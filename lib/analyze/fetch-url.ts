function isPrivate(rawHostname: string): boolean {
  // URL.hostname keeps brackets around IPv6 literals.
  const hostname = rawHostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "") return true;
  if (hostname === "::1" || hostname === "::") return true;
  if (!hostname.includes(".")) return true; // single-label hosts resolve to local search domains
  if (hostname.endsWith(".local") || hostname.endsWith(".localhost") || hostname.endsWith(".internal")) return true;

  // IPv4, including IPv4-mapped IPv6 forms (::ffff:127.0.0.1).
  const candidate = hostname.startsWith("::ffff:") ? hostname.slice(7) : hostname;
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(candidate);
  if (!v4) return false;
  const first = Number(v4[1]);
  const second = Number(v4[2]);
  if (first === 0 || first === 10 || first === 127) return true;
  if (first === 192 && second === 168) return true;
  if (first === 169 && second === 254) return true; // link-local / cloud metadata
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 100 && second >= 64 && second <= 127) return true; // carrier-grade NAT
  return false;
}

function assertPublic(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new FetchError("INVALID_URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new FetchError("INVALID_URL");
  if (isPrivate(parsed.hostname)) throw new FetchError("INVALID_URL");
  return parsed;
}

export class FetchError extends Error {
  constructor(public code: "INVALID_URL" | "TOO_LARGE" | "UNSUPPORTED") {
    super(code);
  }
}

function htmlToText(html: string): string {
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, " ");
  const withoutBlocks = withoutComments
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const withSpaces = withoutBlocks.replace(/<\/(p|div|li|h[1-6]|tr|br)>/gi, "\n").replace(/<[^>]+>/g, " ");
  const decoded = withSpaces
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"');
  return decoded.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").replace(/\n{2,}/g, "\n").trim();
}

/** Fetches a public web page and reduces it to readable text. */
export async function fetchPageText(rawUrl: string): Promise<{ url: string; text: string }> {
  const start = assertPublic(rawUrl);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    // Follow redirects manually so every hop is re-checked against the private-host guard.
    let current = start;
    let res: Response | null = null;
    for (let hop = 0; hop <= 3; hop++) {
      const attempt = await fetch(current.toString(), {
        signal: controller.signal,
        redirect: "manual",
        headers: { "user-agent": "RakshakBot/1.0 (investor safety research)" },
      });
      if (attempt.status >= 300 && attempt.status < 400) {
        const location = attempt.headers.get("location");
        await attempt.body?.cancel().catch(() => undefined);
        if (!location) throw new FetchError("UNSUPPORTED");
        current = assertPublic(new URL(location, current).toString());
        continue;
      }
      res = attempt;
      break;
    }
    if (!res) throw new FetchError("UNSUPPORTED");

    if (!res.ok) throw new FetchError("UNSUPPORTED");
    const type = res.headers.get("content-type") ?? "";
    if (type && !/text\/html|text\/plain|application\/xhtml/.test(type)) throw new FetchError("UNSUPPORTED");

    const length = Number(res.headers.get("content-length") ?? 0);
    if (length > 2_000_000) throw new FetchError("TOO_LARGE");

    const html = await res.text();
    if (html.length > 2_000_000) throw new FetchError("TOO_LARGE");

    const text = htmlToText(html).slice(0, 12000);
    if (!text) throw new FetchError("UNSUPPORTED");
    return { url: current.toString(), text };
  } catch (err) {
    if (err instanceof FetchError) throw err;
    throw new FetchError("UNSUPPORTED");
  } finally {
    clearTimeout(timer);
  }
}
