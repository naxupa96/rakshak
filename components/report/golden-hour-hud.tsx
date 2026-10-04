"use client";

import React, { useState } from "react";
import { RiskAssessment } from "@/types";

interface GoldenHourHudProps {
  risk: RiskAssessment;
  incidentId: string;
}

export function GoldenHourHud({ risk, incidentId }: GoldenHourHudProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedUssd, setCopiedUssd] = useState(false);

  // Only highlight if high or critical risk
  const isHighUrgency = risk.level === "CRITICAL" || risk.level === "HIGH";

  if (!isHighUrgency) return null;

  const handleCopyUssd = () => {
    navigator.clipboard.writeText("*99#");
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2000);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 bg-red-950/90 border border-red-500/50 text-red-200 text-xs font-semibold rounded-full shadow-lg shadow-red-950/40 backdrop-blur-md hover:bg-red-900/90 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Golden Hour Action HUD</span>
        </button>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-red-950/50 via-neutral-900/80 to-amber-950/30 border border-red-500/40 shadow-xl relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Urgent header & pulse */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 shrink-0">
            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                CRITICAL TRIAGE: GOLDEN HOUR HUD
              </span>
              <span className="text-[11px] text-neutral-400">Incident: #{incidentId.slice(0, 8)}</span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-1">
              Active Financial Loss Mitigation Protocol (First 60-120 Minutes)
            </h4>
            <p className="text-xs text-neutral-300 mt-0.5">
              NPCI inter-bank lien freezing is 94% effective within the first 2 hours of illicit UPI/IMPS debit.
            </p>
          </div>
        </div>

        {/* Quick Action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Direct 1930 Dial */}
          <a
            href="tel:1930"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Dial 1930 (Helpline)</span>
          </a>

          {/* USSD Freeze Code */}
          <button
            onClick={handleCopyUssd}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
          >
            <span className="font-mono font-bold text-amber-400">*99#</span>
            <span>{copiedUssd ? "Copied!" : "NPCI USSD"}</span>
          </button>

          {/* National Portal Link */}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg border border-neutral-700 transition-colors"
          >
            <span>cybercrime.gov.in</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-neutral-500 hover:text-neutral-300 rounded transition-colors"
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bank Quick Lock Matrix */}
      <div className="mt-3 pt-3 border-t border-neutral-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
            1-Click Bank Emergency Freeze (SMS / Net-Banking):
          </span>
          <span className="text-[10px] text-neutral-400">Select your bank to dispatch instant block:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { bank: "SBI", sms: "sms:9223966666?body=BLOCK%20UPI", url: "https://retail.onlinesbi.sbi/retail/lockcard.htm" },
            { bank: "HDFC", sms: "sms:5676712?body=BLOCK%20UPI", url: "https://netbanking.hdfcbank.com/netbanking/" },
            { bank: "ICICI", sms: "sms:5676766?body=BLOCK%20UPI", url: "https://infinity.icicibank.com/corp/AuthenticationController" },
            { bank: "AXIS", sms: "sms:5676782?body=BLOCK%20UPI", url: "https://omni.axisbank.co.in/axisretail/" },
            { bank: "KOTAK", sms: "sms:9971056767?body=BLOCK%20UPI", url: "https://netbanking.kotak.com/knb2/" },
            { bank: "PNB", sms: "sms:5607040?body=BLOCK%20UPI", url: "https://netpnb.com" },
          ].map((b) => (
            <div key={b.bank} className="flex items-center rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden text-xs">
              <span className="px-2.5 py-1 font-mono font-bold text-neutral-200 border-r border-neutral-800">{b.bank}</span>
              <a href={b.sms} className="px-2 py-1 text-[11px] text-red-400 hover:text-red-300 hover:bg-neutral-800 transition-colors">
                📱 Lock SMS
              </a>
              <a href={b.url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border-l border-neutral-800 transition-colors">
                🌐 Portal
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Triage Checklist */}
      <div className="mt-3 pt-3 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-[10px] text-amber-400 font-bold shrink-0">1</span>
          <span>Immediately request bank freeze on destination VPA</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-[10px] text-amber-400 font-bold shrink-0">2</span>
          <span>Submit Transaction UTR & SMS alert timestamp to 1930</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-[10px] text-amber-400 font-bold shrink-0">3</span>
          <span>Revoke SMS & Accessibility permissions on suspicious apps</span>
        </div>
      </div>
    </div>
  );
}
