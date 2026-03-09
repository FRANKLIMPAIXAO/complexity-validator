import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  authGuard,
  checkRateLimit,
  getCorsHeaders,
  jsonResponse,
  AIError,
} from "../_shared/utils.ts";

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_TIMEOUT_MS = 45_000; // 45s para PDFs

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // 1. Autenticação (substituído getClaims() depreciado)
  const { user, supabaseAdmin, error: authError } = await authGuard(req);
  if (!user) {
    return jsonResponse({ error: authError ?? "Não autenticado" }, 401, req);
  }

  // 2. Rate limiting: máx 20 extrações por hora
  const allowed = await checkRateLimit(supabaseAdmin, user.id, "extract-document-data", 20, 60);
  if (!allowed) {
    return jsonResponse({ error: "Limite de extração de documentos excedido. Tente novamente em 1 hora." }, 429, req);
  }

  let documentId: string | null = null;

  try {
    const body = await req.json();
    documentId = body.documentId;

    if (!documentId) {
      return jsonResponse({ error: "Document ID é obrigatório" }, 400, req);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Buscar documento
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*, monthly_competences!inner(id, company_id)")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return jsonResponse({ error: "Documento não encontrado" }, 404, req);
    }

    // Verificar que o usuário pertence à empresa do documento
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!userProfile || userProfile.company_id !== doc.company_id) {
      return jsonResponse({ error: "Acesso negado a este documento" }, 403, req);
    }

    // Baixar PDF do Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("company-documents")
      .download(doc.file_path);

    if (downloadError || !fileData) {
      throw new Error("Erro ao baixar documento do storage");
    }

    // Converter para base64
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const binaryString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("");
    const base64Data = btoa(binaryString);

    // Prompts por tipo de documento
    type DocConfig = { prompt: string; fields: string[] };
    const promptsByType: Record<string, DocConfig> = {
      folha_pagamento: {
        fields: ["company_name", "cnpj", "employees_count", "total_payroll", "total_charges", "hires_count", "terminations_count"],
        prompt: "Analise este documento de Folha de Pagamento e extraia os dados como JSON: company_name, cnpj (XX.XXX.XXX/XXXX-XX), employees_count, total_payroll, total_charges, hires_count, terminations_count. Use 0 para números não encontrados e \"\" para texto. Retorne SOMENTE o JSON.",
      },
      pgdas: {
        fields: ["company_name", "cnpj", "period_revenue", "accumulated_revenue", "simples_anexo", "das_value"],
        prompt: "Analise este PGDAS e extraia como JSON: company_name, cnpj, period_revenue, accumulated_revenue, simples_anexo, das_value. Use 0 para números não encontrados. Retorne SOMENTE o JSON.",
      },
      balancete: {
        fields: ["company_name", "cnpj", "total_assets", "total_liabilities", "net_equity", "net_revenue", "net_profit"],
        prompt: "Analise este Balancete Contábil e extraia como JSON: company_name, cnpj, total_assets, total_liabilities, net_equity, net_revenue, net_profit. Use 0 para valores não encontrados. Retorne SOMENTE o JSON.",
      },
    };

    const docConfig: DocConfig = promptsByType[doc.document_type] ?? {
      fields: [],
      prompt: "Extraia informações relevantes, incluindo company_name e cnpj se presentes. Retorne como JSON.",
    };

    // Chamar IA com timeout
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    let aiContent = "";
    try {
      const aiResponse = await fetch(AI_GATEWAY, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: docConfig.prompt },
                { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64Data}` } },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) throw new AIError("RATE_LIMIT", 429);
        if (aiResponse.status === 402) throw new AIError("INSUFFICIENT_CREDITS", 402);
        throw new Error(`AI gateway error: ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();
      aiContent = aiResult.choices?.[0]?.message?.content ?? "";
    } finally {
      clearTimeout(timeout);
    }

    // Parsear resposta
    let extractedData: Record<string, unknown> = {};
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON não encontrado na resposta da IA");
      }
    } catch {
      const fallbacks: Record<string, Record<string, unknown>> = {
        folha_pagamento: { company_name: "", cnpj: "", employees_count: 0, total_payroll: 0, total_charges: 0, hires_count: 0, terminations_count: 0 },
        pgdas: { company_name: "", cnpj: "", period_revenue: 0, accumulated_revenue: 0, simples_anexo: "", das_value: 0 },
      };
      extractedData = fallbacks[doc.document_type] ?? {};
    }

    // Calcular confidence
    let confidence = 85;
    if (docConfig.fields.length > 0) {
      const found = docConfig.fields.filter(
        (f) => extractedData[f] !== undefined && extractedData[f] !== 0 && extractedData[f] !== "",
      );
      confidence = Math.round((found.length / docConfig.fields.length) * 100);
    }

    // Criar/atualizar cliente a partir dos dados extraídos
    const extractedCnpj = String(extractedData.cnpj ?? "").trim();
    const extractedCompanyName = String(extractedData.company_name ?? "").trim();
    let clientId: string | null = null;
    let clientAction: "created" | "updated" | null = null;

    if (extractedCnpj && doc.uploaded_by) {
      const employeesCount = Number(extractedData.employees_count) || 0;
      const monthlyHires = Number(extractedData.hires_count) || 0;
      const monthlyTerminations = Number(extractedData.terminations_count) || 0;

      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("company_id", doc.company_id)
        .eq("cnpj", extractedCnpj)
        .is("deleted_at", null)
        .single();

      if (existingClient) {
        await supabase
          .from("clients")
          .update({ employees_count: employeesCount, monthly_hires: monthlyHires, monthly_terminations: monthlyTerminations })
          .eq("id", existingClient.id);
        clientId = existingClient.id;
        clientAction = "updated";
      } else {
        const { data: newClient } = await supabase
          .from("clients")
          .insert({
            user_id: doc.uploaded_by,
            company_id: doc.company_id,
            name: extractedCompanyName || `Cliente (${extractedCnpj})`,
            cnpj: extractedCnpj,
            tax_regime: "simples",
            monthly_entries: 0,
            monthly_revenue: 0,
            employees_count: employeesCount,
            monthly_hires: monthlyHires,
            monthly_terminations: monthlyTerminations,
            monthly_invoices: 0,
            has_tax_substitution: false,
            has_import_operations: false,
            is_ecommerce: false,
            complex_payroll: false,
            current_fee: 0,
          })
          .select("id")
          .single();
        clientId = newClient?.id ?? null;
        clientAction = "created";
      }
    }

    // Atualizar documento com dados extraídos
    await supabase
      .from("documents")
      .update({ status: "extracted", extracted_data: extractedData, extraction_confidence: confidence })
      .eq("id", documentId);

    // Atualizar monthly_analyses
    const analysisUpdate: Record<string, unknown> = {};
    if (doc.document_type === "folha_pagamento") {
      if (extractedData.employees_count) analysisUpdate.employees_count = extractedData.employees_count;
      if (extractedData.total_payroll) analysisUpdate.total_payroll = extractedData.total_payroll;
      if (extractedData.total_charges) analysisUpdate.total_charges = extractedData.total_charges;
      if (extractedData.hires_count) analysisUpdate.hires_count = extractedData.hires_count;
      if (extractedData.terminations_count) analysisUpdate.terminations_count = extractedData.terminations_count;
      analysisUpdate.payroll_validated = false;
    } else if (doc.document_type === "pgdas") {
      if (extractedData.period_revenue) analysisUpdate.period_revenue = extractedData.period_revenue;
      if (extractedData.accumulated_revenue) analysisUpdate.accumulated_revenue = extractedData.accumulated_revenue;
      if (extractedData.simples_anexo) analysisUpdate.simples_anexo = extractedData.simples_anexo;
      if (extractedData.das_value) analysisUpdate.das_value = extractedData.das_value;
      analysisUpdate.pgdas_validated = false;
    }

    if (Object.keys(analysisUpdate).length > 0) {
      const { data: existingAnalysis } = await supabase
        .from("monthly_analyses")
        .select("id")
        .eq("company_id", doc.company_id)
        .eq("competence_id", doc.competence_id)
        .single();

      if (existingAnalysis) {
        await supabase.from("monthly_analyses").update(analysisUpdate).eq("id", existingAnalysis.id);
      } else {
        await supabase.from("monthly_analyses").insert({
          company_id: doc.company_id,
          competence_id: doc.competence_id,
          ...analysisUpdate,
        });
      }
    }

    return jsonResponse(
      { success: true, extractedData, confidence, client: clientId ? { id: clientId, action: clientAction } : null },
      200,
      req,
    );
  } catch (error) {
    console.error("Extraction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

    // Atualizar documento com status de erro
    if (documentId) {
      try {
        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await supabase.from("documents").update({ status: "error", extraction_error: errorMessage }).eq("id", documentId);
      } catch { /* ignorar erro de cleanup */ }
    }

    if (error instanceof AIError) return error.toResponse(req);
    return jsonResponse({ error: errorMessage }, 500, req);
  }
});
