"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-providers";
import { DEMO_IDS } from "@/data/demo";
import { HeroForensicArtifact } from "@/components/landing/hero-forensic-artifact";
import { StoryDeconstruction } from "@/components/landing/story-deconstruction";

export function Landing() {
  const { dict } = useApp();

  return (
    <div className="bg-ink text-bone font-sans">
      {/* Editorial Intelligence Publication Hero */}
      <section className="relative border-b border-line bg-[#080a0d] pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          {/* Masthead meta rail */}
          <div className="flex flex-wrap items-center justify-between border-b border-line pb-3 text-[11px] font-mono tracking-widest text-dim uppercase">
            <span>RAKSHAK / FINANCIAL THREAT INTELLIGENCE / INDIA</span>
            <span className="flex items-center gap-2 text-mist">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
              INVESTIGATIVE INSTRUMENT · CITIZEN DEFENSE
            </span>
          </div>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.05fr_1.1fr]">
            {/* Left Editorial Narrative */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal font-semibold">
                SYSTEM CLASSIFICATION: ACTIVE EXPLOIT DEFENSE
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-bone sm:text-5xl md:text-6xl leading-[1.02]">
                VERIFY<br />
                BEFORE YOU<br />
                TRUST.
              </h1>

              <p className="mt-6 text-base font-normal leading-relaxed text-mist md:text-lg max-w-xl">
                Investigate suspicious financial claims, identities, domains, documents, and payment signals before they become catastrophic losses.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/investigate"
                  className="btn btn-primary !px-6 !py-3 !text-[13.5px] uppercase tracking-wider font-mono font-bold"
                >
                  START AN INVESTIGATION
                </Link>
                <Link
                  href={`/investigate?demo=${DEMO_IDS[0]}`}
                  className="btn btn-ghost !px-5 !py-3 !text-[13px] uppercase tracking-wider font-mono text-mist hover:text-bone"
                >
                  LOAD LIVE CASE FILE →
                </Link>
              </div>

              {/* Institutional pipeline indicators */}
              <div className="mt-10 border-t border-line pt-5">
                <p className="font-mono text-[10.5px] uppercase tracking-widest text-dim mb-3">
                  CORE ARTIFACT CAPABILITIES
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-mist">
                  <div className="flex items-center gap-2">
                    <span className="text-azure">01/</span> SEBI Master Registry Cross-Check
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-azure">02/</span> Typo-Squatting & DNS Age Analysis
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-azure">03/</span> Mule UPI VPA & IFSC Telemetry
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-azure">04/</span> Tamper-Evident Cybercrime Dossier
                  </div>
                </div>
              </div>
            </div>

            {/* Right Forensic Artifact */}
            <div className="w-full">
              <HeroForensicArtifact />
            </div>
          </div>

          {/* Institutional Telemetry Strip */}
          <div className="mt-12 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            <div className="bg-[#0a0d11] p-4">
              <p className="num text-2xl font-bold text-bone">4,200+</p>
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-dim mt-1">SEBI Intermediaries Indexed</p>
            </div>
            <div className="bg-[#0a0d11] p-4">
              <p className="num text-2xl font-bold text-signal">₹1,750 Cr</p>
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-dim mt-1">Q2 2024 Digital Arrest Losses</p>
            </div>
            <div className="bg-[#0a0d11] p-4">
              <p className="num text-2xl font-bold text-emerald">100% Client-Side</p>
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-dim mt-1">Default Zero-Cloud Retention</p>
            </div>
            <div className="bg-[#0a0d11] p-4">
              <p className="num text-2xl font-bold text-azure">&lt; 350ms</p>
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-dim mt-1">Deterministic Rule Execution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Story Deconstruction Section */}
      <StoryDeconstruction />

      {/* Problem & Threat Analysis in Bharat */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 border-b border-line">
        <div className="grid gap-12 md:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 bg-signal" />
              <p className="kicker !text-bone">{dict.landing.problemKicker}</p>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-bone md:text-3xl font-sans">
              {dict.landing.problemTitle}
            </h2>
            <p className="mt-4 text-xs font-mono leading-relaxed text-mist">
              {dict.landing.problemBody}
            </p>
          </div>
          <div>
            <div className="border border-line bg-[#090b0e] divide-y divide-line font-mono text-xs">
              {dict.landing.problemPoints.map((point, idx) => (
                <div key={point} className="flex items-start gap-4 p-4 hover:bg-[#0d1015] transition-colors">
                  <span className="text-signal font-bold shrink-0">0{idx + 1}/</span>
                  <span className="text-bone leading-relaxed font-sans">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investigation Methodology Strip */}
      <section id="how" className="border-b border-line bg-[#080b0f] py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 bg-azure" />
            <p className="kicker !text-azure">{dict.landing.howKicker}</p>
          </div>
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-bone md:text-3xl font-sans">
            {dict.landing.howTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-xs font-mono leading-relaxed text-mist">{dict.landing.howBody}</p>

          <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4 font-mono">
            {dict.landing.steps.map((step) => (
              <div key={step.n} className="bg-[#0a0d12] p-6 hover:bg-[#0e1218] transition-colors">
                <span className="text-azure text-xs font-bold">{step.n} // PROTOCOL</span>
                <h3 className="mt-3 text-base font-bold font-sans text-bone">{step.title}</h3>
                <p className="mt-2 text-xs font-sans leading-relaxed text-mist">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Scenarios & Verified Dockets */}
      <section className="border-b border-line bg-[#07090c] py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-8">
            <div>
              <p className="kicker !text-bone">{dict.landing.exampleKicker}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-bone md:text-3xl font-sans">
                {dict.landing.exampleTitle}
              </h2>
            </div>
            <span className="text-xs font-mono text-dim hidden sm:inline">
              SELECT DEMO DOCKET TO LOAD INSTANTLY
            </span>
          </div>

          <div className="border border-line bg-[#090b0e] divide-y divide-line font-mono text-xs">
            {DEMO_IDS.map((id, idx) => {
              const scenario = (dict.demo.scenarios as Record<string, { title: string; desc: string }>)[id];
              return (
                <div
                  key={id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-[#0e1218] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-azure font-bold shrink-0">RX-DEMO-0{idx + 1}</span>
                    <div>
                      <span className="text-sm font-sans font-semibold text-bone block">{scenario?.title}</span>
                      <span className="text-xs font-sans text-mist mt-0.5 block">{scenario?.desc}</span>
                    </div>
                  </div>
                  <Link
                    href={`/investigate?demo=${id}`}
                    className="btn btn-ghost !py-1.5 !px-3.5 !text-xs font-mono uppercase tracking-wider shrink-0"
                  >
                    Open Docket →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regulatory Boundaries & Privacy Invariants */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 border-b border-line font-mono text-xs">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="kicker !text-bone">{dict.landing.bharatKicker}</p>
            <h2 className="mt-2 text-2xl font-bold font-sans tracking-tight text-bone">{dict.landing.bharatTitle}</h2>
            <p className="mt-2 text-mist font-sans leading-relaxed">{dict.landing.bharatBody}</p>
          </div>
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
            <div className="bg-[#090c10] p-5">
              <p className="text-emerald font-bold tracking-wider uppercase mb-3">✓ {dict.safety.can}</p>
              <ul className="space-y-2 text-mist font-sans text-xs">
                {dict.safety.canItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald shrink-0">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#090c10] p-5">
              <p className="text-signal font-bold tracking-wider uppercase mb-3">× {dict.safety.cannot}</p>
              <ul className="space-y-2 text-dim font-sans text-xs">
                {dict.safety.cannotItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-signal shrink-0">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Rail */}
      <section className="bg-[#080b0f] py-20">
        <div className="mx-auto w-full max-w-3xl px-5 text-center">
          <p className="kicker !text-signal font-bold">CITIZEN INVESTOR SAFEGUARD</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-bone md:text-4xl font-sans">
            {dict.landing.ctaTitle}
          </h2>
          <p className="mt-3 text-sm text-mist max-w-lg mx-auto font-sans leading-relaxed">{dict.landing.ctaBody}</p>
          <Link href="/investigate" className="btn btn-primary mt-6 !px-8 !py-3.5 !text-xs font-mono uppercase tracking-wider font-bold">
            {dict.landing.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
