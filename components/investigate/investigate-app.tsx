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
    const timer = window.setInterval(() => setIndex((i) => Math.min(i + 1, STAGES.length - 1)), 420);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="panel mx-auto max-w-lg px-6 py-8" role="status" aria-live="polite">
      <p className="kicker">{label}</p>
      <ol className="mt-5 space-y-2.5">
        {STAGES.map((stage, i) => {
          const state = i < index ? "done" : i === index ? "active" : "pending";
          return (
            <li key={stage} className="flex items-center gap-3 text-[13.5px]">
              <span
                className={`h-2 w-2 rounded-full ${
                  state === "done" ? "bg-emerald" : state === "active" ? "animate-pulse bg-amber" : "bg-line-2"
                }`}
                aria-hidden
              />
              <span className={state === "pending" ? "text-dim" : state === "active" ? "text-bone" : "text-mist"}>
                {(dict.processing.stages as Record<string, string>)[stage] ?? stage}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-bone transition-[width] duration-500"
          style={{ width: `${((index + 1) / STAGES.length) * 100}%` }}
        />
      </div>
      {sub ? <p className="mt-4 text-[12.5px] text-dim">{sub}</p> : null}
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
    <div className="mx-auto w-full max-w-4xl px-5 py-12">
      <p className="kicker">{dict.input.kicker}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-bone">{dict.input.title}</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-mist">{dict.input.subtitle}</p>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={dict.input.title}>
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setError(null);
              }}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                tab === t.id
                  ? "border border-white/20 bg-white/12 text-bone shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-md"
                  : "border border-line/60 text-mist hover:border-line-2 hover:text-bone hover:bg-white/[0.03]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 1-Click Smart Clipboard Auto-Detect Button with Shimmer & Glow */}
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
              // Permission denied or clipboard empty
            }
          }}
          className="shimmer-btn inline-flex items-center gap-1.5 rounded-full border border-sky-400/50 bg-sky-500/15 px-4 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/25 transition-all shadow-[0_0_16px_rgba(56,189,248,0.2)] hover:shadow-[0_0_24px_rgba(56,189,248,0.35)]"
          title="Reads clipboard, auto-classifies URL vs text, and runs scan in 1 click"
        >
          <span>📋</span>
          <span>Paste & Quick Scan</span>
        </button>
      </div>

      <div className="panel mt-5 p-5">
        {tab === "text" ? (
          <div>
            <label htmlFor="paste" className="kicker">
              {dict.input.hintText}
            </label>
            <textarea
              id="paste"
              className="field mt-2 min-h-[200px] resize-y font-mono !text-[13.5px] leading-relaxed"
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
              className={`flex min-h-[190px] flex-col items-center justify-center gap-3.5 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all ${
                dragging
                  ? "border-azure bg-azure/10 shadow-[0_0_24px_rgba(91,147,255,0.25)]"
                  : "border-line-2/70 bg-ink-2/60 hover:border-line-2 hover:bg-ink-2/90"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-lg">
                🖼️
              </div>
              <p className="text-sm font-medium text-mist max-w-sm">{dragging ? dict.input.dropHere : dict.input.hintScreenshot}</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
              <button className="btn btn-ghost glass-card-hover !py-2 !text-[13px] border border-white/10 hover:border-white/20" onClick={() => fileRef.current?.click()}>
                {dict.input.browse}
              </button>
            </div>

            {ocr.status === "reading" ? (
              <div className="mt-4" role="status" aria-live="polite">
                <p className="text-sm text-mist">
                  {dict.input.ocrReading} {ocr.progress}%
                </p>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/8">
                  <div className="h-full bg-bone transition-[width]" style={{ width: `${ocr.progress}%` }} />
                </div>
              </div>
            ) : null}

            {ocr.status === "done" ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="kicker">{dict.input.extractReview}</p>
                  <Badge tone={ocr.confidence >= 80 ? "good" : "warn"}>
                    {dict.input.ocrDone} · {ocr.confidence}%
                  </Badge>
                </div>
                <textarea
                  className="field min-h-[160px] resize-y font-mono !text-[13.5px] leading-relaxed"
                  value={ocr.text}
                  onChange={(e) => setOcr((prev) => ({ ...prev, text: e.target.value }))}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "url" ? (
          <div>
            <label htmlFor="url" className="kicker">
              {dict.input.hintUrl}
            </label>
            <input
              id="url"
              className="field mt-2 font-mono !text-[13.5px]"
              placeholder={dict.input.placeholderUrl}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        ) : null}

        {tab === "demo" ? (
          <div>
            <p className="kicker">{dict.demo.hint}</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {DEMO_IDS.map((id) => {
                const scenario = (dict.demo.scenarios as Record<string, { title: string; desc: string }>)[id];
                return (
                  <li key={id} className="panel-flat flex flex-col gap-2 px-4 py-3.5">
                    <span className="text-sm font-medium text-bone">{scenario?.title ?? id}</span>
                    <span className="text-[13px] leading-relaxed text-mist">{scenario?.desc}</span>
                    <button
                      className="btn btn-ghost mt-1 !py-1.5 !text-[12.5px]"
                      disabled={busy}
                      onClick={() => void run({ kind: "text", demo: id })}
                    >
                      {busy ? dict.demo.running : dict.demo.run}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-[13.5px] text-[#ffb4ac]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <p className="max-w-md text-[12.5px] leading-relaxed text-dim">{dict.input.privacyNotice}</p>
          <button
            className="btn btn-primary shimmer-btn shadow-[0_0_24px_rgba(237,239,242,0.18)] hover:shadow-[0_0_32px_rgba(237,239,242,0.3)] !px-6 !py-2.5 font-semibold text-[14px]"
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
