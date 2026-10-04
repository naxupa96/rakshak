"use client";

import React from "react";
import { PdfForensicReport } from "@/types";

interface PdfForensicCardProps {
  pdf: PdfForensicReport;
}

export function PdfForensicCard({ pdf }: PdfForensicCardProps) {
  if (!pdf.isPdf) return null;

  const isForgery = pdf.verdict === "suspicious_forgery";
  const isCertified = pdf.verdict === "authentic_certified";

  return (
    <div className={`my-6 rounded-xl border p-5 ${
      isForgery
        ? "bg-red-950/20 border-red-500/40"
        : isCertified
        ? "bg-emerald-950/20 border-emerald-500/40"
        : "bg-neutral-900/60 border-neutral-800"
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isForgery ? "bg-red-500/20 text-red-400" : isCertified ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-300"
          }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Regulatory Document & Certificate Forensics
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                isForgery
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : isCertified
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-neutral-800 text-neutral-400"
              }`}>
                {isForgery ? "Suspicious Counterfeit / Forgery" : isCertified ? "Cryptographically Certified" : "Unverified Document"}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-0.5">
              {pdf.claimedIssuer ? `Purported Issuer: ${pdf.claimedIssuer}` : "Official Document Audit"}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Digital Signature:</span>
          <span className={`font-semibold ${pdf.hasDigitalSignature ? "text-emerald-400" : "text-red-400"}`}>
            {pdf.hasDigitalSignature ? "✓ Present (eMudhra/DSC)" : "✗ Missing / Unsigned"}
          </span>
        </div>
      </div>

      {/* Metadata Audit Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <div className="text-neutral-500 text-[11px]">Software / Producer</div>
          <div className={`font-medium mt-0.5 truncate ${pdf.isSuspiciousGenerator ? "text-red-400 font-bold" : "text-neutral-200"}`}>
            {pdf.producer || pdf.creator || "Not declared"}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <div className="text-neutral-500 text-[11px]">Digital Signature Standard</div>
          <div className="font-medium text-neutral-200 mt-0.5 truncate">
            {pdf.signatureStandard || "None (Vulnerable to Tampering)"}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <div className="text-neutral-500 text-[11px]">Creation Timestamp</div>
          <div className="font-mono text-neutral-300 mt-0.5 truncate">
            {pdf.creationDate || "Stripped / None"}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <div className="text-neutral-500 text-[11px]">Post-Creation Edits</div>
          <div className="font-mono text-neutral-300 mt-0.5 truncate">
            {pdf.modDate ? (pdf.modDate !== pdf.creationDate ? "Detected Revisions" : "None") : "Undetected"}
          </div>
        </div>
      </div>

      {/* Tamper Warnings */}
      {pdf.tamperIndicators.length > 0 && (
        <div className="mt-4 space-y-2">
          {pdf.tamperIndicators.map((warning, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-red-300 bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg">
              <span className="text-red-500 font-bold shrink-0">⚠</span>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
