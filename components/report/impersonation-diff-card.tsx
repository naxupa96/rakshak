"use client";

import React from "react";
import type { ImpersonationComparison } from "@/types";

interface ImpersonationDiffCardProps {
  comparison: ImpersonationComparison;
}

export function ImpersonationDiffCard({ comparison }: ImpersonationDiffCardProps) {
  const { claimedName, matchedEntity, disparities } = comparison;

  return (
    <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/20 via-[#0e1217] to-[#0a0d11] p-6 shadow-xl relative overflow-hidden my-6">
      {/* Background Warning Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/20 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                Impersonation Alert
              </span>
              <span className="text-xs text-slate-400">
                Match confidence: {Math.round(matchedEntity.similarityScore * 100)}%
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mt-0.5">
              Side-by-Side Reality Check: Impersonating {matchedEntity.name}
            </h3>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          Category: <span className="text-slate-200">{matchedEntity.category}</span>
        </div>
      </div>

      {/* Side by side comparison table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: What was claimed */}
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wide">
            <span className="text-red-400 font-bold">✕</span>
            <span>What You Were Sent (Unverified / Suspect)</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Claimed Entity</span>
              <span className="font-medium text-slate-200">{claimedName}</span>
            </div>
            {disparities.map((d) => (
              <div key={d.field} className="border-t border-red-500/10 pt-2">
                <span className="text-slate-400 block text-[11px]">{d.field}</span>
                <span className="font-mono text-red-300 break-all">{d.claimed}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Authentic Registered Intermediary */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Official SEBI Registered Entity</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Official Entity Name</span>
              <span className="font-medium text-emerald-300">{matchedEntity.name}</span>
            </div>
            {disparities.map((d) => (
              <div key={d.field} className="border-t border-emerald-500/10 pt-2">
                <span className="text-slate-400 block text-[11px]">{d.field}</span>
                <span className="font-mono text-emerald-400 font-medium break-all">{d.official}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Direct Contact Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            📞 Official Helpline: <strong className="text-slate-200">{matchedEntity.officialHelpline}</strong>
          </span>
        </div>
        <a
          href={`https://${matchedEntity.officialDomain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          <span>Visit Genuine Portal ({matchedEntity.officialDomain}) →</span>
        </a>
      </div>
    </div>
  );
}
