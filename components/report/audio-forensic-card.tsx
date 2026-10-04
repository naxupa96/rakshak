"use client";

import React from "react";
import { AudioForensicReport } from "@/types";

interface AudioForensicCardProps {
  audio: AudioForensicReport;
}

export function AudioForensicCard({ audio }: AudioForensicCardProps) {
  if (!audio.isAudio) return null;

  const isDeepfake = audio.verdict === "likely_deepfake_clone";
  const isSuspicious = audio.verdict === "suspicious_synthetic_audio";

  return (
    <div
      className={`my-6 rounded-xl border p-5 ${
        isDeepfake
          ? "bg-red-950/20 border-red-500/40"
          : isSuspicious
          ? "bg-amber-950/20 border-amber-500/40"
          : "bg-neutral-900/60 border-neutral-800"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`p-2 rounded-lg text-sm ${
              isDeepfake
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-neutral-800 text-neutral-300"
            }`}
          >
            🎙️
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Acoustic & Deepfake Voice Note Forensics
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isDeepfake
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : isSuspicious
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {audio.syntheticLikelihood === "high" ? "Likely Synthetic AI Clone" : `${audio.syntheticLikelihood} Likelihood`}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-0.5">
              {audio.fileName ? `Inspected Audio: ${audio.fileName}` : "Voice Coercion Audio Inspection"}
            </h4>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="text-neutral-400">Robotic Cadence Index:</div>
          <div className="font-mono font-bold text-red-400">{audio.roboticCadenceScore}/100</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <div className="text-neutral-500 text-[11px]">Pitch Variance Fluctuation</div>
          <div className="font-mono text-neutral-200 font-semibold mt-1">
            {audio.pitchVarianceScore}/100 {audio.pitchVarianceScore < 30 ? "(Flat TTS Vocoder)" : "(Natural)"}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <div className="text-neutral-500 text-[11px]">Ambient Acoustic Noise Floor</div>
          <div className="font-mono text-neutral-200 font-semibold mt-1">
            {audio.ambientNoiseFloorDb} dB {audio.ambientNoiseFloorDb < -65 ? "(Artificial Silence)" : "(Room Reverb Present)"}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <div className="text-neutral-500 text-[11px]">Duration Checked</div>
          <div className="font-mono text-neutral-200 font-semibold mt-1">
            {audio.durationSec ? `${audio.durationSec}s recorded audio` : "Audio stream extract"}
          </div>
        </div>
      </div>

      {/* Anomalies Detected */}
      {audio.detectedVoiceAnomalies.length > 0 && (
        <div className="mt-4 space-y-2">
          {audio.detectedVoiceAnomalies.map((anom, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs text-red-300 bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg"
            >
              <span className="text-red-500 font-bold shrink-0">⚠</span>
              <span>{anom}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
