"use client";

import React from "react";
import { CryptoWalletTrace } from "@/types";

interface CryptoWalletCardProps {
  traces: CryptoWalletTrace[];
}

export function CryptoWalletCard({ traces }: CryptoWalletCardProps) {
  if (!traces || traces.length === 0) return null;

  return (
    <div className="my-6 rounded-xl border border-red-500/40 bg-red-950/20 p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm">
            🪙
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Cryptocurrency & USDT Mixer Off-Ramp Intelligence
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                DARK MONEY LIQUIDITY
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-0.5">
              Extracted Blockchain Wallets (TRC-20 / ERC-20 / Bitcoin)
            </h4>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="text-neutral-400">Detected Addresses:</div>
          <div className="font-mono font-bold text-red-400">{traces.length} Wallet{traces.length > 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Address Traces */}
      <div className="mt-4 space-y-3">
        {traces.map((trace, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs leading-relaxed space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-amber-300 break-all">{trace.address}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase">
                  {trace.chain.replace(/_/g, " ")} ({trace.assetSymbol})
                </span>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                Risk Score: {trace.riskScore}/100
              </span>
            </div>

            {trace.clusterTag && (
              <div className="text-[11px] text-neutral-400">
                Cluster Label: <strong className="text-white">{trace.clusterTag}</strong>
              </div>
            )}

            <div className="space-y-1">
              {trace.flags.map((flag, fIdx) => (
                <div key={fIdx} className="flex items-start gap-1.5 text-[11px] text-red-300">
                  <span className="text-red-400 font-bold shrink-0">⚠</span>
                  <span>{flag}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-300">
              <span className="font-bold text-amber-400">Enforcement Action:</span> {trace.recommendedAction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
