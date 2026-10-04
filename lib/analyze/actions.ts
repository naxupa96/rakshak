import type { SafetyAction, Signal } from "@/types";

interface Draft {
  phase: SafetyAction["phase"];
  kind: SafetyAction["kind"];
  textKey: string;
}

export function buildActions(
  signals: Signal[],
  hasAmount: boolean,
  claims: { type: string }[] = [],
): SafetyAction[] {
  const ids = new Set(signals.map((s) => s.id));
  const drafts: Draft[] = [];

  const wantsCredential =
    ids.has("otp_request") || ids.has("credential_request") || ids.has("apk_request");
  const riskyDomain = ids.has("suspicious_domain") || ids.has("mismatched_domain");
  const impersonation = ids.has("regulatory_impersonation") || ids.has("government_impersonation");
  const promise =
    ids.has("guaranteed_return") || ids.has("unrealistic_return") || ids.has("risk_free");
  const network = ids.has("referral_pressure");
  const asksMoney = hasAmount || ids.has("upfront_payment");

  if (wantsCredential) {
    drafts.push({ phase: "before", kind: "avoid", textKey: "beforeAvoidOtp" });
    drafts.push({ phase: "before", kind: "avoid", textKey: "beforeAvoidInstall" });
    drafts.push({ phase: "before", kind: "avoid", textKey: "beforeAvoidIdentity" });
  }
  if (riskyDomain) {
    drafts.push({ phase: "before", kind: "avoid", textKey: "beforeAvoidLink" });
  }
  if (impersonation || promise || riskyDomain) {
    drafts.push({ phase: "before", kind: "do", textKey: "beforeDoVerify" });
  }
  if (network) {
    drafts.push({ phase: "before", kind: "avoid", textKey: "beforeAvoidRecruit" });
  }
  if (asksMoney) {
    drafts.push({ phase: "before", kind: "avoid", textKey: "beforeAvoidTransfer" });
  }
  drafts.push({ phase: "before", kind: "do", textKey: "beforeDoPreserve" });

  if (asksMoney) {
    drafts.push({ phase: "paid", kind: "do", textKey: "paidTxn" });
    drafts.push({ phase: "paid", kind: "do", textKey: "paidBank" });
    drafts.push({ phase: "paid", kind: "avoid", textKey: "paidStop" });
  }

  drafts.push({ phase: "report", kind: "do", textKey: "reportCyber" });
  if (claims.some((c) => c.type === "REGULATORY_APPROVAL" || c.type === "GOVERNMENT_AFFILIATION")) {
    drafts.push({ phase: "report", kind: "do", textKey: "reportScores" });
  }
  if (claims.some((c) => c.type === "GOVERNMENT_AFFILIATION")) {
    drafts.push({ phase: "report", kind: "do", textKey: "reportMca" });
  }
  if (asksMoney) {
    drafts.push({ phase: "report", kind: "do", textKey: "reportRbi" });
  }

  const seen = new Set<string>();
  const unique = drafts.filter((d) => {
    if (seen.has(d.textKey)) return false;
    seen.add(d.textKey);
    return true;
  });

  return unique
    .slice(0, 9)
    .map((d, i) => ({ id: `act_${i}`, phase: d.phase, kind: d.kind, textKey: d.textKey }));
}
