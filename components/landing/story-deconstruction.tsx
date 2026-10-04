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
    <section className="relative mx-auto w-full max-w-6xl px-5 py-24 border-t border-line/80">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-signal" />
            <p className="kicker">Scroll-Driven Threat Storytelling</p>
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-bone md:text-4xl">
            From Suspicious Message to Forensic Proof
          </h2>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-mist">
            See how Rakshak progressively dismantles a fraudulent investment lure layer by layer.
          </p>
        </div>

        {/* Stepper buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-1 border border-line-2">
          {STORY_LAYERS.map((layer, idx) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                activeLayer === idx
                  ? "bg-bone text-surface-0 shadow-sm"
                  : "text-mist hover:text-bone"
              }`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-stretch">
        {/* Left Column: Interactive Story Progress Cards */}
        <div className="space-y-3">
          {STORY_LAYERS.map((layer, idx) => {
            const isActive = activeLayer === idx;
            return (
              <div
                key={layer.id}
                onClick={() => setActiveLayer(idx)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                  isActive
                    ? "bg-surface-2/90 border-azure/50 shadow-[0_8px_30px_rgba(77,136,255,0.12)] scale-[1.01]"
                    : "bg-surface-1/40 border-line hover:border-line-2 hover:bg-surface-1/70"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-dim">{layer.stage}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${layer.badgeColor}`}>
                    {layer.badge}
                  </span>
                </div>
                <h3 className={`mt-2 text-base font-semibold ${isActive ? "text-bone" : "text-mist"}`}>
                  {layer.title}
                </h3>
                <p className="mt-1 text-xs text-dim leading-relaxed">
                  {layer.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Deconstruction Inspector Terminal */}
        <div className="panel p-6 flex flex-col justify-between relative overflow-hidden bg-surface-1/90 border-azure/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-azure/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-signal/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs text-dim">rakshak-inspector://layer-0{activeLayer + 1}</span>
              </div>
              <span className="font-mono text-xs text-azure font-semibold">
                LAYER {activeLayer + 1} / {STORY_LAYERS.length}
              </span>
            </div>

            {/* Active Content Inspection */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="kicker text-azure">INSPECTION FOCUS</span>
                {STORY_LAYERS[activeLayer].metric && (
                  <span className="text-xs font-mono font-bold text-bone px-2 py-0.5 rounded bg-white/5 border border-line-2">
                    {STORY_LAYERS[activeLayer].metric}
                  </span>
                )}
              </div>

              <div className="mt-4 rounded-xl bg-surface-0 border border-line-2 p-4 font-mono text-sm leading-relaxed text-bone whitespace-pre-line">
                {STORY_LAYERS[activeLayer].content}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-azure/5 border border-azure/20">
                <p className="text-xs font-mono font-semibold text-azure mb-1 uppercase tracking-wider">
                  Cryptographic & Legal Reasoning
                </p>
                <p className="text-xs text-mist leading-relaxed">
                  {STORY_LAYERS[activeLayer].detail}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="mt-8 pt-4 border-t border-line flex items-center justify-between">
            <span className="text-xs text-dim">
              Explore the live investigation terminal:
            </span>
            <Link
              href="/investigate?demo=guaranteed_returns"
              className="btn btn-primary shimmer-btn !py-2 !px-4 !text-xs font-semibold"
            >
              Interrogate This Threat →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
