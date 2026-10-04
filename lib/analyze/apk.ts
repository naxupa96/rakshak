import { ApkInspection, DangerousPermissionInfo } from "@/types";

export const DANGEROUS_PERMISSIONS_DB: Record<string, Omit<DangerousPermissionInfo, "permission">> = {
  "android.permission.RECEIVE_SMS": {
    name: "Intercept Incoming SMS",
    category: "sms",
    severity: "critical",
    description: "Allows the application to intercept banking OTPs, 2FA codes, and debit alert notifications in real-time.",
    trojanPattern: "Banking Trojan (Jamtara / Mewat OTP Stealer)",
  },
  "android.permission.READ_SMS": {
    name: "Read SMS Inbox",
    category: "sms",
    severity: "critical",
    description: "Reads past banking SMS messages, balance disclosures, and credential reset tokens.",
    trojanPattern: "Financial Profiling & Credential Harvesting",
  },
  "android.permission.SEND_SMS": {
    name: "Silent SMS Exfiltration",
    category: "sms",
    severity: "critical",
    description: "Sends outbound SMS without user confirmation to premium numbers or remote command-and-control servers.",
    trojanPattern: "SIM Swapping / Unsolicited Subscription Scam",
  },
  "android.permission.BIND_ACCESSIBILITY_SERVICE": {
    name: "Full Device Accessibility Hijack",
    category: "accessibility",
    severity: "critical",
    description: "Grants absolute programmatic control over screen tapping, text input logging (keylogger), and automatic dialog dismissal.",
    trojanPattern: "Hydra / Anatsa / TeaBot RAT Framework",
  },
  "android.permission.SYSTEM_ALERT_WINDOW": {
    name: "Screen Overlay Injection",
    category: "overlay",
    severity: "high",
    description: "Draws fake floating login windows directly over genuine banking apps (SBI YONO, HDFC MobileBanking, Zerodha Kite).",
    trojanPattern: "Fake Phishing Screen Overlay",
  },
  "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE": {
    name: "Notification Interception",
    category: "sms",
    severity: "critical",
    description: "Captures UPI push notifications and OTP popups before the user notices them.",
    trojanPattern: "UPI Alert Suppressor & Sniffer",
  },
  "android.permission.REQUEST_INSTALL_PACKAGES": {
    name: "Silent Dropper / Secondary Payload",
    category: "installer",
    severity: "high",
    description: "Allows the APK to download and install secondary malicious modules without Google Play Protect scanning.",
    trojanPattern: "Two-stage Trojan Dropper",
  },
  "android.permission.READ_CALL_LOG": {
    name: "Read Call Logs",
    category: "remote_control",
    severity: "medium",
    description: "Monitors outgoing and incoming calls to detect communication with police (1930) or bank helplines.",
    trojanPattern: "Helpline Counter-Evasion",
  },
  "android.permission.CALL_PHONE": {
    name: "Call Forwarding Hijack",
    category: "remote_control",
    severity: "high",
    description: "Can silently dial *21* or **62* call forwarding codes to redirect voice OTPs to scammers.",
    trojanPattern: "Voice OTP Forwarding Attack",
  },
};

/**
 * Inspect an APK payload or manifest string to detect dangerous permissions and banking trojan signatures.
 * Works synchronously and handles both raw text extracted from manifests / decompiled files or mock APK inspection.
 */
export function inspectApkPayload(textOrManifest: string): ApkInspection {
  const detectedPermissions: DangerousPermissionInfo[] = [];

  // Match standard permission format or XML attributes
  for (const [permKey, info] of Object.entries(DANGEROUS_PERMISSIONS_DB)) {
    const regexPattern = new RegExp(
      permKey.replace(/\./g, "\\.") + "|android:name=[\"']" + permKey.replace(/\./g, "\\.") + "[\"']",
      "i"
    );
    if (regexPattern.test(textOrManifest)) {
      detectedPermissions.push({
        permission: permKey,
        ...info,
      });
    }
  }

  // Look for package name in manifest text if available
  const pkgMatch = textOrManifest.match(/package\s*=\s*["']([a-zA-Z0-9._]+)["']/i);
  const packageName = pkgMatch ? pkgMatch[1] : undefined;

  const versionMatch = textOrManifest.match(/versionName\s*=\s*["']([a-zA-Z0-9._]+)["']/i);
  const versionName = versionMatch ? versionMatch[1] : undefined;

  const criticalCount = detectedPermissions.filter((p) => p.severity === "critical").length;
  const highCount = detectedPermissions.filter((p) => p.severity === "high").length;

  let isBankingTrojanLikelihood: "high" | "moderate" | "low" | "none" = "none";
  const identifiedRisks: string[] = [];
  const securityAdvisories: string[] = [];

  if (criticalCount >= 2 || (criticalCount >= 1 && highCount >= 1)) {
    isBankingTrojanLikelihood = "high";
    identifiedRisks.push("Synergistic Banking RAT signature detected: Intercepts SMS OTPs and possesses accessibility/overlay privileges.");
    identifiedRisks.push("Capable of credential exfiltration and automatic unauthorized fund transfers via UPI.");
    securityAdvisories.push("DO NOT install or grant requested accessibility or notification permissions.");
    securityAdvisories.push("If already installed, disconnect phone from Wi-Fi/Mobile Data immediately and boot into Android Safe Mode to uninstall.");
  } else if (criticalCount === 1 || highCount >= 1) {
    isBankingTrojanLikelihood = "moderate";
    identifiedRisks.push("Excessive dangerous permissions requested that are atypical for legitimate utility or investment applications.");
    securityAdvisories.push("Verify application identity strictly via Google Play Store rather than side-loaded APK links.");
  } else if (detectedPermissions.length > 0) {
    isBankingTrojanLikelihood = "low";
    identifiedRisks.push("Standard Android runtime permissions requested.");
  }

  return {
    isApk: detectedPermissions.length > 0 || /AndroidManifest|\.apk\b/i.test(textOrManifest),
    packageName,
    versionName,
    detectedPermissions,
    criticalPermissionsCount: criticalCount,
    highPermissionsCount: highCount,
    isBankingTrojanLikelihood,
    identifiedRisks,
    securityAdvisories,
  };
}
