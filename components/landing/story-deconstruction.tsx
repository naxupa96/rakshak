"use client";

import React, { useState } from "react";
import Link from "next/link";

interface StoryStep {
  id: string;
  step: string;
  title: string;
  badge: string;
  badgeColor: string;
  quote: string;
  explanation: string;
  takeaway: string;
}

const STORY_STEPS: StoryStep[] = [
  {
    id: "step-1",
    step: "01",
    title: "A suspicious message arrives",
    badge: "Inbound lure",
    badgeColor: "text-mist bg-white/[0.04] border-white/[0.08]",
    quote: "“Exclusive SEBI-Registered VIP Club: Invest ₹25,000 today for GUARANTEED 24% monthly returns. Limited 5 slots left! Transfer via UPI to vip-advisory@okaxis immediately.”",
    explanation: "Scammers frequently target investors across WhatsApp and Telegram, combining promises of extreme profit with urgent deadlines to induce impulsive transfers.",
    takeaway: "Notice the pairing of high guaranteed returns with high time pressure.",
  },
  {
    id: "step-2",
    step: "02",
    title: "Rakshak extracts the claims",
    badge: "Prohibited return",
    badgeColor: "text-[#d99a32] bg-[#d99a32]/10 border-[#d99a32]/20",
    quote: "Claim 1: “Guaranteed 24% monthly returns” (Annualized 288% ROI)\nClaim 2: “SEBI-Registered VIP Advisory”",
    explanation: "Under SEBI (Investment Advisers) Regulations, 2013, guaranteeing fixed stock market returns is prohibited by law. Legitimate registered advisers never guarantee performance.",
    takeaway: "A guaranteed return claim is an immediate red flag under Indian securities law.",
  },
  {
    id: "step-3",
    step: "03",
    title: "Checking the identity & registry",
    badge: "Unregistered entity",
    badgeColor: "text-[#6c8eff] bg-[#6c8eff]/10 border-[#6c8eff]/20",
    quote: "Claimed entity: “VIP Advisory Club”\nSEBI Master Database lookup: No matching intermediary registration found.",
    explanation: "Rakshak cross-references the claimed business against 4,200+ active SEBI-registered entities, checking for valid license numbers, official email domains, and registered addresses.",
    takeaway: "No registered licence found for this entity name.",
  },
  {
    id: "step-4",
    step: "04",
    title: "Examining domain & payment details",
    badge: "Mule payment channel",
    badgeColor: "text-[#e5484d] bg-[#e5484d]/10 border-[#e5484d]/20",
    quote: "Domain: sebi-vip-portal.in (Registered 3 days ago via privacy proxy)\nPayment: vip-advisory@okaxis (Individual savings account, not institutional escrow)",
    explanation: "Contradiction identified: The sender claims corporate advisory status, but requests direct transfer to an individual savings account hosted on a brand new proxy domain.",
    takeaway: "Personal UPI destination masquerading as an institutional fund.",
  },
  {
    id: "step-5",
    step: "05",
    title: "Understandable risk verdict",
    badge: "High risk · 94 / 100",
    badgeColor: "text-[#e5484d] bg-[#e5484d]/15 border-[#e5484d]/30 font-semibold",
    quote: "Score: 94 / 100\nFactors: False regulatory claim (+31) · Prohibited return guarantee (+24) · Fresh domain (+15) · Urgency (+14) · Mule UPI (+10)",
    explanation: "Every point is transparently attributed to concrete evidence. No black-box AI scores or hidden assumptions.",
    takeaway: "Clear, verifiable reasons behind every score.",
  },
  {
    id: "step-6",
    step: "06",
    title: "Clear, protective next steps",
    badge: "Golden Hour safety",
    badgeColor: "text-[#35b779] bg-[#35b779]/10 border-[#35b779]/20",
    quote: "1. Block sender & preserve conversation screenshots\n2. If funds were transferred: Dial 1930 / cybercrime.gov.in within the Golden Hour\n3. Generate a formal SEBI SCORES complaint dossier",
    explanation: "When financial loss threatens, immediate calm action preserves evidence and alerts bank nodal officers before funds leave the intermediary banking chain.",
    takeaway: "Calm, structured steps to protect your capital.",
  },
];

export function StoryDeconstruction() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const current = STORY_STEPS[activeStep];

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-24 border-b border-white/[0.06] bg-[#0a0b0e]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/[0.06]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-mist block">
            Investigation walkthrough
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-bone font-sans">
            How Rakshak breaks down a threat
          </h2>
          <p className="mt-2 text-sm text-mist max-w-xl font-normal leading-relaxed">
            Follow the six stages of investigation—from inbound message to transparent risk assessment and defensive action.
          </p>
        </div>

        {/* Step pill buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121419] border border-white/[0.06]">
          {STORY_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeStep === idx
                  ? "bg-bone text-[#0b0d11] font-semibold shadow-sm"
                  : "text-mist hover:text-bone hover:bg-white/[0.03]"
              }`}
            >
              {s.step}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Stage */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-stretch">
        {/* Left Column: Interactive Story Progress List */}
        <div className="space-y-2.5">
          {STORY_STEPS.map((s, idx) => {
            const isActive = activeStep === idx;
            return (
              <div
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-xl p-4 border transition-all ${
                  isActive
                    ? "bg-[#14171d] border-white/[0.15] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                    : "bg-[#111317]/50 border-white/[0.04] hover:border-white/[0.08] hover:bg-[#121419]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-dim font-medium">{s.step}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <h3 className={`mt-1.5 text-sm font-medium ${isActive ? "text-bone font-semibold" : "text-mist"}`}>
                  {s.title}
                </h3>
                <p className="mt-1 text-xs text-dim leading-relaxed line-clamp-2">
                  {s.takeaway}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Refined Inspection Dossier */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121419] p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-bone">{current.title}</span>
              </div>
              <span className="text-xs text-dim">
                Stage {activeStep + 1} of 6
              </span>
            </div>

            {/* Extracted Artifact Quote */}
            <div>
              <span className="text-xs font-medium text-dim block mb-2">Extracted content</span>
              <div className="rounded-xl border border-white/[0.06] bg-[#181b22] p-4 text-sm text-bone leading-relaxed whitespace-pre-line">
                {current.quote}
              </div>
            </div>

            {/* Human Explanation */}
            <div className="mt-5 p-4 rounded-xl bg-[#161920] border border-white/[0.05]">
              <span className="text-xs font-medium text-azure block mb-1">
                Investigation analysis
              </span>
              <p className="text-xs text-mist leading-relaxed font-normal">
                {current.explanation}
              </p>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-dim">
              Explore how this works on live messages
            </span>
            <div className="flex gap-2">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                className="btn btn-ghost !py-1 !px-3 !text-xs disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={activeStep === STORY_STEPS.length - 1}
                onClick={() => setActiveStep((s) => Math.min(STORY_STEPS.length - 1, s + 1))}
                className="btn btn-primary !py-1 !px-3 !text-xs disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
