import { NextResponse } from "next/server";
import type { AnalyzeError, AnalyzeRequest, Lang } from "@/types";
import { analyze } from "@/lib/analyze";
import { fetchPageText, FetchError } from "@/lib/analyze/fetch-url";
import { DEMOS } from "@/data/demo";

export const runtime = "nodejs";

const MAX_TEXT = 20_000;
const LANGS: Lang[] = ["en", "hi", "gu"];

function fail(status: number, code: AnalyzeError["code"], error: string) {
  const body: AnalyzeError = { error, code };
  return NextResponse.json(body, { status });
}

function sanitize(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

export async function POST(req: Request) {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > 1_500_000) {
    return fail(413, "TOO_LARGE", "That request is too large.");
  }

  let payload: AnalyzeRequest;
  try {
    payload = (await req.json()) as AnalyzeRequest;
  } catch {
    return fail(400, "UNSUPPORTED", "Malformed request body.");
  }

  const kind = payload.kind ?? "text";
  const lang = (LANGS.includes(payload.lang as Lang) ? payload.lang : "en") as Lang;
  const simple = Boolean(payload.simple);

  try {
    if (payload.demo) {
      const demo = DEMOS[payload.demo];
      if (!demo) return fail(404, "UNSUPPORTED", "Unknown demo scenario.");
      const report = await analyze({
        kind: demo.kind,
        text: sanitize(demo.text),
        url: demo.url,
        lang,
        simple,
      });
      return NextResponse.json({ report });
    }

    const SUPPORTED: AnalyzeRequest["kind"][] = ["text", "image", "url"];
    if (!SUPPORTED.includes(kind)) {
      return fail(422, "UNSUPPORTED", "That input type is not supported in this build.");
    }

    if (kind === "url") {
      const url = (payload.url ?? payload.text ?? "").trim();
      if (!url) return fail(400, "EMPTY_INPUT", "Add a website address to analyze.");
      const page = await fetchPageText(url);
      const report = await analyze({ kind, text: page.text, url: page.url, lang, simple });
      return NextResponse.json({ report });
    }

    const text = sanitize(payload.text ?? "");
    if (!text) return fail(400, "EMPTY_INPUT", "Add something to analyze first.");
    if (text.length > MAX_TEXT) return fail(413, "TOO_LARGE", "That content is too long for one analysis.");

    const report = await analyze({
      kind,
      text,
      lang,
      simple,
      ocrConfidence:
        typeof payload.ocrConfidence === "number" && payload.ocrConfidence >= 0
          ? Math.min(100, Math.round(payload.ocrConfidence))
          : undefined,
    });
    return NextResponse.json({ report });
  } catch (err) {
    if (err instanceof FetchError) {
      if (err.code === "INVALID_URL") return fail(400, "INVALID_URL", "That does not look like a complete website address.");
      if (err.code === "TOO_LARGE") return fail(413, "TOO_LARGE", "That page is too large to analyze.");
      return fail(422, "UNSUPPORTED", "That address could not be read.");
    }
    console.error("analyze failed", err);
    return fail(500, "INTERNAL", "Something went wrong while analyzing.");
  }
}
