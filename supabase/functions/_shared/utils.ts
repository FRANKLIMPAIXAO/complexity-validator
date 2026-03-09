// ============================================================
// PRAXIS — Utilitários compartilhados para Edge Functions
// ============================================================
// Importar em cada function com:
//   import { corsHeaders, authGuard, callAI, parseAIJson } from "../_shared/utils.ts";
// ============================================================

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ------------------------------------------------------------------
// CORS: permite Supabase Studio + domínios configurados via env
// ------------------------------------------------------------------
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const isAllowed =
    ALLOWED_ORIGINS.length === 0 ||           // sem restrição configurada
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith(".supabase.co") ||         // Supabase Studio
    origin.endsWith(".lovable.app") ||         // Lovable preview
    origin.endsWith(".lovableproject.com");    // Lovable produção

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version",
    "Access-Control-Max-Age": "86400",
  };
}

export function jsonResponse(
  body: unknown,
  status = 200,
  req: Request,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

// ------------------------------------------------------------------
// AUTH GUARD: valida JWT e retorna user autenticado
// Substitui o uso depreciado de getClaims()
// ------------------------------------------------------------------
export interface AuthResult {
  user: { id: string; email?: string } | null;
  supabaseAdmin: SupabaseClient;
  error?: string;
}

export async function authGuard(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, supabaseAdmin: null as unknown as SupabaseClient, error: "Não autenticado" };
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { user: null, supabaseAdmin, error: "Token inválido ou expirado" };
  }

  return { user, supabaseAdmin };
}

// ------------------------------------------------------------------
// RATE LIMITING: verifica e incrementa contagem via função SQL
// ------------------------------------------------------------------
export async function checkRateLimit(
  supabaseAdmin: SupabaseClient,
  userId: string,
  endpoint: string,
  maxCalls = 10,
  windowMinutes = 60,
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc("check_and_increment_rate_limit", {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_max_calls: maxCalls,
      p_window_min: windowMinutes,
    });
    if (error) {
      console.error("Rate limit check error:", error);
      return true; // Fail open: deixa passar se der erro de DB
    }
    return data === true;
  } catch (err) {
    console.error("Rate limit unexpected error:", err);
    return true; // Fail open
  }
}

// ------------------------------------------------------------------
// AI CALL: chama o gateway de IA com timeout e tratamento de erros
// ------------------------------------------------------------------
const AI_GATEWAY = "https://api.openai.com/v1/chat/completions";
const AI_TIMEOUT_MS = 25_000; // 25 segundos

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICallOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function callAI(
  messages: AIChatMessage[],
  options: AICallOptions = {},
): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(AI_GATEWAY, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model ?? "gpt-4o-mini",
        messages,
        temperature: options.temperature ?? 0.7,
        ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI API Error details:", {
        status: response.status,
        body: text,
        gateway: AI_GATEWAY
      });
      if (response.status === 429) throw new AIError("RATE_LIMIT", 429, text);
      if (response.status === 402) throw new AIError("INSUFFICIENT_CREDITS", 402, text);
      throw new AIError("GATEWAY_ERROR", response.status, text);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    if (err instanceof AIError) throw err;
    if ((err as Error).name === "AbortError") throw new AIError("TIMEOUT", 504);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export class AIError extends Error {
  constructor(
    public readonly code: "RATE_LIMIT" | "INSUFFICIENT_CREDITS" | "GATEWAY_ERROR" | "TIMEOUT",
    public readonly status: number,
    public readonly details?: string
  ) {
    super(code);
    this.name = "AIError";
  }

  toResponse(req: Request): Response {
    const messages: Record<AIError["code"], string> = {
      RATE_LIMIT: "Limite de requisições excedido. Aguarde alguns minutos.",
      INSUFFICIENT_CREDITS: "Créditos de IA insuficientes.",
      GATEWAY_ERROR: `Erro na OpenAI: ${this.details || "Desconhecido"}`,
      TIMEOUT: "Análise demorou mais que o esperado. Tente novamente.",
    };
    return jsonResponse({ error: messages[this.code] }, this.status, req);
  }
}

// ------------------------------------------------------------------
// JSON PARSER: extrai JSON da resposta da IA (com fallback)
// ------------------------------------------------------------------
export function parseAIJson<T>(content: string, fallback: T): T {
  try {
    // Tenta extrair JSON de blocos de código markdown
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const raw = fenced ? fenced[1] : content.trim();
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
