import type { Entity, EntityType, NormalizedContent } from "@/types";
import { RE, findMatches, quoteAround } from "./normalize";

const REGULATORS: { pattern: RegExp; name: string }[] = [
  { pattern: /\bsecurities and exchange board of india\b/i, name: "SEBI" },
  { pattern: /\bsebi\b/i, name: "SEBI" },
  { pattern: /\breserve bank of india\b/i, name: "Reserve Bank of India" },
  { pattern: /\brbi\b/i, name: "RBI" },
  { pattern: /\bnsdl\b/i, name: "NSDL" },
  { pattern: /\bcdsl\b/i, name: "CDSL" },
  { pattern: /\bnational stock exchange\b|\bnse\b/i, name: "NSE" },
  { pattern: /\bbombay stock exchange\b|\bbse\b/i, name: "BSE" },
  { pattern: /\binsurance regulatory and development authority\b|\birdai\b/i, name: "IRDAI" },
  { pattern: /\bpension fund regulatory\b|\bpfrda\b/i, name: "PFRDA" },
  { pattern: /\bministry of corporate affairs\b|\bmca\b/i, name: "MCA" },
  { pattern: /\bassociation of mutual funds in india\b|\bamfi\b/i, name: "AMFI" },
  { pattern: /सेबी|प्रतिभूति और विनिमय बोर्ड/, name: "SEBI" },
  { pattern: /रिज़र्व बैंक|भारतीय रिज़र्व बैंक/, name: "Reserve Bank of India" },
  { pattern: /સેબી|પ્રતિભૂતિ અને વિનિમય બોર્ડ/, name: "SEBI" },
  { pattern: /રિઝર્વ બેંક/, name: "Reserve Bank of India" },
];

const ORG_SUFFIX_EN =
  /\b(?:Capital|Fund|Funds|Investment|Investments|Investors|Trading|Traders|Securities|Security|Group|Financial|Finserve|Finance|Adviser|Advisers|Advisor|Advisors|Advisory|Wealth|Consultant|Consultants|Broker|Brokers|Brokerage|Assets|Manager|Managers|Limited|Ltd|Pvt|Inc|Company|Corporation|Enterprises|Ventures|Solutions|Infra|Holding|Holdings)\b/;
const ORG_SUFFIX_HI = /(?:कैपिटल|फंड|फंड्स|निवेश|इन्वेस्टमेंट|सिक्योरिटीज़|समूह|वित्तीय|सलाहकार|ब्रोकर|लिमिटेड|कंपनी|कॉर्पोरेशन|एंटरप्राइज़)/;
const ORG_SUFFIX_GU = /(?:કેપિટલ|ફંડ|ફંડ્સ|રોકાણ|ઇન્વેસ્ટમેન્ટ|સિક્યોરિટીઝ|જૂથ|નાણાકીય|સલાહકાર|બ્રોકર|લિમિટેડ|કંપની|કોર્પોરેશન|એન્ટરપ્રાઇઝ)/;

const PERSON_PREFIX = /\b(?:mr|mrs|ms|miss|shri|smt|smt\.|dr|prof|ca|adv)\.?\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2}\b/;
const SCHEME_WORDS = /\b([A-Z][\w&']+(?:\s+[A-Z][\w&']+){0,5})\s+(?:scheme|plan|program|programme|yojana)\b/i;

const UPAY_IDS = /\b[\w.\-]{3,30}@(?:okaxis|okicici|okhdfcbank|oksbi|okkotak|ybl|paytm|ibl|axl|upi|nic|apl|federal|kmb)\b/gi;

let counter = 0;
function nextId(prefix: string): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}_${counter}`;
}

function push(
  out: Entity[],
  type: EntityType,
  value: string,
  confidence: number,
  quote: string,
  status: Entity["trustStatus"] = "unknown",
): void {
  const key = `${type}:${value.toLowerCase()}`;
  if (out.some((e) => `${e.type}:${e.value.toLowerCase()}` === key)) return;
  if (!value.trim()) return;
  out.push({ id: nextId("ent"), type, value: value.trim(), confidence: round(confidence), quote, trustStatus: status });
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function looksImpersonating(name: string): boolean {
  const lower = name.toLowerCase();
  const tokens = ["sebi", "rbi", "nsdl", "cdsl", "nse", "bse", "irdai", "pfrda", "govt", "government", "ministry"];
  return tokens.some((t) => new RegExp(`(^|\\s)${t}($|\\s|\\.)`).test(lower));
}

/** Leading words that produce false companies ("Mutual Funds", "Fixed Deposit"). */
const LEAD_BLOCKLIST = new Set(
  [
    "mutual", "debt", "equity", "liquid", "growth", "balanced", "direct", "regular", "nifty",
    "sensex", "index", "fixed", "recurring", "savings", "public", "private", "gold", "silver",
    "hybrid", "elss", "tax", "sip", "retirement", "pension", "children", "child", "infrastructure",
    "get", "the", "our", "your", "this", "that", "best", "top", "new", "free", "guaranteed",
    "monthly", "daily", "annual", "high", "low", "all", "more", "very", "super", "smart",
  ].map((w) => w.toLowerCase()),
);

function extractOrganizations(text: string, out: Entity[]): void {
  const suffixes = [ORG_SUFFIX_EN, ORG_SUFFIX_HI, ORG_SUFFIX_GU];
  const found: { name: string; index: number; length: number }[] = [];

  for (const suffix of suffixes) {
    const re = new RegExp(suffix.source, "gi");
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = re.exec(text)) !== null && guard++ < 80) {
      const matched = m[0];
      const first = matched[0];
      // A Latin suffix must be capitalised to belong to a proper noun.
      if (/[A-Za-z]/.test(first) && first !== first.toUpperCase()) {
        if (m.index === re.lastIndex) re.lastIndex += 1;
        continue;
      }

      const before = text.slice(Math.max(0, m.index - 70), m.index);
      const tokens = before.split(/[\s"'“”(;—–\-•*\n]+/).filter(Boolean);
      const taken: string[] = [];
      for (let i = tokens.length - 1; i >= 0 && taken.length < 5; i--) {
        const tok = tokens[i];
        const isScriptWord = /^[\u0900-\u097F\u0A80-\u0AFF]+$/.test(tok);
        const isNameWord = isScriptWord || /^[A-Z][A-Za-z&'.]*$/.test(tok) || /^[A-Z]{2,10}$/.test(tok);
        if (!isNameWord) break;
        if (LEAD_BLOCKLIST.has(tok.toLowerCase())) break;
        if (/^(And|For|With|Is|Are|Was|Has|Have|Can|Will|But|Or)$/i.test(tok)) break;
        taken.unshift(tok);
      }

      if (!taken.length) {
        if (m.index === re.lastIndex) re.lastIndex += 1;
        continue;
      }

      const name = `${taken.join(" ")} ${matched}`.replace(/\s+/g, " ").trim();
      if (name.length >= 5 && name.length <= 64) {
        found.push({ name, index: Math.max(0, m.index - 70 + before.lastIndexOf(taken[0])), length: name.length });
      }
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  found.sort((a, b) => b.name.length - a.name.length);
  const kept: typeof found = [];
  for (const candidate of found) {
    const lower = candidate.name.toLowerCase();
    if (kept.some((k) => k.name.toLowerCase().includes(lower))) continue;
    kept.push(candidate);
  }

  for (const k of kept) {
    push(
      out,
      "company",
      k.name,
      k.name.split(" ").length > 1 ? 0.91 : 0.72,
      quoteAround(text, k.index, k.length),
      looksImpersonating(k.name) ? "suspicious" : "unknown",
    );
  }
}

export function extractEntities(text: string, normalized: NormalizedContent): Entity[] {
  const out: Entity[] = [];

  for (const { match, index } of findMatches(text, RE.phone)) {
    push(out, "phone", match, 0.95, quoteAround(text, index, match.length));
  }
  for (const { match, index } of findMatches(text, RE.email)) {
    push(out, "email", match, 0.96, quoteAround(text, index, match.length));
  }
  for (const { match, index } of findMatches(text, RE.amount)) {
    push(out, "amount", match, 0.93, quoteAround(text, index, match.length));
  }
  for (const { match, index } of findMatches(text, RE.percent)) {
    push(out, "percent", match.trim(), 0.92, quoteAround(text, index, match.length));
  }
  for (const { match, index } of findMatches(text, UPAY_IDS)) {
    push(out, "payment", match, 0.94, quoteAround(text, index, match.length), "unknown");
  }
  for (const { match, index } of findMatches(text, RE.handle)) {
    push(out, "handle", match, 0.88, quoteAround(text, index, match.length));
  }

  for (const url of normalized.urls) {
    const index = text.indexOf(url);
    push(out, "url", url, 0.97, index >= 0 ? quoteAround(text, index, url.length) : url);
  }
  for (const domain of normalized.domains) {
    const index = text.toLowerCase().indexOf(domain.toLowerCase());
    push(out, "domain", domain, 0.94, index >= 0 ? quoteAround(text, index, domain.length) : domain);
  }

  for (const reg of REGULATORS) {
    const m = reg.pattern.exec(text);
    if (m) push(out, "regulator", reg.name, 0.97, quoteAround(text, m.index, m[0].length), "verified");
    reg.pattern.lastIndex = 0;
  }

  for (const { match, index } of findMatches(text, RE.registration)) {
    const value = match.toUpperCase().replace(/\s+/g, "");
    if (!/\d/.test(value)) continue;
    const plausible = /^IN[A-Z0-9]{5,11}$/.test(value) || /^ARN[-\s]?\d{4,9}$/.test(value);
    if (!plausible) continue;
    const strict = /^IN[A-Z]\d{6,7}$/.test(value) || /^ARN-?\d{6}$/.test(value);
    push(out, "registration_no", value, strict ? 0.9 : 0.6, quoteAround(text, index, match.length));
  }

  const scheme = SCHEME_WORDS.exec(text);
  if (scheme && scheme[1] && scheme[1].length > 3) {
    push(out, "scheme", `${scheme[1]} ${scheme[0].split(/\s+/).slice(-1)[0]}`.trim(), 0.8, quoteAround(text, scheme.index, scheme[0].length));
  }

  const person = PERSON_PREFIX.exec(text);
  if (person) push(out, "person", person[0], 0.74, quoteAround(text, person.index, person[0].length));

  extractOrganizations(text, out);

  return out.filter(
    (e) =>
      !(e.type === "company" && /^(mutual|debt|equity|liquid|म्यूचुअल|म्युचुअल|મ્યુચ્યુઅલ)(?:\s|$)/i.test(e.value)),
  );
}

/** True when a company name borrows a regulator's authority in its own name. */
export function isRegulatorImpersonatingName(entity: Entity): boolean {
  return entity.type === "company" && looksImpersonating(entity.value);
}
