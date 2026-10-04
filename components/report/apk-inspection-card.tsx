"use client";

import React, { useState } from "react";
import { ApkInspection } from "@/types";

interface ApkInspectionCardProps {
  apk: ApkInspection;
}

export function ApkInspectionCard({ apk }: ApkInspectionCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!apk.isApk) return null;

  const isTrojan = apk.isBankingTrojanLikelihood === "high";

  return (
    <div className={`my-6 rounded-xl border p-5 ${
      isTrojan
        ? "bg-red-950/20 border-red-500/40"
        : "bg-neutral-900/60 border-neutral-800"
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isTrojan ? "bg-red-500/20 text-red-400" : "bg-neutral-800 text-neutral-300"
          }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Android APK & Manifest Forensic Inspector
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                isTrojan
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {apk.isBankingTrojanLikelihood === "high" ? "Critical Banking Trojan Pattern" : `${apk.isBankingTrojanLikelihood} Risk`}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-0.5">
              {apk.packageName ? `Package: ${apk.packageName}` : "Side-loaded Android Package Payload"}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <div className="text-neutral-400">Dangerous Privileges:</div>
            <div className="font-mono font-bold text-red-400">
              {apk.criticalPermissionsCount} Critical · {apk.highPermissionsCount} High
            </div>
          </div>
        </div>
      </div>

      {/* Identified Risks */}
      {apk.identifiedRisks.length > 0 && (
        <div className="mt-4 space-y-2">
          {apk.identifiedRisks.map((risk, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-red-300 bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg">
              <span className="text-red-500 font-bold shrink-0">⚠</span>
              <span>{risk}</span>
            </div>
          ))}
        </div>
      )}

      {/* Permissions Breakdown */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-neutral-300">Extracted Dangerous Permissions ({apk.detectedPermissions.length}):</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-neutral-400 hover:text-white underline text-[11px]"
          >
            {expanded ? "Collapse details" : "Show analysis details"}
          </button>
        </div>

        <div className="space-y-2">
          {(expanded ? apk.detectedPermissions : apk.detectedPermissions.slice(0, 3)).map((perm, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-red-400 font-semibold">{perm.permission}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase">
                  {perm.trojanPattern}
                </span>
              </div>
              <p className="text-neutral-300 text-[11px]">{perm.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Advisories */}
      {apk.securityAdvisories.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-800/80">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
            Mandatory Device Defense:
          </span>
          <ul className="mt-2 space-y-1 text-xs text-neutral-300 list-disc list-inside">
            {apk.securityAdvisories.map((adv, idx) => (
              <li key={idx}>{adv}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
