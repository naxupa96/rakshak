import type {
  ContentContext,
  EvidenceItem,
  RiskAssessment,
  RiskFactor,
  Signal,
  TrustAssessment,
} from "@/types";

const CONTEXT_MULTIPLIER: Record<ContentContext, number> = {
  solicitation: 1,
  neutral: 1,
  educational: 0.3,
  news: 0.45,
  complaint: 0.55,
};

const PRESSURE_SIGNALS = new Set([
  "urgency",
  "scarcity",
  "pressure_tactics",
  "referral_pressure",
  "secret_exclusive",
  "emotional_manipulation",
  "upfront_payment",
]);

const WEIGHTS: { id: RiskFactor["id"]; weight: number }[] = [
  { id: "deceptive_signals", weight: 0.45 },
  { id: "solicitation", weight: 0.2 },
  { id: "verification_gap", weight: 0.15 },
  { id: "source_credibility", weight: 0.1 },
  { id: "pressure", weight: 0.1 },
];

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

export interface SourceInput {
  officialDomains: number;
  fineDomains: number;
  unknownDomains: number;
  badDomains: number;
  totalDomains: number;
}

export function levelFor(score: number): RiskAssessment["level"] {
  if (score < 25) return "LOW";
  if (score < 45) return "MODERATE";
  if (score < 65) return "ELEVATED";
  if (score < 85) return "HIGH";
  return "CRITICAL";
}

export function assessRisk(args: {
  signals: Signal[];
  context: ContentContext;
  evidence: EvidenceItem[];
  source: SourceInput;
  hasAmount: boolean;
  insufficientEvidence: boolean;
  live?: import("@/types/intel").LiveVerificationReport;
}): RiskAssessment {
  const { signals, context, evidence, source, hasAmount, live } = args;

  const deceptivePoints = clamp(
    Math.round(signals.reduce((sum, s) => sum + s.weight * (0.7 + 0.3 * s.confidence), 0)),
  );

  const hasPaymentSignal = signals.some((s) => s.id === "payment_link" || s.id === "upfront_payment");
  const hasCredentialAsk = signals.some((s) => s.id === "otp_request" || s.id === "credential_request" || s.id === "apk_request");

  const solicitationPoints = clamp(
    context === "solicitation" || hasPaymentSignal || hasCredentialAsk
      ? 70 + (hasAmount ? 20 : 0) + (hasCredentialAsk ? 10 : 0)
      : context === "complaint"
        ? 45
        : context === "neutral"
          ? 25
          : 0,
  );

  const total = Math.max(1, evidence.length);
  const contradicted = evidence.filter((e) => e.status === "contradicted").length;
  const unresolved = evidence.filter(
    (e) => e.status === "requires_verification" || e.status === "unverifiable",
  ).length;
  let verificationPoints = clamp(Math.round(100 * ((0.6 * contradicted + 0.4 * unresolved) / total)));

  // If live intel confirms domain registered < 7 days and there is solicitation/payment ask, boost verification gap
  if (live?.isNewlyRegistered && (context === "solicitation" || hasAmount || hasPaymentSignal)) {
    verificationPoints = clamp(Math.max(verificationPoints, 85));
  }

  let credibility = 40;
  if (source.totalDomains === 0) credibility = context === "solicitation" ? 35 : 55;
  else if (source.badDomains > 0) credibility = 5;
  else if (source.officialDomains > 0) credibility = 92;
  else if (source.fineDomains > 0) credibility = 68;
  else if (source.unknownDomains > 0) credibility = 42;

  // Blocklist hit strongly reduces source credibility to near zero
  if (live?.hasBlocklistHit) {
    credibility = Math.min(credibility, 3);
  }

  const sourcePoints = clamp(100 - credibility);

  const pressurePoints = clamp(
    Math.round(
      signals.filter((s) => PRESSURE_SIGNALS.has(s.id)).reduce((sum, s) => sum + s.weight * (0.7 + 0.3 * s.confidence), 0),
    ),
  );

  const base: Record<RiskFactor["id"], number> = {
    deceptive_signals: deceptivePoints,
    solicitation: solicitationPoints,
    verification_gap: verificationPoints,
    source_credibility: sourcePoints,
    pressure: pressurePoints,
  };

  const factors: RiskFactor[] = WEIGHTS.map(({ id, weight }) => ({
    id,
    points: base[id],
    weight,
    contribution: Math.round(base[id] * weight * 10) / 10,
  }));

  const raw = factors.reduce((sum, f) => sum + f.contribution, 0);

  // Context-bypass fix: apply educational/news discount ONLY if no solicitation, payment, or credential signal fired
  const isSolicitingOrPaying = context === "solicitation" || hasAmount || hasPaymentSignal || hasCredentialAsk;
  const contextMultiplier = isSolicitingOrPaying ? 1 : CONTEXT_MULTIPLIER[context];
  let score = Math.round(raw * contextMultiplier);

  // If live blocklist hit confirmed, minimum score is HIGH (80+)
  if (live?.hasBlocklistHit) {
    score = Math.max(score, 88);
  }

  // Coercive digital arrest or fraudulent pump-and-dump always triggers critical threshold
  if (signals.some((s) => s.id === "coercive_arrest" || s.id === "pump_and_dump")) {
    score = Math.max(score, 86);
  }

  // Ambiguous input must not be presented as an accusation unless confirmed blocklist hit
  if (args.insufficientEvidence && !live?.hasBlocklistHit) score = Math.min(score, 35);

  return {
    score: clamp(score),
    level: levelFor(score),
    factors,
    contextMultiplier,
    context,
  };
}

export function assessTrust(args: {
  evidence: EvidenceItem[];
  hasNamedCompany: boolean;
  impersonatingRegulator: boolean;
  ambiguousIdentity: boolean;
  hasHandleOnly: boolean;
  source: SourceInput;
  claimsVerified: number;
  claimsContradicted: number;
  claimsOpen: number;
  wantsPayment: boolean;
  wantsCredential: boolean;
}): TrustAssessment {
  const { source } = args;

  let identity = 60;
  if (args.hasNamedCompany) identity += 15;
  if (source.officialDomains > 0) identity += 15;
  if (args.ambiguousIdentity) identity -= 30;
  if (args.hasHandleOnly) identity -= 20;
  if (args.impersonatingRegulator) identity -= 45;
  if (source.badDomains > 0) identity -= 30;

  let claims = 70;
  claims += args.claimsVerified * 10;
  claims -= args.claimsContradicted * 30;
  claims -= args.claimsOpen * 8;

  let sourceScore: number;
  if (source.totalDomains === 0) sourceScore = 45;
  else if (source.badDomains > 0) sourceScore = 8;
  else if (source.officialDomains > 0) sourceScore = 95;
  else if (source.fineDomains > 0) sourceScore = 68;
  else sourceScore = 45;

  let payment = 75;
  if (args.wantsPayment) payment -= 35;
  if (args.wantsCredential) payment -= 40;

  const total = args.evidence.length;
  const confirmed = args.evidence.filter((e) => e.status === "confirmed").length;
  const open = args.evidence.filter(
    (e) => e.status === "requires_verification" || e.status === "unverifiable",
  ).length;
  const contradicted = args.evidence.filter((e) => e.status === "contradicted").length;
  const evidenceScore = total
    ? clamp(Math.round(100 * ((confirmed + 0.4 * open) / total) - 20 * (contradicted / total)))
    : 50;

  const dimensions: TrustAssessment["dimensions"] = [
    { id: "identity", score: clamp(Math.round(identity)) },
    { id: "claims", score: clamp(Math.round(claims)) },
    { id: "source", score: clamp(Math.round(sourceScore)) },
    { id: "payment", score: clamp(Math.round(payment)) },
    { id: "evidence", score: clamp(Math.round(evidenceScore)) },
  ];

  const overall = Math.round(
    dimensions[0].score * 0.25 +
      dimensions[1].score * 0.25 +
      dimensions[2].score * 0.2 +
      dimensions[3].score * 0.15 +
      dimensions[4].score * 0.15,
  );

  return { overall: clamp(overall), dimensions };
}
