import type { Claim, ClaimType, Entity, EntityType } from "@/types";

export interface AugmentationResult {
  entities: Entity[];
  claims: Claim[];
  used: boolean;
}

const ENTITY_TYPES: EntityType[] = [
  "company", "regulator", "person", "phone", "email", "url", "domain",
  "handle", "amount", "percent", "payment", "scheme", "registration_no", "date",
];

const CLAIM_TYPES: ClaimType[] = [
  "REGULATORY_APPROVAL", "GOVERNMENT_AFFILIATION", "GUARANTEED_RETURN", "FIXED_RETURN",
  "UNREALISTIC_RETURN", "RISK_FREE", "DOUBLE_MONEY", "URGENT_OFFER",
  "EXCLUSIVE_OPPORTUNITY", "INSIDER_INFORMATION", "CELEBRITY_ENDORSEMENT",
  "PAST_PERFORMANCE", "ZERO_LOSS", "PRESSURE_TO_INVEST",
];

const SYSTEM = `You are the extraction layer of a fraud-analysis tool for Indian financial messages.
Return ONLY minified JSON of the shape:
{"entities":[{"type":"<entity type>","value":"<short text>","confidence":0.9}],"claims":[{"type":"<claim type>","quote":"<verbatim excerpt>","confidence":0.9}]}
Rules: use only the allowed type values; quotes must be copied verbatim from the input; never add advice or commentary; output no markdown.`;

function endpoint(): { url: string; kind: "openai" | "anthropic"; key: string } | null {
  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    return {
      url: `${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`,
      kind: "openai",
      key: openai,
    };
  }
  const anthropic = process.env.ANTHROPIC_API_KEY;
  if (anthropic) {
    return { url: "https://api.anthropic.com/v1/messages", kind: "anthropic", key: anthropic };
  }
  const generic = process.env.LLM_API_KEY;
  if (generic) {
    return {
      url: `${process.env.LLM_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`,
      kind: "openai",
      key: generic,
    };
  }
  return null;
}

async function callModel(text: string): Promise<string> {
  const target = endpoint();
  if (!target) throw new Error("no_key");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const body =
      target.kind === "anthropic"
        ? {
            model: process.env.LLM_MODEL ?? "claude-sonnet-4-5",
            max_tokens: 900,
            system: SYSTEM,
            messages: [{ role: "user", content: text.slice(0, 6000) }],
          }
        : {
            model: process.env.LLM_MODEL ?? "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: 0,
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: text.slice(0, 6000) },
            ],
          };

    const res = await fetch(target.url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${target.key}`,
        ...(target.kind === "anthropic" ? { "x-api-key": target.key, "anthropic-version": "2023-06-01" } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`http_${res.status}`);
    const json = (await res.json()) as {
      choices?: { message: { content: string } }[];
      content?: { text: string }[];
    };
    const content =
      target.kind === "anthropic"
        ? json.content?.map((c) => c.text).join("") ?? ""
        : json.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("empty");
    return content;
  } finally {
    clearTimeout(timer);
  }
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no_json");
  return JSON.parse(trimmed.slice(start, end + 1));
}

let llmCounter = 0;

/**
 * Optional model-assisted extraction. Runs server-side only, and any failure
 * silently falls back to the deterministic engine — the report stays usable.
 */
export async function augmentWithLlm(args: {
  text: string;
  entities: Entity[];
  claims: Claim[];
}): Promise<AugmentationResult> {
  const { text, entities, claims } = args;
  if (!endpoint()) return { entities, claims: [], used: false };
  if (text.trim().length < 60) return { entities, claims: [], used: false };

  try {
    const raw = await callModel(text);
    const data = extractJson(raw) as {
      entities?: { type?: string; value?: string; confidence?: number }[];
      claims?: { type?: string; quote?: string; confidence?: number }[];
    };

    const knownValues = new Set(entities.map((e) => e.value.toLowerCase()));
    const addedEntities: Entity[] = [];
    for (const item of (data.entities ?? []).slice(0, 12)) {
      const value = (item.value ?? "").trim().slice(0, 80);
      if (!value || !ENTITY_TYPES.includes(item.type as EntityType)) continue;
      if (knownValues.has(value.toLowerCase())) continue;
      knownValues.add(value.toLowerCase());
      llmCounter = (llmCounter + 1) % 1_000_000;
      addedEntities.push({
        id: `en_llm_${llmCounter}`,
        type: item.type as EntityType,
        value,
        confidence: Math.max(0.4, Math.min(1, Number(item.confidence) || 0.7)),
        quote: value,
        trustStatus: "unknown",
      });
    }

    const knownTypes = new Set(claims.map((c) => c.type));
    const addedClaims: Claim[] = [];
    for (const item of (data.claims ?? []).slice(0, 8)) {
      const quote = (item.quote ?? "").trim().slice(0, 240);
      if (!quote || !CLAIM_TYPES.includes(item.type as ClaimType)) continue;
      if (knownTypes.has(item.type as ClaimType)) continue;
      if (!text.includes(quote.slice(0, 30))) continue;
      knownTypes.add(item.type as ClaimType);
      llmCounter = (llmCounter + 1) % 1_000_000;
      addedClaims.push({
        id: `clm_llm_${llmCounter}`,
        type: item.type as ClaimType,
        quote,
        statement: quote,
        confidence: Math.max(0.4, Math.min(1, Number(item.confidence) || 0.7)),
        verification: "requires_verification",
      });
    }

    return {
      entities: [...entities, ...addedEntities],
      claims: addedClaims,
      used: true,
    };
  } catch {
    return { entities, claims: [], used: false };
  }
}
