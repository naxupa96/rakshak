export type Lang = "en" | "hi" | "gu";

export type InputKind = "text" | "image" | "url" | "pdf" | "audio" | "video";

export type Severity = "critical" | "high" | "medium" | "low";

export type RiskLevel = "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";

export type TrustStatus = "verified" | "unknown" | "suspicious";

export type VerificationStatus =
  | "verified"
  | "requires_verification"
  | "contradicted"
  | "unverifiable"
  | "no_claim";

export type ContentContext =
  | "solicitation"
  | "educational"
  | "news"
  | "complaint"
  | "neutral";

export type EntityType =
  | "company"
  | "regulator"
  | "person"
  | "phone"
  | "email"
  | "url"
  | "domain"
  | "handle"
  | "amount"
  | "percent"
  | "payment"
  | "scheme"
  | "registration_no"
  | "date";

export type ClaimType =
  | "REGULATORY_APPROVAL"
  | "GOVERNMENT_AFFILIATION"
  | "GUARANTEED_RETURN"
  | "FIXED_RETURN"
  | "UNREALISTIC_RETURN"
  | "RISK_FREE"
  | "DOUBLE_MONEY"
  | "URGENT_OFFER"
  | "EXCLUSIVE_OPPORTUNITY"
  | "INSIDER_INFORMATION"
  | "CELEBRITY_ENDORSEMENT"
  | "PAST_PERFORMANCE"
  | "ZERO_LOSS"
  | "PRESSURE_TO_INVEST";

export type SignalId =
  | "guaranteed_return"
  | "unrealistic_return"
  | "risk_free"
  | "urgency"
  | "scarcity"
  | "upfront_payment"
  | "otp_request"
  | "credential_request"
  | "apk_request"
  | "regulatory_impersonation"
  | "government_impersonation"
  | "identity_ambiguity"
  | "suspicious_domain"
  | "mismatched_domain"
  | "social_only"
  | "unverifiable_claims"
  | "pressure_tactics"
  | "referral_pressure"
  | "secret_exclusive"
  | "emotional_manipulation"
  | "payment_link"
  | "pump_and_dump"
  | "coercive_arrest"
  | "mule_vpa"
  | "suspicious_intermediary";

export interface ImpersonationComparison {
  claimedName: string;
  claimedRegistration?: string;
  matchedEntity: {
    name: string;
    registrationNo: string;
    category: string;
    officialDomain: string;
    officialHelpline: string;
    similarityScore: number;
    matchType: "exact" | "typosquat" | "fictitious_number" | "unregistered";
  };
  disparities: {
    field: string;
    claimed: string;
    official: string;
    verdict: "match" | "mismatch" | "unverified";
  }[];
}

export interface ComplaintDossier {
  incidentId: string;
  generatedAt: string;
  evidenceHash: string;
  portalTarget: "SEBI_SCORES" | "NATIONAL_CYBERCRIME_1930" | "RBI_CMS";
  subject: string;
  complaintText: string;
  extractedSuspects: {
    domains: string[];
    phones: string[];
    vpas: string[];
    handles: string[];
  };
}

export interface IfscMatch {
  code: string;
  bankName: string;
  bankCode: string;
  branch: string;
  state?: string;
  isKnownMuleZone: boolean;
  muleZoneName?: string;
  riskNotice?: string;
}

export interface PsychologicalStage {
  stage: "hook" | "authority" | "urgency" | "exfiltration";
  label: string;
  biasWeaponized: string;
  detectedQuote: string;
  explanation: string;
}

export interface QrExtraction {
  hasQr: boolean;
  payloadType?: "upi" | "url" | "text" | "phone";
  rawPayload?: string;
  decodedTarget?: string;
  riskNotice?: string;
}

export interface SandboxInspection {
  targetUrl: string;
  disarmedHtml?: string;
  extractedForms: { action: string; method: string; inputs: string[] }[];
  maliciousScriptsStripped: number;
  suspiciousElements: { element: string; reason: string; severity: "critical" | "high" | "medium" }[];
  isSafePreviewAvailable: boolean;
}

export interface DangerousPermissionInfo {
  permission: string;
  name: string;
  category: "sms" | "accessibility" | "remote_control" | "overlay" | "storage" | "installer";
  severity: "critical" | "high" | "medium";
  description: string;
  trojanPattern: string;
}

export interface ApkInspection {
  isApk: boolean;
  packageName?: string;
  versionName?: string;
  detectedPermissions: DangerousPermissionInfo[];
  criticalPermissionsCount: number;
  highPermissionsCount: number;
  isBankingTrojanLikelihood: "high" | "moderate" | "low" | "none";
  identifiedRisks: string[];
  securityAdvisories: string[];
}

export interface PdfForensicReport {
  isPdf: boolean;
  producer?: string;
  creator?: string;
  title?: string;
  author?: string;
  creationDate?: string;
  modDate?: string;
  hasDigitalSignature: boolean;
  signatureStandard?: string;
  isSuspiciousGenerator: boolean;
  claimedIssuer?: string;
  verdict: "authentic_certified" | "suspicious_forgery" | "unverified_document";
  tamperIndicators: string[];
}

export interface VpaProbeResult {
  vpa: string;
  handle: string;
  pspBank: string;
  accountType: "P2M_MERCHANT" | "P2P_INDIVIDUAL" | "SUSPICIOUS_MULE" | "UNKNOWN";
  claimedEntity?: string;
  entityMatchVerdict: "OFFICIAL_MERCHANT_MATCH" | "MISMATCHED_PERSONAL_ACCOUNT" | "UNREGISTERED_BURNER_WALLET";
  riskFlag: boolean;
  advisory: string;
}

export interface AudioForensicReport {
  isAudio: boolean;
  fileName?: string;
  durationSec?: number;
  syntheticLikelihood: "high" | "moderate" | "low" | "natural";
  roboticCadenceScore: number; // 0-100
  pitchVarianceScore: number;  // 0-100
  ambientNoiseFloorDb: number; // e.g. -65dB (extremely clean = generator artifact)
  detectedVoiceAnomalies: string[];
  verdict: "likely_deepfake_clone" | "suspicious_synthetic_audio" | "authentic_natural_voice";
}

export interface CryptoWalletTrace {
  address: string;
  chain: "TRON_TRC20" | "ETHEREUM_ERC20" | "BITCOIN" | "UNKNOWN";
  assetSymbol: "USDT" | "BTC" | "ETH" | "CRYPTO";
  isKnownMixerOrMule: boolean;
  clusterTag?: string;
  riskScore: number;
  flags: string[];
  recommendedAction: string;
}

export interface MuleHopNode {
  id: string;
  label: string;
  category: "victim" | "layer1_mule" | "layer2_aggregator" | "p2p_crypto_offramp" | "illicit_mixer";
  institution: string;
  accountOrAddress: string;
  location?: string;
  flaggedZone?: string;
}

export interface MuleHopGraph {
  incidentId: string;
  nodes: MuleHopNode[];
  edges: {
    from: string;
    to: string;
    amount?: string;
    channel: "IMPS" | "UPI" | "RTGS" | "CRYPTO_P2P" | "USDT_TRANSFER";
    latencyMinutes: number;
  }[];
  totalLayeringMinutes: number;
  estimatedLienWindowMinutes: number;
}

export interface StixBundle {
  type: "bundle";
  id: string;
  spec_version: "2.1";
  objects: Array<{
    type: string;
    id: string;
    spec_version?: string;
    created?: string;
    modified?: string;
    name?: string;
    description?: string;
    pattern?: string;
    pattern_type?: string;
    valid_from?: string;
    source_ref?: string;
    target_ref?: string;
    relationship_type?: string;
    labels?: string[];
    [key: string]: unknown;
  }>;
}

export type GraphNodeKind =
  | "entity"
  | "claim"
  | "regulator"
  | "website"
  | "phone"
  | "payment"
  | "source"
  | "evidence";

export type GraphEdgeLabel =
  | "CLAIMS"
  | "CLAIMS APPROVAL FROM"
  | "CONTACTS VIA"
  | "LINKS TO"
  | "REQUESTS PAYMENT"
  | "MENTIONED IN"
  | "ASSOCIATED WITH"
  | "SUPPORTED BY";

export interface LocalizedText {
  en: string;
  hi: string;
  gu: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  value: string;
  confidence: number;
  /** Exact substring in the source content this entity was found in. */
  quote: string;
  trustStatus: TrustStatus;
  /** Short machine note used to explain the trust status at render time. */
  noteKey?: string;
}

export interface Claim {
  id: string;
  type: ClaimType;
  /** Verbatim quote from the source content. */
  quote: string;
  /** English-normalised statement of what is being claimed. */
  statement: string;
  confidence: number;
  verification: VerificationStatus;
  evidenceKey?: string;
}

export interface Signal {
  id: SignalId;
  severity: Severity;
  confidence: number;
  /** Verbatim quotes from the source content that triggered the signal. */
  evidence: string[];
  /** 0-100 contribution this signal makes inside its own severity class. */
  weight: number;
}

export interface EvidenceItem {
  id: string;
  subject: string;
  /** Key into the localization dictionary (rendered at display time). */
  statementKey: string;
  params?: Record<string, string>;
  quote?: string;
  status: "confirmed" | "requires_verification" | "contradicted" | "unverifiable";
  strength: "strong" | "moderate" | "weak";
}

export interface RiskFactor {
  id:
    | "deceptive_signals"
    | "solicitation"
    | "verification_gap"
    | "source_credibility"
    | "pressure";
  points: number;
  weight: number;
  contribution: number;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  /** Multiplier applied for educational / non-soliciting content. */
  contextMultiplier: number;
  context: ContentContext;
}

export interface TrustDimension {
  id: "identity" | "claims" | "source" | "payment" | "evidence";
  score: number;
}

export interface TrustAssessment {
  overall: number;
  dimensions: TrustDimension[];
}

export interface SafetyAction {
  id: string;
  phase: "before" | "paid" | "report";
  /** "avoid" = something not to do, "do" = something to do. */
  kind: "avoid" | "do";
  textKey: string;
}

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  status: TrustStatus;
  primary?: boolean;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: GraphEdgeLabel;
}

export interface TrustGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface WhyItem {
  id: string;
  /** Ranking source: signal id, claim id or evidence id. */
  sourceId: string;
  sourceKind: "signal" | "claim" | "evidence" | "context";
  severity: Severity | "info";
  score: number;
  quote?: string;
  params?: Record<string, string>;
}

export interface NormalizedContent {
  text: string;
  urls: string[];
  domains: string[];
  phones: string[];
  emails: string[];
  amounts: string[];
  percents: string[];
  hasHttp: boolean;
  charCount: number;
  wordCount: number;
}

export interface PipelineStage {
  id: string;
  status: "done" | "skipped" | "failed";
}

import type { LiveVerificationReport } from "./intel";
export * from "./intel";

export interface AnalysisReport {
  id: string;
  createdAt: string;
  language: Lang;
  simple: boolean;
  input: {
    kind: InputKind;
    /** Raw text as provided/extracted, kept only for this session. */
    text: string;
    excerpt: string;
    fileName?: string;
    url?: string;
    ocrConfidence?: number;
  };
  normalized: NormalizedContent;
  context: ContentContext;
  entities: Entity[];
  claims: Claim[];
  signals: Signal[];
  risk: RiskAssessment;
  trust: TrustAssessment;
  evidence: EvidenceItem[];
  why: WhyItem[];
  actions: SafetyAction[];
  graph: TrustGraph;
  uncertainties: string[];
  confidence: number;
  /** True when a language model contributed extra extraction. */
  usedLlm: boolean;
  insufficientEvidence: boolean;
  pipeline: PipelineStage[];
  live?: LiveVerificationReport;
  comparison?: ImpersonationComparison;
  dossier?: ComplaintDossier;
  ifsc?: IfscMatch;
  psychology?: PsychologicalStage[];
  qr?: QrExtraction;
  sandbox?: SandboxInspection;
  apk?: ApkInspection;
  pdfForensics?: PdfForensicReport;
  vpaProbe?: VpaProbeResult[];
  audioForensics?: AudioForensicReport;
  cryptoTrace?: CryptoWalletTrace[];
  muleGraph?: MuleHopGraph;
}

export interface AnalyzeRequest {
  kind: InputKind;
  text?: string;
  url?: string;
  lang?: Lang;
  simple?: boolean;
  demo?: string;
  /** OCR confidence (0-100) when the text came from an image. */
  ocrConfidence?: number;
}

export interface AnalyzeError {
  error: string;
  code:
    | "EMPTY_INPUT"
    | "INVALID_URL"
    | "OCR_FAILED"
    | "UNSUPPORTED"
    | "TOO_LARGE"
    | "INTERNAL";
}
