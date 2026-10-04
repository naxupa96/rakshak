"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalyzeRequest, InputKind } from "@/types";
import { useApp } from "@/components/app-providers";
import { extractTextFromImage, OCR_MAX_BYTES } from "@/lib/ocr";
import { saveLiveReport } from "@/lib/storage/locker";
import { DEMO_IDS } from "@/data/demo";
import { useAfterMount } from "@/lib/hooks";
import { Badge } from "@/components/ui";

type Tab = "text" | "image" | "url" | "demo";

const HUMAN_STAGES = [
  "Reading the content",
  "Understanding the claims",
  "Checking the source & identity",
  "Connecting the evidence",
  "Assessing the risk",
];

function Processing({ label, sub }: { label: string; sub?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => Math.min(i + 1, HUMAN_STAGES.length - 1)), 450);
    return () => window.clearInterval(timer);
  }, []);

  const progressPct = Math.round(((index + 1) / HUMAN_STAGES.length) * 100);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-white/[0.08] bg-[#121419] p-8 text-bone shadow-[0_20px_50px_rgba(0,0,0,0.4)]" role="status" aria-live="polite">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
        <div>
          <span className="text-xs font-medium text-azure uppercase tracking-wider block">
            Investigation in progress
          </span>
          <h3 className="text-base font-semibold text-bone mt-1">{label}</h3>
        </div>
        <span className="text-xs font-medium text-mist px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
          {progressPct}%
        </span>
      </div>

      {/* Human-Readable Progress List */}
      <div className="space-y-3 mb-6">
        {HUMAN_STAGES.map((stageName, i) => {
          const isDone = i < index;
          const isCurrent = i === index;
          return (
            <div
              key={stageName}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs transition-all ${
                isDone
                  ? "border-[#35b779]/20 bg-[#35b779]/5 text-[#35b779]"
                  : isCurrent
                  ? "border-azure/30 bg-azure/10 text-bone font-medium"
                  : "border-white/[0.04] bg-transparent text-dim"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs">
                  {isDone ? "✓" : isCurrent ? "●" : "○"}
                </span>
                <span className="text-xs">{stageName}</span>
              </div>
              <span className="text-[11px] text-dim">
                {isDone ? "Complete" : isCurrent ? "Analyzing" : "Queued"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full bg-azure transition-all duration-300 rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <p className="mt-4 text-xs text-center text-dim font-normal">
        Your inputs are processed privately in your browser session.
      </p>
    </div>
  );
}

export function InvestigateApp() {
  const { dict } = useApp();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [ocr, setOcr] = useState<{ status: "idle" | "reading" | "done" | "failed"; text: string; confidence: number; progress: number }>({
    status: "idle",
    text: "",
    confidence: 0,
    progress: 0,
  });
  const fileRef = useRef<HTMLInputElement | null>(null);

  useAfterMount(() => {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get("demo");
    const sharedText = params.get("text") || params.get("title");
    const sharedUrl = params.get("url");

    if (demo && DEMO_IDS.includes(demo)) {
      setTab("demo");
      void run({ kind: "text", demo });
    } else if (sharedUrl) {
      setTab("url");
      setUrl(sharedUrl);
      void run({ kind: "url", url: sharedUrl });
    } else if (sharedText) {
      setTab("text");
      setText(sharedText);
      void run({ kind: "text", text: sharedText });
    }
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "text", label: dict.input.tabText },
    { id: "image", label: dict.input.tabScreenshot },
    { id: "url", label: dict.input.tabUrl },
    { id: "demo", label: dict.demo.title },
  ];

  async function run(body: AnalyzeRequest) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { report?: unknown; error?: string; code?: string };
      if (!res.ok || !data.report) {
        const code = data.code;
    if (code === "EMPTY_INPUT") setError(dict.input.errorEmpty);
    else if (code === "TOO_LARGE") setError(dict.input.errorTooLarge);
    else if (code === "INVALID_URL") setError(dict.input.errorUrl);
    else if (code === "UNSUPPORTED") setError(dict.errors.unsupported);
    else setError(data.error || dict.errors.generic);
        return;
      }
      saveLiveReport(data.report as Parameters<typeof saveLiveReport>[0]);
      router.push("/report/live");
    } catch {
      setError(dict.errors.network);
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError(dict.input.errorType);
      return;
    }
    if (file.size > OCR_MAX_BYTES) {
      setError(dict.input.errorTooLarge);
      return;
    }
    setOcr({ status: "reading", text: "", confidence: 0, progress: 0 });
    try {
      const result = await extractTextFromImage(file, (progress) =>
        setOcr((prev) => ({ ...prev, progress })),
      );
      if (!result.text || result.text.replace(/\s/g, "").length < 4) {
        setOcr({ status: "failed", text: "", confidence: 0, progress: 100 });
        setError(dict.input.errorOcr);
        return;
      }
      setOcr({ status: "done", text: result.text, confidence: result.confidence, progress: 100 });
    } catch {
      setOcr({ status: "failed", text: "", confidence: 0, progress: 100 });
      setError(dict.input.errorOcr);
    }
  }

  if (busy) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <Processing label={dict.processing.title} sub={dict.processing.sub} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 font-sans text-bone">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold text-azure uppercase tracking-wider block mb-2">
          New investigation
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-bone font-sans">
          What would you like to verify?
        </h1>
        <p className="mt-2 text-sm text-mist max-w-xl font-normal leading-relaxed">
          Paste an investment message, upload a screenshot, enter a website URL or select a sample scenario.
        </p>
      </div>

      {/* Elegant Tab Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#121419] border border-white/[0.06]" role="tablist" aria-label={dict.input.title}>
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setError(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.id
                  ? "bg-bone text-[#0b0d11] font-semibold shadow-sm"
                  : "text-mist hover:text-bone hover:bg-white/[0.04]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 1-Click Clipboard Auto-Detect */}
        <button
          onClick={async () => {
            try {
              if (navigator.clipboard) {
                const clip = await navigator.clipboard.readText();
                if (clip && clip.trim()) {
                  const trimmed = clip.trim();
                  if (/^https?:\/\//i.test(trimmed)) {
                    setTab("url");
                    setUrl(trimmed);
                    void run({ kind: "url", url: trimmed });
                  } else {
                    setTab("text");
                    setText(trimmed);
                    void run({ kind: "text", text: trimmed });
                  }
                }
              }
            } catch {
              // Permission denied
            }
          }}
          className="btn btn-ghost !py-1.5 !px-3.5 !text-xs font-medium text-azure border-azure/20 hover:bg-azure/10"
          title="Reads clipboard and initiates interrogation"
        >
          Paste & verify ↵
        </button>
      </div>

      {/* Main Input Surface */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121419] p-6 mt-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        {tab === "text" ? (
          <div>
            <label htmlFor="paste" className="text-xs font-medium text-mist block mb-2">
              {dict.input.hintText}
            </label>
            <textarea
              id="paste"
              className="field min-h-[190px] resize-y font-sans text-sm leading-relaxed border-white/[0.08] bg-[#0c0e12] rounded-xl focus:border-white/20"
              placeholder={dict.input.placeholderText}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        ) : null}

        {tab === "image" ? (
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                void handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center transition-all ${
                dragging
                  ? "border-azure bg-azure/10"
                  : "border-white/[0.1] bg-[#0c0e12] hover:border-white/[0.2]"
              }`}
            >
              <span className="text-2xl mb-1">🖼️</span>
              <p className="text-sm font-medium text-bone max-w-sm">{dragging ? dict.input.dropHere : dict.input.hintScreenshot}</p>
              <p className="text-xs text-dim">PNG, JPG, or WebP up to 10MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
              <button
                className="btn btn-ghost !py-1.5 !px-4 !text-xs font-medium mt-1"
                onClick={() => fileRef.current?.click()}
              >
                Browse files
              </button>
            </div>

            {ocr.status === "reading" ? (
              <div className="mt-4 p-4 rounded-xl border border-white/[0.06] bg-[#0c0e12]" role="status" aria-live="polite">
                <div className="flex items-center justify-between text-xs text-mist mb-2">
                  <span>Reading text from screenshot...</span>
                  <span className="font-semibold text-bone">{ocr.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-azure transition-all rounded-full" style={{ width: `${ocr.progress}%` }} />
                </div>
              </div>
            ) : null}

            {ocr.status === "done" ? (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-mist">{dict.input.extractReview}</span>
                  <span className="text-xs text-[#35b779] bg-[#35b779]/10 border border-[#35b779]/20 px-2.5 py-0.5 rounded-full font-medium">
                    Text extracted ({ocr.confidence}% confidence)
                  </span>
                </div>
                <textarea
                  className="field min-h-[150px] resize-y text-sm leading-relaxed border-white/[0.08] bg-[#0c0e12] rounded-xl"
                  value={ocr.text}
                  onChange={(e) => setOcr((prev) => ({ ...prev, text: e.target.value }))}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "url" ? (
          <div>
            <label htmlFor="url" className="text-xs font-medium text-mist block mb-2">
              {dict.input.hintUrl}
            </label>
            <input
              id="url"
              className="field text-sm border-white/[0.08] bg-[#0c0e12] rounded-xl font-mono"
              placeholder={dict.input.placeholderUrl}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        ) : null}

        {tab === "demo" ? (
          <div>
            <span className="text-xs font-medium text-mist block mb-3">{dict.demo.hint}</span>
            <div className="rounded-xl border border-white/[0.06] bg-[#0c0e12] divide-y divide-white/[0.04] overflow-hidden">
              {DEMO_IDS.map((id, idx) => {
                const scenario = (dict.demo.scenarios as Record<string, { title: string; desc: string }>)[id];
                return (
                  <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-white/[0.02] transition-colors">
                    <div>
                      <span className="text-sm font-semibold text-bone block">{scenario?.title ?? id}</span>
                      <p className="text-xs text-mist mt-0.5">{scenario?.desc}</p>
                    </div>
                    <button
                      className="btn btn-ghost !py-1.5 !px-3.5 !text-xs font-medium shrink-0"
                      disabled={busy}
                      onClick={() => void run({ kind: "text", demo: id })}
                    >
                      {busy ? dict.demo.running : dict.demo.run}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-[#e5484d]/30 bg-[#e5484d]/10 px-4 py-3 text-xs text-[#ff8b8e]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
          <p className="max-w-md text-xs text-dim leading-relaxed">{dict.input.privacyNotice}</p>
          <button
            className="btn btn-primary !px-6 !py-2.5 text-sm font-semibold shadow-md shadow-white/5"
            disabled={
              busy ||
              (tab === "text" && !text.trim()) ||
              (tab === "image" && (ocr.status !== "done" || !ocr.text.trim())) ||
              (tab === "url" && !url.trim())
            }
            onClick={() => {
              if (tab === "text") void run({ kind: "text" satisfies InputKind, text });
              else if (tab === "image") void run({ kind: "image", text: ocr.text, ocrConfidence: ocr.confidence });
              else if (tab === "url") void run({ kind: "url", url });
            }}
          >
            {busy ? dict.demo.running : dict.input.analyzeCta}
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-[12.5px] text-dim">{dict.input.unsupportedNote}</p>
    </div>
  );
}
