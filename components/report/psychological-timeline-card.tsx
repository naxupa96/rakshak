"use client";

import React from "react";
import type { PsychologicalStage } from "@/types";

interface PsychologicalTimelineCardProps {
  timeline: PsychologicalStage[];
}

export function PsychologicalTimelineCard({ timeline }: PsychologicalTimelineCardProps) {
  if (!timeline.length) return null;

  const stageIcons: Record<PsychologicalStage["stage"], string> = {
    hook: "🪝",
    authority: "🏛️",
    urgency: "⏳",
    exfiltration: "💸",
  };

  const stageColors: Record<PsychologicalStage["stage"], { border: string; bg: string; text: string; dot: string }> = {
    hook: {
      border: "border-amber-500/30",
      bg: "bg-amber-950/20",
      text: "text-amber-400",
      dot: "bg-amber-400",
    },
    authority: {
      border: "border-sky-500/30",
      bg: "bg-sky-950/20",
      text: "text-sky-400",
      dot: "bg-sky-400",
    },
    urgency: {
      border: "border-orange-500/30",
      bg: "bg-orange-950/20",
      text: "text-orange-400",
      dot: "bg-orange-400",
    },
    exfiltration: {
      border: "border-red-500/40",
      bg: "bg-red-950/25",
      text: "text-red-400",
      dot: "bg-red-400",
    },
  };

  return (
    <div className="panel mt-6 p-6 border-line-2 bg-surface-1/90 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal" />
            <p className="kicker">PSYCHOLOGICAL FORENSICS · ATTACK CHAIN</p>
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-bone mt-1">
            Cognitive Vulnerability & Scam Attack Chain
          </h3>
          <p className="text-xs text-mist mt-1 max-w-xl leading-relaxed">
            Sequential breakdown of how emotional manipulation, false authority, and manufactured scarcity were weaponized to bypass critical faculty.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-bone bg-surface-2 px-3 py-1 rounded-full border border-line-2">
            {timeline.length} PHASES DETECTED
          </span>
        </div>
      </div>

      <div className="mt-6 relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-500/40 via-sky-500/40 to-red-500/40">
        {timeline.map((item, idx) => {
          const colors = stageColors[item.stage] || stageColors.hook;
          return (
            <div key={item.stage} className="relative group">
              {/* Stepper Node */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-line-2 bg-[#0d1015] shadow`}
              >
                <span className="text-xs">{stageIcons[item.stage]}</span>
              </div>

              {/* Step Card */}
              <div
                className={`rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all hover:border-line-2`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                      {item.label}
                    </span>
                    <span className="text-dim text-xs">·</span>
                    <span className="text-xs font-medium text-bone">
                      Bias: <span className="underline decoration-dotted">{item.biasWeaponized}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 rounded-lg border border-white/5 bg-black/40 px-3 py-2 font-mono text-xs text-mist italic">
                  &ldquo;{item.detectedQuote}&rdquo;
                </div>

                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
