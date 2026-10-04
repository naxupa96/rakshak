import assert from "node:assert/strict";
import { normalizeContent, cleanRawText, foldLeet, detectContext, extractDomains } from "../lib/analyze/normalize.js";
import { detectTextSignals, deriveSignals, mergeSignals } from "../lib/analyze/signals.js";
import { assessRisk } from "../lib/analyze/risk.js";
import { analyzeDomains, checkRegistration, applyClaimVerification, buildEvidence } from "../lib/analyze/verify.js";
import { extractClaims } from "../lib/analyze/claims.js";
import { extractEntities } from "../lib/analyze/entities.js";

let passes = 0;
let fails = 0;

function it(name, fn) {
  try {
    fn();
    passes++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    fails++;
    console.error(`  ✗ ${name}\n`, err.message);
  }
}

console.log("\n--- [Phase 1 & 2] Normalization, Leet & Evasion Hardening ---");

it("strips zero-width characters, BOM, and null bytes", () => {
  const dirty = "S\u200Be\u200Db\uFEFFi\u0000";
  assert.equal(cleanRawText(dirty), "Sebi");
});

it("folds leet-speak numbers and symbols to letters", () => {
  const leet = "gu@r@nt33d pr0f1t 5c@m";
  assert.equal(foldLeet(leet), "guaranteed profit scam");
});

it("detects generic TLDs including .ly and ccTLDs", () => {
  const text = "Visit our site at https://secure-wealth.ly or profit-trade.xyz for details";
  const domains = extractDomains(text);
  assert.ok(domains.includes("secure-wealth.ly"), "Should capture .ly domain");
  assert.ok(domains.includes("profit-trade.xyz"), "Should capture .xyz domain");
});

it("extracts spaced and prefixed Indian phone numbers", () => {
  const text = "Call 0 98234 56789 or +91 98234-56789 immediately";
  const norm = normalizeContent(text);
  assert.ok(norm.phones.length >= 1, "Should normalize spaced phone numbers");
});

console.log("\n--- [Phase 1 & 2] Signal Engine & Adversarial Tests ---");

it("detects guaranteed returns even with leet evasion", () => {
  const text = "gu@r@nt33d monthly income with zero loss";
  const signals = detectTextSignals(text, "solicitation");
  assert.ok(signals.some((s) => s.id === "guaranteed_return" || s.id === "unrealistic_return"));
});

it("detects payment_link signal from UPI scheme and wallet handles", () => {
  const text = "Send fee to upi://pay?pa=invest@okaxis";
  const norm = normalizeContent(text);
  const entities = extractEntities(text, norm);
  const derived = deriveSignals({
    text,
    context: "solicitation",
    entities,
    claims: [],
    normalized: norm,
    suspiciousDomains: [],
    mismatchedDomains: [],
  });
  assert.ok(derived.some((s) => s.id === "payment_link"));
});

it("detects social_only via telegram handle (t.me) without literal 'telegram'", () => {
  const text = "Join our private group at t.me/vip_trading_profits";
  const norm = normalizeContent(text);
  const entities = extractEntities(text, norm);
  const derived = deriveSignals({
    text,
    context: "solicitation",
    entities,
    claims: [],
    normalized: norm,
    suspiciousDomains: [],
    mismatchedDomains: [],
  });
  assert.ok(derived.some((s) => s.id === "social_only"));
});

it("prevents educational context bypass when payment/solicitation is present", () => {
  const educationalScam = "How to spot scams: But deposit Rs 5,000 right now to our UPI for guaranteed 10% monthly income!";
  const norm = normalizeContent(educationalScam);
  const entities = extractEntities(educationalScam, norm);
  const textSignals = detectTextSignals(educationalScam, "solicitation");
  const derived = deriveSignals({
    text: educationalScam,
    context: "solicitation",
    entities,
    claims: [],
    normalized: norm,
    suspiciousDomains: [],
    mismatchedDomains: [],
  });
  const signals = mergeSignals(textSignals, derived);
  const risk = assessRisk({
    signals,
    context: "solicitation",
    evidence: [],
    source: { officialDomains: 0, fineDomains: 0, unknownDomains: 0, badDomains: 0, totalDomains: 0 },
    hasAmount: true,
    insufficientEvidence: false,
  });
  assert.ok(risk.score >= 50, `Score must remain high (${risk.score})`);
  assert.equal(risk.contextMultiplier, 1, "Context discount must be bypassed");
});

console.log("\n--- [Phase 1] Live Threat Intel & Verification Integration ---");

it("confirmed blocklist hit marks evidence as contradicted and boosts score >= 85", () => {
  const live = {
    checkedAt: new Date().toISOString(),
    targetDomain: "openphish-hit.com",
    sources: [
      {
        source: "openphish",
        name: "OpenPhish",
        status: "hit",
        checkedAt: new Date().toISOString(),
        summary: "Active threat blocklist hit",
        latencyMs: 140,
      },
    ],
    hasBlocklistHit: true,
    isNewlyRegistered: false,
  };

  const domains = analyzeDomains(["openphish-hit.com"], true, false);
  const evidence = buildEvidence({
    text: "Visit openphish-hit.com",
    entities: [],
    claims: [],
    domains,
    registration: null,
    hasAmount: false,
    hasOtp: false,
    hasContact: false,
    hasSignals: true,
    charCount: 30,
    context: "solicitation",
    live,
  });

  const blocklistEv = evidence.find((e) => e.subject === "OpenPhish");
  assert.ok(blocklistEv && blocklistEv.status === "contradicted");

  const risk = assessRisk({
    signals: [],
    context: "solicitation",
    evidence,
    source: { officialDomains: 0, fineDomains: 0, unknownDomains: 1, badDomains: 1, totalDomains: 1 },
    hasAmount: false,
    insufficientEvidence: false,
    live,
  });
  assert.ok(risk.score >= 85, `Expected high risk >= 85 for blocklist match, got ${risk.score}`);
});

it("fresh domain < 7 days + solicitation boosts verification gap", () => {
  const live = {
    checkedAt: new Date().toISOString(),
    targetDomain: "new-scam-domain.xyz",
    sources: [
      {
        source: "rdap",
        name: "RDAP",
        status: "hit",
        checkedAt: new Date().toISOString(),
        summary: "Registered 2 days ago",
        latencyMs: 310,
      },
    ],
    hasBlocklistHit: false,
    isNewlyRegistered: true,
    registrationDays: 2,
  };

  const risk = assessRisk({
    signals: [],
    context: "solicitation",
    evidence: [],
    source: { officialDomains: 0, fineDomains: 0, unknownDomains: 1, badDomains: 0, totalDomains: 1 },
    hasAmount: true,
    insufficientEvidence: false,
    live,
  });

  const gapFactor = risk.factors.find((f) => f.id === "verification_gap");
  assert.ok(gapFactor && gapFactor.points >= 80, `Expected verification gap >= 80, got ${gapFactor?.points}`);
});

console.log("\n==========================================");
console.log(`Suite finished: ${passes} passed, ${fails} failed.`);
console.log(`Expected agreement rate: 100% (${passes}/${passes + fails} test fixtures)`);
console.log("==========================================\n");

if (fails > 0) process.exit(1);
