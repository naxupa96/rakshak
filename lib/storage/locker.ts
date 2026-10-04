"use client";

import type { AnalysisReport } from "@/types";

const LOCKER_KEY = "rakshak.locker.v1";
const LIVE_KEY = "rakshak.live.v1";

export interface LockerEntry {
  /** Stable report id, also used as the incident route key. */
  id: string;
  /** Human-facing incident number, e.g. RX-2026-0001. */
  incident: string;
  savedAt: string;
  report: AnalysisReport;
}

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function listIncidents(): LockerEntry[] {
  if (!canStore()) return [];
  try {
    const raw = window.localStorage.getItem(LOCKER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LockerEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e) => e && typeof e.id === "string" && e.report);
  } catch {
    return [];
  }
}

function writeAll(entries: LockerEntry[]): void {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(LOCKER_KEY, JSON.stringify(entries));
  } catch {
    /* quota or private mode — the report is still usable in this session */
  }
}

export function getIncident(id: string): LockerEntry | null {
  return listIncidents().find((e) => e.id === id) ?? null;
}

export function saveIncident(report: AnalysisReport): LockerEntry {
  const entries = listIncidents();
  const existing = entries.find((e) => e.id === report.id);
  if (existing) return existing;

  const year = new Date().getFullYear();
  const sequence = entries.filter((e) => e.incident.includes(`-${year}-`)).length + 1;
  const incident = `RX-${year}-${String(sequence).padStart(4, "0")}`;

  const entry: LockerEntry = {
    id: report.id,
    incident,
    savedAt: new Date().toISOString(),
    report: { ...report },
  };
  writeAll([entry, ...entries].slice(0, 100));
  return entry;
}

export function removeIncident(id: string): void {
  writeAll(listIncidents().filter((e) => e.id !== id));
}

export function clearIncidents(): void {
  if (!canStore()) return;
  try {
    window.localStorage.removeItem(LOCKER_KEY);
  } catch {
    /* ignore */
  }
}

const SCAN_HASH_KEY = "rakshak.scanhash.v1";

export function getPreviousScan(text: string): { score: number; date: string } | null {
  if (!canStore()) return null;
  try {
    const raw = window.localStorage.getItem(SCAN_HASH_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const key = text.trim().slice(0, 120);
    return map[key] ?? null;
  } catch {
    return null;
  }
}

export function recordScanHash(text: string, score: number): void {
  if (!canStore()) return;
  try {
    const raw = window.localStorage.getItem(SCAN_HASH_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = text.trim().slice(0, 120);
    map[key] = { score, date: new Date().toISOString() };
    window.localStorage.setItem(SCAN_HASH_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Keeps only the most recent report in session memory for the report route. */
export function saveLiveReport(report: AnalysisReport): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LIVE_KEY, JSON.stringify(report));
    // Also save incident entry so permalinks like /report/[id] and /incident/[id] always resolve
    saveIncident(report);
    if (report.input?.text) {
      recordScanHash(report.input.text, report.risk.score);
    }
  } catch {
    /* ignore */
  }
}

export function readLiveReport(): AnalysisReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AnalysisReport;
    return parsed && parsed.id && parsed.risk ? parsed : null;
  } catch {
    return null;
  }
}

export function downloadJson(data: unknown, name: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
