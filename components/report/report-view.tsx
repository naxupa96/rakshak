"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AnalysisReport, ClaimType, EvidenceItem, RiskFactor, WhyItem } from "@/types";
import { useApp } from "@/components/app-providers";
import { fmt, claimExplain, type Dict } from "@/lib/localization";
import {
  Bar,
  Badge,
  Empty,
  LEVEL_TONE,
  Quote,
  Section,
  severityTone,
  verificationTone,
  type Tone,
} from "@/components/ui";
import { TrustGraphView } from "@/components/graph/trust-graph";
import { downloadJson, saveIncident, listIncidents, getPreviousScan, recordScanHash } from "@/lib/storage/locker";
import { LiveVerificationChips } from "@/components/report/live-verification-chips";
import { CounterfactualCard } from "@/components/report/counterfactual-card";
import { ImpersonationDiffCard } from "@/components/report/impersonation-diff-card";
import { AudioSafetyBriefing } from "@/components/report/audio-safety-briefing";
import { ComplaintDossierModal } from "@/components/report/complaint-dossier-modal";
import { PsychologicalTimelineCard } from "@/components/report/psychological-timeline-card";
import { UrlSandboxModal } from "@/components/report/url-sandbox-modal";
import { AdvisoryDrawer } from "@/components/report/advisory-drawer";
import { GoldenHourHud } from "@/components/report/golden-hour-hud";
import { ApkInspectionCard } from "@/components/report/apk-inspection-card";
import { PdfForensicCard } from "@/components/report/pdf-forensic-card";
import { VpaProbeCard } from "@/components/report/vpa-probe-card";
import { AudioForensicCard } from "@/components/report/audio-forensic-card";
import { ScamSimulatorModal } from "@/components/report/scam-simulator-modal";
import { MultiHopMuleGraphCard } from "@/components/report/multi-hop-mule-graph-card";
import { CryptoWalletCard } from "@/components/report/crypto-wallet-card";
import { CounterBaitModal } from "@/components/report/counter-bait-modal";
import { exportReportToStix21 } from "@/lib/analyze/stix";

/** Colour used for a risk tone in text and chart marks. */
function toneColor(tone: Tone): string {
  if (tone === "good" || tone === "low") return "#35c08a";
  if (tone === "moderate" || tone === "warn" || tone === "elevated") return "#f2a93b";
  if (tone === "high" || tone === "critical" || tone === "bad") return "#ff4d3d";
  return "#5b93ff";
}

/** Localised count sentence, honouring singular forms. Args are (plural, singular). */
function countText(dict: Dict, count: number, plural: string, singular: string): string {
  return fmt(count === 1 ? singular : plural, { count });
}

/** Which report section each risk factor is evidenced by. */
const FACTOR_TARGET: Record<RiskFactor["id"], string> = {
  deceptive_signals: "section-signals",
  pressure: "section-signals",
  verification_gap: "section-claims",
  source_credibility: "section-entities",
  solicitation: "section-evidence",
};

function confidenceBand(confidence: number, dict: Dict): string {
  if (confidence >= 0.75) return dict.breakdown.bandHigh;
  if (confidence >= 0.5) return dict.breakdown.bandMedium;
  return dict.breakdown.bandLow;
}

function useEvidenceText() {
  const { dict } = useApp();
  return (e: EvidenceItem): string => {
    const params: Record<string, string> = { ...(e.params ?? {}) };
    if (params.reason) params.reason = dict.domainReasons[params.reason as keyof typeof dict.domainReasons] ?? params.reason;
    const template = (dict.evidenceStatements as Record<string, string | undefined>)[e.statementKey];
    if (!template) return e.statementKey;
    return fmt(template, params);
  };
}

function ScoreDial({ score, tone }: { score: number; tone: Tone }) {
  const color = toneColor(tone);
  const r = 54;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="relative h-[136px] w-[136px] shrink-0" role="img" aria-label={`${score} / 100`}>
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#23282f" strokeWidth="9" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-[34px] font-semibold leading-none text-bone">{score}</span>
        <span className="kicker mt-1">/ 100</span>
      </div>
    </div>
  );
}

function WhyList({ report }: { report: AnalysisReport }) {
  const { dict, simple } = useApp();
  const evidenceText = useEvidenceText();

  const claimById = useMemo(() => new Map(report.claims.map((c) => [c.id, c])), [report.claims]);
  const evidenceById = useMemo(() => new Map(report.evidence.map((e) => [e.id, e])), [report.evidence]);

  const describe = (item: WhyItem): { title: string; body: string } => {
    if (item.sourceKind === "signal") {
      const entry = dict.signals[item.sourceId as keyof typeof dict.signals];
      if (entry) return { title: entry.title, body: simple ? entry.simple : entry.explain };
      return { title: dict.why.genericTitle, body: item.sourceId };
    }
    if (item.sourceKind === "claim") {
      const claim = claimById.get(item.sourceId);
      const type = claim?.type as ClaimType | undefined;
      return {
        title: dict.why.claimSource,
        body: type ? claimExplain(dict, type) : (claim?.statement ?? ""),
      };
    }
    if (item.sourceKind === "evidence") {
      const ev = evidenceById.get(item.sourceId);
      return {
        title: dict.why.evidenceSource,
        body: ev ? evidenceText(ev) : (item.quote ?? ""),
      };
    }
    const ctx = item.params?.context;
    const key = ctx === "educational" ? "contextEducational" : ctx === "news" ? "contextNews" : null;
    return {
      title: dict.why.contextSource,
      body: key ? (dict.evidenceStatements as Record<string, string>)[key] : dict.risk.contextNote,
    };
  };

  if (!report.why.length) return <Empty text={dict.report.noSignals} />;

  return (
    <ol className="space-y-3">
      {report.why.map((item, index) => {
        const { title, body } = describe(item);
        const tone: Tone = item.severity === "info" ? "neutral" : severityTone(item.severity);
        return (
          <li key={item.id} className="panel-flat flex gap-4 px-4 py-3.5">
            <span className="num mt-0.5 text-[13px] text-dim">{String(index + 1).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-bone">{title}</span>
                <Badge tone={tone}>
                  {item.severity === "info" ? dict.severity.info : dict.severity[item.severity]}
                </Badge>
              </div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-mist">{body}</p>
              {item.quote ? <Quote>{item.quote}</Quote> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ReportView({ report, incident }: { report: AnalysisReport; incident?: string }) {
  const { dict, simple } = useApp();
  const evidenceText = useEvidenceText();
  const [savedId, setSavedId] = useState<string | null>(
    () => listIncidents().find((e) => e.id === report.id)?.id ?? null,
  );

  const levelTone = LEVEL_TONE[report.risk.level];
  const [highlight, setHighlight] = useState<string | null>(null);
  const claimsByType = report.claims;
  const [copied, setCopied] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [advisoryOpen, setAdvisoryOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [baitOpen, setBaitOpen] = useState(false);
  const prevScan = useMemo(() => {
    return report.input?.text ? getPreviousScan(report.input.text) : null;
  }, [report.input?.text]);

  const onSave = () => {
    const entry = saveIncident(report);
    setSavedId(entry.id);
  };

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rakshak Security Report: ${report.id}`,
          text: `Risk Assessment: ${report.risk.score}/100 (${report.risk.level})`,
          url,
        });
        return;
      } catch {
        /* fallback to clipboard */
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const jumpTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setHighlight(sectionId);
    window.setTimeout(() => setHighlight((current) => (current === sectionId ? null : current)), 2000);
  };

  const flash = (sectionId: string) => (highlight === sectionId ? "flash-target" : "");

  const liveVerificationUnavailable =
    report.uncertainties.includes("externalUnavailable") ||
    report.evidence.some((e) => e.status === "unverifiable");

  const factorsDescending = [...report.risk.factors].sort((a, b) => b.contribution - a.contribution);
  const rawContribution =
    Math.round(report.risk.factors.reduce((sum, f) => sum + f.contribution, 0) * 10) / 10;

  // Simple mode leads with what to do; the default order keeps it as the closing section.
  const actionsSection = (
    <Section
      id="section-actions"
      className={flash("section-actions")}
      title={dict.report.whatTodo}
      hint={dict.report.whatTodoHint}
    >
      {(["before", "paid", "report"] as const).map((phase) => {
        const items = report.actions.filter((a) => a.phase === phase);
        if (!items.length) return null;
        const heading =
          phase === "before" ? dict.phases.before : phase === "paid" ? dict.phases.paid : dict.phases.report;
        return (
          <div key={phase} className="mb-5">
            <p className="kicker mb-2">{heading}</p>
            <ul className="space-y-2">
              {items.map((a) => (
                <li
                  key={a.id}
                  className={`panel-flat flex items-start gap-3 px-4 py-3 text-[13.5px] leading-relaxed ${
                    a.kind === "avoid" ? "border-signal/30" : "border-emerald/25"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      a.kind === "avoid" ? "bg-signal/15 text-[#ff9d92]" : "bg-emerald/15 text-emerald"
                    }`}
                    aria-hidden
                  >
                    {a.kind === "avoid" ? "×" : "✓"}
                  </span>
                  <span className="text-bone">{dict.actions[a.textKey as keyof typeof dict.actions]}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </Section>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">{dict.report.kicker}</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-bone">
            {incident ? `${dict.report.incident} ${incident}` : report.id}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-dim">
            <span>{dict.inputKinds[report.input.kind]}</span>
            <span aria-hidden>·</span>
            <span className="num">{new Date(report.createdAt).toLocaleString()}</span>
            <span aria-hidden>·</span>
            <span>{report.usedLlm ? dict.report.llmNote : dict.report.rulesNote}</span>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <AudioSafetyBriefing
            score={report.risk.score}
            level={report.risk.level}
            lang={report.language}
            suspectName={report.entities[0]?.value}
          />
          {report.dossier && (
            <button
              className="btn btn-ghost !py-2 !text-[13px] !text-sky-400 !border-sky-500/30 hover:!bg-sky-500/10"
              onClick={() => setDossierOpen(true)}
            >
              📋 File 1930/SEBI Complaint
            </button>
          )}
          {report.sandbox && (
            <button
              className="btn btn-ghost !py-2 !text-[13px] !text-red-400 !border-red-500/30 hover:!bg-red-500/10"
              onClick={() => setSandboxOpen(true)}
            >
              🔬 Isolated URL Sandbox
            </button>
          )}
          <button
            className="btn btn-ghost !py-2 !text-[13px] !text-emerald-400 !border-emerald-500/30 hover:!bg-emerald-500/10"
            onClick={() => setAdvisoryOpen(true)}
          >
            💬 Ask Advisor
          </button>
          <button
            className="btn btn-ghost !py-2 !text-[13px] !text-amber-400 !border-amber-500/30 hover:!bg-amber-500/10"
            onClick={() => setSimulatorOpen(true)}
            title="Launch Interactive Counter-Scam Defense Sandbox"
          >
            🎮 Defense Sandbox
          </button>
          <button
            className="btn btn-ghost !py-2 !text-[13px] !text-red-400 !border-red-500/30 hover:!bg-red-500/10"
            onClick={() => setBaitOpen(true)}
            title="Generate AI Counter-Bait to stall scammers and extract mule accounts"
          >
            🤖 AI Honeypot Bait
          </button>
          <button className="btn btn-ghost !py-2 !text-[13px]" onClick={onShare}>
            {copied ? dict.report.shareSuccess : dict.report.shareIncident}
          </button>
          <button className="btn btn-ghost !py-2 !text-[13px]" onClick={() => downloadJson(report, report.id)}>
            {dict.common.exportReport}
          </button>
          <button
            className="btn btn-ghost !py-2 !text-[13px] !text-cyan-400 !border-cyan-500/30 hover:!bg-cyan-500/10"
            onClick={() => downloadJson(exportReportToStix21(report), `stix-${report.id}.json`)}
            title="Export STIX 2.1 Standard Threat Intelligence Bundle"
          >
            🛡 STIX 2.1
          </button>
          <button className="btn btn-ghost !py-2 !text-[13px]" onClick={() => window.print()}>
            PDF
          </button>
          {savedId ? (
            <>
              <Link className="btn btn-ghost !py-2 !text-[13px]" href={`/incident/${savedId}`}>
                {dict.report.saved}
              </Link>
              <Link className="btn btn-ghost !py-2 !text-[13px]" href="/locker">
                {dict.locker.title}
              </Link>
            </>
          ) : (
            <button className="btn btn-primary !py-2 !text-[13px]" onClick={onSave}>
              {dict.report.save}
            </button>
          )}
          <Link className="btn btn-ghost !py-2 !text-[13px]" href="/investigate">
            {dict.common.newAnalysis}
          </Link>
        </div>
      </div>

      {/* Verdict — the first thing a judge should see. */}
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <ScoreDial score={report.risk.score} tone={levelTone} />
          <div className="min-w-[220px] flex-1">
            <p className="kicker">{dict.risk.label}</p>
            <p
              className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: toneColor(levelTone) }}
            >
              {dict.risk.levels[report.risk.level].label}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <p className="num text-lg font-semibold text-bone">
                {report.risk.score} <span className="text-dim">/ 100</span>
              </p>
              {prevScan && (
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${
                  report.risk.score > prevScan.score
                    ? "bg-coral/15 text-coral"
                    : report.risk.score < prevScan.score
                    ? "bg-leaf/15 text-leaf"
                    : "bg-charcoal text-dim"
                }`}>
                  {report.risk.score > prevScan.score ? `▲ +${report.risk.score - prevScan.score}` : report.risk.score < prevScan.score ? `▼ ${report.risk.score - prevScan.score}` : "±0"} vs prev scan
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">
              {dict.risk.levels[report.risk.level].line}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3.5 text-[13px]">
          <span className="text-bone">
            {countText(dict, report.signals.length, dict.report.signalsDetected, dict.report.signalsDetectedOne)}
          </span>
          <span aria-hidden className="text-dim">·</span>
          <span className="text-bone">
            {countText(dict, report.evidence.length, dict.report.evidenceCount, dict.report.evidenceCountOne)}
          </span>
          <span aria-hidden className="text-dim">·</span>
          <span className="text-mist">
            {report.uncertainties.length
              ? countText(dict, report.uncertainties.length, dict.report.limitationsCount, dict.report.limitationsCountOne)
              : dict.report.noLimitations}
          </span>
          <span className="ml-auto text-mist">
            {dict.report.confidencePrefix}:{" "}
            <b className="num text-bone">{confidenceBand(report.confidence, dict)}</b>
          </span>
        </div>
      </div>

      {/* Emergency Golden Hour Hotline HUD */}
      <GoldenHourHud risk={report.risk} incidentId={report.id} />

      {/* Real Live Verification Panel */}
      <div className="mt-6">
        <LiveVerificationChips live={report.live} />
      </div>

      {/* Side-by-Side Impersonation & Registry Discrepancy Card */}
      {report.comparison && (
        <ImpersonationDiffCard comparison={report.comparison} />
      )}

      {/* Android APK & Trojan Inspector Card */}
      {report.apk && report.apk.isApk && (
        <ApkInspectionCard apk={report.apk} />
      )}

      {/* PDF Regulatory Certificate & Digital Signature Forensics */}
      {report.pdfForensics && report.pdfForensics.isPdf && (
        <PdfForensicCard pdf={report.pdfForensics} />
      )}

      {/* UPI Payment Service Provider (PSP) Routing & Mule Probe */}
      {report.vpaProbe && report.vpaProbe.length > 0 && (
        <VpaProbeCard probes={report.vpaProbe} />
      )}

      {/* Acoustic & Deepfake Voice Note Forensics */}
      {report.audioForensics && report.audioForensics.isAudio && (
        <AudioForensicCard audio={report.audioForensics} />
      )}

      {/* Multi-Hop Mule Layering & Dark Money Topology Graph */}
      {report.muleGraph && (
        <MultiHopMuleGraphCard graph={report.muleGraph} />
      )}

      {/* Cryptocurrency & USDT Mixer Off-Ramp Intelligence */}
      {report.cryptoTrace && report.cryptoTrace.length > 0 && (
        <CryptoWalletCard traces={report.cryptoTrace} />
      )}

      {report.insufficientEvidence ? (
        <div className="mt-4 rounded-2xl border border-amber/45 bg-amber/8 px-5 py-4" role="status">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber">
            {dict.report.insufficient}
          </p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-mist">{dict.report.insufficientBody}</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-bone">{dict.report.insufficientAction}</p>
        </div>
      ) : report.uncertainties.includes("ambiguous") ? (
        <div className="mt-4 rounded-2xl border border-amber/35 bg-amber/8 px-5 py-4" role="status">
          <p className="text-sm font-semibold text-amber">{dict.report.unableToVerify}</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-mist">{dict.report.unableToVerifyBody}</p>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
        <div className="min-w-0">
          <Section title={dict.report.why} hint={dict.report.whyHint} id="section-why" className={flash("section-why")}>
            <WhyList report={report} />
          </Section>

          {/* QR Code Extraction Card */}
          {report.qr && report.qr.hasQr && (
            <div className="panel mt-6 p-4 border border-sky-500/30 bg-sky-950/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">📷</span>
                  <span className="text-sm font-semibold text-bone">
                    Extracted QR Code Payload ({report.qr.payloadType?.toUpperCase()})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Target: {report.qr.decodedTarget}
                </span>
              </div>
              {report.qr.riskNotice && (
                <p className="mt-2 text-xs text-sky-200/90 leading-relaxed font-mono">
                  {report.qr.riskNotice}
                </p>
              )}
            </div>
          )}

          {/* Bank IFSC & Mule Account Notice */}
          {report.ifsc && (
            <div className="panel mt-6 p-4 border border-amber-500/30 bg-amber-950/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">🏦</span>
                  <span className="text-sm font-semibold text-bone">
                    Bank Account Decoded: {report.ifsc.bankName} ({report.ifsc.code})
                  </span>
                </div>
                {report.ifsc.isKnownMuleZone && (
                  <span className="text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    High-Risk Mule Zone
                  </span>
                )}
              </div>
              {report.ifsc.riskNotice && (
                <p className="mt-2 text-xs text-amber-300/90 leading-relaxed font-mono">
                  {report.ifsc.riskNotice}
                </p>
              )}
            </div>
          )}

          {/* Scam Attack Chain & Cognitive Vulnerability Timeline */}
          {report.psychology && report.psychology.length > 0 && (
            <PsychologicalTimelineCard timeline={report.psychology} />
          )}

          {/* Score breakdown — every point traced to the engine. */}
          <details className="panel mt-10 overflow-hidden" open>
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="text-[15px] font-semibold tracking-tight text-bone">{dict.breakdown.title}</span>
              <span className="chev shrink-0 text-dim" aria-hidden>
                ▾
              </span>
            </summary>
            <div className="border-t border-line px-5 py-4">
              <p className="num text-[13.5px] text-mist">
                {fmt(dict.breakdown.scoreLine, { score: report.risk.score })}
              </p>

              <ul className="mt-3 space-y-3">
                {factorsDescending.map((f) => {
                  const active = f.contribution > 0;
                  const color = active
                    ? toneColor(f.contribution >= 25 ? "bad" : f.contribution >= 12 ? "warn" : "low")
                    : "#6b737e";
                  const shown = Number.isInteger(f.contribution) ? String(f.contribution) : f.contribution.toFixed(1);
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        className="group flex w-full items-start gap-3 text-left focus-visible:outline-none"
                        onClick={() => jumpTo(FACTOR_TARGET[f.id])}
                        aria-label={`${dict.risk.factors[f.id]}: +${shown} — ${dict.breakdown.jump}`}
                      >
                        <span
                          className="num w-11 shrink-0 pt-0.5 text-right text-[14px] font-semibold"
                          style={{ color }}
                        >
                          {active ? `+${shown}` : "+0"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className={`text-[13.5px] ${active ? "text-bone" : "text-dim"}`}>
                              {dict.risk.factors[f.id]}
                            </span>
                            <span className="kicker shrink-0 gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                              {dict.breakdown.jump} →
                            </span>
                          </span>
                          <span className="mt-1.5 flex items-center gap-3">
                            <span className="min-w-0 flex-1">
                              <Bar value={f.points} tone={active ? (f.contribution >= 25 ? "bad" : f.contribution >= 12 ? "moderate" : "low") : "neutral"} />
                            </span>
                            <span className="num shrink-0 text-[11.5px] text-dim">
                              {f.points} × {Math.round(f.weight * 100)}%
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl border border-line bg-ink-2 px-3.5 py-2.5 text-[12.5px]">
                <span className="text-mist">
                  {dict.breakdown.sumOfFactors}{" "}
                  <b className="num text-bone">
                    +{Number.isInteger(rawContribution) ? rawContribution : rawContribution.toFixed(1)}
                  </b>
                  {report.risk.contextMultiplier !== 1 ? (
                    <>
                      {" × context "}
                      <b className="num text-bone">×{report.risk.contextMultiplier}</b>
                    </>
                  ) : null}
                </span>
                <span className="text-mist">
                  {dict.risk.label}: <b className="num text-bone">{report.risk.score}</b> / 100
                </span>
              </div>

              {report.risk.contextMultiplier !== 1 ? (
                <p className="mt-3 text-[12.5px] leading-relaxed text-dim">
                  {fmt(dict.breakdown.contextAdjust, { mult: String(report.risk.contextMultiplier) })}
                </p>
              ) : null}

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3.5">
                <div>
                  <p className="kicker">{dict.common.confidence}</p>
                  <p className="num mt-1 text-sm font-semibold text-bone">
                    {confidenceBand(report.confidence, dict)}
                  </p>
                </div>
                <div>
                  <p className="kicker">{dict.breakdown.evidenceAvailable}</p>
                  <p className="num mt-1 text-sm font-semibold text-bone">
                    {countText(dict, report.evidence.length, dict.report.evidenceCount, dict.report.evidenceCountOne)}
                  </p>
                </div>
                <div>
                  <p className="kicker">{dict.breakdown.verificationLimits}</p>
                  <p className="num mt-1 text-sm font-semibold text-bone">{report.uncertainties.length}</p>
                </div>
              </div>
            </div>
          </details>

          {simple ? actionsSection : null}

          <Section
            id="section-signals"
            className={flash("section-signals")}
            title={dict.report.riskSignals}
            hint={dict.report.riskSignalsHint}
            right={<span className="kicker">{report.signals.length}</span>}
          >
            {report.signals.length ? (
              <ul className="space-y-3">
                {report.signals.map((s) => {
                  const entry = dict.signals[s.id];
                  return (
                    <li key={s.id} className="panel-flat px-4 py-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-bone">{entry.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge tone={severityTone(s.severity)}>{dict.severity[s.severity]}</Badge>
                          <span className="num text-[11.5px] text-dim">{Math.round(s.confidence * 100)}%</span>
                        </div>
                      </div>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-mist">
                        {simple ? entry.simple : entry.explain}
                      </p>
                      {s.evidence.length ? (
                        <div className="mt-2 space-y-1">
                          {s.evidence.map((q, i) => (
                            <Quote key={i}>{q}</Quote>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty text={dict.report.noSignals} />
            )}
          </Section>

          <Section
            id="section-claims"
            className={flash("section-claims")}
            title={dict.report.claims}
            hint={dict.report.claimsHint}
            right={<span className="kicker">{claimsByType.length}</span>}
          >
            {claimsByType.length ? (
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
                {claimsByType.map((c) => (
                  <li key={c.id} className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-bone">{dict.claimTypes[c.type]}</span>
                      <div className="flex items-center gap-2">
                        <Badge tone={verificationTone(c.verification)}>{dict.status[c.verification]}</Badge>
                        <span className="num text-[11.5px] text-dim">{Math.round(c.confidence * 100)}%</span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-mist">
                      {claimExplain(dict, c.type)}
                    </p>
                    <Quote>{c.quote}</Quote>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty text={dict.report.noClaims} />
            )}
          </Section>

          <Section
            id="section-evidence"
            className={flash("section-evidence")}
            title={dict.report.evidence}
            hint={dict.report.evidenceHint}
            right={<span className="kicker">{report.evidence.length}</span>}
          >
            {liveVerificationUnavailable ? (
              <div className="mb-3 rounded-xl border border-amber/35 bg-amber/8 px-4 py-3" role="note">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-amber">
                  {dict.report.liveUnavailable}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-mist">{dict.report.liveUnavailableBody}</p>
              </div>
            ) : null}
            <ul className="space-y-2.5">
              {report.evidence.map((e) => (
                <li key={e.id} className="panel-flat flex flex-wrap items-start gap-3 px-4 py-3">
                  <Badge
                    tone={
                      e.status === "confirmed"
                        ? "good"
                        : e.status === "contradicted"
                          ? "bad"
                          : e.status === "requires_verification"
                            ? "warn"
                            : "neutral"
                    }
                  >
                    {dict.status[e.status]}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] leading-relaxed text-bone">{evidenceText(e)}</p>
                    {e.quote ? <Quote>{e.quote}</Quote> : null}
                  </div>
                  <span className="kicker shrink-0">{e.strength}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            id="section-entities"
            className={flash("section-entities")}
            title={dict.report.entities}
            right={<span className="kicker">{report.entities.length}</span>}
          >
            {report.entities.length ? (
              <div className="flex flex-wrap gap-2">
                {report.entities.map((e) => (
                  <span key={e.id} className="panel-flat flex items-center gap-2 px-3 py-2 text-[13px]">
                    <span className="text-dim">{dict.entityTypes[e.type]}</span>
                    <span className="font-mono text-bone">{e.value}</span>
                    <Badge tone={e.trustStatus === "suspicious" ? "bad" : e.trustStatus === "verified" ? "good" : "neutral"}>
                      {dict.status[e.trustStatus]}
                    </Badge>
                  </span>
                ))}
              </div>
            ) : (
              <Empty text={dict.report.noEntities} />
            )}
          </Section>

          <Section
            id="section-graph"
            className={flash("section-graph")}
            title={dict.report.trustGraph}
            hint={dict.graph.hint}
          >
            <TrustGraphView report={report} />
          </Section>

          {simple ? null : actionsSection}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <CounterfactualCard report={report} />

          <div className="panel p-5">
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="kicker">{dict.trust.label}</span>
                <span className="num text-lg font-semibold text-bone">{report.trust.overall}</span>
              </div>
              <ul className="space-y-2.5">
                {report.trust.dimensions.map((d) => (
                  <li key={d.id}>
                    <div className="mb-1 flex items-center justify-between text-[12.5px]">
                      <span className="text-mist">{dict.trust.dimensions[d.id]}</span>
                      <span className="num text-dim">{d.score}</span>
                    </div>
                    <Bar value={d.score} tone={d.score >= 70 ? "good" : d.score >= 40 ? "moderate" : "bad"} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[12.5px]">
              <span className="text-mist">{dict.common.confidence}</span>
              <span className="num text-bone">{Math.round(report.confidence * 100)}%</span>
            </div>
          </div>

          <div className="panel mt-4 p-5">
            <p className="kicker">{dict.report.detectedContent}</p>
            <p className="mt-1 text-[12.5px] text-dim">{dict.report.detectedContentHint}</p>
            <p className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-ink-2 p-3 text-[13px] leading-relaxed text-mist">
              {report.input.excerpt}
            </p>
            {report.input.ocrConfidence !== undefined ? (
              <p className="mt-2 num text-[12px] text-dim">OCR {report.input.ocrConfidence}%</p>
            ) : null}
          </div>

          {report.uncertainties.length ? (
            <div className="panel mt-4 p-5">
              <p className="kicker">{dict.report.lowConfidence}</p>
              <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-mist">
                {report.uncertainties.map((u) => (
                  <li key={u}>
                    {(dict.uncertainties as Record<string, string>)[u] ?? u}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="panel mt-4 p-5">
            <p className="text-[12.5px] leading-relaxed text-dim">{dict.report.disclaimer}</p>
            <p className="mt-2 text-[11.5px] text-dim">{dict.report.footerNote}</p>
          </div>
        </aside>
      </div>

      {report.dossier && (
        <ComplaintDossierModal
          dossier={report.dossier}
          lang={report.language}
          isOpen={dossierOpen}
          onClose={() => setDossierOpen(false)}
        />
      )}

      {report.sandbox && (
        <UrlSandboxModal
          sandbox={report.sandbox}
          isOpen={sandboxOpen}
          onClose={() => setSandboxOpen(false)}
        />
      )}

      <AdvisoryDrawer
        report={report}
        isOpen={advisoryOpen}
        onClose={() => setAdvisoryOpen(false)}
      />

      <ScamSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      <CounterBaitModal
        isOpen={baitOpen}
        onClose={() => setBaitOpen(false)}
      />
    </div>
  );
}
