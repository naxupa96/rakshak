import type { ReactNode } from "react";
import type { RiskLevel, Severity, VerificationStatus } from "@/types";

export type Tone = "neutral" | "low" | "moderate" | "elevated" | "high" | "critical" | "good" | "warn" | "bad";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "border-line-2 text-mist bg-white/[0.03]",
  low: "border-emerald/40 text-emerald bg-emerald/10",
  good: "border-emerald/40 text-emerald bg-emerald/10",
  moderate: "border-amber/40 text-amber bg-amber/10",
  warn: "border-amber/40 text-amber bg-amber/10",
  elevated: "border-amber/50 text-amber bg-amber/12",
  high: "border-signal/45 text-[#ff9d92] bg-signal/12",
  critical: "border-signal/60 text-[#ffb4ac] bg-signal/18",
  bad: "border-signal/45 text-[#ff9d92] bg-signal/12",
};

export const LEVEL_TONE: Record<RiskLevel, Tone> = {
  LOW: "low",
  MODERATE: "moderate",
  ELEVATED: "elevated",
  HIGH: "high",
  CRITICAL: "critical",
};

export function severityTone(severity: Severity): Tone {
  return severity === "critical"
    ? "critical"
    : severity === "high"
      ? "high"
      : severity === "medium"
        ? "moderate"
        : "neutral";
}

export function verificationTone(status: VerificationStatus): Tone {
  switch (status) {
    case "verified":
      return "good";
    case "contradicted":
      return "bad";
    case "requires_verification":
      return "warn";
    default:
      return "neutral";
  }
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`chip border ${TONE_CLASS[tone]}`} style={{ letterSpacing: "0.02em" }}>
      {children}
    </span>
  );
}

export function Section({
  title,
  hint,
  right,
  children,
  id,
  className = "",
}: {
  title: string;
  hint?: string;
  right?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`mt-10 first:mt-0 ${className}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-bone">{title}</h2>
          {hint ? <p className="mt-1 text-[13px] text-mist">{hint}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Bar({ value, tone = "neutral" }: { value: number; tone?: Tone }) {
  const color =
    tone === "good" || tone === "low"
      ? "#35c08a"
      : tone === "moderate" || tone === "warn" || tone === "elevated"
        ? "#f2a93b"
        : tone === "high" || tone === "critical" || tone === "bad"
          ? "#ff4d3d"
          : "#5b93ff";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 border-l-2 border-line-2 pl-3 font-mono text-[12.5px] leading-relaxed text-mist">
      {children}
    </p>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="panel-flat px-5 py-6 text-sm text-dim" role="status">
      {text}
    </div>
  );
}
