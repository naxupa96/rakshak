"use client";

import React from "react";
import Link from "next/link";

export function HeroProductPreview() {
  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#121419] p-6 text-bone shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all">
      {/* Top Header Rail: Calm, Human, Informative */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-xs font-medium text-mist uppercase tracking-wider block">
            Investigation
          </span>
          <h3 className="text-lg font-semibold text-bone mt-0.5">
            Apex Alpha VIP Club
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#e5484d]/15 text-[#ff8b8e] border border-[#e5484d]/25">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e5484d]" />
            High risk
          </span>
        </div>
      </div>

      {/* Extracted Claim In Focus */}
      <div className="py-4">
        <p className="text-xs text-dim font-medium mb-1.5">
          Flagged claim
        </p>
        <div className="rounded-lg bg-[#181b22] p-3 text-sm text-bone font-normal leading-relaxed border border-white/[0.04]">
          “Invest ₹25,000 today for <span className="text-[#ff8b8e] font-medium underline decoration-[#e5484d]/40">guaranteed 30% monthly returns</span>. Limited allocation under SEBI licence INH00008892.”
        </div>
      </div>

      <div className="border-t border-white/[0.06] my-1" />

      {/* Key Investigation Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-left">
        <div className="p-2.5 rounded-lg bg-[#161920] border border-white/[0.04]">
          <span className="text-[11px] text-dim block">Claim type</span>
          <span className="text-xs font-semibold text-[#ff8b8e] mt-0.5 block">Guaranteed return</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#161920] border border-white/[0.04]">
          <span className="text-[11px] text-dim block">SEBI status</span>
          <span className="text-xs font-semibold text-[#d99a32] mt-0.5 block">Unregistered</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#161920] border border-white/[0.04]">
          <span className="text-[11px] text-dim block">Website age</span>
          <span className="text-xs font-semibold text-[#ff8b8e] mt-0.5 block">6 days old</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#161920] border border-white/[0.04]">
          <span className="text-[11px] text-dim block">Payment channel</span>
          <span className="text-xs font-semibold text-mist mt-0.5 block">Personal UPI</span>
        </div>
      </div>

      <div className="border-t border-white/[0.06] my-1" />

      {/* Evaluated Score & Summary */}
      <div className="pt-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-dim block">Overall risk score</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-semibold text-bone font-sans">82</span>
            <span className="text-xs text-dim">/ 100</span>
            <span className="text-xs font-medium text-[#ff8b8e] ml-1">Critical caution advised</span>
          </div>
        </div>

        <Link
          href="/investigate?demo=guaranteed_returns"
          className="text-xs font-medium text-azure hover:text-bone transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg bg-azure/10 hover:bg-azure/20 border border-azure/20"
        >
          <span>Examine case details</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
