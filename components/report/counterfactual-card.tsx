"use client";

import React from "react";
import type { AnalysisReport } from "@/types";
import { useApp } from "@/components/app-providers";

export function CounterfactualCard({ report }: { report: AnalysisReport }) {
  const { dict } = useApp();

  const recommendations = React.useMemo(() => {
    const list: { action: string; delta: string; direction: "reduce" | "increase"; explanation: string }[] = [];

    // 1. Regulatory verification impact
    const unverifiedClaims = report.claims.filter((c) => c.verification !== "verified");
    if (unverifiedClaims.length > 0) {
      list.push({
        action: "Confirm registration on SEBI / RBI official register",
        delta: "-25 to -35 pts",
        direction: "reduce",
        explanation: "Verified public registry standing resolves the verification gap and authenticates the intermediary.",
      });
    }

    // 2. Removal of upfront fee or direct payment intent
    const hasPayment = report.signals.some((s) => s.id === "upfront_payment" || s.id === "payment_link");
    if (hasPayment) {
      list.push({
        action: "Remove upfront payment / direct UPI links",
        delta: "-18 to -22 pts",
        direction: "reduce",
        explanation: "Legitimate intermediaries do not ask for deposits into personal UPI handles or upfront unlock fees.",
      });
    }

    // 3. Independent official website domain
    const hasBadDomain = report.signals.some((s) => s.id === "suspicious_domain" || s.id === "mismatched_domain");
    if (hasBadDomain || report.normalized.domains.length === 0) {
      list.push({
        action: "Operate via established official regulator-approved domain",
        delta: "-15 to -20 pts",
        direction: "reduce",
        explanation: "Domains matching registered corporate infrastructure with aged RDAP history establish genuine source credibility.",
      });
    }

    // 4. Removing pressure tactics & guaranteed returns
    const hasPressure = report.signals.some((s) => s.id === "urgency" || s.id === "guaranteed_return" || s.id === "risk_free");
    if (hasPressure) {
      list.push({
        action: "Provide realistic statutory risk disclosures (SEBI mandated)",
        delta: "-15 to -25 pts",
        direction: "reduce",
        explanation: "Market investments require explicit risk warnings; guarantees are prohibited by SEBI guidelines.",
      });
    }

    if (list.length === 0) {
      list.push({
        action: "Maintain current verified status and transparent disclosures",
        delta: "0 pts",
        direction: "reduce",
        explanation: "The content adheres to safe practices with no deceptive markers detected.",
      });
    }

    return list.slice(0, 3);
  }, [report]);

  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 font-mono text-sm">⚡</span>
        <h3 className="text-sm font-semibold tracking-wide text-bone">
          {dict.report.counterfactualTitle}
        </h3>
      </div>
      <p className="mt-1 text-xs text-mist">{dict.report.counterfactualHint}</p>

      <div className="mt-4 space-y-3">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-line/60 bg-charcoal/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-bone">{rec.action}</p>
              <p className="text-[11.5px] text-dim">{rec.explanation}</p>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-md bg-leaf/10 px-2.5 py-1 text-xs font-semibold text-leaf">
              {rec.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
