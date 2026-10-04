import type { Lang, Severity, RiskLevel, SignalId, ClaimType, EntityType, InputKind, TrustStatus, VerificationStatus, GraphEdgeLabel } from "@/types";
import { en, type Dict } from "./en";
import { hi } from "./hi";
import { gu } from "./gu";

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
];

const dicts: Record<Lang, Dict> = { en, hi, gu };

export function getDict(lang: Lang | undefined | null): Dict {
  return dicts[lang ?? "en"] ?? en;
}

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "hi" || value === "gu";
}

/** Replaces `{placeholder}` tokens inside a dictionary string. */
export function fmt(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match,
  );
}

export function severityLabel(dict: Dict, severity: Severity): string {
  return dict.severity[severity];
}

export function levelLabel(dict: Dict, level: RiskLevel): string {
  return dict.risk.levels[level].label;
}

export function levelLine(dict: Dict, level: RiskLevel): string {
  return dict.risk.levels[level].line;
}

export function signalText(dict: Dict, id: SignalId): { title: string; explain: string; simple: string } {
  const entry = dict.signals[id];
  return { title: entry.title, explain: entry.explain, simple: entry.simple };
}

export function claimLabel(dict: Dict, type: ClaimType): string {
  return dict.claimTypes[type];
}

export function claimExplain(dict: Dict, type: ClaimType): string {
  return dict.claimExplain[type];
}

export function entityLabel(dict: Dict, type: EntityType): string {
  return dict.entityTypes[type];
}

export function inputKindLabel(dict: Dict, kind: InputKind): string {
  return dict.inputKinds[kind];
}

export function statusLabel(dict: Dict, status: TrustStatus | VerificationStatus): string {
  return dict.status[status];
}

export function edgeLabel(dict: Dict, label: GraphEdgeLabel): string {
  return dict.graph.relations[label];
}

export function formatCount(dict: Dict, count: number): string {
  return fmt(count === 1 ? dict.dashboard.signalCount : dict.dashboard.signalCountPlural, { count });
}

export type { Dict };
