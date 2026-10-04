"use client";

import React, { useState } from "react";
import Link from "next/link";

interface StoryNode {
  id: string;
  stage: "MESSAGE" | "CLAIM" | "ENTITY" | "EVIDENCE" | "RISK" | "ACTION";
  title: string;
  badge: string;
  badgeColor: string;
  content: string;
  detail: string;
  detectedWord?: string;
  metric?: string;
}

const STORY_LAYERS: StoryNode[] = [
  {
    id: "layer-1",
    stage: "MESSAGE",
    title: "01 · The Suspicious Inbound",
    badge: "RAW PAYLOAD",
    badgeColor: "text-mist border-line-2 bg-white/[0.04]",
    content: "“Exclusive SEBI-Registered VIP Club: Invest ₹25,000 today for GUARANTEED 24% monthly returns. Limited 5 slots left! Transfer via UPI to vip-advisory@okaxis immediately.”",
    detail: "Received on WhatsApp / Telegram. Designed to compel rapid impulsive transfer before rational verification.",
  },
  {
    id: "layer-2",
    stage: "CLAIM",
    title: "02 · Deconstructed Claims",
    badge: "REGULATORY / RETURN FRAUD",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    content: "Claim 1: “Guaranteed 24% monthly returns” (Annualized 288% ROI)\nClaim 2: “SEBI-Registered VIP Club” (Regulatory Endorsement)",
    detail: "Under SEBI (Investment Advisers) Regulations, 2013, guaranteeing fixed stock market returns is prohibited by law.",
    detectedWord: "GUARANTEED 24% MONTHLY",
  },
  {
    id: "layer-3",
    stage: "ENTITY",
    title: "03 · Extracted Threat Entities",
    badge: "INTERMEDIARY & VPA",
    badgeColor: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    content: "Entity: “VIP Club” · Claimed SEBI: INX-Unregistered\nVPA: vip-advisory@okaxis (Flagged mule account pattern)",
    detail: "Cross-checked against SEBI 4,200+ Master Registered Intermediary records. No matching SEBI license found.",
    metric: "0 / 1 REGULATORY MATCH",
  },
  {
    id: "layer-4",
    stage: "EVIDENCE",
    title: "04 · Forensic Cross-Examination",
    badge: "LIVE INTEL CORROBORATION",
    badgeColor: "text-signal border-signal/40 bg-signal/10",
    content: "• Domain registered 3 days ago via privacy proxy\n• VPA mapped to private individual P2P account, not corporate escrow\n• Acoustic and leet text evasion detected in header payload",
    detail: "Contradiction proven: Sender claims institutional corporate status but routes payment to an individual mule wallet.",
    metric: "3 CONTRADICTIONS PROVEN",
  },
  {
    id: "layer-5",
    stage: "RISK",
    title: "05 · Explainable Risk Verdict",
    badge: "CRITICAL RISK · 94/100",
    badgeColor: "text-red-400 border-red-500/40 bg-red-500/20",
    content: "Verdict: CRITICAL RISK (94 / 100)\nHigh urgency pressure + False regulatory claims + High-yield fraudulent solicitation.",
    detail: "Every single point of the 94 score is accounted for with cryptographic and textual receipts. No black-box guesses.",
    metric: "SCORE: 94 / 100",
  },
  {
    id: "layer-6",
    stage: "ACTION",
    title: "06 · Defensive Protective Action",
    badge: "GOLDEN HOUR SHIELD",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    content: "1. Block and preserve chat export with SHA-256 integrity hash.\n2. In case of payment: Dial 1930 / USSD *99# to freeze mule bank account.\n3. Generate tamper-evident PDF dossier for cybercrime.gov.in.",
    detail: "Transforms panic into structured legal triage within the critical 60-minute recovery window.",
  },
];

export function StoryDeconstruction() {
  const [activeLayer, setActiveLayer] = useState<number>(0);

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-20 border-b border-line bg-[#07090c]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-signal" />
            <p className="kicker !text-bone">FORENSIC CASE STUDY · DECONSTRUCTION</p>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-bone md:text-3xl font-sans">
            How Rakshak Dissects Inbound Threats
          </h2>
          <p className="mt-1.5 max-w-xl text-xs font-mono leading-relaxed text-mist">
            Follow the automated interrogation pipeline from suspicious inbound message to definitive mathematical risk verdict.
          </p>
        </div>

        {/* Layer tabs */}
        <div className="flex flex-wrap items-center gap-1 border border-line bg-[#090b0e] p-1 font-mono text-xs">
          {STORY_LAYERS.map((layer, idx) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(idx)}
              className={`px-3 py-1.5 text-[11px] uppercase transition-colors ${
                activeLayer === idx
                  ? "bg-bone text-ink font-semibold"
                  : "text-mist hover:text-bone hover:bg-[#12161c]"
              }`}
            >
              0{idx + 1} {layer.stage}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] items-stretch">
        {/* Left Column: Interactive Story Progress Cards */}
        <div className="space-y-2 font-mono">
          {STORY_LAYERS.map((layer, idx) => {
            const isActive = activeLayer === idx;
            return (
              <div
                key={layer.id}
                onClick={() => setActiveLayer(idx)}
                className={`cursor-pointer border p-4 transition-colors ${
                  isActive
                    ? "bg-[#0f141b] border-azure text-bone"
                    : "bg-[#090c10] border-line hover:border-line-2 text-mist"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10.5px]">
                  <span className="text-dim">0{idx + 1} // {layer.stage}</span>
                  <span className="text-azure">{layer.badge}</span>
                </div>
                <h3 className={`mt-1.5 text-sm font-sans font-semibold ${isActive ? "text-bone" : "text-mist"}`}>
                  {layer.title}
                </h3>
                <p className="mt-1 text-[11px] text-dim font-sans leading-relaxed line-clamp-2">
                  {layer.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Deconstruction Inspector Terminal */}
        <div className="border border-line bg-[#080b0f] p-6 flex flex-col justify-between">
          <div>
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-line pb-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-signal" />
                <span className="text-bone font-semibold">CASE RX-2026-0417</span>
                <span className="text-dim">/ DECONSTRUCTION</span>
              </div>
              <span className="text-[11px] text-azure">
                PHASE 0{activeLayer + 1} OF 06
              </span>
            </div>

            {/* Active Content Inspection */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="kicker !text-dim">EXTRACTED EVIDENCE VECTOR</span>
                {STORY_LAYERS[activeLayer].metric && (
                  <span className="text-[11px] font-mono font-bold text-signal bg-signal/10 border border-signal/30 px-2 py-0.5">
                    {STORY_LAYERS[activeLayer].metric}
                  </span>
                )}
              </div>

              <div className="border border-line bg-[#050709] p-4 font-mono text-xs leading-relaxed text-bone whitespace-pre-line border-l-2 border-l-azure">
                {STORY_LAYERS[activeLayer].content}
              </div>

              <div className="mt-4 p-4 border border-line bg-[#090d13]">
                <p className="text-[10.5px] font-mono uppercase tracking-wider text-azure mb-1">
                  Legal & Empirical Analysis
                </p>
                <p className="text-xs text-mist font-sans leading-relaxed">
                  {STORY_LAYERS[activeLayer].detail}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="mt-6 pt-4 border-t border-line flex items-center justify-between font-mono text-xs">
            <span className="text-dim">
              SYSTEM STATUS: INTERROGATION ACTIVE
            </span>
            <Link
              href="/investigate?demo=guaranteed_returns"
              className="btn btn-primary !py-1.5 !px-3.5 !text-xs font-mono uppercase"
            >
              Examine Full Case Docket →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
