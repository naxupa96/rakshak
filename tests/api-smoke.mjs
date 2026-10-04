/**
 * API smoke test for POST /api/analyze.
 * Start the dev server first:  npm run dev  (default port 3000) or
 *   npx next dev -p 3111   and set RAKSHAK_BASE=http://localhost:3111
 * Run: npm run test:api
 */
const BASE = process.env.RAKSHAK_BASE ?? "http://localhost:3111";

let fail = 0;
const log = (ok, msg) => {
  console.log((ok ? "PASS " : "FAIL ") + msg);
  if (!ok) fail++;
};

async function post(body) {
  const res = await fetch(BASE + "/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-json error body */
  }
  return { status: res.status, data };
}

try {
  await fetch(BASE + "/api/analyze", { method: "OPTIONS" });
} catch {
  console.error(`Cannot reach ${BASE}. Start the dev server and/or set RAKSHAK_BASE.`);
  process.exit(1);
}

// --- educational / low-risk inputs stay calm -------------------------------
const eduCases = [
  [
    "hi-edu",
    "म्यूचुअल फंड बाजार जोखिम के अधीन हैं। किसी भी गारंटीड रिटर्न के वादे को सच मानने से पहले सेबी की वेबसाइट पर जाँच करें। यह शैक्षिक जानकारी है, निवेश सलाह नहीं।",
  ],
  [
    "gu-edu",
    "બજાર જોખમી છે. કોઈ પણ પાકી ખાતરીવાળા વળતરના વાદા પર વિશ્વાસ ન કરો. સેબીની વેબસાઇટ પર તપાસ કરો. આ શૈક્ષણિક માહિતી છે.",
  ],
];
for (const [name, text] of eduCases) {
  const { status, data } = await post({ kind: "text", text });
  const r = data?.report;
  log(status === 200 && r, `${name}: HTTP ${status}`);
  if (r) {
    log(r.risk.score <= 24 && r.risk.level === "LOW", `${name}: risk ${r.risk.score} ${r.risk.level} (expect LOW)`);
    log(r.context === "educational", `${name}: context ${r.context}`);
    log(r.usedLlm === false, `${name}: report.usedLlm ${r.usedLlm} (expect false without keys)`);
  }
}

// --- scam inputs escalate --------------------------------------------------
const scamCases = [
  [
    "hi-scam",
    "नमस्ते, हमारी सरकार द्वारा मंजूर स्कीम में गारंटीड 10% मासिक रिटर्न मिलेगा, जोखिम रहित। सिर्फ 8 सीटें बाकी। आज ही ₹2,500 पंजीकरण फ़ीस भेजें 9811112222 पर। किसी को मत बताएं।",
    65,
  ],
  [
    "otp",
    "Dear customer, your bank account will be blocked. Share the OTP you just received to keep it active. Pay Rs 999 now.",
    45,
  ],
];
for (const [name, text, min] of scamCases) {
  const { status, data } = await post({ kind: "text", text });
  const r = data?.report;
  log(status === 200 && r, `${name}: HTTP ${status}`);
  if (r) {
    log(r.risk.score >= min, `${name}: risk ${r.risk.score} >= ${min}`);
    log(r.signals.length >= 2, `${name}: ${r.signals.length} signals`);
    log(r.evidence.length >= 3, `${name}: ${r.evidence.length} evidence lines`);
  }
}

// --- ambiguity is handled honestly ----------------------------------------
{
  const { status, data } = await post({ kind: "text", text: "Should I invest in this? My friend sent me this." });
  const r = data?.report;
  log(status === 200 && r, `ambiguous: HTTP ${status}`);
  if (r) {
    log(r.insufficientEvidence === true, `ambiguous: insufficientEvidence ${r.insufficientEvidence}`);
    log(r.risk.score <= 35, `ambiguous: risk ${r.risk.score} capped`);
    log(
      r.claims.every((c) => c.verification !== "contradicted"),
      "ambiguous: no contradiction claimed without a claim",
    );
  }
}

// --- demo scenarios --------------------------------------------------------
for (const [demo, minLevel] of [
  ["fake_broker", 45],
  ["fake_sebi", 65],
  ["gujarati_scam", 65],
  ["educational", 0],
]) {
  const { status, data } = await post({ kind: "text", demo });
  const r = data?.report;
  log(status === 200 && r, `demo ${demo}: HTTP ${status}`);
  if (r) {
    const levels = { LOW: 0, MODERATE: 25, ELEVATED: 45, HIGH: 65, CRITICAL: 85 };
    log(r.risk.score >= minLevel, `demo ${demo}: risk ${r.risk.score} ${r.risk.level} (expect >= ${minLevel})`);
    log(r.evidence.length > 0 && r.actions.length > 0, `demo ${demo}: evidence + actions present`);
    log(typeof levels[r.risk.level] === "number", `demo ${demo}: level ${r.risk.level}`);
  }
}

// --- validation ------------------------------------------------------------
{
  const empty = await post({ kind: "text", text: "   " });
  log(empty.status === 400, `empty input -> ${empty.status} (expect 400)`);
  const badUrl = await post({ kind: "url", url: "not a url" });
  log(badUrl.status === 400, `bad url -> ${badUrl.status} (expect 400)`);
  const unsupported = await post({ kind: "voice" });
  log(unsupported.status === 422, `unsupported kind -> ${unsupported.status} (expect 422)`);
}

console.log(fail ? `${fail} check(s) failed` : "all API checks passed");
process.exit(fail ? 1 : 0);
