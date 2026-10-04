import { chromium } from "playwright";
import { join } from "node:path";
import { tmpdir } from "node:os";

const BASE = process.env.RAKSHAK_BASE ?? "http://localhost:3111";
try {
  await fetch(BASE, { method: "HEAD" });
} catch {
  console.error(`Cannot reach ${BASE}. Start the dev server and/or set RAKSHAK_BASE.`);
  process.exit(1);
}
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => {
  if (m.type() !== "error") return;
  const text = m.text();
  if (/Parameter not found|Tesseract|tesseract/i.test(text)) return;
  errors.push("console: " + text);
});

let fail = 0;
const log = (ok, msg) => {
  console.log((ok ? "PASS " : "FAIL ") + msg);
  if (!ok) fail++;
};
const settle = async () => {
  await page
    .waitForFunction(() => !document.body.innerText.includes("Loading"), null, { timeout: 15000 })
    .catch(() => {});
};

// 1. Landing
await page.goto(BASE + "/", { waitUntil: "networkidle" });
log((await page.locator("text=Verify before you trust").count()) > 0, "landing hero headline");
log((await page.locator('a[href="/investigate"]').count()) > 0, "landing CTA links to /investigate");
const landing = await page.locator("body").innerText();
log(
  /does not provide investment advice/i.test(landing),
  "landing carries the no-investment-advice disclaimer",
);
log((await page.locator("svg").count()) >= 2, "landing renders the trust-graph visual");
log(
  (await page.locator('a[href="/investigate?demo=fake_investment"]').count()) > 0,
  "landing offers a one-click demo CTA",
);
const loopText = await page.locator("body").innerText();
log(
  /detect/i.test(loopText) && /verify/i.test(loopText) && /explain/i.test(loopText) && /protect/i.test(loopText),
  "landing states the detect-verify-explain-protect loop",
);
log((await page.locator('a[href="/locker"]').count()) > 0, "header links to the Evidence Locker");

// 2. Demo flow via URL
await page.goto(BASE + "/investigate?demo=fake_investment", { waitUntil: "networkidle" });
await page.waitForURL("**/report/**", { timeout: 30000 });
log(page.url().includes("/report/live"), "demo run navigates to /report/live: " + page.url());
await settle();
const body = await page.locator("body").innerText();
log(/High risk|Critical|Elevated|Moderate|Low concern/.test(body), "report shows risk level");
log(/guarantee/i.test(body), "report mentions guaranteed-return signal text");
log(/risk signals detected/.test(body), "report verdict shows the risk-signal count");
log(/How did Rakshak reach this score/i.test(body), "report shows the score breakdown panel");
log(/Sum of factors/.test(body), "report shows the factor sum that ties to the score");
log(
  /Live verification unavailable/i.test(body),
  "report shows the live-verification-unavailable notice",
);
log((await page.locator('button:has-text("Save investigation")').count()) > 0, "save button present");

// 2b. Trust graph interaction
const node = page.locator('svg[role="img"] g[role="button"]').first();
if ((await node.count()) > 0) {
  await node.click();
  await page.waitForTimeout(200);
  const withNode = await page.locator("body").innerText();
  log(/Connections: \d+/.test(withNode), "graph node selection shows its connections");
} else {
  log(false, "graph node selection shows its connections");
}

// 3. Save -> open the saved incident -> dashboard
await page.locator('button:has-text("Save investigation")').first().click();
await page.waitForTimeout(500);
await page.locator('a:has-text("Saved to evidence locker")').first().click();
await page.waitForURL("**/incident/**", { timeout: 15000 });
await settle();
const incidentBody = await page.locator("body").innerText();
log(/RX-\d{4}-\d+/.test(incidentBody), "saved incident page shows its incident number");
await page.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
const dash = await page.locator("body").innerText();
log(/RX-\d{4}-\d+/.test(dash), "dashboard lists a saved incident");

// 3b. Evidence Locker: search, filter, empty state
await page.goto(BASE + "/locker", { waitUntil: "networkidle" });
const locker = await page.locator("body").innerText();
log(/RX-\d{4}-\d+/.test(locker), "locker lists the saved incident");
await page.locator('input[type="search"]').fill("zzz-no-match-zzz");
await page.waitForTimeout(200);
const filtered = await page.locator("body").innerText();
log(/No saved investigation matches/i.test(filtered), "locker search shows empty state");
await page.locator('input[type="search"]').fill("");
await page.waitForTimeout(200);
await page.locator('button:has-text("Low concern")').first().click();
await page.waitForTimeout(200);
const levelFiltered = await page.locator("body").innerText();
log(
  /No saved investigation matches/i.test(levelFiltered),
  "locker level filter hides rows of another risk level",
);
await page.locator('button:has-text("All levels")').first().click();

// 4. Text analysis through the UI
await page.goto(BASE + "/investigate", { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Message" }).click();
await page.locator("textarea").fill("Guaranteed 40% returns daily! WhatsApp 9876543210, pay now via USDT");
await page.locator('button:has-text("Run analysis")').first().click();
await page.waitForURL("**/report/**", { timeout: 60000 });
await settle();
const body2 = await page.locator("body").innerText();
log(
  /High risk|Critical|Elevated|Moderate|Low concern/.test(body2),
  "text analysis produced a report with a risk level",
);
log(!/undefined|\[object Object\]|NaN/.test(body2), "no undefined/object-placeholder text");

// 4b. URL analysis through the UI (public example page)
await page.goto(BASE + "/investigate", { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "URL" }).click();
const urlCta = page.locator('button:has-text("Run analysis")').first();
log(await urlCta.isDisabled(), "URL tab keeps the CTA disabled until an address is typed");
await page.locator("#url").fill("https://example.com");
await urlCta.click();
await page.waitForURL("**/report/**", { timeout: 60000 });
await settle();
const urlBody = await page.locator("body").innerText();
log(/Low concern|Moderate|Elevated|High risk|Critical/.test(urlBody), "URL analysis renders a report");
log(!/undefined|\[object Object\]/.test(urlBody), "URL report has no placeholder text");

// 4c. Screenshot / OCR flow (text rendered to a PNG, read in the browser)
const shot = await browser.newPage();
await shot.setViewportSize({ width: 1000, height: 300 });
await shot.setContent(
  '<body style="margin:0;background:#fff;padding:48px;font:30px/1.5 Arial,sans-serif;color:#111">' +
    "Guaranteed 24% monthly returns. Limited seats. Pay Rs 2999 registration fee today to get started." +
    "</body>",
);
const fixture = join(tmpdir(), "rakshak-ocr-sample.png");
await shot.screenshot({ path: fixture });
await shot.close();

await page.goto(BASE + "/investigate", { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Screenshot" }).click();
await page.locator('input[type="file"]').setInputFiles(fixture);
const ocrBox = page.locator("textarea").first();
await ocrBox.waitFor({ state: "visible", timeout: 120000 });
const ocrText = await ocrBox.inputValue();
log(ocrText.length > 40, `OCR extracted text from the screenshot (${ocrText.length} chars)`);
await page.locator('button:has-text("Run analysis")').first().click();
await page.waitForURL("**/report/**", { timeout: 60000 });
await settle();
const imgBody = await page.locator("body").innerText();
log(
  /Low concern|Moderate|Elevated|High risk|Critical/.test(imgBody),
  "screenshot analysis renders a report",
);
log(!/undefined|\[object Object\]/.test(imgBody), "screenshot report has no placeholder text");

// 5. Language switch on report
const before = await page.locator("body").innerText();
await page.getByRole("tab", { name: "HI" }).click();
await page.waitForTimeout(300);
const after = await page.locator("body").innerText();
log(before !== after && /की|को|जोखिम/.test(after), "Hindi switch changes report text");

// 5b. Gujarati switch
await page.getByRole("tab", { name: "GU" }).click();
await page.waitForTimeout(300);
const gu = await page.locator("body").innerText();
log(gu !== after && /જોખમ|ચકાસો|કરો/.test(gu), "Gujarati switch changes report text");

// 6. Settings + simple mode
await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
await page.getByRole("main").getByRole("checkbox").first().check();
const fs = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
log(parseFloat(fs) > 18, "simple mode scales root font: " + fs);

// 6b. Simple mode reorders the report so actions come before the technical sections
await page.getByRole("tab", { name: "EN" }).click();
await page.goto(BASE + "/investigate?demo=fake_investment", { waitUntil: "networkidle" });
await page.waitForURL("**/report/**", { timeout: 30000 });
await settle();
const order = await page.locator("main h2").allTextContents();
const actionsAt = order.findIndex((t) => /What should I do/i.test(t));
const signalsAt = order.findIndex((t) => /Risk signals/i.test(t));
log(
  actionsAt > -1 && signalsAt > -1 && actionsAt < signalsAt,
  "simple mode puts actions before technical sections: " + order.join(" | "),
);

console.log(errors.length ? "ERRORS:\n" + errors.slice(0, 8).join("\n") : "no page errors");
await browser.close();
process.exit(fail ? 1 : 0);
