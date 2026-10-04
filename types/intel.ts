export interface LiveSourceResult {
  source: "openphish" | "rdap" | "wayback";
  name: string;
  status: "hit" | "clean" | "info" | "unavailable";
  checkedAt: string; // ISO string
  summary: string;
  details?: Record<string, unknown>;
  latencyMs: number;
}

export interface LiveVerificationReport {
  checkedAt: string;
  targetDomain?: string;
  targetUrl?: string;
  sources: LiveSourceResult[];
  hasBlocklistHit: boolean;
  isNewlyRegistered: boolean; // < 7 days
  registrationDays?: number;
  waybackSnapshots?: number;
}
