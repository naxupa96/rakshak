import type { WhyItem, Claim, EvidenceItem, Signal, ContentContext, Severity } from "@/types";

const CLAIM_SEVERITY: Partial<Record<Claim["type"], Severity>> = {
  REGULATORY_APPROVAL: "critical",
  GOVERNMENT_AFFILIATION: "critical",
  GUARANTEED_RETURN: "critical",
  UNREALISTIC_RETURN: "critical",
  RISK_FREE: "high",
  DOUBLE_MONEY: "high",
  ZERO_LOSS: "high",
  INSIDER_INFORMATION: "high",
  CELEBRITY_ENDORSEMENT: "high",
  FIXED_RETURN: "medium",
  URGENT_OFFER: "medium",
  EXCLUSIVE_OPPORTUNITY: "medium",
  PAST_PERFORMANCE: "medium",
  PRESSURE_TO_INVEST: "medium",
};

export function buildWhy(args: {
  signals: Signal[];
  claims: Claim[];
  evidence: EvidenceItem[];
  context: ContentContext;
}): WhyItem[] {
  const items: WhyItem[] = [];

  for (const s of args.signals) {
    items.push({
      id: `why_${s.id}`,
      sourceId: s.id,
      sourceKind: "signal",
      severity: s.severity,
      score: Math.round(s.weight * s.confidence),
      quote: s.evidence[0],
    });
  }

  for (const c of args.claims) {
    items.push({
      id: `why_${c.id}`,
      sourceId: c.id,
      sourceKind: "claim",
      severity: CLAIM_SEVERITY[c.type] ?? "medium",
      score: Math.round(40 * c.confidence),
      quote: c.quote,
    });
  }

  for (const e of args.evidence) {
    if (e.status !== "contradicted" || e.strength === "weak") continue;
    items.push({
      id: `why_${e.id}`,
      sourceId: e.id,
      sourceKind: "evidence",
      severity: e.strength === "strong" ? "high" : "medium",
      score: e.strength === "strong" ? 42 : 24,
      quote: e.quote ?? e.subject,
      params: e.params,
    });
  }

  if (args.context === "educational" || args.context === "news" || args.context === "complaint") {
    items.push({
      id: "why_context",
      sourceId: args.context,
      sourceKind: "context",
      severity: "info",
      score: 0,
      params: { context: args.context },
    });
  }

  return items.sort((a, b) => b.score - a.score).slice(0, 10);
}
