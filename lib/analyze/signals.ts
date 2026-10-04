import type { ContentContext, Entity, Severity, Claim, Signal, SignalId, NormalizedContent } from "@/types";
import { findMatches, quoteAround, REGULATOR_TOKENS, foldLeet } from "./normalize";

interface SignalPattern {
  id: SignalId;
  severity: Severity;
  weight: number;
  confidence: number;
  patterns: RegExp[];
}

/** Weight is this signal's contribution to the risk factor it belongs to. */
const SEVERITY_WEIGHT: Record<Severity, number> = { critical: 28, high: 18, medium: 10, low: 4 };

const TEXT_SIGNALS: SignalPattern[] = [
  {
    id: "guaranteed_return",
    severity: "critical",
    weight: SEVERITY_WEIGHT.critical,
    confidence: 0.95,
    patterns: [
      /\bguarantee(?:d|s|ing)?[\s-]+(?:\d+(?:\.\d+)?%?\s*)?(?:monthly|daily|weekly|yearly|annual(?:ly)?|fixed)?\s*(?:returns?|profit|income|earnings?|payouts?|interest)\b/gi,
      /\breturns?\s+guaranteed\b/gi,
      /गारंटीड?\s*(?:रिटर्न|मुनाफा|आय|कमाई)|गारंटीड?\s*(?:[\d.,%]+\s*)?(?:मासिक|हर महीने|प्रति मासिक|दर महीने)?\s*(?:रिटर्न|मुनाफा|आय|कमाई)|निश्चित\s*(?:रिटर्न|मुनाफा|आय)|रिटर्न\s*की\s*गारंटी|पक्का\s*(?:मुनाफा|रिटर्न)/g,
      /(?:પાકી\s*ખાતરી|ખાતરીપૂર્વક)[^.!?]{0,30}?(?:વળતર|નફો)|નિશ્ચિત\s*(?:વળતર|નફો)/g,
    ],
  },
  {
    id: "unrealistic_return",
    severity: "critical",
    weight: SEVERITY_WEIGHT.critical,
    confidence: 0.93,
    patterns: [
      /\b\d+(?:\.\d+)?%\s*(?:per\s*)?(?:month|monthly|week|weekly|day|daily)\s*(?:returns?|profit|income|guaranteed)?/gi,
      /(?:हर|प्रति)\s*(?:महीने|हफ्ते|दिन)\s*\d+(?:\.\d+)?%\s*(?:रिटर्न|मुनाफा|तक)?/g,
      /\d+(?:\.\d+)?%\s*(?:मासिक|हर महीने|प्रति मासिक)\s*(?:रिटर्न|मुनाफा|आय|तक)?/g,
      /દર\s*(?:મહિને|સપ્તાહે|દિવસે)\s*\d+(?:\.\d+)?%\s*(?:વળતર|નફો)?/g,
      /\d+(?:\.\d+)?%\s*(?:માસિક|દર મહિને)\s*(?:વળતર|નફો)?/g,
      /\b(?:\d+(?:\.\d+)?x|\d+(?:\.\d+)?\s*times)\s+(?:return|money|profit|in)\b/gi,
    ],
  },
  {
    id: "risk_free",
    severity: "high",
    weight: SEVERITY_WEIGHT.high,
    confidence: 0.93,
    patterns: [
      /\brisk[\s-]?free\b|\bno[\s-]+risk\b|\bzero[\s-]+risk\b|\bwithout\s+any\s+risk\b|\b100%\s*(?:safe|secure)\b/gi,
      /बिना\s*जोखिम|जोखिम\s*रहित|कोई\s*जोखिम\s*नहीं|शून्य\s*जोखिम|100%\s*सुरक्षित/g,
      /જોખમ\s*વિના|જોખમમુક્ત|કોઈ\s*જોખમ\s*નહીં|શૂન્ય\s*જોખમ|100%\s*સુરક્ષિત/g,
    ],
  },
  {
    id: "urgency",
    severity: "high",
    weight: SEVERITY_WEIGHT.high,
    confidence: 0.9,
    patterns: [
      /\b(?:act now|hurry up|last chance|limited time|offer ends?|expires? (?:today|tonight|soon)|don't miss|do not miss|right now|immediately|asap|before (?:it(?:'s| is) )?too late|within \d+\s*(?:hours|minutes)|today only|join today)\b/gi,
      /आज ही|तुरंत|अभी\s*(?:करें|जुड़ें|भरें)|जल्दी\s*(?:करें|भरें)|आखिरी\s*मौका|समय\s*समाप्त|देर\s*न\s*करें/g,
      /આજે જ|તરત જ|હમણાં જ|જલ્દી કરો|છેલ્લી તક|સમય પૂરો|વિલંબ ન કરો/g,
    ],
  },
  {
    id: "scarcity",
    severity: "medium",
    weight: SEVERITY_WEIGHT.medium,
    confidence: 0.86,
    patterns: [
      /\b(?:only|just)\s+\d+\s+(?:seats|slots|positions|spots|openings|members|people|entries)\b|\b\d+\s+(?:seats|slots|spots|positions)\s+(?:left|remaining|available)\b|\blimited\s+\d+\s+(?:seats|slots|positions)\b|\bfirst\s+\d+\s+(?:people|members|users|clients)\b/gi,
      /सिर्फ़\s*\d+\s*(?:सीट|स्लॉट|जगह)|सिर्फ\s*\d+\s*(?:सीट|स्लॉट|जगह)|केवल\s*\d+\s*(?:सीट|जगह)|\d+\s*(?:सीट|जगह)\s*बाकी/g,
      /ફક્ત\s*\d+\s*(?:સીટ|જગ્યા|સ્લોટ)|માત્ર\s*\d+\s*(?:સીટ|જગ્યા)|\d+\s*(?:સીટ|જગ્યા)\s*બાકી/g,
    ],
  },
  {
    id: "upfront_payment",
    severity: "critical",
    weight: SEVERITY_WEIGHT.critical,
    confidence: 0.92,
    patterns: [
      /\b(?:registration|joining|activation|subscription|membership|processing|enrollment|sign[\s-]?up|booking|token)\s+(?:fee|charges?|amount|money)\b/gi,
      /\b(?:pay|send|transfer|deposit)\s+(?:rs\.?|₹|inr)\s*[\d,]+/gi,
      /\bpay\s+(?:an?\s+)?(?:amount|fee|money)\b/gi,
      /(?:भुगतान|पेमेंट|फ़ीस|शुल्क)\s*(?:करें|भरें|भेजें)|₹\s*[\d,]+\s*(?:भरें|भेजें|जमा करें)|पंजीकरण\s*शुल्क/g,
      /(?:ચુકવણી|ફી|શુલ્ક)\s*(?:કરો|ભરો|મોકલો)|₹\s*[\d,]+\s*(?:ભરો|મોકલો|જમા કરો)|નોંધણી ફી/g,
    ],
  },
  {
    id: "otp_request",
    severity: "critical",
    weight: SEVERITY_WEIGHT.critical,
    confidence: 0.96,
    patterns: [
      /\b(?:share|send|enter|tell|provide|give)\b[^.!?]{0,40}\b(?:otp|one[\s-]?time[\s-]?password|verification code|auth(?:entication)? code)\b/gi,
      /\b(?:otp|one[\s-]?time[\s-]?password|verification code)\b[^.!?]{0,30}\b(?:share|send|enter|tell|reply|needed|required)\b/gi,
      /(?:ओ\.?टी\.?पी|ओटीपी|वन टाइम पासवर्ड)\s*(?:भेजें|बताएं|शेयर|साझा|दें|चाहिए)/g,
      /ઓટીપી\s*(?:મોકલો|જણાવો|શેર|આપો|જોઈએ)|વન ટાઈમ પાસવર્ડ/g,
    ],
  },
  {
    id: "credential_request",
    severity: "critical",
    weight: SEVERITY_WEIGHT.critical,
    confidence: 0.95,
    patterns: [
      /\b(?:share|send|enter|tell|provide|give|need)\b[^.!?]{0,40}\b(?:password|login id|user id|atm pin|cvv|card number|net banking credentials|upi pin)\b/gi,
      /\b(?:password|cvv|atm pin|upi pin|card number|net banking credentials)\b[^.!?]{0,30}\b(?:share|send|enter|reply|needed|required|bao)\b/gi,
      /(?:पासवर्ड|सीवीवी|एटीएम पिन|कार्ड नंबर|यूपीआई पिन)\s*(?:भेजें|बताएं|शेयर|दें|चाहिए)/g,
      /(?:પાસવર્ડ|સીવીવી|એટીએમ પિન|કાર્ડ નંબર|યુપીઆઈ પિન)\s*(?:મોકલો|જણાવો|આપો|જોઈએ)/g,
    ],
  },
  {
    id: "apk_request",
    severity: "critical",
    weight: SEVERITY_WEIGHT.critical,
    confidence: 0.94,
    patterns: [
      /\b[\w-]+\.apk\b/gi,
      /\b(?:install|download)\b[^.!?]{0,40}\b(?:app|application|apk|software|file)\b/gi,
      /\b(?:screen\s*share|teamviewer|anydesk|ultrasurf|rat\s*app)\b/gi,
      /(?:इंस्टॉल|डाउनलोड|एपीके)\s*(?:करें|कीजिए|करो)|स्क्रीन\s*शेयर/g,
      /ઇન્સ્ટોલ|ડાઉનલોડ|એપીકે|સ્ક્રીન શેર/g,
    ],
  },
  {
    id: "pressure_tactics",
    severity: "high",
    weight: SEVERITY_WEIGHT.high,
    confidence: 0.88,
    patterns: [
      /\b(?:don't|do not|never)\s+(?:tell|share|inform|mention)\b[^.!?]{0,30}\b(?:anyone|anybody|others|family|friends|anyone)\b/gi,
      /\bkeep\s+(?:this\s+)?(?:secret|confidential)\b|\bbetween\s+(?:us|you\s+and\s+me)\b|\bfor\s+(?:your|our)\s+safety\b[^.!?]{0,40}\b(?:don't|do not)\b/gi,
      /किसी\s*को\s*(?:मत|नहीं)\s*(?:बताएं|बताओ)|गुप्त\s*रखें|यह\s*बात\s*किसी\s*को\s*नहीं/g,
      /કોઈને\s*(?:ન\s*)?(?:કહેતા|જણાવતા|કહેશો નહીં)|ગુપ્ત\s*રાખો|આ વાત\s*કોઈને\s*નહીં/g,
    ],
  },
  {
    id: "referral_pressure",
    severity: "high",
    weight: SEVERITY_WEIGHT.high,
    confidence: 0.87,
    patterns: [
      /\b(?:refer|referral)s?\b[^.!?]{0,40}\b(?:friend|family|member|people|others)\b/gi,
      /\b(?:bring|add)\s+(?:in\s+)?(?:friends|people|members|family)\b|\bper\s+referral\b|\bjoin\s+and\s+earn\b|\bteam\s+(?:building|bonus)\b|\bdownline\b|\blevel\s*\d+\s*income\b/gi,
      /रेफरल\s*(?:बोनस|इनकम|पर)|दोस्तों\s*को\s*लाओ|टीम\s*बनाओ|नेटवर्क\s*मार्केटिंग/g,
      /રેફરલ\s*(?:બોનસ|ઇન્કમ|પર)|મિત્રોને\s*લાવો|ટીમ\s*બનાવો|નેટવર્ક માર્કેટિંગ/g,
    ],
  },
  {
    id: "secret_exclusive",
    severity: "medium",
    weight: SEVERITY_WEIGHT.medium,
    confidence: 0.8,
    patterns: [
      /\bexclusive\s+(?:offer|deal|opportunity|access|invitation|scheme)\b|\bonly\s+for\s+(?:selected|a\s+few|invited|our\s+vip)\b|\bprivate\s+group\b|\bsecret\s+(?:offer|deal|scheme|tip)\b/gi,
      /विशेष\s*(?:ऑफर|अवसर|स्कीम|सौदा)|खास\s*(?:मौका|ऑफर|स्कीम)|चुनिंदा\s*लोगों\s*के\s*लिए|गोपनीय\s*(?:सौदा|योजना)/g,
      /વિશેષ\s*(?:ઓફર|તક|સ્કીમ|સોદો)|ખાસ\s*(?:તક|ઓફર|સ્કીમ)|પસંદગીના\s*લોકો\s*માટે|ગુપ્ત\s*(?:સોદો|યોજના)/g,
    ],
  },
  {
    id: "emotional_manipulation",
    severity: "medium",
    weight: SEVERITY_WEIGHT.medium,
    confidence: 0.78,
    patterns: [
      /\bsecure\s+(?:your|the)\s+(?:future|family(?:'s)?\s+future|children(?:'s)?)\b|\b(?:don't|do not)\s+miss\s+(?:this\s+)?(?:chance|opportunity|out)\s+(?:again|forever)?\b|\byour\s+(?:family|children)'?s?\s+future\b/gi,
      /अपने\s*परिवार\s*का\s*भविष्य|बच्चों\s*का\s*भविष्य|मौका\s*हाथ\s*से\s*जाने\s*दें|अपनों\s*की\s*सुरक्षा/g,
      /તમારા\s*પરિવારનું\s*ભવિષ્ય|બાળકોનું\s*ભવિષ્ય|તક\s*હાથમાંથી\s*જવા\s*દો|તમારા\s*સ્વજનોની\s*સુરક્ષા/g,
    ],
  },
  {
    id: "pump_and_dump",
    severity: "critical",
    weight: SEVERITY_WEIGHT.critical,
    confidence: 0.93,
    patterns: [
      /\b(?:upper\s*circuit|jackpot\s*(?:call|share|stock)|sure-shot\s*tip|target\s*[:=]\s*\d+%\s*in\s*\d+\s*(?:days|hours)|buy\s+before\s+9:15\s*am|dabba\s*trading|fake\s*institutional\s*account)\b/gi,
      /(?:अपर\s*सर्किट|जैकपॉट\s*शेयर|श्योर\s*शॉट\s*टिप|डब्बा\s*ट्रेडिंग|संस्थागत\s*खाता)/g,
      /(?:અપર\s*સર્કિટ|જેકપોટ\s*શેર|ખાતરીપૂર્વક\s*ટીપ|ડબ્બા\s*ટ્રેડિંગ)/g,
    ],
  },
  {
    id: "coercive_arrest",
    severity: "critical",
    weight: SEVERITY_WEIGHT.critical,
    confidence: 0.96,
    patterns: [
      /\b(?:digital\s*arrest|cbi\s*(?:warrant|arrest|order)|trai\s*(?:sim\s*block|disconnection)|supreme\s*court\s*summons|narcotics\s*control\s*bureau|rbi\s*verification\s*account|stay\s*on\s*skype|stay\s*on\s*video\s*call)\b/gi,
      /(?:डिजिटल\s*अरेस्ट|सीबीआई\s*वारंट|सुप्रीम\s*कोर्ट\s*समन|आरबीआई\s*वेरिफिकेशन\s*अकाउंट|वीडियो\s*कॉल\s*पर\s*रहें)/g,
      /(?:ડિજિટલ\s*ધરપકડ|સીબીઆઈ\s*વોરંટ|વીડિયો\s*કૉલ\s*પર\s*રહો)/g,
    ],
  },
];

/** Signals that need the extracted entities, claims and verification results. */
export interface DeriveContext {
  text: string;
  context: ContentContext;
  entities: Entity[];
  claims: Claim[];
  normalized: NormalizedContent;
  suspiciousDomains: { domain: string; reason: string }[];
  mismatchedDomains: { domain: string; reason: string }[];
}

function build(pattern: SignalPattern, text: string, matches: { match: string; index: number }[], context: ContentContext): Signal | null {
  if (!matches.length) return null;
  const attenuated = context === "educational" || context === "news" || context === "complaint";
  const base = matches.length > 1 ? Math.min(0.97, pattern.confidence + 0.03) : pattern.confidence;
  const confidence = Math.round((attenuated ? base * 0.55 : base) * 100) / 100;
  const evidence = matches.slice(0, 3).map((m) => quoteAround(text, m.index, m.match.length));
  return { id: pattern.id, severity: pattern.severity, weight: pattern.weight, confidence, evidence };
}

export function detectTextSignals(text: string, context: ContentContext): Signal[] {
  const out: Signal[] = [];
  const leetText = foldLeet(text.toLowerCase());
  for (const pattern of TEXT_SIGNALS) {
    const matches: { match: string; index: number }[] = [];
    for (const re of pattern.patterns) {
      matches.push(...findMatches(text, re));
      if (matches.length < 6) {
        // Also match against leet-folded representation
        const leetMatches = findMatches(leetText, re);
        for (const lm of leetMatches) {
          if (!matches.some((m) => Math.abs(m.index - lm.index) <= 2)) {
            matches.push({ match: text.slice(lm.index, lm.index + lm.match.length) || lm.match, index: lm.index });
          }
        }
      }
      if (matches.length >= 6) break;
    }
    if (!matches.length) continue;
    matches.sort((a, b) => a.index - b.index);
    const signal = build(pattern, text, matches, context);
    if (signal) out.push(signal);
  }
  return out;
}

export function deriveSignals(ctx: DeriveContext): Signal[] {
  const out: Signal[] = [];
  const { entities, claims, normalized, context } = ctx;

  const namedEntity = entities.some((e) => e.type === "company" || e.type === "person");
  const hasRegulator = entities.some((e) => e.type === "regulator");

  const regulatorUsedAsEndorsement = ((): boolean => {
    const lower = ctx.text.toLowerCase();
    return REGULATOR_TOKENS.some((token) => {
      const re = new RegExp(`\\b${token}\\b`, "gi");
      let m: RegExpExecArray | null;
      while ((m = re.exec(lower)) !== null) {
        const window = lower.slice(Math.max(0, m.index - 70), Math.min(lower.length, m.index + 90));
        if (/(approved|registered|certified|licensed|authoris|authoriz|recognis|recogniz|मंजूर|अनुमोदित|पंजीकृत|મંજૂર|નોંધાયેલ|માન્ય)/.test(window)) {
          if (/(check|verify|visit|register|list|portal|website|search|तपास|जाँच|जांच|તપાસ|જાંચ)/.test(window)) continue;
          return true;
        }
      }
      return false;
    });
  })();

  if (regulatorUsedAsEndorsement) {
    out.push({
      id: "regulatory_impersonation",
      severity: "critical",
      weight: SEVERITY_WEIGHT.critical,
      confidence: hasRegulator ? 0.94 : 0.86,
      evidence: ctx.text
        ? findMatches(ctx.text, new RegExp(`\\b(?:${REGULATOR_TOKENS.join("|")})\\b`, "gi"))
            .slice(0, 3)
            .map((m) => quoteAround(ctx.text, m.index, m.match.length))
        : [],
    });
  }

  const governmentClaim =
    /(?:govt|government)[\s-]*(?:approved|backed|supported|scheme|authorized|authorised)|भारत सरकार|सरकार द्वारा मंजूर|सरकारी योजना|રાજ્ય સરકાર|ભારત સરકાર|સરકાર દ્વારા મંજૂર/i;
  const govWindowHit = governmentClaim.test(ctx.text);
  if (govWindowHit) {
    const m = governmentClaim.exec(ctx.text);
    out.push({
      id: "government_impersonation",
      severity: "critical",
      weight: SEVERITY_WEIGHT.critical,
      confidence: 0.9,
      evidence: m ? [quoteAround(ctx.text, m.index, m[0].length)] : [],
    });
    governmentClaim.lastIndex = 0;
  }

  if (context === "solicitation" && !namedEntity && (normalized.phones.length || normalized.domains.length || entities.some((e) => e.type === "handle"))) {
    out.push({
      id: "identity_ambiguity",
      severity: "medium",
      weight: SEVERITY_WEIGHT.medium,
      confidence: 0.76,
      evidence: normalized.phones.slice(0, 1).map((p) => p),
    });
  }

  for (const d of ctx.suspiciousDomains.slice(0, 2)) {
    out.push({
      id: "suspicious_domain",
      severity: "high",
      weight: SEVERITY_WEIGHT.high,
      confidence: 0.85,
      evidence: [d.domain],
    });
    break;
  }

  for (const d of ctx.mismatchedDomains.slice(0, 2)) {
    out.push({
      id: "mismatched_domain",
      severity: "high",
      weight: SEVERITY_WEIGHT.high,
      confidence: 0.88,
      evidence: [d.domain],
    });
    break;
  }

  // payment_link signal
  const paymentEntities = entities.filter((e) => e.type === "payment");
  if (paymentEntities.length > 0 || /upi:\/\/|phonepe:\/\/|gpay:\/\//i.test(ctx.text)) {
    out.push({
      id: "payment_link",
      severity: "high",
      weight: SEVERITY_WEIGHT.high,
      confidence: 0.92,
      evidence: paymentEntities.length ? paymentEntities.slice(0, 3).map((e) => e.quote) : ["Direct payment intent link"],
    });
  }

  const hasSocialHandle = entities.some((e) => e.type === "handle") || /t\.me\/|wa\.me\/|chat\.whatsapp\.com/i.test(ctx.text);
  const mentionsSocial = /\b(?:telegram|whatsapp|whats app|instagram|facebook|snapchat|imo)\b/i.test(ctx.text) || hasSocialHandle;
  const nonSocialDomains = normalized.domains.filter((d) => !/^(?:t\.me|wa\.me|whatsapp\.com|telegram\.org|instagram\.com|facebook\.com)$/i.test(d));
  if (context === "solicitation" && !nonSocialDomains.length && !normalized.emails.length && mentionsSocial) {
    out.push({
      id: "social_only",
      severity: "low",
      weight: SEVERITY_WEIGHT.low,
      confidence: 0.75,
      evidence: (ctx.text.match(/(?:telegram|whatsapp|whats app|instagram|facebook|t\.me\/[a-zA-Z0-9_]+|wa\.me\/\d+|@[a-zA-Z0-9_]+)/gi) ?? []).slice(0, 2),
    });
  }

  // Mule VPA detection (personal VPA handles soliciting commercial investments/fees)
  const muleVpas = entities
    .filter((e) => e.type === "payment" || e.quote.includes("@"))
    .map((e) => e.quote)
    .filter((v) => /@(?:ok|ybl|ibl|paytm|apl|axl|upi|postbank)/i.test(v));
  if (context === "solicitation" && muleVpas.length > 0) {
    out.push({
      id: "mule_vpa",
      severity: "high",
      weight: SEVERITY_WEIGHT.high,
      confidence: 0.89,
      evidence: muleVpas.slice(0, 2),
    });
  }

  // Intermediary mismatch / unregistered broker signal
  const hasRegistration = entities.some((e) => e.type === "registration_no");
  if (context === "solicitation" && (hasRegulator || regulatorUsedAsEndorsement) && !hasRegistration) {
    out.push({
      id: "suspicious_intermediary",
      severity: "critical",
      weight: SEVERITY_WEIGHT.critical,
      confidence: 0.91,
      evidence: [quoteAround(ctx.text, 0, Math.min(ctx.text.length, 60))],
    });
  }

  void hasRegulator;
  return out;
}

export function mergeSignals(a: Signal[], b: Signal[]): Signal[] {
  const map = new Map<SignalId, Signal>();
  for (const s of [...a, ...b]) {
    const existing = map.get(s.id);
    if (!existing) {
      map.set(s.id, s);
      continue;
    }
    map.set(s.id, {
      ...existing,
      confidence: Math.max(existing.confidence, s.confidence),
      evidence: Array.from(new Set([...existing.evidence, ...s.evidence])).slice(0, 3),
    });
  }
  return Array.from(map.values()).sort((x, y) => y.weight - x.weight || y.confidence - x.confidence);
}
