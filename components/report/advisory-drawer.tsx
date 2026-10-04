"use client";

import React, { useState } from "react";
import type { AnalysisReport, Lang } from "@/types";

interface AdvisoryDrawerProps {
  report: AnalysisReport;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function AdvisoryDrawer({ report, isOpen, onClose }: AdvisoryDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: `Hello. I am your Rakshak Emergency Advisor. I have context on your report (Risk Score: ${report.risk.score}/100 - ${report.risk.level}). How can I assist you right now?`,
    },
  ]);
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const quickQuestions = [
    "I already sent money. What should I do right now?",
    "They are threatening me with police/CBI arrest. Is it real?",
    "How do I block this UPI ID and freeze my bank account?",
    "What exact words should I say if the scammer calls back?",
  ];

  const handleSend = (questionText?: string) => {
    const q = questionText || input.trim();
    if (!q) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", text: q }];
    setMessages(newMessages);
    setInput("");

    // Deterministic factual crisis advisory responses anchored strictly to Indian regulatory guidance
    let answer = "";
    const lower = q.toLowerCase();

    if (lower.includes("already sent") || lower.includes("paid") || lower.includes("sent money")) {
      answer = `🚨 CRITICAL EMERGENCY ACTION (GOLDEN HOUR):
1. Immediately dial 1930 (National Cybercrime Reporting Helpline). Reporting within 2-3 hours significantly increases the chance of freezing the money in the scammer's mule bank account.
2. Open your banking app and block the transaction / UPI ID immediately.
3. Visit cybercrime.gov.in and file an official complaint using the dossier generated in your report.
4. Notify your home branch manager in writing with your Rakshak evidentiary hash: ${report.dossier?.evidenceHash || report.id}.`;
    } else if (lower.includes("threaten") || lower.includes("police") || lower.includes("cbi") || lower.includes("arrest")) {
      answer = `🛑 DO NOT PANIC. IT IS 100% FAKE:
- Indian Law Enforcement (Police, CBI, ED, Narcotics Control Bureau) NEVER conducts "Digital Arrests" via Skype, WhatsApp, or video calls.
- Legitimate courts never send arrest warrants or summons over WhatsApp messaging.
- Hang up immediately, block the number, and report it on the Chakshu portal (sancharsaathi.gov.in). They have zero legal power over you.`;
    } else if (lower.includes("block") || lower.includes("freeze") || lower.includes("upi")) {
      answer = `🔒 HOW TO BLOCK & SAFEGUARD YOUR FUNDS:
1. Open Google Pay / PhonePe / Paytm -> Settings -> Security -> Manage UPI IDs -> Block contact.
2. Call your bank's 24/7 emergency fraud helpline (e.g. SBI: 1800 11 2211, HDFC: 1800 1600).
3. Request a temporary hotlist/block on net banking and UPI outgoing payments until you secure your devices.`;
    } else {
      answer = `🛡️ WHAT TO SAY IF THEY CALL:
"I have logged this communication with Rakshak Threat Intelligence and submitted the incident record to the National Cybercrime Reporting Portal (1930) and SEBI. All subsequent calls and payment requests are being recorded for law enforcement."
Then immediately disconnect and do not engage further.`;
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    }, 300);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0e1217] border-l border-sky-500/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-sky-950/20">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 font-bold">
            🛡️
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Ask Rakshak Emergency Advisor</h3>
            <p className="text-[11px] text-slate-400 font-mono">Immediate victim safety guidance</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0a0d11]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-sky-600 text-white font-medium"
                  : "bg-slate-800/90 text-slate-200 border border-slate-700/60 whitespace-pre-wrap font-sans"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0d1015] space-y-1.5">
        <span className="text-[11px] font-semibold text-dim uppercase tracking-wider block">
          Frequent Crisis Inquiries:
        </span>
        <div className="flex flex-col gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left text-[11.5px] rounded-lg px-2.5 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-slate-800 transition-colors truncate"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-slate-800 bg-[#07090c] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask what to do next..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button
          onClick={() => handleSend()}
          className="rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
