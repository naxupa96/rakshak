/**
 * Automated 1-Click Bank Emergency Lock & SMS Dispatch Matrix
 * Formats official emergency SMS codes and direct banking freeze helplines for Indian banks.
 */

export interface BankLockAction {
  bankName: string;
  shortCode: string;
  tollFreeHelpline: string;
  smsRecipient: string;
  smsBodyUpiBlock: string;
  smsBodyCardBlock: string;
  portalUrl: string;
}

export const INDIAN_BANKS_LOCK_MATRIX: Record<string, BankLockAction> = {
  SBI: {
    bankName: "State Bank of India",
    shortCode: "SBIN",
    tollFreeHelpline: "18001234",
    smsRecipient: "9223966666",
    smsBodyUpiBlock: "BLOCK UPI",
    smsBodyCardBlock: "BLOCK <Last4Digits>",
    portalUrl: "https://retail.onlinesbi.sbi/retail/lockcard.htm",
  },
  HDFC: {
    bankName: "HDFC Bank",
    shortCode: "HDFC",
    tollFreeHelpline: "18002583838",
    smsRecipient: "5676712",
    smsBodyUpiBlock: "BLOCK UPI",
    smsBodyCardBlock: "BLOCK CARD <Last4Digits>",
    portalUrl: "https://netbanking.hdfcbank.com/netbanking/",
  },
  ICICI: {
    bankName: "ICICI Bank",
    shortCode: "ICIC",
    tollFreeHelpline: "18001080",
    smsRecipient: "5676766",
    smsBodyUpiBlock: "BLOCK UPI",
    smsBodyCardBlock: "IBLOCK <Last4Digits>",
    portalUrl: "https://infinity.icicibank.com/corp/AuthenticationController",
  },
  AXIS: {
    bankName: "Axis Bank",
    shortCode: "UTIB",
    tollFreeHelpline: "18604195555",
    smsRecipient: "5676782",
    smsBodyUpiBlock: "BLOCK UPI",
    smsBodyCardBlock: "BLOCKCARD <Last4Digits>",
    portalUrl: "https://omni.axisbank.co.in/axisretail/",
  },
  KOTAK: {
    bankName: "Kotak Mahindra Bank",
    shortCode: "KKBK",
    tollFreeHelpline: "18602662666",
    smsRecipient: "9971056767",
    smsBodyUpiBlock: "BLOCK UPI",
    smsBodyCardBlock: "DCBLOCK <Last4Digits>",
    portalUrl: "https://netbanking.kotak.com/knb2/",
  },
  PNB: {
    bankName: "Punjab National Bank",
    shortCode: "PUNB",
    tollFreeHelpline: "18001802222",
    smsRecipient: "5607040",
    smsBodyUpiBlock: "BLOCK UPI",
    smsBodyCardBlock: "HOT <Last4Digits>",
    portalUrl: "https://netpnb.com",
  },
};

/**
 * Generate formatted SMS emergency link (sms:12345?body=...) for mobile 1-tap dispatch.
 */
export function buildSmsEmergencyLink(bankKey: string, type: "upi" | "card"): string {
  const bank = INDIAN_BANKS_LOCK_MATRIX[bankKey] || INDIAN_BANKS_LOCK_MATRIX["SBI"];
  const body = type === "upi" ? bank.smsBodyUpiBlock : bank.smsBodyCardBlock;
  return `sms:${bank.smsRecipient}?body=${encodeURIComponent(body)}`;
}
