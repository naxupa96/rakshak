# Rakshak — AI Financial Threat Intelligence

**Verify before you trust.** Rakshak analyses a suspicious message, screenshot or website address and returns an explainable risk report: what was detected, what evidence supports it, what could not be verified, and what to do next.

Built for the SANGYAN Hackathon (SNTC, IIT (BHU) Varanasi, in collaboration with SEBI and NSDL).

> Rakshak is an investor-safety and verification tool. It does **not** give investment advice, recommendations or return predictions, and it never claims to query live regulatory registers — the report states plainly when external verification is unavailable in this build.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 10/10 test fixtures (100% agreement)
```

Other scripts:

```bash
npm run lint        # eslint
npx tsc --noEmit    # typecheck
npm run build       # production build
npm test            # comprehensive unit test suite
```

Tests expect a dev server on port 3111:

```bash
npx next dev -p 3111
npm run test:api    # 39 engine/API assertions
npm run test:ui     # 33 Playwright end-to-end checks (npm i -D playwright)
```

Set `RAKSHAK_BASE` if the server is elsewhere.

## Judge Demo Script — The 60-Second "Money Shot"

| Step | Action | What Judges See |
| --- | --- | --- |
| **1 (The Money Shot)** | Paste a live phishing or suspicious domain (e.g., `https://secure-wealth.ly`) on `/investigate` | **Live Threat Verification Panel** with pulsing green radar status lights. In ~1 second, watch OpenPhish blocklists and ICANN RDAP registry get queried live in parallel, displaying real latency and provenance timestamps. |
| **2 (Side-by-Side Reality Check)** | Test an intermediary impersonation (e.g. Zerodha or Kotak fake portal) | **Impersonation Alert Card**: Side-by-side comparison showing exact discrepancies between what was sent vs the official SEBI registered entity, with real helpline numbers and authentic portal links. |
| **3 (Mule Account & IFSC Decoding)** | Paste bank transfer details with IFSC (e.g., `SBIN000543`) | **Mule Fingerprint Notice**: Automatically decodes bank branch routing and flags known cybercrime mule zones (Jamtara, Mewat/Nuh, Bharatpur). |
| **4 (Cognitive Attack Chain)** | View "Anatomy of the Deception" | **Psychological Attack Timeline**: Reconstructs how the scam weaponized human cognitive biases phase-by-phase (Hook $\to$ Authority $\to$ Synthetic Urgency $\to$ Exfiltration). |
| **5 (1-Click Complaint Dossier)** | Click **📋 File 1930/SEBI Complaint** in report header | Generates an official, pre-formatted legal complaint dossier with evidentiary hash (`RKSHK-...`), intercepted mule VPAs, and direct links to SEBI SCORES or 1930 Cybercrime portal. |
| **6 (Vernacular Audio Briefing)** | Click **Listen Safety Briefing (EN / HI / GU)** | Native browser speech synthesis reads an urgent verbal warning in Hindi, Gujarati, or English designed for non-tech-savvy vernacular investors. |
| **7 (WhatsApp PWA Share Target)** | On mobile/PWA, tap Share on any WhatsApp message | Directly forwards text, link, or screenshot into Rakshak's `/investigate` screen with 0 copy-paste friction. |
| **8 (Golden Hour Emergency HUD)** | Trigger any high/critical threat report | **Golden Hour Action HUD**: Floating crisis banner with 1-tap `tel:1930` dialing, NPCI `*99#` USSD bank freeze code copy, and immediate loss-containment checklist. |
| **9 (Android Banking Trojan Inspector)** | Inspect side-loaded APK manifests / permission logs | **APK Reverse Engineering Inspector**: Unmasks remote access trojans (Hydra/TeaBot) stealing SMS OTPs and abusing Accessibility/Overlay services. |
| **10 (PDF Regulatory Forensics)** | Upload alleged SEBI approval or IPO allotment letters | **Document Metadata Forensics**: Flags Canva/Photoshop consumer software generation and missing Class-3 DSC cryptographic signatures. |
| **11 (Threat Intel STIX 2.1 Export)** | Click **🛡 STIX 2.1** in the report header | 1-Click export of incident indicators (IOCs: domains, phones, mule VPAs) into standardized OASIS STIX 2.1 JSON for LEAs and SOC firewalls. |

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
