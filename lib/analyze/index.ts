import type {
  AnalysisReport,
  EvidenceItem,
  Entity,
  Lang,
  InputKind,
  Signal,
} from "@/types";
import { normalizeContent, detectContext, maskSensitive } from "./normalize";
import { extractEntities } from "./entities";
import { extractClaims } from "./claims";
import { analyzeDomains, applyClaimVerification, buildEvidence, checkRegistration } from "./verify";
import { detectTextSignals, deriveSignals, mergeSignals } from "./signals";
import { assessRisk, assessTrust } from "./risk";
import { buildWhy } from "./explain";
import { buildActions } from "./actions";
import { buildGraph } from "./graph";
import { augmentWithLlm } from "@/lib/ai/llm";
import { runLiveVerification } from "./intel";
import { matchIntermediary } from "./registry";
import { generateComplaintDossier } from "./dossier";
import { analyzeIfsc } from "./ifsc";
import { buildPsychologicalTimeline } from "./psychology";
import { parseQrPayload } from "./qr";
import { inspectAndDisarmUrl } from "./sandbox";
import { inspectApkPayload } from "./apk";
import { analyzePdfForensics } from "./pdf-forensics";

export interface AnalyzeInput {
  kind: InputKind;
  text: string;
  lang?: Lang;
  simple?: boolean;
  url?: string;
  fileName?: string;
  ocrConfidence?: number;
}

function newReportId(): string {
  const d = new Date();
  const stamp =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RX-${stamp}-${rand}`;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export async function analyze(input: AnalyzeInput): Promise<AnalysisReport> {
  const raw = (input.text ?? "").replace(/\r\n/g, "\n").trim();
  const stages: AnalysisReport["pipeline"] = [];
  const mark = (id: string, status: "done" | "skipped" | "failed" = "done") =>
    stages.push({ id, status });

  const normalized = normalizeContent(raw);
  if (input.url) {
    try {
      const host = new URL(input.url).hostname.replace(/^www\./, "");
      if (host && !normalized.domains.includes(host)) normalized.domains = [host, ...normalized.domains];
    } catch {
      /* the route validates URLs; ignore anything else */
    }
  }
  const context = detectContext(normalized.text);
  mark("normalize");

  let entities: Entity[] = extractEntities(normalized.text, normalized);
  mark("entities");

  const claims = extractClaims(normalized.text);
  mark("claims");

  const augmentation = await augmentWithLlm({
    text: normalized.text,
    entities,
    claims,
  });
  entities = augmentation.entities;
  if (augmentation.claims.length) {
    const seen = new Set(claims.map((c) => c.type));
    for (const c of augmentation.claims) {
      if (seen.has(c.type)) continue;
      claims.push(c);
      seen.add(c.type);
    }
  }
  mark("llm", augmentation.used ? "done" : "skipped");

  const hasHttp = normalized.hasHttp;
  const insecure = normalized.urls.some((u) => /^http:\/\//i.test(u));
  const domains = analyzeDomains(normalized.domains, hasHttp, insecure);
  const registration = checkRegistration(entities);

    let liveIntel: import("@/types/intel").LiveVerificationReport | undefined;
  if (normalized.domains.length > 0 || normalized.urls.length > 0) {
    try {
      liveIntel = await runLiveVerification(normalized.domains, normalized.urls);
    } catch {
      // Degrade gracefully offline
    }
  }

  const comparison = matchIntermediary({
    text: normalized.text,
    domains: normalized.domains,
    registrationNumbers: entities.filter((e) => e.type === "registration_no").map((e) => e.value),
    companies: entities.filter((e) => e.type === "company").map((e) => e.value),
  });

  applyClaimVerification(claims, registration, domains, liveIntel);
  mark("verify");

  const textSignals: Signal[] = detectTextSignals(normalized.text, context);
  mark("signals");

  const derived = deriveSignals({
    text: normalized.text,
    context,
    entities,
    claims,
    normalized,
    suspiciousDomains: domains.suspicious,
    mismatchedDomains: domains.mismatched,
  });
  const signals = mergeSignals(textSignals, derived);

  const hasAmount = normalized.amounts.length > 0;
  const otpHit = /(?:otp|one[\s-]?time[\s-]?password|verification code|ओटीपी|ओ\.टी\.पी|ઓટીપી)/i.test(
    normalized.text,
  );

  const evidence: EvidenceItem[] = buildEvidence({
    text: normalized.text,
    entities,
    claims: claims.map((c) => ({ quote: c.quote, verification: c.verification, type: c.type })),
    domains,
    registration,
    hasAmount,
    amount: normalized.amounts[0],
    hasOtp: otpHit,
    otpQuote: signals.find((s) => s.id === "otp_request")?.evidence[0],
    hasContact: normalized.phones.length > 0 || normalized.emails.length > 0,
    contact: normalized.phones[0] ?? normalized.emails[0],
    hasSignals: signals.length > 0,
    charCount: normalized.charCount,
    context,
    live: liveIntel,
  });
  mark("evidence");

  const nothingFound =
    claims.length === 0 && signals.length === 0 && entities.filter((e) => e.type !== "percent").length === 0;
  const insufficientEvidence = normalized.wordCount < 6 || nothingFound;

  const source = {
    officialDomains: domains.official.length,
    fineDomains: domains.fine.length,
    unknownDomains: domains.unknown.length,
    badDomains: domains.suspicious.length + domains.mismatched.length + (liveIntel?.hasBlocklistHit ? 1 : 0),
    totalDomains:
      domains.official.length + domains.fine.length + domains.unknown.length + domains.suspicious.length + domains.mismatched.length,
  };

  const risk = assessRisk({
    signals,
    context,
    evidence,
    source,
    hasAmount,
    insufficientEvidence,
    live: liveIntel,
  });
  mark("risk");

  const trust = assessTrust({
    evidence,
    hasNamedCompany: entities.some((e) => e.type === "company"),
    impersonatingRegulator: signals.some((s) => s.id === "regulatory_impersonation"),
    ambiguousIdentity: signals.some((s) => s.id === "identity_ambiguity"),
    hasHandleOnly: entities.some((e) => e.type === "handle") && !entities.some((e) => e.type === "company"),
    source,
    claimsVerified: claims.filter((c) => c.verification === "verified").length,
    claimsContradicted: claims.filter((c) => c.verification === "contradicted").length,
    claimsOpen: claims.filter((c) => c.verification !== "verified" && c.verification !== "contradicted").length,
    wantsPayment: hasAmount,
    wantsCredential: signals.some(
      (s) => s.id === "otp_request" || s.id === "credential_request" || s.id === "apk_request",
    ),
  });
  mark("trust");

  const why = buildWhy({ signals, claims, evidence, context });
  const actions = buildActions(signals, hasAmount, claims);
  const graph = buildGraph({
    kind: input.kind,
    entities,
    claims,
    evidence,
    hasAmount,
  });
  mark("graph");

  const uncertainties: string[] = [];
  uncertainties.push("externalUnavailable");
  if (input.ocrConfidence !== undefined && input.ocrConfidence < 80) uncertainties.push("lowOcr");
  if (insufficientEvidence) uncertainties.push("ambiguous");
  if (input.kind === "url") uncertainties.push("fetchedTextOnly");

  let confidence = 0.86;
  if (input.ocrConfidence !== undefined) confidence -= (100 - input.ocrConfidence) / 400;
  if (normalized.charCount < 60) confidence -= 0.12;
  if (nothingFound) confidence -= 0.15;
  if (signals.some((s) => s.confidence >= 0.9)) confidence += 0.06;

  const excerpt = maskSensitive(normalized.text).slice(0, 400);

  return redactReport({
    id: newReportId(),
    createdAt: new Date().toISOString(),
    language: input.lang ?? "en",
    simple: input.simple ?? false,
    input: {
      kind: input.kind,
      text: maskSensitive(normalized.text),
      excerpt,
      fileName: input.fileName,
      url: input.url,
      ocrConfidence: input.ocrConfidence,
    },
    normalized: { ...normalized, text: maskSensitive(normalized.text) },
    context,
    entities,
    claims,
    signals,
    risk,
    trust,
    evidence,
    why,
    actions,
    graph,
    uncertainties,
    confidence: Math.round(clamp01(confidence) * 100) / 100,
    usedLlm: augmentation.used,
    insufficientEvidence,
    pipeline: stages,
    live: liveIntel,
    comparison,
    dossier: generateComplaintDossier({
      id: "inc_" + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
      risk,
      signals,
      normalized,
      entities,
    }),
    ifsc: analyzeIfsc(normalized.text),
    psychology: buildPsychologicalTimeline({
      text: normalized.text,
      signals,
    }),
    qr: parseQrPayload(normalized.text),
    sandbox: input.url ? inspectAndDisarmUrl(input.url, normalized.text) : undefined,
    apk: inspectApkPayload(normalized.text),
    pdfForensics: analyzePdfForensics(normalized.text),
  });
}

/** Redact phone numbers and e-mail addresses everywhere they are displayed. */
function redactReport(report: AnalysisReport): AnalysisReport {
  const m = (s: string | undefined) => (s ? maskSensitive(s) : s);
  return {
    ...report,
    entities: report.entities.map((e) => ({ ...e, value: m(e.value)!, quote: m(e.quote)! })),
    claims: report.claims.map((c) => ({ ...c, quote: m(c.quote)!, statement: m(c.statement)! })),
    signals: report.signals.map((s) => ({ ...s, evidence: s.evidence.map((q) => m(q)!) })),
    evidence: report.evidence.map((e) => ({
      ...e,
      subject: m(e.subject)!,
      quote: m(e.quote),
      params: e.params
        ? Object.fromEntries(Object.entries(e.params).map(([k, v]) => [k, m(v)!]))
        : e.params,
    })),
    why: report.why.map((w) => ({ ...w, quote: m(w.quote) })),
    graph: {
      ...report.graph,
      nodes: report.graph.nodes.map((n) => ({ ...n, label: m(n.label)! })),
    },
  };
}
