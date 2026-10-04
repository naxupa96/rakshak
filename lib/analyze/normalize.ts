import type { ContentContext, NormalizedContent } from "@/types";

/**
 * Normalizes unicode (NFKC), strips zero-width / BOM characters,
 * converts full-width ASCII/digits, and collapses whitespace.
 */
export function cleanRawText(text: string): string {
  if (!text) return "";
  let s = text.normalize("NFKC");
  // Remove zero-width characters, BOM, and null characters
  s = s.replace(/[\u200B-\u200D\uFEFF\u0000\u2060\u180E]/g, "");
  // Replace full-width digits / characters with standard ASCII if any remained
  s = s.replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
  return s;
}

/**
 * Leet speak substitution and basic homoglyph folding.
 * Converts: 0->o, @->a, 4->a, 1->i, 5->s, 3->e, $|§->s, !->i
 */
export function foldLeet(text: string): string {
  return text
    .replace(/0/g, "o")
    .replace(/[@4]/g, "a")
    .replace(/[1!|]/g, "i")
    .replace(/[5$§]/g, "s")
    .replace(/3/g, "e")
    .replace(/8/g, "b");
}

/** Patterns shared by the normalizer, entity extractor and signal engine. */
export const RE = {
  url: /(?:https?:\/\/|www\.)[^\s,;)"'<>]+/gi,
  // Generic TLD extractor capturing standard TLDs, ccTLDs (.ly, .in, .cc, .co, .me) and gTLDs
  bareDomain: /\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s,;)"'<>]*)?/gi,
  email: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g,
  // Accommodates 0-prefix, spaced, hyphenated, or full-width Indian 10-digit mobile numbers
  phone: /(?:(?:\+?91|0)[\s-]?)?[6-9]\d{2,4}[\s-]?\d{3,5}\b/g,
  amount:
    /(?:₹|rs\.?|inr)\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:lakh|lac|crore|k\b|million|lakhsha|हज़ार|लाख|करोड़|હજાર|લાખ|કરોડ))?/gi,
  percent: /\d+(?:\.\d+)?\s?%/g,
  /** Registration-number shapes used by Indian market intermediaries. */
  registration: /\bIN[A-Z0-9]{3,10}\b|\bARN[-\s]?\d{4,9}\b/g,
  handle: /@[a-z0-9_.]{3,30}/gi,
  otpContext: /\b(?:otp|one[\s-]?time[\s-]?password|verification code|auth(?:entication)? code)\b/i,
  // Payment links (UPI intent schemes, phonepe, gpay, paytm)
  paymentLink: /\b(?:upi|phonepe|gpay|paytm):\/\/[^\s,;)"'<>]+|\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/gi,
} as const;

export const OFFICIAL_DOMAINS = [
  "sebi.gov.in",
  "nsdl.co.in",
  "nsdl.com",
  "cdsl.co.in",
  "indiavx.com",
  "nseindia.com",
  "bseindia.com",
  "rbi.org.in",
  "rbidocs.rbi.org.in",
  "mca.gov.in",
  "irdai.gov.in",
  "pfrda.org.in",
  "gain.amfiindia.com",
  "scores.sebi.gov.in",
  "smartodr.in",
  "cybercrime.gov.in",
  "indiapost.gov.in",
  "uidai.gov.in",
  "gov.in",
  "nic.in",
];

export const REGULATOR_TOKENS = ["sebi", "rbi", "nsdl", "cdsl", "nse", "bse", "irdai", "pfrda", "mca", "amfi"];

export function findMatches(text: string, regex: RegExp): { match: string; index: number }[] {
  const out: { match: string; index: number }[] = [];
  const flags = regex.flags.includes("g") ? regex.flags : regex.flags + "g";
  const re = new RegExp(regex.source, flags);
  for (const m of text.matchAll(re)) {
    if (m.index !== undefined) {
      out.push({ match: m[0], index: m.index });
    }
    if (out.length > 200) break;
  }
  return out;
}

/** Returns a short, human-readable quote centred on a match. */
export function quoteAround(text: string, index: number, length: number, radius = 46): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + length + radius);
  let slice = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) slice = "…" + slice;
  if (end < text.length) slice = slice + "…";
  return slice.slice(0, 180);
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.toLowerCase().replace(/[.,;]+$/, "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(v.trim());
  }
  return out;
}

export function extractDomains(text: string): string[] {
  const found: string[] = [];
  for (const { match } of findMatches(text, RE.url)) {
    try {
      const withProto = /^https?:\/\//i.test(match) ? match : `https://${match}`;
      found.push(new URL(withProto).hostname.replace(/^www\./, ""));
    } catch {
      found.push(match.replace(/^https?:\/\//i, "").replace(/^www\./, "").split("/")[0]);
    }
  }
  for (const { match } of findMatches(text, RE.bareDomain)) {
    const host = match.replace(/^www\./, "").replace(/[.,;]+$/, "").split("/")[0];
    if (host && host.includes(".") && !host.endsWith(".")) {
      // Validate last token looks like a real TLD (2+ alpha characters)
      const tld = host.split(".").pop();
      if (tld && /^[a-z]{2,24}$/i.test(tld)) {
        found.push(host);
      }
    }
  }
  return unique(found);
}

export function normalizeContent(raw: string): NormalizedContent {
  const cleaned = cleanRawText(raw);
  const text = normalizeWhitespace(cleaned);
  const urls = unique(findMatches(text, RE.url).map((m) => m.match.replace(/[.,;]+$/, "")));
  const domains = extractDomains(text);
  const phones = unique(
    findMatches(text, RE.phone).map((m) => m.match.replace(/[\s-]/g, ""))
  ).filter((p) => p.replace(/\D/g, "").length >= 10);
  const emails = unique(findMatches(text, RE.email).map((m) => m.match));
  const amounts = unique(findMatches(text, RE.amount).map((m) => m.match));
  const percents = unique(findMatches(text, RE.percent).map((m) => m.match));

  return {
    text,
    urls,
    domains,
    phones,
    emails,
    amounts,
    percents,
    hasHttp: /https?:\/\//i.test(text),
    charCount: text.length,
    wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
  };
}

/**
 * Classifies what kind of writing this is. Fraud patterns are only scored as
 * offers when the content is actually offering something — an article that
 * *describes* guaranteed-return scams must not score like a scam.
 */
export function detectContext(text: string): ContentContext {
  const t = text.toLowerCase();

  const complaint =
    /\b(fraud|scam|cheated|fraudulent|complaint|report(ed)?|fake app|duped|cheated me|lost money)\b|धोखा|धोखाधड़ी|छेतरपिंडी|फ़रेब|છેતરપિંડી|ઠગી/;
  const news =
    /\b(reported|report|according to|officials said|police said|news|press release|announcement|investors should note)\b|समाचार|खबर|पुलिस ने|સમાચાર|પોલીસ/;
  const educational =
    /\b(red flag|warning signs?|how to (spot|identify|avoid)|learn|explainer|what is|guide|awareness|beware|never (share|pay|invest|send)|do not (share|pay|invest|send)|investor alert|educational|scam signals?|protect yourself|remember)\b|चेतावनी|सावधान|कैसे पहचानें|सीखें|जागरूकता|कभी नहीं|जोखिम के अधीन|जाँच करें|जांच करें|ચેતવણી|સાવધાન|કેવી રીતે ઓળખવું|શીખો|જાગરૂકતા|ક્યારેય નહીં|જોખમ અધીન|તપાસ કરો/;
  const solicitation =
    /\b(?:invest(?:\s+(?:now|today|with\s+us))?|join(?:\s+(?:us|now))?|sign[-\s]?up|regist(?:er|ration)(?:\s+(?:now|today))?|deposit(?:s|ed)?|transfer(?:red|ring|s)?|pay(?:\s+(?:now|today))?|buy\s+now|limited\s+(?:offer|seats|slots|batch)|guarante(?:d|es)?|returns?|schemes?|opportunit(?:y|ies)|apply\s+now|enroll|activate\s+your|account\s+opening|registration\s+fee|processing\s+charge|expire[sd]?|share\s+the\s+otp|double\s+your\s+money)\b|निवेश करें|जुड़ें|पंजीकरण|भुगतान|गारंटी|रिटर्न|योजना|फ़ीस आज|નિવેશ કરો|જોડાવો|નોંધણી|ચુકવણી|ખાતરી|વળતર|યોજના/;

  if (solicitation.test(t)) return "solicitation";
  if (educational.test(t)) return "educational";
  if (news.test(t)) return "news";
  if (complaint.test(t)) return "complaint";
  return "neutral";
}

const CARD_LIKE = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
const LONG_DIGITS = /\b\d{12,19}\b/g;

/**
 * Privacy screen. Long card-like digit runs are masked before anything is
 * rendered or stored, so a pasted bank statement never leaves the session
 * readable.
 */
export function maskSensitive(text: string): string {
  return text.replace(CARD_LIKE, (m) => m.replace(/\d(?=\d)/g, "•")).replace(LONG_DIGITS, (m) => m.replace(/\d(?=\d)/g, "•"));
}

export function detectSensitive(text: string): { hasCardLike: boolean; hasOtpLike: boolean } {
  const card = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;
  const long = /\b\d{12,19}\b/;
  return {
    hasCardLike: card.test(text) || long.test(text),
    hasOtpLike: /\b(?:otp|one[\s-]?time[\s-]?password|verification code)\b.{0,40}\b\d{6}\b/i.test(text),
  };
}
