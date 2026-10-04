"use client";

import React, { useState } from "react";

interface Scenario {
  id: string;
  title: string;
  badge: string;
  lossMetric: string;
  messages: {
    sender: string;
    avatar: string;
    text: string;
    isAttacker: boolean;
  }[];
  choices: {
    label: string;
    isTrap: boolean;
    explanation: string;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "digital_arrest",
    title: "CBI & Supreme Court 'Digital Arrest' Video Coercion",
    badge: "Most Dangerous 2025/26 Vector",
    lossMetric: "Average loss: ₹48 Lakhs / victim",
    messages: [
      {
        sender: "Inspector Ajay Sharma (CBI Cyber Crime Cell)",
        avatar: "👮‍♂️",
        text: "Notice: An illicit international narcotics courier under your Aadhaar has been intercepted at Mumbai Airport. Warrant #CBI-2026-9041 is issued for your immediate non-bailable arrest.",
        isAttacker: true,
      },
      {
        sender: "Inspector Ajay Sharma (CBI Cyber Crime Cell)",
        avatar: "👮‍♂️",
        text: "You are placed under immediate 'Digital Arrest'. Do not disconnect this WhatsApp video call or contact family. To clear your name before the Magistrate, transfer your liquid deposits into the Supreme Court Verification Reserve Escrow immediately.",
        isAttacker: true,
      },
    ],
    choices: [
      {
        label: "Acknowledge panic, stay on video call, and transfer 50% funds for audit",
        isTrap: true,
        explanation: "CRITICAL FAILURE: 'Digital Arrest' is a total fabrication. Indian police, CBI, ED, and courts NEVER conduct trials or arrests via WhatsApp/Skype, nor do they maintain 'Verification Escrows'. Disconnecting and dialing 1930 is the only safe move.",
      },
      {
        label: "Disconnect call immediately, block number, and dial 1930 Cybercrime Helpline",
        isTrap: false,
        explanation: "EXCELLENT DEFENSE: Disconnecting the psychological pressure channel neutralizes the coercion. Government agencies strictly issue physical summons, never Skype/WhatsApp digital arrest mandates.",
      },
    ],
  },
  {
    id: "institutional_ipo",
    title: "Fake FII / 'Institutional Quota' Allotment WhatsApp Group",
    badge: "Financial Engineering Racket",
    lossMetric: "Average loss: ₹14 Lakhs / victim",
    messages: [
      {
        sender: "Prof. Rajesh (Senior Market Analyst)",
        avatar: "📈",
        text: "VIP Members: We have secured an exclusive FII/QIB block allotment for the upcoming mega IPO at 40% discount before listing. Guaranteed 300% listing day gains.",
        isAttacker: true,
      },
      {
        sender: "Aditi (Group Admin)",
        avatar: "👩‍💼",
        text: "Allotments are confirmed only through our institutional APK terminal. Download the terminal from http://zerodha-institutional-allotment.top and transfer allotment fees to our designated clearing VPA: sebi.allotment@okhdfcbank.",
        isAttacker: true,
      },
    ],
    choices: [
      {
        label: "Download the institutional APK and deposit allotment fee via UPI",
        isTrap: true,
        explanation: "CRITICAL FAILURE: Retail investors can NEVER buy IPOs through third-party APKs or private UPI transfers. All legitimate IPO applications happen via ASBA (Application Supported by Blocked Amount) through your official banking portal or SEBI-registered broker.",
      },
      {
        label: "Reject offer, verify broker on official SEBI portal, and report group on 1930",
        isTrap: false,
        explanation: "EXCELLENT DEFENSE: You caught the typo-squatted domain (.top) and recognized that IPO funds must remain blocked in your personal bank account via ASBA until official BSE/NSE allotment.",
      },
    ],
  },
  {
    id: "task_scam",
    title: "Telegram Hotel / Google Maps Review 'Part-Time Task' Scam",
    badge: "Rapid Compounding Trap",
    lossMetric: "Average loss: ₹6.5 Lakhs / victim",
    messages: [
      {
        sender: "HR Consultant Divya",
        avatar: "💼",
        text: "Earn ₹3,000–₹8,000 daily from home! Simply like 5 luxury hotels on Google Maps and submit screenshots. We pay ₹150 per review instantly via UPI.",
        isAttacker: true,
      },
      {
        sender: "Crypto Task Coordinator",
        avatar: "💎",
        text: "You earned ₹450 on Trial Tasks! To unlock Premium Merchant Tasks (Batch #4), deposit ₹10,000 refundable liquidity into merchant wallet to earn ₹16,000 in 20 minutes.",
        isAttacker: true,
      },
    ],
    choices: [
      {
        label: "Send ₹10,000 to unlock higher commission since the trial paid real money",
        isTrap: true,
        explanation: "CRITICAL FAILURE: This is the classic 'Prepaid Task Scam'. The initial ₹150–₹450 payouts are bait to build synthetic trust. Once you deposit ₹10,000, they freeze withdrawals claiming 'tax penalties' until victims lose lakhs.",
      },
      {
        label: "Keep the ₹450 trial payment, exit Telegram group immediately, and report handle",
        isTrap: false,
        explanation: "EXCELLENT DEFENSE: Legitimate enterprises never require prepaid deposits to perform freelance work. You recognized the bait-and-switch compounding trap.",
      },
    ],
  },
];

export function ScamSimulatorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentScenario = SCENARIOS[selectedScenarioIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400 text-lg">🛡️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Rakshak Counter-Scam Defense Sandbox
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  TRAINING SIMULATOR
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Practice recognizing real-world coercion tactics without risking real capital.
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

        {/* Scenario Tabs */}
        <div className="flex overflow-x-auto border-b border-neutral-800 bg-neutral-950/60 p-2 gap-2 text-xs">
          {SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenarioIndex(idx);
                setUserChoice(null);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedScenarioIndex === idx
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              {sc.title.split(" ")[0]} {sc.title.split(" ")[1]}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">{currentScenario.title}</h4>
              <span className="text-[11px] font-mono text-red-400 font-semibold">{currentScenario.lossMetric}</span>
            </div>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
              {currentScenario.badge}
            </span>
          </div>

          {/* Simulated WhatsApp / Messaging Chat Window */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 font-sans">
            {currentScenario.messages.map((m, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="text-xl p-1 rounded-full bg-neutral-800">{m.avatar}</span>
                <div className="flex-1 bg-neutral-900 border border-neutral-800/80 rounded-xl rounded-tl-none p-3 text-xs leading-relaxed text-neutral-200">
                  <div className="font-semibold text-amber-400 text-[11px] mb-1">{m.sender}</div>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Decision Choices */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              How do you respond? Choose your defense:
            </div>

            {currentScenario.choices.map((choice, idx) => {
              const isSelected = userChoice === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setUserChoice(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                    isSelected
                      ? choice.isTrap
                        ? "bg-red-950/40 border-red-500/60 text-red-200"
                        : "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
                      : "bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{choice.label}</span>
                    {isSelected && (
                      <span className="text-xs font-bold uppercase">
                        {choice.isTrap ? "🚨 Trap Triggered" : "✓ Safe Defense"}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-2.5 pt-2.5 border-t border-neutral-800/80 text-[11px] leading-relaxed">
                      {choice.explanation}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
          <span className="text-neutral-500">Rakshak Interactive Cyber-Defense Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg transition-colors"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
