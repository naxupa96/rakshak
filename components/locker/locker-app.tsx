"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { RiskLevel } from "@/types";
import { useApp } from "@/components/app-providers";
import { clearIncidents, downloadJson, listIncidents, removeIncident, type LockerEntry } from "@/lib/storage/locker";
import { useAfterMount } from "@/lib/hooks";
import { fmt } from "@/lib/localization";
import { Badge, Empty, LEVEL_TONE } from "@/components/ui";

const LEVELS: RiskLevel[] = ["CRITICAL", "HIGH", "ELEVATED", "MODERATE", "LOW"];
type Filter = RiskLevel | "ALL";

export function LockerApp() {
  const { dict, simple } = useApp();
  const [entries, setEntries] = useState<LockerEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sort, setSort] = useState<"new" | "risk">("new");

  useAfterMount(() => {
    setEntries(listIncidents());
  });

  const visible = useMemo(() => {
    const list = [...(entries ?? [])];
    const q = query.trim().toLowerCase();
    const filtered = list.filter((entry) => {
      if (filter !== "ALL" && entry.report.risk.level !== filter) return false;
      if (!q) return true;
      const haystack = [
        entry.incident,
        dict.inputKinds[entry.report.input.kind],
        entry.report.input.excerpt,
        ...entry.report.entities.map((e) => e.value),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    filtered.sort((a, b) =>
      sort === "risk"
        ? b.report.risk.score - a.report.risk.score
        : new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
    return filtered;
  }, [entries, query, filter, sort, dict]);

  if (entries === null) {
    return <p className="text-sm text-dim">{dict.common.loading}</p>;
  }

  return (
    <div>
      <p className="kicker">{dict.locker.title}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-bone">{dict.locker.saved}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">{dict.locker.subtitle}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">{dict.locker.search}</span>
          <input
            className="field"
            type="search"
            placeholder={dict.locker.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <label className="sr-only" htmlFor="locker-sort">
          {dict.locker.sortNewest}
        </label>
        <select
          id="locker-sort"
          className="field !w-auto"
          value={sort}
          onChange={(e) => setSort(e.target.value as "new" | "risk")}
        >
          <option value="new">{dict.locker.sortNewest}</option>
          <option value="risk">{dict.locker.sortRisk}</option>
        </select>

        <span className="ml-auto text-[12.5px] text-dim">{fmt(dict.locker.savedCount, { count: entries.length })}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(["ALL", ...LEVELS] as Filter[]).map((key) => (
          <button
            key={key}
            className={`btn !px-3 !py-1.5 !text-[12.5px] ${filter === key ? "btn-primary" : "btn-ghost"}`}
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {key === "ALL" ? dict.locker.all : dict.risk.levels[key].label}
          </button>
        ))}
      </div>

      {!entries.length ? (
        <div className="border border-line bg-[#080b0f] mt-8 p-10 text-center font-mono text-xs">
          <p className="kicker !text-bone">{dict.locker.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-xs text-mist font-sans leading-relaxed">{dict.locker.emptyBody}</p>
          <Link className="btn btn-primary mt-6 !px-6 !py-2.5 text-xs font-mono uppercase font-bold" href="/investigate">
            {dict.hero.cta}
          </Link>
        </div>
      ) : !visible.length ? (
        <div className="mt-8 border border-line p-6 bg-[#080b0f] font-mono text-xs text-dim">
          <Empty text={dict.locker.noResults} />
        </div>
      ) : (
        <div className="mt-6 border border-line bg-[#080b0f] font-mono text-xs">
          {/* Docket Table Header */}
          <div className="hidden md:grid grid-cols-[140px_130px_100px_1fr_140px] border-b border-line bg-[#0c0f15] px-4 py-2.5 text-[10.5px] uppercase tracking-wider text-dim">
            <span>CASE / DOCKET</span>
            <span>THREAT RATING</span>
            <span>VECTOR</span>
            <span>EXCERPT / SUSPECT ENTITIES</span>
            <span className="text-right">ACTIONS</span>
          </div>

          <div className="divide-y divide-line">
            {visible.map((entry) => {
              const report = entry.report;
              return (
                <div
                  key={entry.id}
                  className="flex flex-col md:grid md:grid-cols-[140px_130px_100px_1fr_140px] items-start md:items-center px-4 py-3 hover:bg-[#0d1016] transition-colors gap-2 md:gap-0"
                >
                  {/* Case ID */}
                  <div>
                    <span className="font-bold text-azure">#{entry.incident}</span>
                    <span className="block text-[10px] text-dim">{new Date(entry.savedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Threat Rating */}
                  <div>
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] font-bold border ${
                        report.risk.score >= 65
                          ? "bg-signal/15 text-signal border-signal/30"
                          : report.risk.score >= 35
                          ? "bg-amber/15 text-amber border-amber/30"
                          : "bg-emerald/15 text-emerald border-emerald/30"
                      }`}
                    >
                      {report.risk.score}/100 {report.risk.level}
                    </span>
                  </div>

                  {/* Input Vector */}
                  <div>
                    <span className="text-mist uppercase text-[11px]">{dict.inputKinds[report.input.kind]}</span>
                  </div>

                  {/* Excerpt / Entities */}
                  <div className="min-w-0 pr-4">
                    <p className="text-bone font-mono text-[11px] truncate">
                      "{report.input.excerpt}"
                    </p>
                    {report.entities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {report.entities.slice(0, 3).map((e) => (
                          <span key={e.value} className="text-[9.5px] text-dim border border-line px-1 bg-[#050709]">
                            {e.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 w-full md:w-auto">
                    <Link
                      className="btn btn-primary !py-1 !px-2.5 !text-[11px] uppercase font-bold"
                      href={`/incident/${entry.id}`}
                    >
                      DOCKET →
                    </Link>
                    <button
                      className="btn btn-ghost !py-1 !px-2 !text-[11px] hover:border-signal/50 hover:text-signal"
                      onClick={() => {
                        if (window.confirm(dict.locker.deleteConfirm)) {
                          removeIncident(entry.id);
                          setEntries(listIncidents());
                        }
                      }}
                    >
                      DEL
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {entries.length ? (
        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-5">
          <button className="btn btn-ghost" onClick={() => downloadJson(entries, "rakshak-evidence-locker")}>
            {dict.locker.exportAll}
          </button>
          <button
            className="btn btn-ghost hover:border-signal/50 hover:text-[#ff9d92]"
            onClick={() => {
              if (window.confirm(dict.locker.clearConfirm)) {
                clearIncidents();
                setEntries([]);
              }
            }}
          >
            {dict.locker.clearAll}
          </button>
          {simple ? null : (
            <span className="self-center text-[12.5px] text-dim">{dict.settings.privacyHint}</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
