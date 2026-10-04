import "server-only";
import type { LiveSourceResult, LiveVerificationReport } from "@/types/intel";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-memory TTL caches: 30 minutes for blocklist feeds, 24 hours for RDAP/Wayback
const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCached<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// Timeout helper with AbortController
async function fetchWithTimeout(url: string, timeoutMs: number, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "Rakshak-ThreatIntel/1.0 (+https://rakshak.org)",
        Accept: "application/json, text/plain, */*",
        ...(options.headers || {}),
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 1. OpenPhish community feed check
 * Cached 30 minutes in memory. Checks if domain or full URL appears in the feed.
 */
async function checkOpenPhish(targetDomain: string, targetUrl?: string): Promise<LiveSourceResult> {
  const started = Date.now();
  const checkedAt = new Date().toISOString();
  const CACHE_KEY = "intel:feed:openphish";
  const FEED_TTL = 30 * 60 * 1000; // 30 min

  let feedUrls = getCached<string[]>(CACHE_KEY);
  if (!feedUrls) {
    try {
      const res = await fetchWithTimeout("https://openphish.com/feed.txt", 1200);
      if (res.ok) {
        const text = await res.text();
        feedUrls = text
          .split("\n")
          .map((line) => line.trim().toLowerCase())
          .filter(Boolean);
        setCached(CACHE_KEY, feedUrls, FEED_TTL);
      }
    } catch {
      // Offline fallback / timeout
    }
  }

  const latencyMs = Date.now() - started;
  if (!feedUrls) {
    return {
      source: "openphish",
      name: "OpenPhish Feed",
      status: "unavailable",
      checkedAt,
      summary: "Feed offline / timeout",
      latencyMs,
    };
  }

  const d = targetDomain.toLowerCase();
  const hit = feedUrls.some((u) => {
    try {
      const host = new URL(u.startsWith("http") ? u : `http://${u}`).hostname.replace(/^www\./, "");
      return host === d || host.endsWith("." + d);
    } catch {
      return u.includes(d);
    }
  });

  return {
    source: "openphish",
    name: "OpenPhish Threat Feed",
    status: hit ? "hit" : "clean",
    checkedAt,
    summary: hit ? "Active phishing URL match in threat database" : "No known active phishing listings found",
    latencyMs,
    details: { hit },
  };
}

/**
 * 2. RDAP (Registration Data Access Protocol)
 * Queries ICANN / IANA / registry bootstrap to determine domain creation date and age.
 * Cached for 24 hours.
 */
async function checkRDAP(domain: string): Promise<LiveSourceResult & { daysOld?: number }> {
  const started = Date.now();
  const checkedAt = new Date().toISOString();
  const CACHE_KEY = `intel:rdap:${domain.toLowerCase()}`;
  const RDAP_TTL = 24 * 60 * 60 * 1000; // 24 hours

  const cached = getCached<LiveSourceResult & { daysOld?: number }>(CACHE_KEY);
  if (cached) {
    return { ...cached, latencyMs: Date.now() - started };
  }

  try {
    // We query rdap.org which redirects to the authoritative RDAP server (e.g., Verisign, Registry.in)
    const res = await fetchWithTimeout(`https://rdap.org/domain/${encodeURIComponent(domain)}`, 1300);
    const latencyMs = Date.now() - started;

    if (!res.ok) {
      const resData: LiveSourceResult = {
        source: "rdap",
        name: "RDAP Registration",
        status: "unavailable",
        checkedAt,
        summary: `Lookup unavailable (HTTP ${res.status})`,
        latencyMs,
      };
      return resData;
    }

    const data = await res.json();
    const events: Array<{ eventAction: string; eventDate: string }> = data.events || [];
    const regEvent = events.find((e) =>
      ["registration", "created", "registered"].includes(e.eventAction?.toLowerCase())
    );

    let daysOld: number | undefined;
    let summary = "Domain registration date retrieved";
    let status: LiveSourceResult["status"] = "info";

    if (regEvent?.eventDate) {
      const createdTime = new Date(regEvent.eventDate).getTime();
      if (!isNaN(createdTime)) {
        daysOld = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
        if (daysOld < 7) {
          status = "hit";
          summary = `Registered recently: ${daysOld} day${daysOld === 1 ? "" : "s"} ago (High risk)`;
        } else if (daysOld < 30) {
          status = "info";
          summary = `Registered ${daysOld} days ago (New domain)`;
        } else {
          status = "clean";
          summary = `Established domain: ${Math.round(daysOld / 365 * 10) / 10} years old (${daysOld} days)`;
        }
      }
    }

    const result: LiveSourceResult & { daysOld?: number } = {
      source: "rdap",
      name: "RDAP Registration Registry",
      status,
      checkedAt,
      summary,
      daysOld,
      latencyMs,
      details: {
        registrationDate: regEvent?.eventDate,
        registrar: data.entities?.[0]?.vcardArray?.[1]?.[1]?.[3] || data.port43,
      },
    };

    setCached(CACHE_KEY, result, RDAP_TTL);
    return result;
  } catch {
    const latencyMs = Date.now() - started;
    return {
      source: "rdap",
      name: "RDAP Registration Registry",
      status: "unavailable",
      checkedAt,
      summary: "RDAP lookup timed out or service offline",
      latencyMs,
    };
  }
}

/**
 * 3. Wayback Machine (Internet Archive availability API)
 * Checks historical snapshots for credibility/longevity.
 * Cached for 24 hours.
 */
async function checkWayback(domain: string): Promise<LiveSourceResult & { snapshots?: number }> {
  const started = Date.now();
  const checkedAt = new Date().toISOString();
  const CACHE_KEY = `intel:wayback:${domain.toLowerCase()}`;
  const WAYBACK_TTL = 24 * 60 * 60 * 1000;

  const cached = getCached<LiveSourceResult & { snapshots?: number }>(CACHE_KEY);
  if (cached) {
    return { ...cached, latencyMs: Date.now() - started };
  }

  try {
    const res = await fetchWithTimeout(
      `https://archive.org/wayback/available?url=${encodeURIComponent(domain)}`,
      1200
    );
    const latencyMs = Date.now() - started;

    if (!res.ok) {
      return {
        source: "wayback",
        name: "Wayback Historical Archive",
        status: "unavailable",
        checkedAt,
        summary: "Archive unavailable",
        latencyMs,
      };
    }

    const data = await res.json();
    const snapshot = data.archived_snapshots?.closest;

    let status: LiveSourceResult["status"] = "clean";
    let summary = "Historical web footprint verified in internet archive";
    let snapshots = 1;

    if (!snapshot || !snapshot.available) {
      status = "info";
      summary = "No prior archive history found (Ephemeral / new footprint)";
      snapshots = 0;
    } else if (snapshot.timestamp) {
      const year = snapshot.timestamp.slice(0, 4);
      summary = `Archived since ${year} (${snapshot.timestamp.slice(0, 8)})`;
    }

    const result: LiveSourceResult & { snapshots?: number } = {
      source: "wayback",
      name: "Wayback Historical Archive",
      status,
      checkedAt,
      summary,
      snapshots,
      latencyMs,
      details: snapshot || {},
    };

    setCached(CACHE_KEY, result, WAYBACK_TTL);
    return result;
  } catch {
    const latencyMs = Date.now() - started;
    return {
      source: "wayback",
      name: "Wayback Historical Archive",
      status: "unavailable",
      checkedAt,
      summary: "Archive check timed out (offline degraded)",
      latencyMs,
    };
  }
}

/**
 * Top-level real live verification runner.
 * Bounded by a strict total 2000ms wall-clock budget.
 */
export async function runLiveVerification(
  domains: string[],
  urls: string[] = []
): Promise<LiveVerificationReport | undefined> {
  const primaryDomain = domains[0]?.toLowerCase().replace(/^www\./, "");
  if (!primaryDomain || primaryDomain === "localhost") {
    return undefined;
  }

  const primaryUrl = urls[0];
  const checkedAt = new Date().toISOString();

  // Run all 3 checks in parallel with a strict 2s hard timeout race
  const checksPromise = Promise.all([
    checkOpenPhish(primaryDomain, primaryUrl),
    checkRDAP(primaryDomain),
    checkWayback(primaryDomain),
  ]);

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Global budget exceeded")), 2000)
  );

  let sources: LiveSourceResult[] = [];
  try {
    const [openphish, rdap, wayback] = await Promise.race([checksPromise, timeoutPromise]);
    sources = [openphish, rdap, wayback];
  } catch {
    // If global budget pops, gather whatever succeeded or degrade honestly
    sources = [
      {
        source: "openphish",
        name: "OpenPhish Threat Feed",
        status: "unavailable",
        checkedAt,
        summary: "Check timed out (2s budget exceeded)",
        latencyMs: 2000,
      },
      {
        source: "rdap",
        name: "RDAP Registration Registry",
        status: "unavailable",
        checkedAt,
        summary: "Check timed out (2s budget exceeded)",
        latencyMs: 2000,
      },
      {
        source: "wayback",
        name: "Wayback Historical Archive",
        status: "unavailable",
        checkedAt,
        summary: "Check timed out (2s budget exceeded)",
        latencyMs: 2000,
      },
    ];
  }

  const hasBlocklistHit = sources.some((s) => s.source === "openphish" && s.status === "hit");
  const rdapResult = sources.find((s) => s.source === "rdap") as (LiveSourceResult & { daysOld?: number }) | undefined;
  const isNewlyRegistered = typeof rdapResult?.daysOld === "number" && rdapResult.daysOld < 7;
  const waybackResult = sources.find((s) => s.source === "wayback") as (LiveSourceResult & { snapshots?: number }) | undefined;

  return {
    checkedAt,
    targetDomain: primaryDomain,
    targetUrl: primaryUrl,
    sources,
    hasBlocklistHit,
    isNewlyRegistered,
    registrationDays: rdapResult?.daysOld,
    waybackSnapshots: waybackResult?.snapshots,
  };
}
