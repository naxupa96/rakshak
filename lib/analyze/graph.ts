import type { Claim, Entity, EvidenceItem, GraphEdge, GraphNode, TrustGraph, InputKind } from "@/types";

function short(value: string, max = 26): string {
  return value.length > max ? value.slice(0, max - 1).trimEnd() + "…" : value;
}

function nodeKind(type: Entity["type"]): GraphNode["kind"] {
  switch (type) {
    case "regulator":
      return "regulator";
    case "url":
    case "domain":
      return "website";
    case "phone":
    case "handle":
      return "phone";
    case "payment":
    case "amount":
      return "payment";
    default:
      return "entity";
  }
}

const CLAIM_LABEL: Partial<Record<Claim["type"], string>> = {
  REGULATORY_APPROVAL: "REGULATORY CLAIM",
  GOVERNMENT_AFFILIATION: "GOVERNMENT LINK",
  GUARANTEED_RETURN: "GUARANTEED RETURN",
  UNREALISTIC_RETURN: "RETURN CLAIM",
  RISK_FREE: "RISK-FREE CLAIM",
};

export function buildGraph(args: {
  kind: InputKind;
  entities: Entity[];
  claims: Claim[];
  evidence: EvidenceItem[];
  hasAmount: boolean;
}): TrustGraph {
  const { entities, claims, evidence } = args;

  const host = entities.find((e) => e.type === "domain" || e.type === "url");
  const nodes: GraphNode[] = [
    {
      id: "src",
      kind: "source",
      label: host ? short(host.value.replace(/^https?:\/\//, "")) : args.kind,
      status: "unknown",
      primary: true,
    },
  ];
  const edges: GraphEdge[] = [];
  let edgeSeq = 0;
  const link = (from: string, to: string, label: GraphEdge["label"]) => {
    if (edges.length >= 14) return;
    if (from === to) return;
    if (edges.some((e) => e.from === from && e.to === to)) return;
    edges.push({ id: `ge_${edgeSeq++}`, from, to, label });
  };

  const picked = entities
    .filter((e) => e.type !== "registration_no" && e.type !== "percent" && e.type !== "date" && e.type !== "scheme")
    .slice(0, 9);

  for (const e of picked) {
    if (nodes.some((n) => n.id === e.id)) continue;
    nodes.push({ id: e.id, kind: nodeKind(e.type), label: short(e.value), status: e.trustStatus });
    link("src", e.id, "MENTIONED IN");
  }

  const primary =
    picked.find((e) => e.type === "company") ??
    picked.find((e) => e.type === "person") ??
    picked.find((e) => e.type === "handle") ??
    picked[0];
  if (primary) nodes.find((n) => n.id === primary.id)!.primary = true;

  const focus = primary?.id ?? "src";
  const websites = picked.filter((e) => e.type === "url" || e.type === "domain");
  const contacts = picked.filter((e) => e.type === "phone" || e.type === "handle" || e.type === "email");
  const payments = picked.filter((e) => e.type === "payment" || e.type === "amount");
  const regulator = picked.find((e) => e.type === "regulator");
  const rest = picked.filter((e) => e !== primary);

  for (const w of websites) link(focus, w.id, "LINKS TO");
  for (const c of contacts.slice(0, 3)) link(focus, c.id, "CONTACTS VIA");
  if (args.hasAmount) for (const p of payments.slice(0, 2)) link(focus, p.id, "REQUESTS PAYMENT");

  const claimNodes = claims.slice(0, 6);
  for (const c of claimNodes) {
    nodes.push({
      id: c.id,
      kind: "claim",
      label: CLAIM_LABEL[c.type] ?? "CLAIM",
      status: "unknown",
    });
    link(focus, c.id, "CLAIMS");
  }

  const approvalClaim = claims.find((c) => c.type === "REGULATORY_APPROVAL" || c.type === "GOVERNMENT_AFFILIATION");
  if (approvalClaim && regulator) link(approvalClaim.id, regulator.id, "CLAIMS APPROVAL FROM");
  else if (approvalClaim && regulator === undefined) {
    const regEntity = entities.find((e) => e.type === "regulator");
    if (regEntity) link(approvalClaim.id, regEntity.id, "CLAIMS APPROVAL FROM");
  }

  const proven = evidence.filter((e) => e.status === "contradicted" && e.strength !== "weak").slice(0, 3);
  for (const p of proven) {
    nodes.push({ id: p.id, kind: "evidence", label: short(p.subject), status: "suspicious" });
    link(focus, p.id, "SUPPORTED BY");
  }

  for (const r of rest.slice(0, 4)) link(focus, r.id, "ASSOCIATED WITH");

  return { nodes, edges };
}
