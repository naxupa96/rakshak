"use client";

import React from "react";
import { VpaProbeResult } from "@/types";

interface VpaProbeCardProps {
  probes: VpaProbeResult[];
}

export function VpaProbeCard({ probes }: VpaProbeCardProps) {
  if (!probes || probes.length === 0) return null;

  return (
    <div className="my-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm">
            ⚡
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                UPI Payment Service Provider (PSP) Routing Probe
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                NPCI PROTOCOL PROBE
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-0.5">
              Destination VPA Account Type & Corporate Verification
            </h4>
          </div>
        </div>

        <div className="text-xs text-neutral-400">
          Probed: <span className="font-mono text-white font-bold">{probes.length} Handle{probes.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Probes List */}
      <div className="mt-4 space-y-3">
        {probes.map((probe, idx) => {
          const isMule = probe.accountType === "SUSPICIOUS_MULE" || probe.riskFlag;
          const isMerchant = probe.accountType === "P2M_MERCHANT";

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                isMule
                  ? "bg-red-950/20 border-red-500/40"
                  : isMerchant
                  ? "bg-emerald-950/20 border-emerald-500/40"
                  : "bg-neutral-950/60 border-neutral-800"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-white">{probe.vpa}</span>
                  <span className="text-[11px] text-neutral-400">({probe.pspBank})</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                    isMule
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : isMerchant
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {probe.entityMatchVerdict.replace(/_/g, " ")}
                </span>
              </div>

              {/* Advisory notice */}
              <div className="mt-2 text-neutral-300 text-[11.5px] leading-relaxed">
                {probe.advisory}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
