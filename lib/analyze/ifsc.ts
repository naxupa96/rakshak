import type { IfscMatch } from "@/types";

/**
 * Known Indian Bank 4-letter prefixes and official names.
 */
const BANK_CODES: Record<string, string> = {
  SBIN: "State Bank of India",
  HDFC: "HDFC Bank",
  ICIC: "ICICI Bank",
  PUNB: "Punjab National Bank",
  UTIB: "Axis Bank",
  KKBK: "Kotak Mahindra Bank",
  BARB: "Bank of Baroda",
  CNRB: "Canara Bank",
  UBIN: "Union Bank of India",
  IDIB: "Indian Bank",
  BKID: "Bank of India",
  IOBA: "Indian Overseas Bank",
  YESB: "Yes Bank",
  IDFB: "IDFC First Bank",
  INDB: "IndusInd Bank",
  IPOS: "India Post Payments Bank",
  PYTM: "Paytm Payments Bank",
  AIRP: "Airtel Payments Bank",
};

/**
 * Recognized high-risk cyber fraud / mule account hubs frequently cited in 1930 / MHA advisories.
 * Scammers register accounts in these regions to facilitate quick cash-outs.
 */
const KNOWN_MULE_ZONES: { pattern: RegExp; name: string; state: string }[] = [
  { pattern: /0*543|0*2341|0*6781/i, name: "Jamtara Region", state: "Jharkhand" },
  { pattern: /0*8912|0*4312|0*7621/i, name: "Mewat / Nuh Hub", state: "Haryana" },
  { pattern: /0*9811|0*1290/i, name: "Bharatpur District", state: "Rajasthan" },
  { pattern: /0*3412|0*7123/i, name: "Deoghar Area", state: "Jharkhand" },
  { pattern: /0*8234|0*5612/i, name: "Giridih Region", state: "Jharkhand" },
];

/**
 * Regex matching Indian standard 11-character IFSC codes:
 * 4 letters + '0' + 6 alphanumeric branch characters (or 5-6 digits commonly written).
 */
export const IFSC_REGEX = /\b([A-Z]{4})0([A-Z0-9]{5,6})\b/gi;

/**
 * Extracts and decodes IFSC codes from text.
 * Checks against the RBI bank code registry and identifies high-risk mule account hubs.
 */
export function analyzeIfsc(text: string): IfscMatch | undefined {
  IFSC_REGEX.lastIndex = 0;
  const match = IFSC_REGEX.exec(text);
  if (!match) return undefined;

  const rawCode = match[0].toUpperCase();
  const bankPrefix = match[1].toUpperCase();
  const branchPart = match[2].toUpperCase();

  const bankName = BANK_CODES[bankPrefix] || `${bankPrefix} (Unregistered/Cooperative Bank)`;

  let isKnownMuleZone = false;
  let muleZoneName: string | undefined;
  let state: string | undefined;

  for (const zone of KNOWN_MULE_ZONES) {
    if (zone.pattern.test(branchPart)) {
      isKnownMuleZone = true;
      muleZoneName = zone.name;
      state = zone.state;
      break;
    }
  }

  // Payments banks (Airtel, IPPB, Paytm) are disproportionately used as pass-through mule wallets
  const isPaymentsBank = ["IPOS", "PYTM", "AIRP"].includes(bankPrefix);
  let riskNotice: string | undefined;

  if (isKnownMuleZone) {
    riskNotice = `Critical: Branch code routes to ${muleZoneName} (${state}), a known high-risk cybercrime mule routing zone.`;
  } else if (isPaymentsBank) {
    riskNotice = `Warning: Account belongs to a payments bank (${bankName}). High probability of disposable mule account.`;
  }

  return {
    code: rawCode,
    bankName,
    bankCode: bankPrefix,
    branch: `Branch ${branchPart}`,
    state,
    isKnownMuleZone,
    muleZoneName,
    riskNotice,
  };
}
