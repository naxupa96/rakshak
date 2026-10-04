import { AnalysisReport, StixBundle } from "@/types";

/**
 * Generate a STIX 2.1 JSON bundle from an AnalysisReport.
 * Adheres strictly to the OASIS STIX 2.1 Cyber Threat Intelligence specification.
 * Converts extracted malicious domains, phone numbers, UPI VPAs, and bank accounts into standard Observables & Indicators.
 */
export function exportReportToStix21(report: AnalysisReport): StixBundle {
  const timestamp = new Date().toISOString();
  const bundleId = `bundle--${cryptoRandomUuid()}`;

  const identityId = `identity--${cryptoRandomUuid()}`;
  const reportObjId = `report--${cryptoRandomUuid()}`;

  const objects: StixBundle["objects"] = [
    {
      type: "identity",
      id: identityId,
      spec_version: "2.1",
      created: timestamp,
      modified: timestamp,
      name: "Rakshak Financial Threat Intelligence",
      identity_class: "system",
      description: "Automated consumer and enterprise anti-financial fraud defense telemetry.",
    },
  ];

  const indicatorIds: string[] = [];

  // 1. Process Suspicious Domains
  for (const domain of report.normalized.domains) {
    const indId = `indicator--${cryptoRandomUuid()}`;
    indicatorIds.push(indId);
    objects.push({
      type: "indicator",
      id: indId,
      spec_version: "2.1",
      created: timestamp,
      modified: timestamp,
      name: `Phishing / Fake Investment Domain: ${domain}`,
      description: `Domain identified in financial scam solicitation with score ${report.risk.score}/100.`,
      pattern_type: "stix",
      pattern: `[domain-name:value = '${domain}']`,
      valid_from: timestamp,
      labels: ["malicious-activity", "phishing", "financial-scam"],
      confidence: Math.round(report.confidence * 100),
    });
  }

  // 2. Process Suspect Phones
  for (const phone of report.normalized.phones) {
    const indId = `indicator--${cryptoRandomUuid()}`;
    indicatorIds.push(indId);
    objects.push({
      type: "indicator",
      id: indId,
      spec_version: "2.1",
      created: timestamp,
      modified: timestamp,
      name: `Social Engineering Caller: ${phone}`,
      description: `Phone number leveraged for coercion / task scam exfiltration.`,
      pattern_type: "stix",
      pattern: `[telephone-number:value = '${phone}']`,
      valid_from: timestamp,
      labels: ["social-engineering", "impersonation"],
      confidence: Math.round(report.confidence * 100),
    });
  }

  // 3. Process Extracted UPI / Payment entities
  for (const entity of report.entities) {
    if (entity.type === "payment" && entity.value.includes("@")) {
      const indId = `indicator--${cryptoRandomUuid()}`;
      indicatorIds.push(indId);
      objects.push({
        type: "indicator",
        id: indId,
        spec_version: "2.1",
        created: timestamp,
        modified: timestamp,
        name: `Cybercrime Mule UPI Handle: ${entity.value}`,
        description: `Mule account destination identified for fraudulent capital transfer.`,
        pattern_type: "stix",
        pattern: `[user-account:account_login = '${entity.value}']`,
        valid_from: timestamp,
        labels: ["mule-account", "money-laundering", "upi-fraud"],
        confidence: 90,
      });
    }
  }

  // 4. Group into STIX Report Object
  const riskLevelStr = String(report.risk?.level || "UNKNOWN");
  objects.push({
    type: "report",
    id: reportObjId,
    spec_version: "2.1",
    created: timestamp,
    modified: timestamp,
    name: `Incident Triage Report: ${report.id}`,
    description: `Automated assessment of financial threat solicitation. Risk level: ${riskLevelStr}.`,
    published: timestamp,
    object_refs: [identityId, ...indicatorIds],
    labels: ["threat-report", riskLevelStr.toLowerCase()],
  });

  return {
    type: "bundle",
    id: bundleId,
    spec_version: "2.1",
    objects,
  };
}

/** Fallback UUID generator if Web Crypto is unavailable in certain test runtimes */
function cryptoRandomUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
