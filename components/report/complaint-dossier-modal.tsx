"use client";

import React, { useState } from "react";
import type { ComplaintDossier, Lang } from "@/types";

interface ComplaintDossierModalProps {
  dossier: ComplaintDossier;
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

export function ComplaintDossierModal({ dossier, isOpen, onClose }: ComplaintDossierModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(dossier.complaintText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([dossier.complaintText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rakshak_Complaint_Dossier_${dossier.evidenceHash}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const portalUrl =
    dossier.portalTarget === "SEBI_SCORES"
      ? "https://scores.sebi.gov.in"
      : "https://cybercrime.gov.in";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-sky-500/30 bg-[#0f1318] text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-sky-950/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
              📄
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                Official Regulatory & Police Complaint Dossier
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Evidence Hash: {dossier.evidenceHash}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Portal Target Banner */}
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <span className="text-amber-400">⚠️</span>
            <span>
              Target Portal:{" "}
              <strong>
                {dossier.portalTarget === "SEBI_SCORES"
                  ? "SEBI SCORES (scores.sebi.gov.in)"
                  : "National Cybercrime Reporting Portal (1930 / cybercrime.gov.in)"}
              </strong>
            </span>
          </div>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-amber-400 underline hover:text-amber-300 flex items-center gap-1"
          >
            Open Official Portal →
          </a>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-slate-300 bg-[#0a0d11] space-y-4">
          <pre className="whitespace-pre-wrap leading-relaxed selection:bg-sky-500/30">
            {dossier.complaintText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-4 bg-[#0d1015]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-bold">🛡️</span>
            <span>Tamper-evident evidentiary formatting</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copied ? "✓ Copied!" : "📋 Copy Dossier"}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-sky-500 transition-colors shadow-lg shadow-sky-600/20"
            >
              ⬇ Download .TXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
