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
        <div className="panel mt-8 px-6 py-10 text-center">
          <p className="kicker">{dict.locker.emptyTitle}</p>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-mist">{dict.locker.emptyBody}</p>
          <Link className="btn btn-primary mt-5 !px-5 !py-2.5" href="/investigate">
            {dict.hero.cta}
          </Link>
        </div>
      ) : !visible.length ? (
        <div className="mt-8">
          <Empty text={dict.locker.noResults} />
        </div>
      ) : (
        <ul className="mt-6 space-y-2.5">
          {visible.map((entry) => {
            const report = entry.report;
            return (
              <li key={entry.id} className="panel-flat flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                <span className="num text-[12.5px] text-dim">{entry.incident}</span>
                <span className="text-sm text-bone">{dict.inputKinds[report.input.kind]}</span>
                <Badge tone={LEVEL_TONE[report.risk.level]}>
                  {report.risk.score} · {dict.risk.levels[report.risk.level].label}
                </Badge>
                <span className="text-[12.5px] text-mist">
                  {fmt(dict.locker.signalsCount, { count: report.signals.length })}
                </span>
                <span className="truncate text-[12.5px] text-dim" style={{ maxWidth: "34rem" }}>
                  {report.input.excerpt}
                </span>
                <span className="ml-auto flex items-center gap-2">
                  <span className="hidden text-[12.5px] text-dim sm:inline">
                    {new Date(entry.savedAt).toLocaleDateString()}
                  </span>
                  <Link className="btn btn-ghost !px-3 !py-1.5 !text-[12.5px]" href={`/incident/${entry.id}`}>
                    {dict.locker.open}
                  </Link>
                  <button
                    className="btn btn-ghost !px-3 !py-1.5 !text-[12.5px] hover:border-signal/50 hover:text-[#ff9d92]"
                    onClick={() => {
                      if (window.confirm(dict.locker.deleteConfirm)) {
                        removeIncident(entry.id);
                        setEntries(listIncidents());
                      }
                    }}
                  >
                    {dict.locker.delete}
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
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
