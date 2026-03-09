import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  authGuard,
  callAI,
  checkRateLimit,
  getCorsHeaders,
  jsonResponse,
  parseAIJson,
  AIError,
} from "../_shared/utils.ts";

interface BenchmarkData {
  indicatorName: string;
  userValue: number;
  clusterAverage: number;
  differencePercent: number;
  direction: "above" | "below";
  severity: "normal" | "moderate" | "critical";
}

const CORTEXCONT_SYSTEM_PROMPT = `Você é o CORTEXCONT - Sistema Operacional Estratégico para Escritórios Contábeis.

IDENTIDADE:
- Atua como consultor estratégico sênior para donos de escritórios contábeis
- Comportamento: Técnico, objetivo, estruturado, orientado a dados
- NÃO é: calculadora, assistente genérico ou chatbot motivacional
- É: sistema de análise, tradutor de dados em decisão, apoio à governança e execução

PRINCÍPIOS DE LINGUAGEM:
Utilize: Diagnóstico, Análise, Indicador, Risco, Impacto, Decisão, Governança, Execução
Evite: Linguagem emocional, termos genéricos ("ajuda", "talvez", "pode ser"), sugestões vagas

DOMÍNIO ESPECÍFICO: Benchmark Estratégico

PAPEL NESTA ANÁLISE:
Você analisa indicadores de benchmark comparando o desempenho do escritório com escritórios do mesmo cluster.

ESTRUTURA DE RESPOSTA:
1. CONTEXTO DO DESVIO: O que o indicador representa e por que é relevante
2. DIAGNÓSTICO: Por que este desvio ocorreu - análise causal
3. IMPACTO ESTRATÉGICO: Consequências para o negócio
4. RISCO OU OPORTUNIDADE: Classificação objetiva do cenário
5. AÇÃO RECOMENDADA: Caminho estratégico (sem imposição)

REGRAS ESPECÍFICAS:
- Nunca mencione nomes de outros escritórios
- Conecte desvios de benchmark com outros domínios (pessoas, operações, financeiro)
- Identifique padrões de causa e efeito
- Sempre interprete os números, nunca exiba sem contexto
- Considere o contexto do portfólio na análise

FORMATO DE RESPOSTA (JSON):
{
  "explanation": "Explicação técnica do desvio e seu significado",
  "factors": ["Fator causal 1", "Fator causal 2", "Fator causal 3"],
  "strategicImpact": "Impacto estratégico no negócio",
  "riskOrOpportunity": "Classificação: risco identificado ou oportunidade detectada",
  "recommendation": "Ação recomendada - caminho estratégico"
}

TOM DE VOZ:
Profissional, seguro, claro, direto, sem jargões desnecessários e sem floreios.

IMPORTANTE: CORTEXCONT sugere caminhos e explica consequências. A decisão final é sempre do gestor.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // 1. Autenticação (substituído getClaims() depreciado por getUser())
  const { user, supabaseAdmin, error: authError } = await authGuard(req);
  if (!user) {
    return jsonResponse({ error: authError ?? "Não autenticado" }, 401, req);
  }

  // 2. Rate limiting: máx 30 chamadas por hora
  const allowed = await checkRateLimit(supabaseAdmin, user.id, "benchmark-analysis", 30, 60);
  if (!allowed) {
    return jsonResponse({ error: "Limite de análises de benchmark excedido. Tente novamente em 1 hora." }, 429, req);
  }

  try {
    const { benchmarkData, portfolioContext } = await req.json() as {
      benchmarkData: BenchmarkData;
      portfolioContext: {
        totalClients: number;
        underpricedClients: number;
        predominantRegime: string;
        averageComplexityScore: number;
      };
    };

    const deviationContext = benchmarkData.direction === "above"
      ? `${benchmarkData.differencePercent}% ACIMA da média do cluster`
      : `${benchmarkData.differencePercent}% ABAIXO da média do cluster`;

    const severityLabels: Record<string, string> = {
      normal: "dentro da faixa esperada",
      moderate: "desvio moderado - requer atenção",
      critical: "desvio crítico - ação recomendada",
    };
    const severityLabel = severityLabels[benchmarkData.severity] ?? "a ser avaliado";

    const userPrompt = `Realize o diagnóstico do desvio de benchmark:

INDICADOR ANALISADO: ${benchmarkData.indicatorName}
VALOR DO ESCRITÓRIO: ${benchmarkData.userValue}
MÉDIA DO CLUSTER: ${benchmarkData.clusterAverage}
DESVIO: ${deviationContext}
CLASSIFICAÇÃO: ${severityLabel}

CONTEXTO DO PORTFÓLIO:
- Total de clientes na base: ${portfolioContext.totalClients}
- Clientes com indicativo de subprecificação: ${portfolioContext.underpricedClients}
- Regime tributário predominante: ${portfolioContext.predominantRegime}
- Score médio de complexidade: ${portfolioContext.averageComplexityScore}

Gere o diagnóstico CORTEXCONT seguindo o formato JSON especificado.`;

    const content = await callAI(
      [
        { role: "system", content: CORTEXCONT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      { model: "google/gemini-2.5-flash", temperature: 0.7 },
    );

    const analysis = parseAIJson(content, {
      explanation: content,
      factors: ["Diagnóstico em processamento"],
      strategicImpact: "Impacto a ser avaliado",
      riskOrOpportunity: "Requer análise adicional",
      recommendation: "Acompanhar indicador",
    });

    return jsonResponse(analysis, 200, req);
  } catch (error) {
    if (error instanceof AIError) return error.toResponse(req);
    console.error("Benchmark analysis error:", error);
    return jsonResponse({ error: "Erro interno ao processar diagnóstico" }, 500, req);
  }
});
