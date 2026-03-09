import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, jsonResponse } from "../_shared/utils.ts";

const DEFAULT_PLANS = [
  { name: "Black",       color: "#1F2937", description: "Plano exclusivo com atendimento premium",     is_default: false, sort_order: 0 },
  { name: "Tradicional", color: "#3B82F6", description: "Plano padrão com serviços essenciais",       is_default: true,  sort_order: 1 },
  { name: "Premium",     color: "#8B5CF6", description: "Plano com serviços adicionais",              is_default: false, sort_order: 2 },
  { name: "Gold",        color: "#F59E0B", description: "Plano intermediário com benefícios especiais",is_default: false, sort_order: 3 },
  { name: "Abertura",    color: "#10B981", description: "Plano para empresas em fase de abertura",    is_default: false, sort_order: 4 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    // 1. Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Não autenticado" }, 401, req);
    }

    // 2. Cliente admin com service_role (bypassa RLS para operações de criação)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 3. Validar usuário via getUser() (substitui getClaims() depreciado)
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Token inválido" }, 401, req);
    }

    // 4. Verificar se usuário já tem empresa
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (existingProfile?.company_id) {
      return jsonResponse({ error: "Usuário já possui uma empresa cadastrada" }, 400, req);
    }

    // 5. Obter e validar dados da empresa
    const companyData = await req.json();

    if (!companyData.razao_social || !companyData.cnpj) {
      return jsonResponse({ error: "Razão social e CNPJ são obrigatórios" }, 400, req);
    }

    // 6. Criar empresa
    const { data: company, error: insertError } = await supabaseAdmin
      .from("companies")
      .insert({
        razao_social:      companyData.razao_social,
        nome_fantasia:     companyData.nome_fantasia ?? null,
        cnpj:              companyData.cnpj,
        tax_regime:        companyData.tax_regime ?? "simples",
        responsible_name:  companyData.responsible_name ?? null,
        responsible_email: companyData.responsible_email ?? null,
        is_active:         true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return jsonResponse({ error: `Erro ao criar empresa: ${insertError.message}` }, 500, req);
    }

    // 7. Atribuir role de admin
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: user.id, company_id: company.id, role: "admin" });

    if (roleError) {
      console.error("Role insert error:", roleError);
      // Rollback: apagar empresa criada
      await supabaseAdmin.from("companies").delete().eq("id", company.id);
      return jsonResponse({ error: `Erro ao atribuir role: ${roleError.message}` }, 500, req);
    }

    // 8. Criar planos padrão (não-crítico)
    const { error: plansError } = await supabaseAdmin
      .from("client_plans")
      .insert(DEFAULT_PLANS.map((plan) => ({ ...plan, company_id: company.id })));

    if (plansError) {
      console.error("Plans insert error (non-critical):", plansError);
    }

    // 9. Atualizar perfil com company_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ company_id: company.id })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error (non-critical):", profileError);
    }

    return jsonResponse({ company }, 200, req);
  } catch (error) {
    console.error("Unexpected error:", error);
    return jsonResponse({ error: "Erro interno do servidor" }, 500, req);
  }
});
