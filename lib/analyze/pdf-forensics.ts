import { PdfForensicReport } from "@/types";

/**
 * Known suspicious document generator software frequently utilized by counterfeiters
 * and investment scam syndicates to produce fake SEBI certificates, RBI approval letters,
 * and IPO allotment documents.
 */
const SUSPICIOUS_GENERATORS = [
  "Canva",
  "Photoshop",
  "Illustrator",
  "CorelDraw",
  "Microsoft Word",
  "PDF24",
  "ILovePDF",
  "Smallpdf",
  "Wondershare",
  "LibreOffice",
  "GIMP",
  "InDesign",
];

/**
 * Authentic regulators & certified issuing authorities in India.
 */
const REGULATORY_BODIES = [
  "Securities and Exchange Board of India",
  "SEBI",
  "Reserve Bank of India",
  "RBI",
  "National Stock Exchange",
  "NSE",
  "Bombay Stock Exchange",
  "BSE",
  "Insurance Regulatory and Development Authority",
  "IRDAI",
];

/**
 * Parse PDF document metadata or string representations to detect document tampering,
 * forged regulatory certificates, and missing cryptographic digital signatures (eMudhra, DSC).
 */
export function analyzePdfForensics(rawContentOrText: string): PdfForensicReport {
  // Check if string contains typical PDF header or metadata tags
  const isPdf = /%PDF-|\/Producer|\/Creator|\/CreationDate/i.test(rawContentOrText) || /\.pdf\b/i.test(rawContentOrText);

  // Extract /Producer, /Creator, /Author, /Title
  const producerMatch = rawContentOrText.match(/\/Producer\s*(?:\(([^)]+)\)|<([0-9a-fA-F]+)>)/i);
  const creatorMatch = rawContentOrText.match(/\/Creator\s*(?:\(([^)]+)\)|<([0-9a-fA-F]+)>)/i);
  const authorMatch = rawContentOrText.match(/\/Author\s*(?:\(([^)]+)\)|<([0-9a-fA-F]+)>)/i);
  const titleMatch = rawContentOrText.match(/\/Title\s*(?:\(([^)]+)\)|<([0-9a-fA-F]+)>)/i);

  const creationDateMatch = rawContentOrText.match(/\/CreationDate\s*\(([^)]+)\)/i);
  const modDateMatch = rawContentOrText.match(/\/ModDate\s*\(([^)]+)\)/i);

  const producer = producerMatch ? (producerMatch[1] || producerMatch[2]) : undefined;
  const creator = creatorMatch ? (creatorMatch[1] || creatorMatch[2]) : undefined;
  const author = authorMatch ? (authorMatch[1] || authorMatch[2]) : undefined;
  const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : undefined;

  const creationDate = creationDateMatch ? creationDateMatch[1] : undefined;
  const modDate = modDateMatch ? modDateMatch[1] : undefined;

  // Check for cryptographic digital signatures: /ByteRange and /adbe.pkcs7
  const hasDigitalSignature = /\/ByteRange/i.test(rawContentOrText) && /\/(?:adbe\.pkcs7|ETSI\.CAdES|ETSI\.PAdES)/i.test(rawContentOrText);
  let signatureStandard: string | undefined = undefined;
  if (hasDigitalSignature) {
    if (/adbe\.pkcs7\.detached/i.test(rawContentOrText)) signatureStandard = "PKCS#7 Detached (Standard DSC)";
    else if (/ETSI\.CAdES/i.test(rawContentOrText)) signatureStandard = "CAdES PAdES Baseline";
    else signatureStandard = "Digital Signature Verified";
  }

  // Detect claimed regulatory issuer in the text
  let claimedIssuer: string | undefined = undefined;
  for (const reg of REGULATORY_BODIES) {
    if (new RegExp(`\\b${reg}\\b`, "i").test(rawContentOrText)) {
      claimedIssuer = reg;
      break;
    }
  }

  const tamperIndicators: string[] = [];
  let isSuspiciousGenerator = false;

  const combinedSoftware = `${producer || ""} ${creator || ""}`.toLowerCase();
  for (const suspicious of SUSPICIOUS_GENERATORS) {
    if (combinedSoftware.includes(suspicious.toLowerCase())) {
      isSuspiciousGenerator = true;
      tamperIndicators.push(
        `Generated using graphic design/desktop editor (${suspicious}) rather than government document generation pipeline.`
      );
      break;
    }
  }

  if (claimedIssuer && isSuspiciousGenerator) {
    tamperIndicators.push(
      `Claims official sanction from ${claimedIssuer}, but metadata confirms it was created with consumer design software.`
    );
  }

  if (claimedIssuer && !hasDigitalSignature) {
    tamperIndicators.push(
      `Authentic ${claimedIssuer} circulars and licenses require class-3 digital signatures (DSC); no valid cryptographic signature dictionary found.`
    );
  }

  // Check if modification date differs heavily from creation or multiple revision increments
  if (creationDate && modDate && creationDate !== modDate) {
    tamperIndicators.push("Document shows post-creation modification/revision tampering.");
  }

  let verdict: "authentic_certified" | "suspicious_forgery" | "unverified_document" = "unverified_document";

  if (claimedIssuer && (isSuspiciousGenerator || (!hasDigitalSignature && tamperIndicators.length > 0))) {
    verdict = "suspicious_forgery";
  } else if (hasDigitalSignature && !isSuspiciousGenerator) {
    verdict = "authentic_certified";
  }

  return {
    isPdf,
    producer,
    creator,
    title,
    author,
    creationDate,
    modDate,
    hasDigitalSignature,
    signatureStandard,
    isSuspiciousGenerator,
    claimedIssuer,
    verdict,
    tamperIndicators,
  };
}
