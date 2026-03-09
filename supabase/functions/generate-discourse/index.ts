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

type DiscourseType =
  | "reajuste_salarial"
  | "feedback_desenvolvimento"
  | "treinamento_direcionado"
  | "alerta_atencao"
  | "avaliacao_desligamento";

const PRAXIS_SYSTEM_PROMPT = `Você é o PRAXIS | Pessoas & Performance.

IDENTIDADE:
Seu papel é gerar discursos técnicos, claros e justificados para apoiar decisões de gestão de pessoas em escritórios contábeis, com base em dados objetivos.

PRINCÍPIOS FUNDAMENTAIS:
- Você NÃO cria discursos emocionais
- Você NÃO impõe decisões
- Você NÃO julga pessoas
- Você analisa dados, explica cenários, estrutura conversas difíceis e dá base técnica para decisões justas

ESTRUTURA DO DISCURSO:
1. Contexto objetivo
2. Diagnóstico técnico
3. Evidências (dados concretos)
4. Impacto operacional
5. Direcionamento estratégico
6. Próximo passo sugerido

REGRAS DE ÉTICA E GOVERNANÇA:
- Nunca utilizar linguagem acusatória
- Nunca expor comparações com outros colaboradores
- Nunca sugerir punição automática
- Sempre tratar desligamento como última alternativa
- Manter tom profissional e respeitoso

TOM DE VOZ:
Profissional, seguro, claro, direto, técnico. Sem jargões desnecessários e sem floreios.

IMPORTANTE: PRAXIS apoia decisões justas, técnicas e sustentáveis. A decisão final é sempre do gestor.`;

const DISCOURSE_PROMPTS: Record<DiscourseType, string> = {
  reajuste_salarial: `Gere um discurso para REAJUSTE SALARIAL baseado nos indicadores de alto desempenho.
Inclua dados concretos e justifique tecnicamente. Formato JSON solicitado.`,

  feedback_desenvolvimento: `Gere um discurso para FEEDBACK DE DESENVOLVIMENTO.
Foque em pontos de melhoria objetivos e plano de ação. Formato JSON solicitado.`,

  treinamento_direcionado: `Gere um discurso para TREINAMENTO DIRECIONADO.
Identifique o padrão de erro/retrabalho e proponha direcionamento técnico. Formato JSON solicitado.`,

  alerta_atencao: `Gere um discurso de ALERTA (Zona de Atenção).
Comunique o risco operacional com clareza e proponha plano corretivo imediato. Formato JSON solicitado.`,

  avaliacao_desligamento: `Gere um discurso para AVALIAÇÃO DE DESLIGAMENTO.
CONTEXTO CRÍTICO: Use somente quando há risco operacional recorrente após ações corretivas.
Mantenha tom profissional, respeitoso e baseado em evidências. Formato JSON solicitado.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // 1. Autenticação (substituído getClaims() depreciado)
  const { user, supabaseAdmin, error: authError } = await authGuard(req);
  if (!user) {
    return jsonResponse({ error: authError ?? "Não autenticado" }, 401, req);
  }

  // 2. Rate limiting: máx 20 gerações por hora
  const allowed = await checkRateLimit(supabaseAdmin, user.id, "generate-discourse", 20, 60);
  if (!allowed) {
    return jsonResponse({ error: "Limite de geração de discursos excedido. Tente novamente em 1 hora." }, 429, req);
  }

  try {
    const { employee, metrics, feedback, discourseType } = await req.json();

    const avgFeedback = feedback?.length > 0
      ? feedback.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / feedback.length
      : null;

    const completionRate = metrics?.tasks_assigned > 0
      ? ((metrics.tasks_completed / metrics.tasks_assigned) * 100).toFixed(1)
      : 0;

    const onTimeRate = metrics?.tasks_completed > 0
      ? ((metrics.tasks_on_time / metrics.tasks_completed) * 100).toFixed(1)
      : 0;

    const reworkRate = metrics?.tasks_completed > 0
      ? ((metrics.tasks_rework / metrics.tasks_completed) * 100).toFixed(1)
      : 0;

    const delayRate = metrics?.obligations_delivered > 0
      ? ((metrics.obligations_delayed / metrics.obligations_delivered) * 100).toFixed(1)
      : 0;

    const discoursePrompt = DISCOURSE_PROMPTS[discourseType as DiscourseType]
      ?? DISCOURSE_PROMPTS.feedback_desenvolvimento;

    const userPrompt = `${discoursePrompt}

DADOS DO COLABORADOR:
- Nome: ${employee.name}
- Cargo: ${employee.role}
- Departamento: ${employee.department}
- Data de admissão: ${employee.hire_date}

INDICADORES DE PERFORMANCE:
- Clientes atendidos: ${metrics?.clients_served ?? 0}
- Complexidade média dos clientes: ${metrics?.avg_client_complexity?.toFixed(1) ?? "N/A"}
- Taxa de conclusão de tarefas: ${completionRate}% (${metrics?.tasks_completed ?? 0}/${metrics?.tasks_assigned ?? 0})
- Taxa de pontualidade: ${onTimeRate}% (${metrics?.tasks_on_time ?? 0} no prazo)
- Taxa de retrabalho: ${reworkRate}% (${metrics?.tasks_rework ?? 0} ocorrências)
- Obrigações entregues: ${metrics?.obligations_delivered ?? 0}
- Obrigações em atraso: ${delayRate}% (${metrics?.obligations_delayed ?? 0})
- Erros identificados: ${metrics?.obligations_errors ?? 0}
- Score de performance: ${metrics?.performance_score ?? 0}/100
- Classificação: ${metrics?.performance_level ?? "não avaliado"}

FEEDBACK:
- Média de avaliações: ${avgFeedback?.toFixed(1) ?? "Sem avaliações"}/5
- Total de feedbacks: ${feedback?.length ?? 0}

Retorne em formato JSON:
{
  "title": "Título do discurso",
  "context": "Contexto objetivo",
  "diagnosis": "Diagnóstico técnico",
  "indicators": ["Indicador 1 com valor", "Indicador 2 com valor"],
  "impact": "Impacto operacional",
  "direction": "Direcionamento estratégico",
  "nextStep": "Próximo passo sugerido",
  "fullDiscourse": "Discurso completo formatado para apresentação ao colaborador"
}`;

    const content = await callAI(
      [
        { role: "system", content: PRAXIS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      { model: "google/gemini-2.5-flash", temperature: 0.7 },
    );

    const discourse = parseAIJson(content, {
      title: "Discurso Gerado",
      context: "Análise de desempenho",
      diagnosis: content,
      indicators: [],
      impact: "A ser avaliado",
      direction: "Acompanhamento recomendado",
      nextStep: "Reunião de alinhamento",
      fullDiscourse: content,
    });

    return jsonResponse(discourse, 200, req);
  } catch (error) {
    if (error instanceof AIError) return error.toResponse(req);
    console.error("Discourse generation error:", error);
    return jsonResponse({ error: "Erro interno ao gerar discurso" }, 500, req);
  }
});
