import type { Entity, EvidenceItem, VerificationStatus } from "@/types";
import { OFFICIAL_DOMAINS, REGULATOR_TOKENS } from "./normalize";

export type DomainReason = "shortener" | "tld" | "punycode" | "lookalike" | "structure" | "insecure";

export interface DomainFinding {
  domain: string;
  reason: DomainReason;
}

const SUSPICIOUS_TLDS = new Set([
  "xyz", "top", "click", "info", "online", "site", "club", "fun", "buzz",
  "icu", "rest", "cfd", "sbs", "bond", "beauty", "makeup", "monster",
  "quest", "shop", "store", "win", "loan", "trade", "gq", "tk", "ml", "cf",
]);

const SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "cutt.us", "rb.gy", "is.gd", "ow.ly",
  "rebrand.ly", "s.id", "shorturl.at", "goo.gl", "buff.ly", "lnkd.in",
]);

export function isOfficialDomain(domain: string): boolean {
  const d = domain.toLowerCase().replace(/^www\./, "");
  return OFFICIAL_DOMAINS.some((o) => d === o || d.endsWith("." + o));
}

function registrable(domain: string): string {
  const parts = domain.split(".");
  return parts.length <= 2 ? parts.join(".") : parts.slice(-2).join(".");
}

export function analyzeDomains(domains: string[], hasHttp: boolean, insecureUrl: boolean): {
  official: string[];
  suspicious: DomainFinding[];
  mismatched: DomainFinding[];
  fine: string[];
  unknown: string[];
} {
  const official: string[] = [];
  const suspicious: DomainFinding[] = [];
  const mismatched: DomainFinding[] = [];
  const fine: string[] = [];
  const unknown: string[] = [];

  for (const raw of domains) {
    const domain = raw.toLowerCase().replace(/^www\./, "").replace(/[.,;]+$/, "");
    if (!domain) continue;

    if (isOfficialDomain(domain)) {
      official.push(domain);
      continue;
    }

    const tld = domain.split(".").pop() ?? "";
    const hasRegulatorToken = REGULATOR_TOKENS.some(
      (t) => registrable(domain).startsWith(t + ".") || registrable(domain).split(".")[0].includes(t),
    );

    if (SHORTENERS.has(domain) || SHORTENERS.has(registrable(domain))) {
      suspicious.push({ domain, reason: "shortener" });
      continue;
    }
    if (domain.includes("xn--") || /[^\x00-\x7F]/.test(domain)) {
      suspicious.push({ domain, reason: "punycode" });
      continue;
    }
    if (hasRegulatorToken) {
      mismatched.push({ domain, reason: "lookalike" });
      continue;
    }
    if (SUSPICIOUS_TLDS.has(tld)) {
      suspicious.push({ domain, reason: "tld" });
      continue;
    }
    if (insecureUrl && hasHttp) {
      suspicious.push({ domain, reason: "insecure" });
      continue;
    }
    const label = registrable(domain).split(".")[0];
    if ((label.match(/-/g) ?? []).length >= 2 || /\d{3,}/.test(label) || label.length > 28) {
      suspicious.push({ domain, reason: "structure" });
      continue;
    }
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
      suspicious.push({ domain, reason: "structure" });
      continue;
    }

    if (tld && ["com", "in", "org", "net", "co", "io", "gov", "edu"].includes(tld)) fine.push(domain);
    else unknown.push(domain);
  }

  return { official, suspicious, mismatched, fine, unknown };
}

export type RegistrationCheck = { value: string; status: "format_valid" | "format_invalid" } | null;

/**
 * Checks whether a claimed registration number matches the shape used by
 * Indian market intermediaries. A matching format is not proof of
 * registration — the report says so explicitly.
 */
export function checkRegistration(entities: Entity[]): RegistrationCheck {
  const reg = entities.find((e) => e.type === "registration_no");
  if (!reg) return null;
  const value = reg.value.toUpperCase().replace(/\s+/g, "");
  const valid = /^IN[A-Z]\d{6,7}$/.test(value) || /^ARN-?\d{6}$/.test(value);
  return { value, status: valid ? "format_valid" : "format_invalid" };
}

let evCounter = 0;
function ev(
  subject: string,
  statementKey: string,
  status: EvidenceItem["status"],
  strength: EvidenceItem["strength"],
  extra?: { quote?: string; params?: Record<string, string> },
): EvidenceItem {
  evCounter = (evCounter + 1) % 1_000_000;
  return {
    id: `ev_${evCounter}`,
    subject,
    statementKey,
    params: extra?.params,
    quote: extra?.quote,
    status,
    strength,
  };
}

export interface EvidenceInput {
  text: string;
  entities: Entity[];
  claims: { quote: string; verification: VerificationStatus; type: string }[];
  domains: { official: string[]; suspicious: DomainFinding[]; mismatched: DomainFinding[]; fine: string[]; unknown: string[] };
  registration: RegistrationCheck;
  hasAmount: boolean;
  amount?: string;
  hasOtp: boolean;
  otpQuote?: string;
  hasContact: boolean;
  contact?: string;
  hasSignals: boolean;
  charCount: number;
  context: "solicitation" | "educational" | "news" | "complaint" | "neutral";
}

export function buildEvidence(input: EvidenceInput): EvidenceItem[] {
  const out: EvidenceItem[] = [];

  const companies = input.entities.filter((e) => e.type === "company");
  const phones = input.entities.filter((e) => e.type === "phone");
  const regulators = input.entities.filter((e) => e.type === "regulator");

  if (companies.length) {
    for (const c of companies.slice(0, 3)) {
      const impersonating = c.trustStatus === "suspicious";
      out.push(
        ev(
          c.value,
          impersonating ? "entityUnmatched" : "entityNamed",
          impersonating ? "contradicted" : "unverifiable",
          impersonating ? "strong" : "moderate",
          { params: { name: c.value, value: c.value }, quote: c.quote },
        ),
      );
    }
  } else if (phones.length || input.hasContact) {
    out.push(
      ev(
        input.contact ?? phones[0]?.value ?? "—",
        "entityAmbiguous",
        "requires_verification",
        "moderate",
        { params: { value: input.contact ?? phones[0]?.value ?? "—" }, quote: phones[0]?.quote },
      ),
    );
  } else if (input.hasSignals) {
    out.push(ev("—", "identityMissing", "unverifiable", "moderate"));
  }

  if (input.domains.official.length) {
    out.push(
      ev(input.domains.official[0], "domainOfficial", "confirmed", "strong", {
        params: { value: input.domains.official[0] },
      }),
    );
  }
  for (const d of input.domains.suspicious.slice(0, 2)) {
    out.push(
      ev(d.domain, "domainSuspicious", "contradicted", "strong", {
        params: { value: d.domain, reason: d.reason },
        quote: d.domain,
      }),
    );
  }
  for (const d of input.domains.mismatched.slice(0, 2)) {
    out.push(
      ev(d.domain, "domainSuspicious", "contradicted", "strong", {
        params: { value: d.domain, reason: d.reason },
        quote: d.domain,
      }),
    );
  }
  if (input.domains.fine.length && !input.domains.suspicious.length && !input.domains.mismatched.length) {
    out.push(
      ev(input.domains.fine[0], "domainFine", "confirmed", "moderate", {
        params: { value: input.domains.fine[0] },
      }),
    );
  }
  for (const d of input.domains.unknown.slice(0, 1)) {
    out.push(
      ev(d, "domainUnknown", "requires_verification", "weak", { params: { value: d } }),
    );
  }
  if (
    !input.domains.official.length &&
    !input.domains.suspicious.length &&
    !input.domains.mismatched.length &&
    !input.domains.fine.length &&
    !input.domains.unknown.length &&
    input.hasSignals
  ) {
    out.push(ev("—", "noSource", "unverifiable", "weak"));
  }

  if (input.registration) {
    out.push(
      ev(input.registration.value, input.registration.status === "format_valid" ? "regFormatValid" : "regFormatInvalid",
        input.registration.status === "format_valid" ? "requires_verification" : "contradicted",
        input.registration.status === "format_valid" ? "moderate" : "strong",
        { params: { value: input.registration.value } },
      ),
    );
  } else if (regulators.length || input.claims.some((c) => c.type === "REGULATORY_APPROVAL")) {
    out.push(ev("—", "regFormatNone", "unverifiable", "weak"));
  }

  for (const c of input.claims.slice(0, 5)) {
    out.push(
      ev(c.type, "claimUnsupported", c.verification === "contradicted" ? "contradicted" : "requires_verification",
        "moderate", { quote: c.quote }),
    );
  }

  if (input.hasOtp) {
    out.push(ev("OTP", "otpQuoted", "contradicted", "strong", { params: { value: input.otpQuote ?? "" }, quote: input.otpQuote }));
  }

  if (input.hasAmount && input.amount) {
    out.push(ev(input.amount, "paymentRequested", "contradicted", "strong", { params: { value: input.amount } }));
  } else if (input.hasAmount) {
    out.push(ev("—", "paymentNoAmount", "contradicted", "moderate"));
  }

  if (input.hasContact && input.contact && input.domains.official.length === 0 && !input.hasAmount) {
    out.push(ev(input.contact, "contactPresent", "requires_verification", "weak", { params: { value: input.contact } }));
  }

  if (input.context === "educational") {
    out.push(ev("context", "contextEducational", "confirmed", "moderate"));
  } else if (input.context === "news") {
    out.push(ev("context", "contextNews", "confirmed", "moderate"));
  }

  if (input.charCount > 0 && input.charCount < 40) {
    out.push(ev("content", "shortContent", "unverifiable", "strong", { params: { count: String(input.charCount) } }));
  }

  if (!input.hasSignals) {
    out.push(ev("—", "noSignals", "confirmed", "moderate"));
  }

  out.push(ev("—", "externalUnavailable", "unverifiable", "weak"));

  return out;
}

/**
 * Offline verification state for each claim. Nothing here proves a claim
 * true — at best it contradicts the form of a claim, or leaves it open.
 */
export function applyClaimVerification(
  claims: { type: string; verification: VerificationStatus }[],
  registration: RegistrationCheck,
  domains: { official: string[]; suspicious: DomainFinding[]; mismatched: DomainFinding[] },
): void {
  const externallyCheckable = ["REGULATORY_APPROVAL", "GOVERNMENT_AFFILIATION", "CELEBRITY_ENDORSEMENT"];
  const badDomain = domains.suspicious.length > 0 || domains.mismatched.length > 0;

  for (const c of claims) {
    if (!externallyCheckable.includes(c.type)) {
      c.verification = "unverifiable";
      continue;
    }
    if (c.type === "REGULATORY_APPROVAL") {
      if (registration?.status === "format_invalid" || badDomain) {
        c.verification = "contradicted";
        continue;
      }
      c.verification = domains.official.length ? "requires_verification" : "requires_verification";
      continue;
    }
    c.verification = badDomain ? "contradicted" : "requires_verification";
  }
}
