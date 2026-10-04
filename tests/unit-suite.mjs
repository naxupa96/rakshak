/**
 * Standalone Vitest/Node test suite for engine modules:
 * normalize, signals, risk, and verify.
 * Run with: node tests/unit-suite.mjs
 */

import assert from "node:assert/strict";
import { normalizeContent, cleanRawText, foldLeet, detectContext } from "../lib/analyze/normalize.js";
import { detectTextSignals, deriveSignals, mergeSignals } from "../lib/analyze/signals.js";
import { assessRisk, assessTrust } from "../lib/analyze/risk.js";
import { analyzeDomains, checkRegistration, applyClaimVerification, buildEvidence } from "../lib/analyze/verify.js";
import { extractClaims } from "../lib/analyze/claims.js";
import { extractEntities } from "../lib/analyze/entities.js";

let passes = 0;
let fails = 0;

function test(name, fn) {
  try {
    fn();
    passes++;
    console.log(`PASS: ${name}`);
  } catch (err) {
    fails++;
    console.error(`FAIL: ${name}\n`, err);
  }
}

console.log("=== Running Rakshak Core Unit Suite ===");

// 1. Normalization & Clean text
test("cleanRawText strips zero-width chars and normalizes NFKC", () => {
  const dirty = "S\u200BE\u200DB\uFEFFI\u0000";
  const cleaned = cleanRawText(dirty);
  assert.equal(cleaned, "SEBI");
});

test("foldLeet maps leet speak chars", () => {
  const leet = "gu@r@nt33d pr0f1t 5c@m";
  const folded = foldLeet(leet);
  assert.equal(folded, "guaranteed profit scam");
});

test("detectContext correctly classifies solicitation vs educational", () => {
  const edu = "How to spot red flags and avoid scams. Never share OTP or pay upfront fees.";
  assert.equal(detectContext(edu), "educational");

  const sol = "Invest now with us to earn guaranteed 20% returns! Sign up today.";
  assert.equal(detectContext(sol), "solicitation");
});

// 2. Signals & Leet detection
test("detectTextSignals detects guaranteed return with leet evasion", () => {
  const text = "gu@r@nt33d returns of 20% monthly";
  const signals = detectTextSignals(text, "solicitation");
  const hasSignal = signals.some((s) => s.id === "guaranteed_return" || s.id === "unrealistic_return");
  assert.ok(hasSignal, "Should catch guaranteed or unrealistic return despite leet speak");
});

test("signals detect payment links and handles", () => {
  const text = "Pay via upi://pay?pa=scammer@okhdfcbank or contact on t.me/profitgroup";
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
  const hasPaymentLink = derived.some((s) => s.id === "payment_link");
  const hasSocialOnly = derived.some((s) => s.id === "social_only");
  assert.ok(hasPaymentLink, "Should detect payment_link signal");
  assert.ok(hasSocialOnly, "Should detect social_only via telegram handle without literal word");
});

// 3. Risk scoring & Educational context bypass fix
test("Educational context bypass is prevented when solicitation or payment fired", () => {
  const fakeEdu = "Educational guide on stocks: But send Rs 5000 right now to our UPI for guaranteed 10% monthly income!";
  const norm = normalizeContent(fakeEdu);
  const entities = extractEntities(fakeEdu, norm);
  const textSignals = detectTextSignals(fakeEdu, "solicitation");
  const derived = deriveSignals({
    text: fakeEdu,
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
  assert.ok(risk.score >= 50, `Expected elevated score despite educational prefix, got ${risk.score}`);
  assert.equal(risk.contextMultiplier, 1, "Context multiplier should remain 1 when payment/solicitation is present");
});

// 4. Live threat intel verification wiring
test("Live blocklist hit boosts risk to critical/high and marks evidence contradicted", () => {
  const domains = analyzeDomains(["phishing-fake-broker.com"], true, false);
  const liveIntel = {
    checkedAt: new Date().toISOString(),
    targetDomain: "phishing-fake-broker.com",
    sources: [
      {
        source: "openphish",
        name: "OpenPhish",
        status: "hit",
        checkedAt: new Date().toISOString(),
        summary: "Active phishing match",
        latencyMs: 120,
      },
    ],
    hasBlocklistHit: true,
    isNewlyRegistered: true,
    registrationDays: 2,
  };

  const evidence = buildEvidence({
    text: "Visit phishing-fake-broker.com to claim prize",
    entities: [],
    claims: [],
    domains,
    registration: null,
    hasAmount: false,
    hasOtp: false,
    hasContact: false,
    hasSignals: true,
    charCount: 45,
    context: "solicitation",
    live: liveIntel,
  });

  const hasOpenPhishEv = evidence.some((e) => e.subject === "OpenPhish" && e.status === "contradicted");
  assert.ok(hasOpenPhishEv, "Evidence must include OpenPhish contradicted hit");

  const risk = assessRisk({
    signals: [],
    context: "solicitation",
    evidence,
    source: { officialDomains: 0, fineDomains: 0, unknownDomains: 1, badDomains: 1, totalDomains: 1 },
    hasAmount: false,
    insufficientEvidence: false,
    live: liveIntel,
  });

  assert.ok(risk.score >= 85, `Score with blocklist hit should be >= 85, got ${risk.score}`);
});

console.log(`\nResults: ${passes} passed, ${fails} failed.`);
if (fails > 0) process.exit(1);
