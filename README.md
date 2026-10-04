# Rakshak — AI Financial Threat Intelligence

**Verify before you trust.** Rakshak analyses a suspicious message, screenshot or website address and returns an explainable risk report: what was detected, what evidence supports it, what could not be verified, and what to do next.

Built for the SANGYAN Hackathon (SNTC, IIT (BHU) Varanasi, in collaboration with SEBI and NSDL).

> Rakshak is an investor-safety and verification tool. It does **not** give investment advice, recommendations or return predictions, and it never claims to query live regulatory registers — the report states plainly when external verification is unavailable in this build.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run lint        # eslint
npx tsc --noEmit    # typecheck
npm run build       # production build
```

Tests expect a dev server on port 3111:

```bash
npx next dev -p 3111
npm run test:api    # 39 engine/API assertions
npm run test:ui     # 33 Playwright end-to-end checks (npm i -D playwright)
```

Set `RAKSHAK_BASE` if the server is elsewhere.

## Judge demo script (≈3 minutes)

| Step | Do this | You will see |
| --- | --- | --- |
| 1 | Open `/investigate?demo=fake_sebi` | A fake "SEBI-approved" pitch: **Critical** score in the verdict hero — dial, level, `score / 100`, risk-signal count, evidence count and confidence in one strip. |
| 2 | Scroll to **How did Rakshak reach this score?** | Every factor as `+points` with its `raw × weight`, summing to the final score. Click a factor to jump to the section that evidences it (it flashes). |
| 3 | Click a node in the **Trust graph** | Directional relations with each node's status (claim → claimed regulator → suspicious). |
| 4 | Click **Save investigation**, then open the locker | Incident saved in `/locker`; search and risk filters, export/clear, stored only in this browser. |
| 5 | On `/investigate`, paste your own message and run analysis | Deterministic rules engine — signals, claims, risk factors, evidence, actions. |
| 6 | Switch **EN → HI → GU** in the header | The whole report re-renders in that language, live. |
| 7 | Open `/investigate?demo=educational` | Legitimate educational content stays **Low concern** — the tool does not flag everything. |

Other ready scenarios: `fake_investment` (the landing page's "Try a Demo" button), `guaranteed_whatsapp`, `fake_broker`, `gujarati_scam`.

Turn on **Simple mode** in the header to see the report reorder itself: *What should I do?* moves ahead of the technical sections, and every signal is rewritten as one short plain sentence.

## How it works

```
text / screenshot (OCR in browser) / URL (SSRF-guarded fetch)
        │
        ▼
lib/analyze/  normalize → entities → claims → signals → verify → risk → explain → actions → graph
        │
        ▼
app/api/analyze  ──►  AnalysisReport  ──►  report UI (why, factors, evidence, actions, trust graph)
        │
        └── optional lib/ai/llm.ts (server-side only, silent fallback, report.usedLlm flag)
```

- **Deterministic by design.** The rules engine is the source of truth; an LLM is an optional, validated augmenter and is never required. The same input always produces the same report.
- **Risk score** = weighted factors (deceptive signals .45, solicitation .20, verification gap .15, source credibility .10, pressure .10) × context multiplier (educational content is deliberately down-weighted), capped when evidence is insufficient. The report shows that arithmetic: each factor lists `points × weight`, and the rows sum to the score shown in the verdict.
- **Honest verification.** Local allowlists and strict formats for registration numbers (`IN[A-Z]\d{6,7}`, `ARN-\d{6}`); every external check the build cannot perform is disclosed as evidence, with a *Live verification unavailable* notice in the Evidence section.
- **Privacy.** Screenshot OCR runs entirely in the browser (`tesseract.js`); saved investigations live in `localStorage` only; phone numbers/e-mails are masked in reports; Settings lists exactly what is and is not sent anywhere.
- **Hardened.** URL fetches validate every redirect hop against a private-host guard (loopback, RFC1918, link-local/metadata, CGNAT, single-label hosts), payloads are size-capped, LLM keys stay server-side, and responses ship `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing: problem, how it works, trust graph, safety, privacy |
| `/investigate` | Text, screenshot (OCR), URL and demo analysis |
| `/report/live` | The current report |
| `/incident/[id]` | A saved investigation from the Evidence Locker |
| `/locker` | Evidence Locker: search, filter, export, clear |
| `/dashboard` | Aggregated safety centre: distribution, common signals |
| `/settings` | Language (EN/HI/GU), simple mode, data controls |

## Optional environment

Everything works with no environment variables — the deterministic rules engine needs none. To turn on the optional server-side language-model step, set one of these **server-side** (never `NEXT_PUBLIC_*`):

```bash
ANTHROPIC_API_KEY=...      # or OPENAI_API_KEY, or LLM_API_KEY + LLM_BASE_URL
LLM_MODEL=claude-sonnet-4-5 # optional override
```

If a key is absent, unreachable or returns something invalid, the report simply falls back to the rules engine and keeps `usedLlm: false`.

## Deploy

Standard Next.js build — `npm run build && npm start`, or deploy the repo to Vercel with no configuration. There is no database and no server-side storage: evidence lives in the browser, and the only server work is analysis plus the optional LLM call.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · tesseract.js (browser OCR) · Playwright (E2E) — no database, no backend dependencies beyond the Next server.

## Languages

English, हिन्दी and ગુજરાતી throughout the interface and report narrative (dictionaries in `lib/localization/`). The architecture is language-agnostic: Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam and Punjabi are next.
