"use client";

import React, { useState } from "react";

interface ThreatRegion {
  name: string;
  state: string;
  vector: string;
  threatLevel: "CRITICAL" | "HIGH" | "ELEVATED";
  monthlyIntercepts: number;
  topModusOperandi: string;
  x: number; // percentage coordinate on SVG
  y: number;
}

const THREAT_REGIONS: ThreatRegion[] = [
  {
    name: "Jamtara & Deoghar",
    state: "Jharkhand",
    vector: "Bank OTP Sniffing & Call Forwarding Hijack",
    threatLevel: "CRITICAL",
    monthlyIntercepts: 14200,
    topModusOperandi: "APK trojan droppers + silent *21* voice OTP redirection",
    x: 68,
    y: 43,
  },
  {
    name: "Mewat, Nuh & Bharatpur",
    state: "Haryana / Rajasthan",
    vector: "Fake Vehicle Listings & Task Compounding",
    threatLevel: "CRITICAL",
    monthlyIntercepts: 18900,
    topModusOperandi: "Prepaid hotel rating scams & QR code reverse-charge traps",
    x: 42,
    y: 35,
  },
  {
    name: "Bengaluru & Hyderabad Corridor",
    state: "Karnataka / Telangana",
    vector: "Institutional Block-IPO WhatsApp Syndicates",
    threatLevel: "HIGH",
    monthlyIntercepts: 9400,
    topModusOperandi: "Fictitious QIB/FII allotment APK terminals spoofing Zerodha/Groww",
    x: 48,
    y: 72,
  },
  {
    name: "Noida & Gurugram NCR Hub",
    state: "Delhi NCR",
    vector: "CBI / Supreme Court 'Digital Arrest' Coercion",
    threatLevel: "CRITICAL",
    monthlyIntercepts: 16500,
    topModusOperandi: "Fake Skype courtroom video calls & forged Supreme Court escrow orders",
    x: 44,
    y: 31,
  },
  {
    name: "Surat & Ahmedabad Hub",
    state: "Gujarat",
    vector: "Pump & Dump Circuit Manipulation & Dabba Trading",
    threatLevel: "HIGH",
    monthlyIntercepts: 8200,
    topModusOperandi: "Telegram penny stock tips with upper circuit guarantees",
    x: 28,
    y: 50,
  },
];

export function IndiaThreatHeatmap() {
  const [activeRegion, setActiveRegion] = useState<ThreatRegion>(THREAT_REGIONS[0]);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
            🗺️
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">National Cyber-Financial Threat Heatmap</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                LIVE INTERCEPT TELEMETRY
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Aggregated syndicated mule routing & digital arrest origins across India.
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="text-neutral-400">Total Intercepts (30d):</div>
          <div className="font-mono font-bold text-amber-400">67,200+ Verified Scams</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* SVG Map Canvas with Animated Hotspot Coordinates */}
        <div className="lg:col-span-7 relative h-72 rounded-xl bg-neutral-950 border border-neutral-800/80 overflow-hidden flex items-center justify-center p-4">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Abstract India Geometrical Outline representation */}
          <svg className="w-full h-full text-neutral-800/60 max-w-xs" viewBox="0 0 100 100" fill="none">
            {/* Outline Path of India */}
            <path
              d="M45 8 L52 14 L55 22 L62 25 L70 28 L82 25 L88 32 L82 38 L72 38 L65 42 L68 48 L62 58 L54 68 L48 85 L44 88 L40 82 L38 68 L32 55 L25 48 L22 38 L30 30 L38 22 L42 12 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="rgba(255, 255, 255, 0.02)"
            />
          </svg>

          {/* Hotspot Markers */}
          {THREAT_REGIONS.map((region) => {
            const isSelected = activeRegion.name === region.name;
            return (
              <button
                key={region.name}
                onClick={() => setActiveRegion(region)}
                style={{ left: `${region.x}%`, top: `${region.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer p-1"
                title={`${region.name} (${region.state})`}
              >
                <span className={`relative flex h-4 w-4 items-center justify-center`}>
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      region.threatLevel === "CRITICAL" ? "bg-red-500" : "bg-amber-500"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isSelected
                        ? "bg-white ring-2 ring-red-500"
                        : region.threatLevel === "CRITICAL"
                        ? "bg-red-500"
                        : "bg-amber-400"
                    }`}
                  />
                </span>
                <span className="absolute left-5 top-0 hidden group-hover:block whitespace-nowrap z-20 px-2 py-1 text-[10px] font-bold rounded bg-neutral-900 border border-neutral-700 text-white shadow-lg">
                  {region.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Hotspot Intelligence Panel */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-neutral-400">
              Selected Cybercrime Zone
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeRegion.threatLevel === "CRITICAL"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {activeRegion.threatLevel} RISK
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">{activeRegion.name}</h4>
            <p className="text-neutral-400 text-xs mt-0.5">{activeRegion.state}</p>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80 space-y-1">
            <div className="text-[11px] text-neutral-400 font-semibold">Primary Attack Vector:</div>
            <div className="text-neutral-200 font-medium">{activeRegion.vector}</div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-neutral-400 font-semibold">Top Modus Operandi:</div>
            <div className="text-neutral-300 leading-relaxed text-[11.5px]">
              {activeRegion.topModusOperandi}
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">Intercepts Flagged:</span>
            <span className="font-mono font-bold text-red-400">
              {activeRegion.monthlyIntercepts.toLocaleString()} monthly
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
