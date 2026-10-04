"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ArtifactSignal {
  id: string;
  name: string;
  verdict: "CONTRADICTED" | "UNVERIFIED" | "SUSPICIOUS" | "PROVEN";
  score: number;
  meta: string;
}

export function HeroForensicArtifact() {
  const [timestamp, setTimestamp] = useState("04 OCT 2026 · 21:41:08 IST");
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const signals: ArtifactSignal[] = [
    {
      id: "SIG-01",
      name: "Guaranteed 30% Return Solicitation",
      verdict: "CONTRADICTED",
      score: 31,
      meta: "Violates SEBI IA Regulations 2013 §15",
    },
    {
      id: "SIG-02",
      name: "Intermediary Registration Claim",
      verdict: "UNVERIFIED",
      score: 18,
      meta: "INH00008892 missing from SEBI Master DB",
    },
    {
      id: "SIG-03",
      name: "Cloned Verification Host",
      verdict: "SUSPICIOUS",
      score: 14,
      meta: "sebi-portal-verify.in · Domain age 48h",
    },
    {
      id: "SIG-04",
      name: "P2P Mule Exfiltration Channel",
      verdict: "SUSPICIOUS",
      score: 19,
      meta: "apex-invest@okaxis · Flagged 1930 reports",
    },
  ];

  return (
    <div className="investigation-artifact border border-line bg-[#080b0e] text-bone font-mono text-xs select-none">
      {/* Top Header Rail */}
      <div className="flex items-center justify-between border-b border-line bg-[#0c0f14] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-signal" />
          <span className="font-semibold tracking-wider text-bone">CASE RX-2026-0417</span>
          <span className="text-[10px] text-dim">/</span>
          <span className="text-[10px] tracking-widest text-emerald uppercase font-bold">LIVE DOCKET</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-dim">
          <span>SOURCE: SCREENSHOT</span>
          <span className="text-bone">ACTIVE ●</span>
        </div>
      </div>

      {/* Case Header Details */}
      <div className="grid grid-cols-3 border-b border-line bg-[#090c10] px-4 py-2 text-[11px]">
        <div>
          <span className="text-dim block text-[10px] uppercase tracking-wider">INTAKE TIMESTAMP</span>
          <span className="text-mist">{timestamp}</span>
        </div>
        <div>
          <span className="text-dim block text-[10px] uppercase tracking-wider">TARGET ENTITY</span>
          <span className="text-bone font-semibold">Apex Alpha VIP Club</span>
        </div>
        <div>
          <span className="text-dim block text-[10px] uppercase tracking-wider">JURISDICTION</span>
          <span className="text-azure">IN / SEBI / RBI</span>
        </div>
      </div>

      {/* Dissected Claim */}
      <div className="p-4 border-b border-line bg-[#0a0d12]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-widest text-dim">EXTRACTED PRIMARY CLAIM</span>
          <span className="text-[10px] text-signal font-semibold bg-signal/10 px-1.5 py-0.5 border border-signal/30">
            PROHIBITED RETURN MULTIPLIER
          </span>
        </div>
        <div className="border-l-2 border-signal pl-3 py-1 bg-signal/[0.03] text-[13px] text-bone">
          “Invest ₹25,000 today for <span className="text-signal font-semibold underline decoration-signal/50">guaranteed 30% monthly returns</span>. Limited VIP allocation under SEBI licence INH00008892.”
        </div>
      </div>

      {/* Forensic Signal Matrix */}
      <div className="border-b border-line">
        <div className="grid grid-cols-[80px_1fr_110px_48px] border-b border-line bg-[#0c0f14] px-4 py-1.5 text-[10px] uppercase tracking-wider text-dim">
          <span>CODE</span>
          <span>EVIDENCE VECTOR</span>
          <span>STATUS</span>
          <span className="text-right">WEIGHT</span>
        </div>
        <div className="divide-y divide-line/60">
          {signals.map((sig) => (
            <div
              key={sig.id}
              className="grid grid-cols-[80px_1fr_110px_48px] items-center px-4 py-2 hover:bg-[#0f131a] transition-colors"
            >
              <span className="text-azure text-[11px] font-semibold">{sig.id}</span>
              <div className="pr-2">
                <div className="text-bone font-sans text-xs">{sig.name}</div>
                <div className="text-[10.5px] text-dim">{sig.meta}</div>
              </div>
              <div>
                <span
                  className={`inline-block px-1.5 py-0.5 text-[9.5px] uppercase font-bold tracking-wider ${
                    sig.verdict === "CONTRADICTED"
                      ? "bg-signal/15 text-signal border border-signal/30"
                      : sig.verdict === "UNVERIFIED"
                      ? "bg-amber/15 text-amber border border-amber/30"
                      : "bg-azure/15 text-azure border border-azure/30"
                  }`}
                >
                  {sig.verdict}
                </span>
              </div>
              <span className="text-right font-mono text-bone text-xs font-semibold">+{sig.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Calculation Ledger */}
      <div className="p-4 bg-[#0a0d12]">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-dim block">COMPOSITE THREAT ASSESSMENT</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold tracking-tight text-signal font-sans">CRITICAL RISK</span>
              <span className="text-xs text-mist">· REQUIRES IMMEDIATE REFUSAL</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold font-mono text-signal">82</span>
            <span className="text-dim text-xs font-mono"> / 100</span>
          </div>
        </div>

        {/* Hairline meter */}
        <div className="mt-3 h-1.5 w-full bg-[#171b22] border border-line">
          <div className="h-full bg-signal" style={{ width: "82%" }} />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-dim border-t border-line/60 pt-2.5">
          <span>04 SIGNALS PROVEN · 02 ENTITIES EXAMINED</span>
          <Link
            href="/investigate?demo=guaranteed_returns"
            className="text-azure hover:text-bone underline underline-offset-2 tracking-wide font-semibold text-[11px]"
          >
            DISSECT IN WORKSPACE →
          </Link>
        </div>
      </div>
    </div>
  );
}
