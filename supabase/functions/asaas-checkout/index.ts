import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { authGuard, jsonResponse, getCorsHeaders } from "../_shared/utils.ts";

const ASAAS_BASE_URL = "https://www.asaas.com/api/v3";

const PLAN_CONFIG = {
  monthly: { value: 49.00, cycle: "MONTHLY", description: "PRAXIS - Plano Mensal" },
  yearly:  { value: 297.00, cycle: "YEARLY",  description: "PRAXIS - Plano Anual"  },
} as const;

type PlanId = keyof typeof PLAN_CONFIG;

async function asaasGet(path: string, apiKey: string): Promise<Response> {
  return fetch(`${ASAAS_BASE_URL}${path}`, {
    headers: { "access_token": apiKey, "Content-Type": "application/json" },
  });
}

async function asaasPost(path: string, apiKey: string, body: unknown): Promise<Response> {
  return fetch(`${ASAAS_BASE_URL}${path}`, {
    method: "POST",
    headers: { "access_token": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

  // 2. Validar plano
  let planId: PlanId;
  try {
    const body = await req.json();
    planId = body.plan as PlanId;
    if (!planId || !PLAN_CONFIG[planId]) {
      return jsonResponse({ error: "Plano inválido. Use 'monthly' ou 'yearly'." }, 400, req);
    }
  } catch {
    return jsonResponse({ error: "Corpo da requisição inválido." }, 400, req);
  }

  const apiKey = Deno.env.get("ASAAS_API_KEY");
  if (!apiKey) {
    console.error("ASAAS_API_KEY não configurada");
    return jsonResponse({ error: "Integração de pagamento não configurada." }, 500, req);
  }

  const plan = PLAN_CONFIG[planId];

  try {
    // 3. Carregar perfil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, asaas_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "Perfil não encontrado." }, 404, req);
    }

    // 4. Encontrar ou criar cliente no Asaas
    let asaasCustomerId: string = profile.asaas_customer_id ?? "";

    if (!asaasCustomerId) {
      // Buscar por email para evitar duplicação
      const searchRes = await asaasGet(
        `/customers?email=${encodeURIComponent(profile.email)}`,
        apiKey,
      );
      const searchData = await searchRes.json();

      if (searchRes.ok && searchData.data?.length > 0) {
        asaasCustomerId = searchData.data[0].id;
      } else {
        // Criar novo cliente
        const createRes = await asaasPost("/customers", apiKey, {
          name: profile.full_name ?? profile.email,
          email: profile.email,
          notificationDisabled: false,
        });

        if (!createRes.ok) {
          const err = await createRes.text();
          console.error("Falha ao criar cliente no Asaas:", err);
          return jsonResponse({ error: "Falha ao criar cliente no Asaas." }, 502, req);
        }

        const customerData = await createRes.json();
        asaasCustomerId = customerData.id;
      }

      // Salvar customer ID antes de criar assinatura (garante lookup no webhook)
      await supabaseAdmin
        .from("profiles")
        .update({ asaas_customer_id: asaasCustomerId })
        .eq("id", user.id);
    }

    // 5. Criar assinatura recorrente
    const nextDueDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const subscriptionRes = await asaasPost("/subscriptions", apiKey, {
      customer: asaasCustomerId,
      billingType: "UNDEFINED", // Cliente escolhe: PIX, boleto ou cartão
      nextDueDate,
      value: plan.value,
      cycle: plan.cycle,
      description: plan.description,
    });

    if (!subscriptionRes.ok) {
      const err = await subscriptionRes.text();
      console.error("Falha ao criar assinatura no Asaas:", err);
      return jsonResponse({ error: "Falha ao criar assinatura no Asaas." }, 502, req);
    }

    const subscriptionData = await subscriptionRes.json();
    const subscriptionId: string = subscriptionData.id;
    const paymentUrl: string = subscriptionData.invoiceUrl;

    // 6. Salvar subscription ID
    await supabaseAdmin
      .from("profiles")
      .update({ asaas_subscription_id: subscriptionId })
      .eq("id", user.id);

    if (!paymentUrl) {
      // Fallback: buscar URL da primeira cobrança da assinatura
      const paymentsRes = await asaasGet(
        `/payments?subscription=${subscriptionId}`,
        apiKey,
      );
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        const firstPayment = paymentsData.data?.[0];
        if (firstPayment?.invoiceUrl) {
          return jsonResponse({ paymentUrl: firstPayment.invoiceUrl }, 200, req);
        }
      }
      return jsonResponse({ error: "URL de pagamento não disponível." }, 502, req);
    }

    return jsonResponse({ paymentUrl }, 200, req);

  } catch (err) {
    console.error("asaas-checkout erro inesperado:", err);
    return jsonResponse({ error: "Erro interno ao processar pagamento." }, 500, req);
  }
});
