"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-providers";
import { DEMO_IDS } from "@/data/demo";
import { HeroProductPreview } from "@/components/landing/hero-product-preview";
import { StoryDeconstruction } from "@/components/landing/story-deconstruction";

export function Landing() {
  const { dict } = useApp();

  return (
    <div className="bg-ink text-bone font-sans">
      {/* Editorial Premium Financial Intelligence Hero */}
      <section className="relative border-b border-line bg-gradient-to-b from-[#0e1014] to-[#0a0b0e] pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto w-full max-w-6xl px-5">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-azure bg-azure/10 border border-azure/20">
              <span className="h-1.5 w-1.5 rounded-full bg-azure" />
              Financial Threat Intelligence · India
            </span>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            {/* Left Narrative */}
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-bone sm:text-5xl md:text-6xl leading-[1.08]">
                Verify before you trust.
              </h1>

              <p className="mt-5 text-base md:text-lg leading-relaxed text-mist max-w-xl font-normal">
                Investigate suspicious investment messages, claims, identities and payment requests before you act.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/investigate"
                  className="btn btn-primary !px-6 !py-3 !text-sm font-semibold shadow-lg shadow-white/5"
                >
                  Analyze something
                </Link>
                <Link
                  href={`/investigate?demo=${DEMO_IDS[0]}`}
                  className="btn btn-ghost !px-5 !py-3 !text-sm text-mist hover:text-bone"
                >
                  Explore a demo →
                </Link>
              </div>

              <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-6 text-xs text-dim">
                <span className="flex items-center gap-2">
                  <span className="text-[#35b779]">✓</span> 4,200+ SEBI Registries Verified
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[#35b779]">✓</span> Zero-Retention Client-Side Security
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[#35b779]">✓</span> 100% Deterministic Evidence
                </span>
              </div>
            </div>

            {/* Right Product Preview */}
            <div className="w-full">
              <HeroProductPreview />
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

      {/* Problem & Reality in India */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24 border-b border-white/[0.06]">
        <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-mist block mb-2">
              The Reality
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-bone font-sans">
              Financial fraud is evolving faster than traditional checks.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-mist font-normal">
              Indian investors are targeted with fabricated regulatory documents, cloned corporate identity credentials, and multi-hop UPI mule accounts designed to bypass ordinary scrutiny.
            </p>
          </div>
          <div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#121419] divide-y divide-white/[0.05] overflow-hidden">
              {[
                { title: "Fabricated SEBI Approvals", desc: "Forged certificates and unregistered registration strings quoted to exploit trust." },
                { title: "High-Yield Urgency Traps", desc: "Short deadlines combined with guarantees of 20–30% monthly returns." },
                { title: "Personal Mule Accounts", desc: "Corporate advisories routing payments to personal P2P bank handles." },
                { title: "Brand New Cloned Domains", desc: "Lookalike websites registered only hours before solicitations begin." },
              ].map((item, idx) => (
                <div key={item.title} className="p-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-azure">0{idx + 1}</span>
                    <h3 className="text-sm font-semibold text-bone">{item.title}</h3>
                  </div>
                  <p className="mt-1 text-xs text-mist leading-relaxed pl-7">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="how" className="border-b border-white/[0.06] bg-[#0c0d11] py-24">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-azure block mb-2">
              How Rakshak works
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-bone font-sans">
              Four steps from uncertainty to verified clarity.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist font-normal">
              An evidence-first engine that correlates claims against official Indian registries, DNS databases, and banking networks.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", title: "Extract claims", desc: "Isolates promises, return multipliers, regulatory statements, and payment channels." },
              { n: "02", title: "Verify evidence", desc: "Cross-checks against 4,200+ registered SEBI intermediaries and banking routing tables." },
              { n: "03", title: "Score risk", desc: "Assigns a transparent 0–100 risk rating with exact mathematical contribution." },
              { n: "04", title: "Protect capital", desc: "Delivers immediate, time-sensitive Golden Hour actions and complaint documentation." },
            ].map((step) => (
              <div key={step.n} className="rounded-xl border border-white/[0.06] bg-[#121419] p-6 hover:border-white/[0.12] transition-all">
                <span className="text-xs font-semibold text-azure block">{step.n}</span>
                <h3 className="mt-3 text-base font-semibold text-bone">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-mist font-normal">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Investigations Showcase */}
      <section className="border-b border-white/[0.06] bg-[#0a0b0e] py-24">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/[0.06]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-mist block mb-2">
                Sample investigations
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-bone font-sans">
                Explore real-world scenarios
              </h2>
            </div>
            <span className="text-xs text-dim">
              Load an interactive pre-verified investigation
            </span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#121419] divide-y divide-white/[0.05] overflow-hidden">
            {DEMO_IDS.map((id, idx) => {
              const scenario = (dict.demo.scenarios as Record<string, { title: string; desc: string }>)[id];
              return (
                <div
                  key={id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-xs font-medium text-azure mt-0.5">0{idx + 1}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-bone">{scenario?.title ?? id}</h3>
                      <p className="text-xs text-mist mt-0.5 max-w-2xl font-normal leading-relaxed">{scenario?.desc}</p>
                    </div>
                  </div>
                  <Link
                    href={`/investigate?demo=${id}`}
                    className="btn btn-ghost !py-1.5 !px-3.5 !text-xs font-medium shrink-0"
                  >
                    View investigation →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety & Invariants */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24 border-b border-white/[0.06]">
        <div className="grid gap-12 md:grid-cols-2 items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-mist block mb-2">
              Our safety commitment
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-bone font-sans">
              Built for trust, transparency, and privacy.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist font-normal">
              Rakshak operates on zero-retention principles. Your screenshots, documents, and messages remain in your browser session and are never uploaded or shared without explicit permission.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-[#121419] p-5">
              <span className="text-xs font-semibold text-[#35b779] block mb-3">✓ What Rakshak does</span>
              <ul className="space-y-2 text-xs text-mist">
                <li>• Verifies intermediary credentials against official records</li>
                <li>• Detects prohibited return claims and pressure techniques</li>
                <li>• Identifies cloned websites and mule UPI identifiers</li>
                <li>• Guides immediate action if funds have already transferred</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#121419] p-5">
              <span className="text-xs font-semibold text-[#e5484d] block mb-3">× What Rakshak does not do</span>
              <ul className="space-y-2 text-xs text-dim">
                <li>• Never offers investment or financial advice</li>
                <li>• Never stores unencrypted personal financial records</li>
                <li>• Never guarantees stock market investment outcomes</li>
                <li>• Never replaces official police and regulatory reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Hero */}
      <section className="bg-gradient-to-b from-[#0a0b0e] to-[#0e1015] py-24">
        <div className="mx-auto w-full max-w-3xl px-5 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-bone font-sans">
            Verify any investment claim in seconds.
          </h2>
          <p className="mt-4 text-base text-mist max-w-lg mx-auto font-normal leading-relaxed">
            Free, private, and deterministic. Protect your hard-earned savings before making a decision.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/investigate" className="btn btn-primary !px-7 !py-3.5 !text-sm font-semibold shadow-lg shadow-white/5">
              Start an investigation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
