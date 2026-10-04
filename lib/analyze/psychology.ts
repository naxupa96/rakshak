import type { PsychologicalStage, Signal } from "@/types";

/**
 * Reconstructs the psychological manipulation chain (cognitive biases weaponized)
 * from the detected signals and quotes in the scam payload.
 */
export function buildPsychologicalTimeline(params: {
  text: string;
  signals: Signal[];
}): PsychologicalStage[] {
  const { text, signals } = params;
  const stages: PsychologicalStage[] = [];

  // 1. Hook (Greed / Hope / Relief)
  const hookSignal = signals.find((s) => s.id === "guaranteed_return" || s.id === "unrealistic_return" || s.id === "pump_and_dump");
  if (hookSignal) {
    stages.push({
      stage: "hook",
      label: "Phase 1: The Lure / Hook",
      biasWeaponized: "Greed Bias & Return Heuristic",
      detectedQuote: hookSignal.evidence[0] || "Promises of guaranteed high yields or jackpot profits",
      explanation: "Weaponizes the desire for effortless, outsized returns to suppress critical thinking.",
    });
  }

  // 2. Authority (Legitimacy usurpation / Fear of law)
  const authSignal = signals.find((s) => s.id === "regulatory_impersonation" || s.id === "government_impersonation" || s.id === "coercive_arrest");
  if (authSignal) {
    stages.push({
      stage: "authority",
      label: "Phase 2: Authority Manipulation",
      biasWeaponized: authSignal.id === "coercive_arrest" ? "Coercive Intimidation & Fear" : "Authority Bias & Institutional Trust",
      detectedQuote: authSignal.evidence[0] || "Claims of SEBI/RBI approval or Police/CBI summons",
      explanation: authSignal.id === "coercive_arrest"
        ? "Weaponizes fear of arrest and criminal prosecution to induce panic and compliance."
        : "Borrows regulatory legitimacy to make the fraudulent offer feel government-backed and safe.",
    });
  }

  // 3. Urgency / Panic (Manufacturing FOMO or deadline)
  const urgencySignal = signals.find((s) => s.id === "urgency" || s.id === "scarcity" || s.id === "pressure_tactics");
  if (urgencySignal) {
    stages.push({
      stage: "urgency",
      label: "Phase 3: Synthetic Urgency & Panic",
      biasWeaponized: "Loss Aversion & Panic Heuristic",
      detectedQuote: urgencySignal.evidence[0] || "Limited seats, immediate deadline, or do-not-share orders",
      explanation: "Artificially creates a time crunch to force a rushed emotional decision before the victim can consult family or advisors.",
    });
  }

  // 4. Exfiltration (Extracting capital or access)
  const exfilSignal = signals.find((s) => s.id === "payment_link" || s.id === "mule_vpa" || s.id === "upfront_payment" || s.id === "otp_request" || s.id === "apk_request");
  if (exfilSignal) {
    stages.push({
      stage: "exfiltration",
      label: "Phase 4: Irreversible Capital Exfiltration",
      biasWeaponized: "Sunk Cost & Immediate Action Trap",
      detectedQuote: exfilSignal.evidence[0] || "Demanding upfront fee, UPI transfer, or OTP/APK installation",
      explanation: "The end objective: routing victim funds into irreversible personal mule VPAs or compromising device credentials.",
    });
  }

  return stages;
}
