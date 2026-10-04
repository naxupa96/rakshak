import { VpaProbeResult } from "@/types";

/**
 * Standard Indian UPI Payment Service Providers (PSP) and their associated bank routing.
 */
export const UPI_PSP_REGISTRY: Record<string, { bank: string; defaultP2M: boolean }> = {
  okaxis: { bank: "Axis Bank (Google Pay)", defaultP2M: false },
  okhdfcbank: { bank: "HDFC Bank (Google Pay)", defaultP2M: false },
  okicici: { bank: "ICICI Bank (Google Pay)", defaultP2M: false },
  oksbi: { bank: "State Bank of India (Google Pay)", defaultP2M: false },
  ybl: { bank: "YES Bank (PhonePe)", defaultP2M: false },
  ibl: { bank: "ICICI Bank (PhonePe)", defaultP2M: false },
  axl: { bank: "Axis Bank (PhonePe)", defaultP2M: false },
  paytm: { bank: "Paytm Payments Bank / Partner Banks", defaultP2M: false },
  apl: { bank: "Amazon Pay (Axis Bank)", defaultP2M: false },
  barodampay: { bank: "Bank of Baroda", defaultP2M: false },
  aubank: { bank: "AU Small Finance Bank", defaultP2M: false },
  icici: { bank: "ICICI Bank iMobile", defaultP2M: false },
  sbi: { bank: "SBI YONO Pay", defaultP2M: false },
  kotak: { bank: "Kotak Mahindra Bank", defaultP2M: false },
  indus: { bank: "IndusInd Bank", defaultP2M: false },
  federal: { bank: "Federal Bank (Jupiter/Fi)", defaultP2M: false },
};

/**
 * Known legitimate corporate merchant patterns for registered brokers and institutions.
 * Authentic brokers do NOT use personal phone-number-based VPAs or generic individual handles.
 */
const INSTITUTIONAL_MERCHANT_VPA_PATTERNS = [
  /^(?:zerodha|groww|angelone|upstox|icicisec|hdfcsec|kotaksecurities|sharekhan|motilaloswal)\b/i,
  /^(?:nse|bse|cdsl|nsdl|sebi)\b/i,
];

/**
 * Probe an extracted VPA handle against UPI PSP patterns and claimed institutional entities.
 */
export function probeVpaHandle(vpa: string, claimedEntity?: string): VpaProbeResult {
  const cleanVpa = vpa.trim().toLowerCase();
  const parts = cleanVpa.split("@");
  const prefix = parts[0] || "";
  const handle = parts[1] || "";

  const pspInfo = UPI_PSP_REGISTRY[handle] ?? {
    bank: "Third-Party Private PSP / Burner Wallet",
    defaultP2M: false,
  };

  // Check if prefix looks like a personal mobile number (10 digits) or anonymous random string
  const isPersonalMobilePrefix = /^[6-9]\d{9}$/.test(prefix);
  const isRandomHexOrWord = /^[a-z0-9._-]{3,25}$/.test(prefix);

  const isClaimingCorporate = Boolean(
    claimedEntity &&
      /(?:zerodha|groww|angel|upstox|sebi|rbi|nse|bse|police|customs|cbi|ed)/i.test(claimedEntity)
  );

  let isInstitutionalMerchant = false;
  for (const pat of INSTITUTIONAL_MERCHANT_VPA_PATTERNS) {
    if (pat.test(cleanVpa)) {
      isInstitutionalMerchant = true;
      break;
    }
  }

  let accountType: VpaProbeResult["accountType"] = "UNKNOWN";
  let entityMatchVerdict: VpaProbeResult["entityMatchVerdict"] = "UNREGISTERED_BURNER_WALLET";
  let riskFlag = false;
  let advisory = "";

  if (isInstitutionalMerchant) {
    accountType = "P2M_MERCHANT";
    entityMatchVerdict = "OFFICIAL_MERCHANT_MATCH";
    riskFlag = false;
    advisory = "VPA prefix conforms to recognized institutional corporate merchant nodal account format.";
  } else if (isClaimingCorporate && (isPersonalMobilePrefix || !isInstitutionalMerchant)) {
    accountType = "SUSPICIOUS_MULE";
    entityMatchVerdict = "MISMATCHED_PERSONAL_ACCOUNT";
    riskFlag = true;
    advisory = `Critical Discrepancy: Solicitation claims affiliation with ${claimedEntity || "an official broker"}, but the destination UPI address (${cleanVpa}) is routed to a private individual savings account (${pspInfo.bank}), NOT an official corporate escrow nodal account.`;
  } else if (isPersonalMobilePrefix) {
    accountType = "P2P_INDIVIDUAL";
    entityMatchVerdict = "MISMATCHED_PERSONAL_ACCOUNT";
    riskFlag = true;
    advisory = `Destination is an individual mobile-linked P2P account on ${pspInfo.bank}. Legitimate SEBI brokers and government agencies never accept fund deposits via personal savings VPAs.`;
  } else {
    accountType = "P2P_INDIVIDUAL";
    entityMatchVerdict = "UNREGISTERED_BURNER_WALLET";
    riskFlag = false;
    advisory = `Standard UPI handle registered on ${pspInfo.bank}. Verify recipient identity before authenticating UPI PIN.`;
  }

  return {
    vpa: cleanVpa,
    handle,
    pspBank: pspInfo.bank,
    accountType,
    claimedEntity,
    entityMatchVerdict,
    riskFlag,
    advisory,
  };
}

/**
 * Extract all VPAs from text and run probes.
 */
export function probeAllVpas(text: string, claimedEntity?: string): VpaProbeResult[] {
  const vpaRegex = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g;
  const matches = text.match(vpaRegex) || [];
  const unique = Array.from(new Set(matches));

  return unique
    .filter((v) => !v.includes(".com") && !v.includes(".org") && !v.includes(".in")) // filter emails
    .map((v) => probeVpaHandle(v, claimedEntity));
}
