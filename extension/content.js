/**
 * Rakshak Shield — Client Content Script
 * Monitors page domain, forms, and keywords to inject real-time security warnings.
 */
(() => {
  const currentHostname = window.location.hostname.toLowerCase();

  // Known legitimate broker portals
  const AUTHENTIC_DOMAINS = [
    "zerodha.com",
    "groww.in",
    "angelone.in",
    "upstox.com",
    "icicidirect.com",
    "hdfcsec.com",
    "kotaksecurities.com",
    "sebi.gov.in",
    "rbi.org.in",
    "nseindia.com",
    "bseindia.com",
  ];

  // Check if current hostname is a known authentic domain
  const isAuthentic = AUTHENTIC_DOMAINS.some(
    (d) => currentHostname === d || currentHostname.endsWith("." + d)
  );

  // Check for suspicious typosquats (e.g. contains 'zerodha' or 'groww' but not authentic)
  const suspiciousBrandMatch = [
    "zerodha",
    "groww",
    "angelone",
    "upstox",
    "sebi",
    "rbi",
    "nse",
  ].find((b) => currentHostname.includes(b));

  if (suspiciousBrandMatch && !isAuthentic) {
    // Inject Rakshak Warning Banner
    const banner = document.createElement("div");
    banner.id = "rakshak-shield-alert";
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: #7f1d1d;
      color: #fef2f2;
      border-bottom: 2px solid #ef4444;
      padding: 12px 16px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;

    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">🚨</span>
        <div>
          <strong style="text-transform: uppercase; letter-spacing: 0.5px;">Rakshak Shield Warning:</strong>
          This website (<em>${currentHostname}</em>) impersonates <strong>${suspiciousBrandMatch.toUpperCase()}</strong>, but is NOT an authentic registered portal!
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <a href="https://rakshak-investor.vercel.app/investigate?url=${encodeURIComponent(window.location.href)}" 
           target="_blank" 
           style="background: #ef4444; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 11px;">
          Triage with Rakshak
        </a>
        <button id="rakshak-dismiss" style="background: transparent; border: 1px solid #fca5a5; color: white; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 11px;">
          Dismiss
        </button>
      </div>
    `;

    document.body.prepend(banner);
    document.getElementById("rakshak-dismiss")?.addEventListener("click", () => {
      banner.remove();
    });
  }
})();
