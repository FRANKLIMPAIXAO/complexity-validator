import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { authGuard, jsonResponse, getCorsHeaders } from "../_shared/utils.ts";

const ASAAS_BASE_URL = "https://www.asaas.com/api/v3";

async function asaasDelete(path: string, apiKey: string): Promise<Response> {
  return fetch(`${ASAAS_BASE_URL}${path}`, {
    method: "DELETE",
    headers: { "access_token": apiKey, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // 1. Autenticar usuário
  const { user, supabaseAdmin, error: authError } = await authGuard(req);
  if (!user) {
    return jsonResponse({ error: authError ?? "Não autenticado" }, 401, req);
  }

  const apiKey = Deno.env.get("ASAAS_API_KEY");
  if (!apiKey) {
    console.error("ASAAS_API_KEY não configurada");
    return jsonResponse({ error: "Integração de pagamento não configurada." }, 500, req);
  }

  try {
    // 2. Buscar o subscription ID do perfil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("asaas_subscription_id, subscription_status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "Perfil não encontrado." }, 404, req);
    }

    if (!profile.asaas_subscription_id) {
      return jsonResponse({ error: "Nenhuma assinatura ativa encontrada." }, 400, req);
    }

    if (profile.subscription_status === "cancelled") {
      return jsonResponse({ error: "Assinatura já cancelada." }, 400, req);
    }

    // 3. Cancelar assinatura na API do Asaas
    const cancelRes = await asaasDelete(
      `/subscriptions/${profile.asaas_subscription_id}`,
      apiKey,
    );

    if (!cancelRes.ok) {
      const errText = await cancelRes.text();
      console.error("Falha ao cancelar assinatura no Asaas:", errText);
      return jsonResponse({ error: "Falha ao cancelar assinatura no Asaas." }, 502, req);
    }

    // 4. Atualizar status no banco imediatamente (não depender só do webhook)
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erro ao atualizar status no banco:", updateError);
      // Assinatura foi cancelada no Asaas, mas falhou no banco — logar mas retornar sucesso
      // O webhook vai corrigir o banco eventualmente
      return jsonResponse({ success: true, warning: "Status será atualizado em breve." }, 200, req);
    }

    console.log(`asaas-cancel-subscription: user ${user.id} cancelou assinatura ${profile.asaas_subscription_id}`);
    return jsonResponse({ success: true }, 200, req);

  } catch (err) {
    console.error("asaas-cancel-subscription erro inesperado:", err);
    return jsonResponse({ error: "Erro interno ao cancelar assinatura." }, 500, req);
  }
});
