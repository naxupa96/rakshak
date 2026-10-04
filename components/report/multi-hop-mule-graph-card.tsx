"use client";

import React from "react";
import { MuleHopGraph } from "@/types";

interface MultiHopMuleGraphCardProps {
  graph: MuleHopGraph;
}

export function MultiHopMuleGraphCard({ graph }: MultiHopMuleGraphCardProps) {
  if (!graph || !graph.nodes || graph.nodes.length === 0) return null;

  return (
    <div className="my-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
            🕸️
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Multi-Hop Mule Layering & Dark Money Topology
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                P2P USDT EXFILTRATION CHAIN
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-0.5">
              Reconstructed 3-Tier Syndicated Fund Flow & Crypto Off-Ramp
            </h4>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="text-neutral-400">Estimated Freeze Window:</div>
          <div className="font-mono font-bold text-amber-400">&lt; {graph.estimatedLienWindowMinutes} Minutes</div>
        </div>
      </div>

      {/* Visual Multi-Hop Node Sequence */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {graph.nodes.map((node, idx) => {
          const isVictim = node.category === "victim";
          const isL1 = node.category === "layer1_mule";
          const isL2 = node.category === "layer2_aggregator";
          const isCrypto = node.category === "p2p_crypto_offramp";

          return (
            <div
              key={node.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between text-xs relative ${
                isVictim
                  ? "bg-neutral-950 border-neutral-700"
                  : isL1
                  ? "bg-red-950/30 border-red-500/40"
                  : isL2
                  ? "bg-amber-950/30 border-amber-500/40"
                  : "bg-indigo-950/30 border-indigo-500/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-neutral-400 mb-1">
                  <span>Hop 0{idx + 1}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      isVictim
                        ? "bg-neutral-800 text-neutral-300"
                        : isL1
                        ? "bg-red-500/20 text-red-400"
                        : isL2
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    {node.category.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="font-semibold text-white text-sm">{node.label}</div>
                <div className="text-neutral-400 text-[11px] mt-0.5">{node.institution}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-800/80">
                <div className="font-mono text-neutral-300 text-[11px] truncate">
                  {node.accountOrAddress}
                </div>
                {node.location && (
                  <div className="text-[10px] text-neutral-500 mt-0.5">📍 {node.location}</div>
                )}
                {node.flaggedZone && (
                  <div className="text-[10px] text-red-400 font-bold mt-1">⚠️ {node.flaggedZone}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Latency & Velocity Summary */}
      <div className="mt-4 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-neutral-300">
          <span className="font-bold text-amber-400">Total Exfiltration Velocity:</span> Illicit funds are converted to P2P USDT in <span className="font-mono font-bold text-white">~{graph.totalLayeringMinutes} minutes</span> across Indian bank API gateways.
        </div>
        <div className="text-[11px] text-neutral-400">
          Mandatory NPCI priority flag dispatched to Layer-1 & Layer-2 beneficiary banks.
        </div>
      </div>
    </div>
  );
}
