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
        <div className="rounded-2xl border border-white/[0.07] bg-[#121419] mt-8 p-12 text-center text-xs">
          <p className="kicker !text-bone">{dict.locker.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-mist leading-relaxed">{dict.locker.emptyBody}</p>
          <Link className="btn btn-primary mt-6 !px-6 !py-2.5 text-xs font-medium" href="/investigate">
            {dict.hero.cta}
          </Link>
        </div>
      ) : !visible.length ? (
        <div className="mt-8 rounded-2xl border border-white/[0.07] p-8 bg-[#121419] text-xs text-dim">
          <Empty text={dict.locker.noResults} />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#121419] overflow-hidden text-xs">
          {/* Investigation Table Header */}
          <div className="hidden md:grid grid-cols-[130px_130px_100px_1fr_130px] border-b border-white/[0.06] bg-white/[0.02] px-5 py-3 text-[11px] font-medium text-dim">
            <span>Investigation</span>
            <span>Risk level</span>
            <span>Source</span>
            <span>Summary & signals</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-white/[0.05]">
            {visible.map((entry) => {
              const report = entry.report;
              const isHigh = report.risk.score >= 65;
              const isMedium = report.risk.score >= 35;
              return (
                <div
                  key={entry.id}
                  className="flex flex-col md:grid md:grid-cols-[130px_130px_100px_1fr_130px] items-start md:items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors gap-2 md:gap-0"
                >
                  {/* Case ID */}
                  <div>
                    <span className="font-semibold text-bone font-sans">#{entry.incident}</span>
                    <span className="block text-[11px] text-dim">{new Date(entry.savedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Threat Rating */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        isHigh
                          ? "bg-[#e5484d]/10 text-[#ff8b8e] border-[#e5484d]/20"
                          : isMedium
                          ? "bg-[#d99a32]/10 text-[#f5b854] border-[#d99a32]/20"
                          : "bg-[#35b779]/10 text-[#35b779] border-[#35b779]/20"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-currentColor" />
                      {report.risk.score}/100 · {dict.risk.levels[report.risk.level].label}
                    </span>
                  </div>

                  {/* Input Vector */}
                  <div>
                    <span className="text-mist text-[12px]">{dict.inputKinds[report.input.kind]}</span>
                  </div>

                  {/* Excerpt / Entities */}
                  <div className="min-w-0 pr-4">
                    <p className="text-bone font-sans text-[12.5px] truncate">
                      &ldquo;{report.input.excerpt}&rdquo;
                    </p>
                    {report.entities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {report.entities.slice(0, 3).map((e) => (
                          <span key={e.value} className="text-[10px] text-mist border border-white/[0.08] px-1.5 py-0.5 rounded-md bg-white/[0.03]">
                            {e.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 w-full md:w-auto">
                    <Link
                      className="btn btn-primary !py-1 !px-3 !text-[12px] font-medium"
                      href={`/incident/${entry.id}`}
                    >
                      Open report →
                    </Link>
                    <button
                      className="btn btn-ghost !py-1 !px-2.5 !text-[12px] hover:border-[#e5484d]/50 hover:text-[#ff8b8e]"
                      onClick={() => {
                        if (window.confirm(dict.locker.deleteConfirm)) {
                          removeIncident(entry.id);
                          setEntries(listIncidents());
                        }
                      }}
                    >
                      Delete
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
