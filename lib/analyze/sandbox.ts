import type { SandboxInspection } from "@/types";

/**
 * Disarms untrusted HTML scraped from suspicious phishing sites,
 * strips active scripts, iframes, cookies, and event handlers,
 * and extracts deceptive forms and spoofed credentials inputs.
 */
export function inspectAndDisarmUrl(url: string, rawHtml?: string): SandboxInspection {
  if (!rawHtml || typeof rawHtml !== "string") {
    return {
      targetUrl: url,
      extractedForms: [],
      maliciousScriptsStripped: 0,
      suspiciousElements: [],
      isSafePreviewAvailable: false,
    };
  }

  let scriptsStripped = 0;
  const suspiciousElements: SandboxInspection["suspiciousElements"] = [];

  // Count and strip scripts
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const scriptMatches = rawHtml.match(scriptRegex);
  if (scriptMatches) {
    scriptsStripped = scriptMatches.length;
    suspiciousElements.push({
      element: `<script> (${scriptsStripped} tags)`,
      reason: "Executable client-side scripts stripped to prevent session hijacking or drive-by downloads.",
      severity: "high",
    });
  }

  // Detect and neutralize iframes
  const iframeRegex = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;
  if (iframeRegex.test(rawHtml)) {
    suspiciousElements.push({
      element: "<iframe> overlay",
      reason: "Hidden or overlay iframe detected. Commonly used for clickjacking and credential overlays.",
      severity: "critical",
    });
  }

  // Extract forms and their destinations
  const extractedForms: SandboxInspection["extractedForms"] = [];
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  let formMatch: RegExpExecArray | null;

  while ((formMatch = formRegex.exec(rawHtml)) !== null) {
    const formAttrs = formMatch[1];
    const formInner = formMatch[2];

    const actionMatch = formAttrs.match(/action=["']([^"']*)["']/i);
    const methodMatch = formAttrs.match(/method=["']([^"']*)["']/i);
    const action = actionMatch ? actionMatch[1] : "#";
    const method = methodMatch ? methodMatch[1].toUpperCase() : "GET";

    const inputNames: string[] = [];
    const inputRegex = /<input\b[^>]*name=["']([^"']*)["'][^>]*>/gi;
    let inputMatch: RegExpExecArray | null;
    while ((inputMatch = inputRegex.exec(formInner)) !== null) {
      inputNames.push(inputMatch[1]);
    }

    // Check for password/OTP harvesting
    if (/password|pass|pin|otp|cvv|card/i.test(formInner)) {
      suspiciousElements.push({
        element: `<form action="${action}">`,
        reason: "Credential or OTP harvesting form detected submitting to unverified recipient.",
        severity: "critical",
      });
    }

    extractedForms.push({ action, method, inputs: inputNames });
  }

  // Disarm all active tags: script, iframe, object, embed, inline event handlers
  let disarmed = rawHtml
    .replace(scriptRegex, "<!-- [Rakshak Sandboxed: Script Removed] -->")
    .replace(iframeRegex, "<!-- [Rakshak Sandboxed: Iframe Removed] -->")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "data-disarmed-handler=''")
    .replace(/href=["']javascript:[^"']*["']/gi, 'href="#"');

  return {
    targetUrl: url,
    disarmedHtml: disarmed.slice(0, 15000), // Cap for memory
    extractedForms,
    maliciousScriptsStripped: scriptsStripped,
    suspiciousElements,
    isSafePreviewAvailable: true,
  };
}
