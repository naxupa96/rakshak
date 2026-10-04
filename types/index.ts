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
  | "emotional_manipulation";

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
