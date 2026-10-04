import type { Claim, ClaimType } from "@/types";
import { findMatches, quoteAround } from "./normalize";

interface Detector {
  type: ClaimType;
  pattern: RegExp;
  confidence: number;
  /** When present, the claim only counts if this also matches nearby. */
  context?: RegExp;
}

const DETECTORS: Detector[] = [
  {
    type: "REGULATORY_APPROVAL",
    confidence: 0.94,
    pattern:
      /\b(?:sebi|rbi|nsdl|cdsl|nse|bse|irdai|pfrda|mca|amfi)\s*(?:-|\s)?\s*(?:approved|registered|certified|licensed|authorised|authorized|recognised|recognized|verified)\b|\b(?:approved|registered|certified)\s+by\s+(?:sebi|rbi|nsdl|nse|bse)\b|\bsebi\s+registration\s*(?:no|number)?\.?\s*[:#-]?\s*[A-Za-z0-9-]+|सेबी\s*(?:द्वारा\s*अनुमोदित|मंजूर|पंजीकृत|अप्रूव्ड)|रिज़र्व बैंक द्वारा मंजूર|સેબી\s*(?:દ્વારા\s*મંજૂર|મંજૂર|નોંધાયેલ|અપ્રૂવ્ડ)/i,
  },
  {
    type: "GOVERNMENT_AFFILIATION",
    confidence: 0.9,
    pattern:
      /\b(?:government|govt)\s*(?:-|\s)?\s*(?:approved|backed|supported|run|scheme|affiliated|authorized|authorised)\b|\bunder\s+(?:the\s+)?government\s+of\s+india\b|\bministry\s+of\s+[a-z\s]+\s*(?:approved|scheme)\b|भारत सरकार|सरकार द्वारा\s*(?:मंजूर|अनुमोदित|समर्थित)|सरकारी योजना|રાજ્ય સરકાર|ભારત સરકાર|સરકાર દ્વારા\s*(?:મંજૂર|માન્ય)/i,
  },
  {
    type: "GUARANTEED_RETURN",
    confidence: 0.95,
    pattern:
      /\bguarantee(?:d)?[\s-]+(?:\d+(?:\.\d+)?%?\s*)?(?:monthly|daily|weekly|yearly|annual(?:ly)?|fixed)?\s*(?:returns?|profit|income|earnings?|payouts?)\b|\bguarante(?:d|es)?\s+\d+(?:\.\d+)?%|\breturns?\s+guaranteed\b|गारंटीड?\s*(?:रिटर्न|मुनाफा|आय)|निश्चित\s*(?:रिटर्न|मुनाफा|आय)|रिटर्न\s*की\s*गारंटी|પાકી\s*ખાતરી|ખાતરીપૂર્વક\s*(?:વળતર|નફો)|નિશ્ચિત\s*(?:વળતર|નફો)/i,
  },
  {
    type: "FIXED_RETURN",
    confidence: 0.88,
    pattern:
      /\bfixed\s+(?:\d+(?:\.\d+)?%?\s*)?(?:returns?|income|profit|interest)\b|\b\d+(?:\.\d+)?%\s*fixed\s*(?:returns?|income)?\b|निश्चित आय|फिक्स्ड रिटर्न|નિશ્ચિત આવક|ફિક્સ્ડ વળતર/i,
  },
  {
    type: "RISK_FREE",
    confidence: 0.93,
    pattern:
      /\brisk[\s-]?free\b|\bno[\s-]+risk\b|\bzero[\s-]+risk\b|\bwithout\s+any\s+risk\b|\b100%\s*(?:safe|secure|guaranteed safe)\b|बिना जोखिम|जोखिम रहित|कोई जोखिम नहीं|शून्य जोखिम|જોખમ વિના|જોખમમુક્ત|કોઈ જોખમ નહીં|શૂન્ય જોખમ/i,
  },
  {
    type: "DOUBLE_MONEY",
    confidence: 0.92,
    pattern:
      /\bdouble\s+(?:your\s+)?money\b|\bmoney\s+doubles?\b|\b\d+x\s+your\s+(?:money|investment)\b|पैसे\s*दोगुने|धन\s*दोगुना|पैसा\s*(?:डबल|दुगना)|બમણા|પૈસા\s*ડબલ/i,
  },
  {
    type: "URGENT_OFFER",
    confidence: 0.85,
    pattern:
      /\b(?:today only|offer ends? (?:today|tonight|soon)|last chance|hurry up|act now|before it(?:'s| is) too late|expires? (?:today|tonight))\b|आज ही|जल्दी करें|आखिरी मौका|आज रात तक|આજે જ|જલ્દી કરો|છેલ્લી તક/i,
  },
  {
    type: "EXCLUSIVE_OPPORTUNITY",
    confidence: 0.82,
    pattern:
      /\bexclusive\s+(?:offer|deal|opportunity|access|invitation)\b|\bonly\s+for\s+(?:selected|a\s+few|invited)\b|\blimited\s+invitation\b|\bvip\s+(?:group|access|member)\b|विशेष अवसर|खास मौका|खास ऑफर|चुनिंदा लोगों के लिए|વિશેષ તક|ખાસ ઓફર|પસંદગીના લોકો માટે/i,
  },
  {
    type: "INSIDER_INFORMATION",
    confidence: 0.87,
    pattern:
      /\binsider\s+(?:tip|tips|information|deal|trade|call|calls)\b|\bguaranteed\s+(?:tip|tips|calls|signal|signals)\b|\binside\s+information\b|इनसाइडर टिप|हॉट टिप|गुप्त जानकारी|અંદરની જાણ|ઇનસાઇડર ટિપ|ગુપ્ત માહિતી/i,
  },
  {
    type: "PAST_PERFORMANCE",
    confidence: 0.8,
    pattern:
      /\bpast\s+performance\b|\b(?:our\s+)?investors?\s+(?:have\s+)?(?:earned|received|made)\s+\d|\blast\s+year\s+we\b|\bhistorical\s+returns?\b|पिछले साल|हमारे निवेशकों ने|गया रिटर्न|ગયા વર્ષે|અમારા રોકાણકારોએ/i,
  },
  {
    type: "ZERO_LOSS",
    confidence: 0.9,
    pattern: /\bzero\s+loss\b|\bnever\s+lose\b|\byou\s+cannot\s+lose\b|कभी नहीं डूबेंगे|नुकसान नहीं होगा|ખોટ નહીં થશે|ક્યારેય ડૂબશો નહીં/i,
  },
  {
    type: "PRESSURE_TO_INVEST",
    confidence: 0.8,
    pattern:
      /\b(?:invest|join|deposit|apply)\s+(?:now|today|immediately|tonight|fast)\b|\bdon't\s+(?:miss|wait|delay)\b|\bdo\s+not\s+(?:miss|wait|delay)\b|अभी निवेश करें|आज ही निवेश|अभी जुड़ें|હમણાં જ રોકાણ|હમણાં જ જોડાવો/i,
  },
  {
    type: "CELEBRITY_ENDORSEMENT",
    confidence: 0.84,
    pattern:
      /\b(?:ambani|adani|modi|kohli|tendulkar|bachchan|shah rukh|salman khan|akshay kumar|deepika|virat)\b/i,
    context: /\b(?:endorsed|recommended|supported|backed|promoted|investing|joined|launched|approved)\b/i,
  },
];

let claimCounter = 0;

function detectReturnFigures(text: string): { quote: string; index: number; pct: number; period: string }[] {
  const out: { quote: string; index: number; pct: number; period: string }[] = [];
  const patterns: { re: RegExp; period: string }[] = [
    { re: /(\d+(?:\.\d+)?)\s*%\s*(?:per\s*)?(?:month|monthly|महीने|महीना|મહિને)/gi, period: "monthly" },
    { re: /(?:per\s*)?(?:month|monthly|महीने|महीना|મહિને)\s*(?:returns?\s*)?[-:]?\s*(\d+(?:\.\d+)?)\s*%/gi, period: "monthly" },
    { re: /(\d+(?:\.\d+)?)\s*%\s*(?:per\s*)?(?:week|weekly|सप्ताह|हफ्ते|સપ્તાહ)/gi, period: "weekly" },
    { re: /(\d+(?:\.\d+)?)\s*%\s*(?:per\s*)?(?:day|daily|दिन|रोज़|दिन में|રોજ)/gi, period: "daily" },
    { re: /(\d+(?:\.\d+)?)\s*%\s*(?:per\s*)?(?:year|years|annual(?:ly)?|pa\b|साल|वर्ष|વર્ષ)/gi, period: "annual" },
  ];
  for (const { re, period } of patterns) {
    for (const m of findMatches(text, re)) {
      const num = m.match.match(/(\d+(?:\.\d+)?)/);
      if (!num) continue;
      out.push({ quote: m.match.trim(), index: m.index, pct: Number(num[1]), period });
    }
  }
  return out;
}

/** Thresholds above which a quoted return is implausible for real products. */
const UNREALISTIC: Record<string, number> = { monthly: 5, weekly: 2, daily: 0.5, annual: 25 };

export function extractClaims(text: string): Claim[] {
  const claims: Claim[] = [];
  const seen = new Set<ClaimType>();

  for (const detector of DETECTORS) {
    if (seen.has(detector.type)) continue;
    const matches = findMatches(text, detector.pattern);
    if (!matches.length) continue;
    if (detector.context) {
      const hit = matches.find((m) => {
        const window = text.slice(Math.max(0, m.index - 60), Math.min(text.length, m.index + m.match.length + 60));
        return detector.context!.test(window);
      });
      if (!hit) continue;
      claims.push(buildClaim(detector.type, text, hit.index, hit.match, detector.confidence));
      seen.add(detector.type);
      continue;
    }
    const first = matches[0];
    const confidence = matches.length > 1 ? Math.min(0.97, detector.confidence + 0.03) : detector.confidence;
    claims.push(buildClaim(detector.type, text, first.index, first.match, confidence));
    seen.add(detector.type);
  }

  for (const figure of detectReturnFigures(text)) {
    const threshold = UNREALISTIC[figure.period];
    if (threshold === undefined || figure.pct < threshold) continue;
    if (seen.has("UNREALISTIC_RETURN")) break;
    claims.push(buildClaim("UNREALISTIC_RETURN", text, figure.index, figure.quote, 0.93));
    seen.add("UNREALISTIC_RETURN");
    break;
  }

  return claims;
}

function buildClaim(type: ClaimType, text: string, index: number, match: string, confidence: number): Claim {
  claimCounter = (claimCounter + 1) % 1_000_000;
  return {
    id: `clm_${claimCounter}`,
    type,
    quote: quoteAround(text, index, match.length),
    statement: match.replace(/\s+/g, " ").trim().slice(0, 160),
    confidence: Math.round(confidence * 100) / 100,
    verification: "requires_verification",
  };
}
