import type { ComplaintDossier } from "@/types";

/**
 * Generates an official, structured cybercrime and regulatory complaint dossier
 * formatted for immediate filing with National Cybercrime Portal (1930 / cybercrime.gov.in)
 * or SEBI SCORES (scores.sebi.gov.in).
 */
export function generateComplaintDossier(report: {
  id: string;
  createdAt: string;
  risk: { score: number; level: string };
  signals: { id: string }[];
  normalized: { domains: string[]; phones: string[]; text: string };
  entities: { type: string; value: string; quote: string }[];
}): ComplaintDossier {
  const isSebiRelated = report.signals.some((s) => s.id === "regulatory_impersonation" || s.id === "pump_and_dump");
  const portalTarget: ComplaintDossier["portalTarget"] = isSebiRelated ? "SEBI_SCORES" : "NATIONAL_CYBERCRIME_1930";

  const vpas = report.entities
    .filter((e) => e.type === "payment" || e.quote.includes("@"))
    .map((e) => e.quote)
    .filter((v) => /@(?:ok|ybl|ibl|paytm|apl|axl|upi|postbank)/i.test(v));

  const handles = report.entities
    .filter((e) => e.type === "handle" || e.quote.startsWith("@"))
    .map((e) => e.quote);

  const suspectDomains = report.normalized.domains;
  const suspectPhones = report.normalized.phones;

  // Generate deterministic hash string representing the evidentiary record
  const evidenceString = `${report.id}:${report.createdAt}:${suspectDomains.join(",")}:${suspectPhones.join(",")}:${vpas.join(",")}`;
  let hashVal = 0;
  for (let i = 0; i < evidenceString.length; i++) {
    hashVal = (hashVal << 5) - hashVal + evidenceString.charCodeAt(i);
    hashVal |= 0;
  }
  const evidenceHash = `RKSHK-${Math.abs(hashVal).toString(16).toUpperCase()}-${report.id.slice(0, 6).toUpperCase()}`;

  const subject = isSebiRelated
    ? `Complaint against fraudulent financial solicitation & regulatory impersonation [SEBI Reference Case]`
    : `Urgent Report: Financial Cyber Fraud / Impersonation & Mule Account Solicitation [1930 Dossier]`;

  const complaintLines = [
    `TO: ${portalTarget === "SEBI_SCORES" ? "Securities and Exchange Board of India (SEBI SCORES)" : "National Cyber Crime Reporting Portal (Helpline 1930 / MHA)"}`,
    `DATE OF INCIDENT RECORD: ${new Date(report.createdAt).toUTCString()}`,
    `EVIDENTIARY HASH: ${evidenceHash}`,
    `AUTOMATED RISK ASSESSMENT: ${report.risk.level} (${report.risk.score}/100 Risk Score)`,
    ``,
    `RESPECTED OFFICER / GRIEVANCE REDRESSAL DESK,`,
    ``,
    `I am submitting this formal complaint regarding an illegal financial solicitation and potential cyber fraud intercepted through Rakshak Threat Intelligence.`,
    ``,
    `1. NATURE OF FRAUD:`,
    isSebiRelated
      ? `- Unauthorized use of SEBI/regulatory registered intermediary identity to solicit public funds without lawful authority.`
      : `- Financial cyber fraud involving false investment promises, urgent fund exfiltration, and unauthorized payment solicitation.`,
    `- Detected Red Flags: ${report.signals.map((s) => s.id.replace(/_/g, " ")).join(", ") || "suspicious investment pitch"}`,
    ``,
    `2. SUSPECT IDENTIFIERS & DIGITAL TRACES:`,
    `- Suspect Phone Numbers / WhatsApp Contacts: ${suspectPhones.length ? suspectPhones.join(", ") : "None specified in text"}`,
    `- Suspect Domains / Fake Portals: ${suspectDomains.length ? suspectDomains.join(", ") : "None specified"}`,
    `- Intercepted Mule UPI VPAs / Payment Endpoints: ${vpas.length ? vpas.join(", ") : "Direct transfer/link referenced in source text"}`,
    `- Social Handles / Channels: ${handles.length ? handles.join(", ") : "None"}`,
    ``,
    `3. TRANSCRIPT OF FRAUDULENT MESSAGE:`,
    `"""`,
    report.normalized.text.slice(0, 500) + (report.normalized.text.length > 500 ? "..." : ""),
    `"""`,
    ``,
    `4. PRAYER / REQUESTED RELIEF:`,
    `- Immediately freeze the referenced UPI IDs/mule bank accounts to prevent diversion of investor funds.`,
    `- Issue takedown notice for fraudulent web portals and Telegram/WhatsApp channels.`,
    `- Initiate inquiry under relevant sections of the Information Technology Act (Sec 66D) and BNS/IPC.`,
    ``,
    `SUBMITTED VIA: Rakshak Automated Investor Threat Intelligence Engine`,
    `VERIFICATION INTEGRITY RECORD ID: ${report.id}`,
  ];

  return {
    incidentId: report.id,
    generatedAt: new Date().toISOString(),
    evidenceHash,
    portalTarget,
    subject,
    complaintText: complaintLines.join("\n"),
    extractedSuspects: {
      domains: suspectDomains,
      phones: suspectPhones,
      vpas,
      handles,
    },
  };
}
