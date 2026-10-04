"use client";

import React, { useState } from "react";
import type { SandboxInspection } from "@/types";

interface UrlSandboxModalProps {
  sandbox: SandboxInspection;
  isOpen: boolean;
  onClose: () => void;
}

export function UrlSandboxModal({ sandbox, isOpen, onClose }: UrlSandboxModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-red-500/40 bg-[#0e1217] text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/20 px-6 py-4 bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  Rakshak Disarmed Sandbox
                </span>
                <span className="text-xs text-slate-400">
                  Active scripts stripped: <strong>{sandbox.maliciousScriptsStripped}</strong>
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-100 font-mono mt-0.5 truncate max-w-md">
                {sandbox.targetUrl}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Security Disarm Notice */}
        <div className="px-6 py-2.5 bg-black/40 border-b border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3 font-mono">
          <span>✓ Session cookies disabled</span>
          <span>✓ External scripts isolated</span>
          <span>✓ Forms neutralized</span>
          <span className="text-emerald-400 font-semibold">Safe View Only</span>
        </div>

        {/* Main Sandbox Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 bg-[#0a0d11]">
          {/* Disarmed Preview Frame */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-[#07090c] overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-800 bg-black/40 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Sanitized Render Preview</span>
              <span className="text-red-400">NO SCRIPTS EXECUTED</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto max-h-[460px] text-xs font-mono text-slate-300">
              <pre className="whitespace-pre-wrap selection:bg-red-500/30">
                {sandbox.disarmedHtml || "No HTML content extracted."}
              </pre>
            </div>
          </div>

          {/* Intercepted Deceptive Elements */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-bone">
                Intercepted Deceptive Elements ({sandbox.suspiciousElements.length})
              </h3>
              <p className="text-[11px] text-mist mt-0.5">
                Specific payloads and forms designed to deceive the visitor.
              </p>
            </div>

            <div className="space-y-2.5">
              {sandbox.suspiciousElements.map((el, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-3 text-xs ${
                    el.severity === "critical"
                      ? "border-red-500/30 bg-red-950/20 text-red-200"
                      : "border-amber-500/30 bg-amber-950/20 text-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold">{el.element}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40">
                      {el.severity}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-300">
                    {el.reason}
                  </p>
                </div>
              ))}
            </div>

            {/* Extracted Forms */}
            {sandbox.extractedForms.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-2">
                <span className="text-xs font-semibold text-bone block">
                  Harvesting Forms Target Endpoints
                </span>
                {sandbox.extractedForms.map((f, i) => (
                  <div key={i} className="text-xs font-mono text-slate-300 border-t border-slate-800/60 pt-2">
                    <div>Action: <span className="text-amber-400 break-all">{f.action}</span></div>
                    <div>Inputs: <span className="text-slate-400">{f.inputs.join(", ") || "None"}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-3.5 bg-[#0d1015]">
          <span className="text-xs text-slate-400">
            Rendered inside Rakshak Isolation Sandbox. Zero network requests permitted.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
