"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-providers";
import { DEMO_IDS } from "@/data/demo";

function StaticGraph() {
  const nodes = [
    { x: 130, y: 120, label: "WealthGrow", kind: "ENTITY", color: "#ff4d3d" },
    { x: 350, y: 60, label: "12% monthly", kind: "CLAIM", color: "#f2a93b" },
    { x: 350, y: 185, label: "SEBI INX1234", kind: "REGULATOR", color: "#ff4d3d" },
    { x: 570, y: 60, label: "sebi-verify.in", kind: "WEBSITE", color: "#ff4d3d" },
    { x: 570, y: 185, label: "+91 98765 43210", kind: "CONTACT", color: "#98a0ab" },
  ];
  const edges: [number, number, string][] = [
    [0, 1, "CLAIMS"],
    [0, 2, "APPROVAL FROM"],
    [1, 3, "LINKS TO"],
    [0, 4, "CONTACTS VIA"],
  ];
  return (
    <svg viewBox="0 0 700 250" className="h-auto w-full" role="img" aria-label="trust graph">
      {edges.map(([a, b, label], i) => {
        const from = nodes[a];
        const to = nodes[b];
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        return (
          <g key={i}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#3a414b" strokeDasharray="4 4" />
            <text x={mx} y={my - 6} textAnchor="middle" fontSize="9.5" fill="#6b737e" fontFamily="var(--font-jetbrains)">
              {label}
            </text>
          </g>
        );
      })}
      {nodes.map((n) => (
        <g key={n.label}>
          <rect
            x={n.x - 66}
            y={n.y - 18}
            width="132"
            height="36"
            rx="11"
            fill="rgba(255,255,255,0.04)"
            stroke={n.color}
          />
          <text x={n.x} y={n.y - 3} textAnchor="middle" fontSize="8.5" fill="#6b737e" fontFamily="var(--font-jetbrains)" letterSpacing="1">
            {n.kind}
          </text>
          <text x={n.x} y={n.y + 11} textAnchor="middle" fontSize="11" fill={n.color} fontWeight="600">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Landing() {
  const { dict } = useApp();

  return (
    <div>
      <section className="grain relative overflow-hidden border-b border-line">
        <div className="grid-lines absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-20 md:pb-28 md:pt-28">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="kicker">AI Financial Threat Intelligence · India</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-bone md:text-6xl">
                {dict.hero.headline}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mist md:text-xl">{dict.hero.sub}</p>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-dim">{dict.hero.body}</p>

              {/* The product loop, stated up front: DETECT → VERIFY → EXPLAIN → PROTECT */}
              <ol className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-2" aria-label={dict.hero.loopLabel}>
                {dict.landing.steps.map((step, i) => (
                  <Fragment key={step.title}>
                    <li className="chip !px-3.5 !py-1.5 !text-[12px] font-semibold uppercase tracking-[0.16em]">
                      {step.title}
                    </li>
                    {i < dict.landing.steps.length - 1 ? (
                      <li aria-hidden className="text-[13px] text-dim">
                        →
                      </li>
                    ) : null}
                  </Fragment>
                ))}
              </ol>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/investigate" className="btn btn-primary !px-6 !py-3 !text-[15px]">
                  {dict.hero.cta}
                </Link>
                <Link href={`/investigate?demo=${DEMO_IDS[0]}`} className="btn btn-ghost !px-6 !py-3 !text-[15px]">
                  {dict.hero.ctaDemo}
                </Link>
                <a href="#how" className="px-1 text-[14px] text-mist underline-offset-4 hover:text-bone hover:underline">
                  {dict.hero.secondary}
                </a>
              </div>
              <p className="mt-5 text-[13px] text-dim">{dict.hero.micro}</p>
            </div>

            <div className="hidden lg:block">
              <div className="panel p-5">
                <p className="kicker mb-3">{dict.landing.graphKicker}</p>
                <StaticGraph />
              </div>
            </div>
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {dict.landing.impactStats.map((stat) => (
              <div key={stat.label} className="bg-panel px-4 py-5">
                <p className="num text-3xl font-semibold text-bone">{stat.value}</p>
                <p className="mt-1 text-[12.5px] leading-snug text-mist">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="kicker">{dict.landing.problemKicker}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-bone md:text-3xl">
              {dict.landing.problemTitle}
            </h2>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-mist">{dict.landing.problemBody}</p>
            <ul className="mt-5 space-y-2.5">
              {dict.landing.problemPoints.map((point) => (
                <li key={point} className="flex gap-3 text-[14px] leading-relaxed text-bone">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-line bg-ink-2 py-16">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="kicker">{dict.landing.howKicker}</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-bone md:text-3xl">
            {dict.landing.howTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-mist">{dict.landing.howBody}</p>

          <ol className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {dict.landing.steps.map((step) => (
              <li key={step.n} className="bg-panel p-6">
                <span className="num text-[13px] text-signal">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-bone">{step.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-mist">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="kicker">{dict.landing.graphKicker}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-bone md:text-3xl">
              {dict.landing.graphTitle}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-mist">{dict.landing.graphBody}</p>
          </div>
          <div className="panel p-5">
            <StaticGraph />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-2 py-16">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="kicker">{dict.landing.exampleKicker}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-bone md:text-3xl">
            {dict.landing.exampleTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-mist">{dict.landing.exampleBody}</p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_IDS.map((id) => {
              const scenario = (dict.demo.scenarios as Record<string, { title: string; desc: string }>)[id];
              return (
                <li key={id} className="panel flex flex-col gap-2 p-5">
                  <span className="text-[15px] font-semibold text-bone">{scenario?.title}</span>
                  <span className="flex-1 text-[13.5px] leading-relaxed text-mist">{scenario?.desc}</span>
                  <Link href={`/investigate?demo=${id}`} className="btn btn-ghost mt-2 !py-1.5 !text-[12.5px]">
                    {dict.demo.run}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="kicker">{dict.landing.bharatKicker}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-bone">{dict.landing.bharatTitle}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-mist">{dict.landing.bharatBody}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-5">
              <p className="kicker text-emerald">{dict.safety.can}</p>
              <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-bone">
                {dict.safety.canItems.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="text-emerald" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-5">
              <p className="kicker text-signal">{dict.safety.cannot}</p>
              <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-mist">
                {dict.safety.cannotItems.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="text-signal" aria-hidden>
                      ×
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="panel p-6">
            <p className="kicker">{dict.landing.privacyKicker}</p>
            <h3 className="mt-2 text-xl font-semibold text-bone">{dict.landing.privacyTitle}</h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-mist">{dict.landing.privacyBody}</p>
          </div>
          <div className="panel p-6">
            <p className="kicker">{dict.landing.impactKicker}</p>
            <h3 className="mt-2 text-xl font-semibold text-bone">{dict.landing.impactTitle}</h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-mist">{dict.landing.impactBody}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ink-2 py-20">
        <div className="mx-auto w-full max-w-3xl px-5 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-bone md:text-4xl">
            {dict.landing.ctaTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-mist">{dict.landing.ctaBody}</p>
          <Link href="/investigate" className="btn btn-primary mt-8 !px-7 !py-3.5 !text-[15px]">
            {dict.landing.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
