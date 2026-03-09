import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  authGuard,
  callAI,
  checkRateLimit,
  getCorsHeaders,
  jsonResponse,
  AIError,
} from "../_shared/utils.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // 1. Autenticação (estava AUSENTE — gap crítico de segurança)
  const { user, supabaseAdmin, error: authError } = await authGuard(req);
  if (!user) {
    return jsonResponse({ error: authError ?? "Não autenticado" }, 401, req);
  }

  // 2. Rate limiting: máx 20 chamadas por hora por usuário
  const allowed = await checkRateLimit(supabaseAdmin, user.id, "strategic-ai-analysis", 20, 60);
  if (!allowed) {
    return jsonResponse({ error: "Limite de análises excedido. Tente novamente em 1 hora." }, 429, req);
  }

  try {
    const { portfolioData, analysisType } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (analysisType) {
      case "portfolio":
        systemPrompt = `Você é um consultor estratégico especializado em escritórios de contabilidade no Brasil.
Analise os dados do portfólio e forneça insights estratégicos em português brasileiro.
Seja direto, use dados concretos e forneça recomendações acionáveis.
Responda em formato markdown com seções claras.`;
        userPrompt = `Analise o portfólio deste escritório contábil e identifique padrões de subprecificação, riscos operacionais e oportunidades estratégicas.

Dados do portfólio:
- Total de clientes: ${portfolioData.totalClients}
- Honorário médio: R$ ${portfolioData.avgFee?.toFixed(2)}
- Score médio de complexidade: ${portfolioData.avgComplexity?.toFixed(1)}
- Clientes subprecificados: ${portfolioData.underpricedCount} (${portfolioData.underpricedPercentage?.toFixed(1)}%)
- Receita total mensal: R$ ${portfolioData.totalRevenue?.toFixed(2)}
- Custo operacional estimado: R$ ${portfolioData.totalCost?.toFixed(2)}
- Margem estimada: ${portfolioData.estimatedMargin?.toFixed(1)}%
- Distribuição por regime: Simples (${portfolioData.simpleCount}), Presumido (${portfolioData.presumidoCount}), Real (${portfolioData.realCount})
- Distribuição por complexidade: Básico (${portfolioData.basicCount}), Intermediário (${portfolioData.intermediarioCount}), Avançado (${portfolioData.avancadoCount}), Alto Risco (${portfolioData.altoRiscoCount}), Crítico (${portfolioData.criticoCount})
- Total de colaboradores: ${portfolioData.employeeCount}
- Custos do escritório: R$ ${portfolioData.officeExpenses?.toFixed(2)}

Forneça:
1. Resumo executivo (2-3 frases)
2. Pontos de atenção críticos
3. Oportunidades de melhoria de margem
4. Recomendações estratégicas`;
        break;

      case "radar_oportunidades":
        systemPrompt = `Você é um consultor financeiro e estrategista de negócios para escritórios de contabilidade.
Sua missão é ler os dados do 'Radar de Oportunidades' e resumir onde está o dinheiro deixado na mesa e quais são as ações imediatas.
Responda em formato markdown, seja persuasivo, direto e sugira um plano de ação rápido.`;
        userPrompt = `Analise o radar de oportunidades atual:

- Clientes analisados: ${portfolioData.totalClients}
- Clientes com margem negativa (prejuízo): ${portfolioData.negativeMarginCount}
- Clientes subprecificados (abaixo da margem ideal): ${portfolioData.underpricedCount}
- Aumento potencial de receita mensal: R$ ${portfolioData.potentialIncrease?.toFixed(2)}
- Margem geral do portfólio: ${portfolioData.portfolioMargin?.toFixed(1)}%
- Principais segmentos para focar: ${portfolioData.topSegments?.join(', ')}
- Top 5 clientes para reajuste imediato e oportunidade financeira de cada um: ${JSON.stringify(portfolioData.topAdjustmentClients)}

Forneça:
1. Um diagnóstico de urgência (1 parágrafo)
2. O impacto no fluxo de caixa se as correções forem aplicadas
3. Sugestão de abordagem de reprecificação para os Top 5 clientes
4. Estratégia recomendada de cross-sell ou ganho de eficiência técnica para os clientes com margem negativa`;
        break;

      case "growth":
        systemPrompt = `Você é um consultor de crescimento para escritórios de contabilidade no Brasil.
Analise a capacidade operacional e forneça projeções de crescimento realistas.
Responda em português brasileiro com dados concretos.`;
        userPrompt = `Analise a estratégia de crescimento proposta:

Dados atuais:
- Clientes atuais: ${portfolioData.currentClients}
- Colaboradores atuais: ${portfolioData.currentEmployees}
- Receita mensal atual: R$ ${portfolioData.currentRevenue?.toFixed(2)}
- Custo mensal atual: R$ ${portfolioData.currentCost?.toFixed(2)}

Projeção:
- Novos clientes desejados: ${portfolioData.targetNewClients}
- Honorário médio pretendido: R$ ${portfolioData.targetAvgFee?.toFixed(2)}
- Novas contratações planejadas: ${portfolioData.plannedHires}

Capacidade estimada: ${portfolioData.capacity} clientes por colaborador.

Forneça:
1. Análise da viabilidade
2. Projeções financeiras
3. Recomendações de contratação
4. Riscos e mitigações`;
        break;

      default:
        return jsonResponse({ error: "Tipo de análise inválido" }, 400, req);
    }

    const content = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { model: "gpt-4o-mini" },
    );

    return jsonResponse({ analysis: content }, 200, req);
  } catch (error) {
    if (error instanceof AIError) return error.toResponse(req);
    console.error("strategic-ai-analysis error:", error);
    return jsonResponse({ error: "Erro interno ao processar análise" }, 500, req);
  }
});
