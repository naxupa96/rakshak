"use client";

import React from "react";
import type { LiveVerificationReport } from "@/types/intel";
import { useApp } from "@/components/app-providers";

export function LiveVerificationChips({ live }: { live?: LiveVerificationReport }) {
  const { dict } = useApp();

  if (!live || !live.sources || live.sources.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-panel/60 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-mist/40" />
          <h3 className="text-sm font-medium text-bone">{dict.report.liveUnavailable}</h3>
        </div>
        <p className="mt-1 text-xs text-mist">{dict.report.liveUnavailableBody}</p>
      </div>
    );
  }

  const getBadgeStyle = (status: "hit" | "clean" | "info" | "unavailable") => {
    switch (status) {
      case "hit":
        return "border-coral/40 bg-coral/10 text-coral";
      case "clean":
        return "border-leaf/40 bg-leaf/10 text-leaf";
      case "info":
        return "border-amber-400/40 bg-amber-400/10 text-amber-300";
      case "unavailable":
      default:
        return "border-line bg-charcoal text-dim";
    }
  };

  const getStatusIcon = (status: "hit" | "clean" | "info" | "unavailable") => {
    switch (status) {
      case "hit":
        return "⚠️";
      case "clean":
        return "✓";
      case "info":
        return "ℹ";
      case "unavailable":
      default:
        return "—";
    }
  };

  return (
    <div className="rounded-xl border border-line bg-panel/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-leaf" />
          </span>
          <h3 className="text-sm font-semibold tracking-wide text-bone">
            {dict.report.liveVerificationTitle}
          </h3>
          {live.targetDomain && (
            <span className="rounded bg-charcoal px-2 py-0.5 font-mono text-[11px] text-cyan-400">
              {live.targetDomain}
            </span>
          )}
        </div>
        <span className="text-[11.5px] text-dim">
          {new Date(live.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      <p className="mt-2 text-xs text-mist">{dict.report.liveVerificationSub}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {live.sources.map((src) => {
          return (
            <div
              key={src.source}
              className={`flex flex-col justify-between rounded-lg border p-3.5 transition-all ${getBadgeStyle(
                src.status
              )}`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-xs font-semibold">{src.name}</span>
                <span className="flex h-5 items-center rounded px-1.5 font-mono text-[11px] font-bold">
                  {getStatusIcon(src.status)} {src.status.toUpperCase()}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed opacity-95">{src.summary}</p>
              <div className="mt-3 flex items-center justify-between border-t border-current/10 pt-2 text-[10.5px] opacity-75">
                <span>{src.latencyMs}ms</span>
                <span>{src.source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
