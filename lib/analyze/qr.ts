import type { QrExtraction } from "@/types";

/**
 * Pure, zero-external-dependency QR code detector and parser.
 * Inspects parsed strings, image data, and URL payloads for embedded QR intent schemes.
 */
export function parseQrPayload(raw: string): QrExtraction {
  if (!raw || typeof raw !== "string") {
    return { hasQr: false };
  }

  const trimmed = raw.trim();

  // 1. UPI QR Code (Standard Indian NPCI QR payload)
  // Format: upi://pay?pa=...&pn=...&am=...&cu=INR
  if (/^upi:\/\/pay/i.test(trimmed) || trimmed.includes("pa=") && trimmed.includes("@")) {
    let vpa = "";
    try {
      const url = new URL(trimmed.startsWith("upi://") ? trimmed : `upi://${trimmed}`);
      vpa = url.searchParams.get("pa") || "";
    } catch {
      const match = trimmed.match(/pa=([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+)/i);
      vpa = match ? match[1] : "";
    }

    return {
      hasQr: true,
      payloadType: "upi",
      rawPayload: trimmed,
      decodedTarget: vpa || trimmed,
      riskNotice: vpa
        ? `Direct UPI Payment QR detected routing to personal VPA (${vpa}). Bypasses merchant safeguards.`
        : "Direct UPI intent payment QR code detected.",
    };
  }

  // 2. Phishing URL QR Code
  if (/^https?:\/\//i.test(trimmed) || /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\//i.test(trimmed)) {
    const isIpOrShortener = /bit\.ly|tinyurl|is\.gd|cutt\.ly|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/i.test(trimmed);
    return {
      hasQr: true,
      payloadType: "url",
      rawPayload: trimmed,
      decodedTarget: trimmed,
      riskNotice: isIpOrShortener
        ? "Obfuscated / Shortened link inside QR Code. Frequently used to conceal fake investment portals."
        : "External website redirection QR code detected.",
    };
  }

  // 3. Phone / WhatsApp QR Code
  if (/^(?:tel:|whatsapp:\/\/|https?:\/\/wa\.me\/)/i.test(trimmed)) {
    return {
      hasQr: true,
      payloadType: "phone",
      rawPayload: trimmed,
      decodedTarget: trimmed,
      riskNotice: "Direct chat/call initiation QR code routing directly to a private WhatsApp channel.",
    };
  }

  return {
    hasQr: true,
    payloadType: "text",
    rawPayload: trimmed,
    decodedTarget: trimmed,
    riskNotice: "Text payload extracted from QR code.",
  };
}
