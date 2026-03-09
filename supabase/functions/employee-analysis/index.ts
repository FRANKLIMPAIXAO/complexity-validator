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

const CORTEXCONT_SYSTEM_PROMPT = `Você é o CORTEXCONT - Sistema Operacional Estratégico para Escritórios Contábeis.

IDENTIDADE:
- Atua como consultor estratégico sênior para donos de escritórios contábeis
- Comportamento: Técnico, objetivo, estruturado, orientado a dados
- NÃO é: calculadora, assistente genérico ou chatbot motivacional
- É: sistema de análise, tradutor de dados em decisão, apoio à governança e execução

PRINCÍPIOS DE LINGUAGEM:
Utilize: Diagnóstico, Análise, Indicador, Risco, Impacto, Decisão, Governança, Execução
Evite: Linguagem emocional, termos genéricos ("ajuda", "talvez", "pode ser"), sugestões vagas

DOMÍNIO ESPECÍFICO: Pessoas & Performance

PAPEL NESTA ANÁLISE:
Você analisa dados de desempenho de colaboradores para apoiar decisões de gestão de pessoas.

ESTRUTURA DE RESPOSTA:
1. DIAGNÓSTICO: Análise objetiva do desempenho
2. FATORES DE IMPACTO: O que influenciou positiva e negativamente
3. RISCO OPERACIONAL: Nível de risco identificado
4. AÇÕES RECOMENDADAS: Sugestões concretas (nunca imposições)

REGRAS ESPECÍFICAS:
- Foco em desenvolvimento, não punição
- Linguagem técnica e respeitosa
- Nunca sugira desligamento automático
- Conecte performance individual com impacto operacional do escritório
- Sempre interprete os números, nunca exiba sem contexto

FORMATO DE RESPOSTA (JSON):
{
  "summary": "Diagnóstico objetivo do desempenho em 2-3 frases técnicas",
  "factors": ["Fator de impacto 1", "Fator de impacto 2", "Fator de impacto 3"],
  "recommendations": [
    {
      "type": "tipo_da_acao",
      "description": "Descrição objetiva da recomendação",
      "priority": "alta|media|baixa"
    }
  ],
  "riskLevel": "baixo|moderado|alto"
}

Tipos de ação disponíveis:
- melhoria_salarial, reconhecimento, feedback_periodico, feedback_estruturado,
- treinamento, plano_desenvolvimento, reavaliacao_funcao, plano_corretivo

TOM DE VOZ:
Profissional, seguro, claro, direto, sem jargões desnecessários e sem floreios.

IMPORTANTE: CORTEXCONT sugere caminhos e explica consequências. A decisão final é sempre do gestor.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // 1. Autenticação (substituído getClaims() depreciado)
  const { user, supabaseAdmin, error: authError } = await authGuard(req);
  if (!user) {
    return jsonResponse({ error: authError ?? "Não autenticado" }, 401, req);
  }

  // 2. Rate limiting: máx 30 chamadas por hora
  const allowed = await checkRateLimit(supabaseAdmin, user.id, "employee-analysis", 30, 60);
  if (!allowed) {
    return jsonResponse({ error: "Limite de análises de colaboradores excedido. Tente novamente em 1 hora." }, 429, req);
  }

  try {
    const { employee, metrics, feedback } = await req.json();

    const avgFeedback = feedback?.length > 0
      ? feedback.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / feedback.length
      : null;

    const completionRate = metrics?.tasks_assigned > 0
      ? ((metrics.tasks_completed / metrics.tasks_assigned) * 100).toFixed(1)
      : 0;

    const onTimeRate = metrics?.tasks_completed > 0
      ? ((metrics.tasks_on_time / metrics.tasks_completed) * 100).toFixed(1)
      : 0;

    const userPrompt = `Realize o diagnóstico de desempenho do colaborador:

DADOS DO COLABORADOR:
- Nome: ${employee.name}
- Cargo: ${employee.role}
- Departamento: ${employee.department}
- Data de admissão: ${employee.hire_date}

INDICADORES DO PERÍODO:
- Clientes atendidos: ${metrics?.clients_served ?? 0}
- Complexidade média dos clientes: ${metrics?.avg_client_complexity?.toFixed(1) ?? "N/A"}
- Demandas mensais processadas: ${metrics?.monthly_demands ?? 0}
- Taxa de conclusão de tarefas: ${completionRate}% (${metrics?.tasks_completed ?? 0}/${metrics?.tasks_assigned ?? 0})
- Taxa de pontualidade: ${onTimeRate}% (${metrics?.tasks_on_time ?? 0} no prazo)
- Índice de retrabalho: ${metrics?.tasks_rework ?? 0} ocorrências
- Obrigações entregues: ${metrics?.obligations_delivered ?? 0}
- Obrigações em atraso: ${metrics?.obligations_delayed ?? 0}
- Erros identificados: ${metrics?.obligations_errors ?? 0}
- Score de performance: ${metrics?.performance_score ?? 0}/100
- Classificação atual: ${metrics?.performance_level ?? "não avaliado"}

AVALIAÇÕES:
- Média de avaliações: ${avgFeedback?.toFixed(1) ?? "Sem avaliações"}/5
- Total de feedbacks registrados: ${feedback?.length ?? 0}

Gere o diagnóstico CORTEXCONT seguindo o formato JSON especificado.`;

    const content = await callAI(
      [
        { role: "system", content: CORTEXCONT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      { model: "google/gemini-2.5-flash", temperature: 0.7 },
    );

    const analysis = parseAIJson(content, {
      summary: content,
      factors: ["Diagnóstico em processamento"],
      recommendations: [],
      riskLevel: "moderado",
    });

    return jsonResponse(analysis, 200, req);
  } catch (error) {
    if (error instanceof AIError) return error.toResponse(req);
    console.error("Employee analysis error:", error);
    return jsonResponse({ error: "Erro interno ao processar diagnóstico" }, 500, req);
  }
});
