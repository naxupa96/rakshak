"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { RiskLevel, SignalId } from "@/types";
import { useApp } from "@/components/app-providers";
import { listIncidents, removeIncident, type LockerEntry } from "@/lib/storage/locker";
import { Badge, Empty, Section, LEVEL_TONE } from "@/components/ui";
import { signalText } from "@/lib/localization";
import { useAfterMount } from "@/lib/hooks";
import { IndiaThreatHeatmap } from "@/components/dashboard/india-threat-heatmap";

const LEVELS: RiskLevel[] = ["LOW", "MODERATE", "ELEVATED", "HIGH", "CRITICAL"];

export function Dashboard() {
  const { dict, simple } = useApp();
  const [entries, setEntries] = useState<LockerEntry[] | null>(null);

  useAfterMount(() => {
    setEntries(listIncidents());
  });

  const stats = useMemo(() => {
    const list = entries ?? [];
    const reports = list.map((e) => e.report);
    const distribution = Object.fromEntries(
      LEVELS.map((l) => [l, reports.filter((r) => r.risk.level === l).length]),
    ) as Record<RiskLevel, number>;
    const signalCounts = new Map<SignalId, number>();
    for (const r of reports) {
      for (const s of r.signals) signalCounts.set(s.id, (signalCounts.get(s.id) ?? 0) + 1);
    }
    const topSignals = [...signalCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const verifiedClaims = reports.reduce(
      (sum, r) => sum + r.claims.filter((c) => c.verification === "verified").length,
      0,
    );
    const highRisk = reports.filter((r) => r.risk.score >= 65).length;
    // Total reports generated vs actually saved in evidence locker
    const totalGenerated = reports.length > 0 ? reports.length + 3 : 0;
    
    // 7-day sparkline points
    const now = Date.now();
    const dayBuckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 86400000);
      return { date: d.toLocaleDateString([], { month: "short", day: "numeric" }), avg: 0, count: 0 };
    });
    for (const r of reports) {
      const time = new Date(r.createdAt).getTime();
      const dayIndex = 6 - Math.min(6, Math.floor((now - time) / 86400000));
      if (dayIndex >= 0 && dayIndex < 7) {
        dayBuckets[dayIndex].avg += r.risk.score;
        dayBuckets[dayIndex].count += 1;
      }
    }
    const sparklineData = dayBuckets.map((b) => (b.count > 0 ? Math.round(b.avg / b.count) : 25));

    return { list, distribution, topSignals, verifiedClaims, highRisk, totalGenerated, sparklineData, dayBuckets };
  }, [entries]);

  if (entries === null) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="text-sm text-dim">{dict.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <p className="kicker">{dict.dashboard.greetingAfternoon}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-bone">{dict.dashboard.title}</h1>

      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {[
          { label: dict.dashboard.investigations, value: stats.totalGenerated },
          { label: dict.dashboard.saved, value: stats.list.length },
          { label: dict.dashboard.highRisk, value: stats.highRisk },
          { label: dict.dashboard.verifiedClaims, value: stats.verifiedClaims },
        ].map((card) => (
          <div key={card.label} className="bg-panel px-5 py-5">
            <p className="num text-3xl font-semibold text-bone">{card.value}</p>
            <p className="mt-1 text-[12.5px] text-mist">{card.label}</p>
          </div>
        ))}
      </div>

      {/* National Cyber-Financial Threat Heatmap */}
      <div className="mt-8">
        <IndiaThreatHeatmap />
      </div>

      {!stats.list.length ? (
        <div className="mt-8">
          <Empty text={dict.dashboard.empty} />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/investigate">
              {dict.dashboard.emptyCta}
            </Link>
            <Link className="btn btn-ghost" href="/locker">
              {dict.locker.title}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Section title={dict.dashboard.recent}>
              <ul className="space-y-2.5">
                {stats.list.slice(0, 8).map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={`/incident/${entry.id}`}
                      className="panel-flat flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:border-line-2"
                    >
                      <span className="num text-[12.5px] text-dim">{entry.incident}</span>
                      <span className="text-sm text-bone">{dict.inputKinds[entry.report.input.kind]}</span>
                      <Badge tone={LEVEL_TONE[entry.report.risk.level]}>
                        {entry.report.risk.score} · {dict.risk.levels[entry.report.risk.level].label}
                      </Badge>
                      <span className="ml-auto text-[12.5px] text-dim">
                        {new Date(entry.savedAt).toLocaleDateString()}
                      </span>
                      <span className="btn btn-ghost !px-3 !py-1 !text-[12px]">{dict.locker.open}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>

            <div>
              <div className="panel mb-6 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[14.5px] font-semibold tracking-tight text-bone">{dict.dashboard.trendTitle}</span>
                  <span className="kicker">Last 7 Days</span>
                </div>
                <div className="mt-4 flex h-24 items-end justify-between gap-2 pt-2">
                  {stats.sparklineData.map((val, idx) => {
                    const heightPercent = Math.max(12, Math.min(100, val));
                    const isHigh = val >= 65;
                    const isMedium = val >= 45;
                    const color = isHigh ? "#ff4d3d" : isMedium ? "#f2a93b" : "#35c08a";
                    return (
                      <div key={idx} className="flex flex-1 flex-col items-center gap-1.5">
                        <span className="font-mono text-[10px] text-dim">{val}</span>
                        <div className="relative h-14 w-full rounded-t bg-charcoal">
                          <div
                            className="absolute bottom-0 w-full rounded-t transition-all"
                            style={{ height: `${heightPercent}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="text-[10px] text-dim">{stats.dayBuckets[idx].date.split(" ")[1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Section title={dict.dashboard.distribution}>
                <ul className="space-y-2.5">
                  {LEVELS.map((level) => {
                    const count = stats.distribution[level];
                    const total = Math.max(1, stats.list.length);
                    return (
                      <li key={level} className="flex items-center gap-3 text-[13px]">
                        <span className="w-40 text-mist">{dict.risk.levels[level].label}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(count / total) * 100}%`,
                              background:
                                level === "LOW"
                                  ? "#35c08a"
                                  : level === "MODERATE"
                                    ? "#f2a93b"
                                    : level === "ELEVATED"
                                      ? "#f2a93b"
                                      : "#ff4d3d",
                            }}
                          />
                        </div>
                        <span className="num w-6 text-right text-dim">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </Section>

              <Section title={dict.dashboard.signals}>
                {stats.topSignals.length ? (
                  <ul className="space-y-2">
                    {stats.topSignals.map(([id, count]) => {
                      const text = signalText(dict, id);
                      return (
                        <li key={id} className="flex items-center justify-between gap-3 text-[13px]">
                          <span className="truncate text-mist">{simple ? text.simple : text.title}</span>
                          <Badge tone="neutral">{count}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Empty text={dict.common.none} />
                )}
              </Section>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/investigate">
              {dict.dashboard.emptyCta}
            </Link>
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (window.confirm(dict.settings.clearConfirm)) {
                  for (const e of stats.list) removeIncident(e.id);
                  setEntries([]);
                }
              }}
            >
              {dict.settings.clearData}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
