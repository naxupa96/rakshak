"use client";

import React, { useState } from "react";

interface CounterBaitTemplate {
  title: string;
  category: "Extract Mule Bank" | "Extract UPI VPA" | "Stall & Delay" | "Digital Arrest Challenge";
  scammerContext: string;
  generatedReply: string;
  operationalObjective: string;
}

const BAIT_TEMPLATES: CounterBaitTemplate[] = [
  {
    title: "Request RTGS Beneficiary (Mule Bank Account Harvesting)",
    category: "Extract Mule Bank",
    scammerContext: "Scammer is pushing to transfer funds immediately via unknown channel.",
    generatedReply: "I am at my bank branch counter right now. The bank manager says my daily UPI limit of ₹1,00,000 is exhausted. Please send the Beneficiary Account Holder Name, Account Number, and Branch IFSC Code so I can dispatch the remaining ₹15,00,000 via RTGS immediately.",
    operationalObjective: "Forces the syndicate to burn a real Layer-1 or Layer-2 mule bank account number and IFSC code, which Rakshak immediately hashes and submits to 1930.",
  },
  {
    title: "Request Merchant VPA for High-Value Payment",
    category: "Extract UPI VPA",
    scammerContext: "Scammer is asking you to scan a random personal QR code.",
    generatedReply: "My corporate bank account requires an official merchant UPI VPA or nodal escrow ID to authorize transactions above ₹50,000. Please text the exact UPI ID so I can add you as an approved beneficiary on HDFC NetBanking.",
    operationalObjective: "Tricks the scammer into revealing their primary collection UPI VPA handle.",
  },
  {
    title: "Digital Arrest Jurisdiction & Official Notice Challenge",
    category: "Digital Arrest Challenge",
    scammerContext: "Scammer is demanding you remain on WhatsApp/Skype video call under 'Digital Arrest'.",
    generatedReply: "My legal counsel is here with me. Under Section 41A of the CrPC, please email the official signed arrest warrant and FIR copy to my registered advocate from your official @gov.in or @cbi.gov.in domain so we can acknowledge service.",
    operationalObjective: "Completely disarms the psychological coercion loop and induces scammer retreat.",
  },
  {
    title: "Technical Glitch Stall (Buying 'Golden Hour' Time)",
    category: "Stall & Delay",
    scammerContext: "Scammer is imposing a 15-minute countdown threat.",
    generatedReply: "The payment gateway shows 'Error 409: Bank Server Synchronization'. My bank relationship manager informed me that high-value NEFT clearances take 45 minutes on Mondays. Please do not re-initiate or cancel the order; keeping the line open.",
    operationalObjective: "Buys 45 minutes of critical time for the victim to contact real police at 1930 and freeze their bank accounts.",
  },
];

export function CounterBaitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-red-500/20 text-red-400 text-lg">🤖</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Rakshak AI Honeypot & Counter-Bait Generator
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  IOC EXTRACTION
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Stall scammers, disarm psychological coercion, and trick attackers into revealing mule accounts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800">
            💡 <strong className="text-amber-400">Pro-Defense Strategy:</strong> Never reveal panic. Copy one of these pre-engineered counter-prompts to stall the attacker while you dial <strong>1930</strong> or trick them into providing new mule bank details for legal evidence.
          </div>

          <div className="space-y-3">
            {BAIT_TEMPLATES.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-semibold">
                      {item.category}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(item.generatedReply, idx)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg text-xs transition-colors"
                  >
                    {copiedIndex === idx ? "✓ Copied!" : "📋 Copy Reply"}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800/80 font-mono text-neutral-200 text-xs leading-relaxed">
                  "{item.generatedReply}"
                </div>

                <div className="text-[11px] text-neutral-400">
                  <strong className="text-amber-400">Tactical Purpose:</strong> {item.operationalObjective}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
          <span className="text-neutral-500">Autonomous Counter-Intelligence Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
