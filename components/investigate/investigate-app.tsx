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

const STAGES = ["normalize", "entities", "claims", "verify", "signals", "risk", "evidence", "trust", "graph"];

function Processing({ label, sub }: { label: string; sub?: string }) {
  const { dict } = useApp();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => Math.min(i + 1, STAGES.length - 1)), 350);
    return () => window.clearInterval(timer);
  }, []);

  const progressPct = Math.round(((index + 1) / STAGES.length) * 100);

  return (
    <div className="mx-auto max-w-xl border border-line bg-[#080b0f] p-6 text-bone font-mono text-xs select-none" role="status" aria-live="polite">
      {/* Top Docket Bar */}
      <div className="flex items-center justify-between border-b border-line pb-3 mb-4 bg-[#0c0f15] -mx-6 -mt-6 p-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-signal" />
          <span className="font-bold tracking-wider text-bone">INTERROGATION IN PROGRESS</span>
        </div>
        <span className="text-[11px] font-bold text-azure border border-azure/40 bg-azure/10 px-2 py-0.5">
          {progressPct}% COMPLETE
        </span>
      </div>

      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wider text-mist">{label}</p>
        {sub ? <p className="text-[11px] text-dim mt-0.5">{sub}</p> : null}
      </div>

      {/* Stage Grid */}
      <div className="border border-line divide-y divide-line mb-5 bg-[#0a0d12]">
        {STAGES.map((stage, i) => {
          const state = i < index ? "done" : i === index ? "active" : "pending";
          return (
            <div
              key={stage}
              className={`flex items-center justify-between px-3.5 py-2 transition-colors ${
                state === "done"
                  ? "bg-[#0b1016] text-emerald"
                  : state === "active"
                  ? "bg-[#111722] text-bone font-bold"
                  : "text-dim"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px]">
                  {state === "done" ? "✓" : state === "active" ? "●" : "○"}
                </span>
                <span className="uppercase tracking-wider text-[11px]">
                  {(dict.processing.stages as Record<string, string>)[stage] ?? stage}
                </span>
              </div>
              <span className="text-[10px] text-dim">
                {state === "done" ? "EXECUTED" : state === "active" ? "PROCESSING" : "QUEUED"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-1 w-full bg-[#13171f] border border-line">
        <div
          className="h-full bg-azure transition-[width] duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-dim">
        <span>SECURITY LEVEL: AIR-GAPPED EVALUATION</span>
        <span>NO EXTERNAL RETENTION</span>
      </div>
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
    <div className="mx-auto w-full max-w-4xl px-5 py-10 font-mono text-xs text-bone">
      {/* Workstation Header */}
      <div className="border-b border-line pb-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 bg-signal" />
          <p className="kicker !text-bone">FORENSIC INTAKE WORKSTATION</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-bone font-sans">{dict.input.title}</h1>
        <p className="mt-1 text-xs text-mist font-sans">{dict.input.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label={dict.input.title}>
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setError(null);
              }}
              className={`border px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                tab === t.id
                  ? "border-bone bg-bone text-ink font-bold"
                  : "border-line bg-[#090b0e] text-mist hover:text-bone hover:border-line-2"
              }`}
            >
              [ {t.label} ]
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
          className="border border-azure/40 bg-azure/10 px-3 py-1.5 text-xs font-mono text-azure hover:bg-azure/20 hover:text-bone transition-colors"
          title="Reads clipboard and initiates interrogation"
        >
          PASTE & INTERROGATE ↵
        </button>
      </div>

      <div className="border border-line bg-[#080b0f] p-5 mt-4">
        {tab === "text" ? (
          <div>
            <label htmlFor="paste" className="kicker !text-dim block mb-2">
              {dict.input.hintText}
            </label>
            <textarea
              id="paste"
              className="field min-h-[190px] resize-y font-mono !text-xs leading-relaxed border-line bg-[#06080b]"
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
              className={`flex min-h-[170px] flex-col items-center justify-center gap-3 border border-dashed px-6 py-6 text-center transition-colors ${
                dragging
                  ? "border-azure bg-azure/10 text-bone"
                  : "border-line bg-[#06080b] hover:border-line-2 text-mist"
              }`}
            >
              <span className="font-mono text-xs uppercase tracking-wider text-dim">
                DRAG IMAGE EVIDENCE HERE OR BROWSE LOCAL FILES
              </span>
              <p className="text-xs text-mist max-w-sm font-sans">{dragging ? dict.input.dropHere : dict.input.hintScreenshot}</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
              <button
                className="btn btn-ghost !py-1.5 !px-3 !text-xs font-mono uppercase"
                onClick={() => fileRef.current?.click()}
              >
                SELECT FILE
              </button>
            </div>

            {ocr.status === "reading" ? (
              <div className="mt-4 p-3 border border-line bg-[#0a0d12]" role="status" aria-live="polite">
                <div className="flex items-center justify-between text-xs text-mist font-mono mb-2">
                  <span>OCR EXTRACTION IN PROGRESS...</span>
                  <span>{ocr.progress}%</span>
                </div>
                <div className="h-1 w-full bg-[#151922] border border-line">
                  <div className="h-full bg-azure transition-[width]" style={{ width: `${ocr.progress}%` }} />
                </div>
              </div>
            ) : null}

            {ocr.status === "done" ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="kicker !text-dim">{dict.input.extractReview}</p>
                  <span className="text-[11px] font-mono text-emerald bg-emerald/10 border border-emerald/30 px-2 py-0.5">
                    CONFIDENCE: {ocr.confidence}%
                  </span>
                </div>
                <textarea
                  className="field min-h-[150px] resize-y font-mono !text-xs leading-relaxed border-line bg-[#06080b]"
                  value={ocr.text}
                  onChange={(e) => setOcr((prev) => ({ ...prev, text: e.target.value }))}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "url" ? (
          <div>
            <label htmlFor="url" className="kicker !text-dim block mb-2">
              {dict.input.hintUrl}
            </label>
            <input
              id="url"
              className="field font-mono !text-xs border-line bg-[#06080b]"
              placeholder={dict.input.placeholderUrl}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        ) : null}

        {tab === "demo" ? (
          <div>
            <p className="kicker !text-dim mb-3">{dict.demo.hint}</p>
            <div className="border border-line divide-y divide-line">
              {DEMO_IDS.map((id, idx) => {
                const scenario = (dict.demo.scenarios as Record<string, { title: string; desc: string }>)[id];
                return (
                  <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#07090c] hover:bg-[#0c0f15] transition-colors">
                    <div>
                      <span className="text-xs font-bold text-azure font-mono">RX-DEMO-0{idx + 1} // </span>
                      <span className="text-xs font-sans font-semibold text-bone">{scenario?.title ?? id}</span>
                      <p className="text-[11px] font-sans text-mist mt-0.5">{scenario?.desc}</p>
                    </div>
                    <button
                      className="btn btn-ghost !py-1 !px-3 !text-xs font-mono uppercase shrink-0"
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
          <p className="mt-4 border border-signal/50 bg-signal/10 px-4 py-2.5 text-xs text-signal font-mono" role="alert">
            ERROR: {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <p className="max-w-md text-[11px] text-dim font-sans leading-relaxed">{dict.input.privacyNotice}</p>
          <button
            className="btn btn-primary !px-6 !py-2.5 text-xs font-mono uppercase tracking-wider font-bold"
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
