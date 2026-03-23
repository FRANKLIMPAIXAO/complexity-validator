import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Eventos Asaas que ativam a assinatura
const ACTIVATION_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
// Eventos Asaas que cancelam a assinatura
const CANCELLATION_EVENTS = new Set(["SUBSCRIPTION_DELETED"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function jsonResp(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResp({ error: "Method not allowed" }, 405);
  }

  // Parse do payload
  let event: {
    event: string;
    payment?: { id: string; customer: string; subscription?: string; status?: string };
    subscription?: { id: string; customer: string; status?: string };
  };

  try {
    event = await req.json();
  } catch {
    return jsonResp({ error: "Invalid JSON" }, 400);
  }

  const eventType: string = event.event ?? "";
  console.log("asaas-webhook:", eventType, JSON.stringify(event));

  // Resolver customer ID a partir do payload
  const customerId: string | undefined =
    event.payment?.customer ?? event.subscription?.customer;

  if (!customerId) {
    console.warn("asaas-webhook: sem customer ID no evento, ignorando:", eventType);
    return jsonResp({ received: true });
  }

  const isActivation = ACTIVATION_EVENTS.has(eventType);
  const isCancellation = CANCELLATION_EVENTS.has(eventType);

  // Eventos que não afetam status: reconhecer e ignorar
  if (!isActivation && !isCancellation) {
    return jsonResp({ received: true });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Buscar profile pelo asaas_customer_id
  const { data: profile, error: lookupError } = await supabaseAdmin
    .from("profiles")
    .select("id, subscription_status")
    .eq("asaas_customer_id", customerId)
    .maybeSingle();

  if (lookupError) {
    console.error("asaas-webhook: erro ao buscar profile:", lookupError);
    return jsonResp({ error: "DB lookup failed" }, 500);
  }

  if (!profile) {
    console.warn("asaas-webhook: nenhum profile para customer:", customerId);
    return jsonResp({ received: true });
  }

  const newStatus = isActivation ? "active" : "cancelled";

  // Idempotência: não atualizar se já está no status correto
  if (profile.subscription_status === newStatus) {
    return jsonResp({ received: true, note: "status já atualizado" });
  }

  const updatePayload: Record<string, unknown> = {
    subscription_status: newStatus,
    updated_at: new Date().toISOString(),
  };

  // Na ativação: limpar trial para o TrialBanner não exibir mais
  if (isActivation) {
    updatePayload.trial_expires_at = null;
  }

  // Persistir subscription ID se disponível no evento
  if (event.payment?.subscription) {
    updatePayload.asaas_subscription_id = event.payment.subscription;
  }

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update(updatePayload)
    .eq("id", profile.id);

  if (updateError) {
    console.error("asaas-webhook: erro ao atualizar profile:", updateError);
    return jsonResp({ error: "Failed to update subscription status" }, 500);
  }

  console.log(`asaas-webhook: profile ${profile.id} → subscription_status=${newStatus}`);
  return jsonResp({ received: true });
});
