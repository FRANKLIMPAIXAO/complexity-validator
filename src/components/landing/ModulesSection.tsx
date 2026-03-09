import { motion } from "framer-motion";
import { DollarSign, Target, BarChart2, Users, Gauge, Lightbulb, Radar } from "lucide-react";

const modules = [
  {
    icon: Gauge,
    title: "Score de Complexidade",
    description: "Motor automático que calcula a complexidade operacional de cada cliente com base em regime tributário, faturamento, funcionários, NFs e flags especiais.",
    features: ["Cálculo Automático", "Classificação por Nível", "Indicadores Visuais"],
    color: "primary",
  },
  {
    icon: DollarSign,
    title: "Rentabilidade & Precificação",
    description: "Analise a margem de cada cliente, identifique subprecificação e simule reajustes com base no custo estimado e score de complexidade.",
    features: ["Margem por Cliente", "Alertas de Subpreço", "Simulador de Reajuste"],
    color: "accent",
  },
  {
    icon: Radar,
    title: "Radar de Oportunidades",
    description: "Detecte automaticamente clientes com prejuízo, oportunidades de reajuste e os segmentos mais rentáveis do seu portfólio.",
    features: ["Clientes com Prejuízo", "Reajustes Recomendados", "Segmentos Rentáveis"],
    color: "primary",
  },
  {
    icon: Lightbulb,
    title: "Consultor Estratégico (IA)",
    description: "Painel de inteligência artificial que analisa portfólio, capacidade da equipe, potencial de crescimento e gera recomendações estratégicas.",
    features: ["Análise de Portfólio", "Capacidade da Equipe", "Insights por IA"],
    color: "accent",
  },
  {
    icon: Target,
    title: "Planejamento Estratégico",
    description: "Defina objetivos, metas SMART e acompanhe KPIs por pilar estratégico. Governança periódica para manter a estratégia viva.",
    features: ["Diagnóstico Completo", "Metas SMART", "KPIs por Pilar"],
    color: "primary",
  },
  {
    icon: BarChart2,
    title: "Benchmark Estratégico",
    description: "Compare seus indicadores com o mercado. Clusters de performance, alertas inteligentes e análise de posicionamento.",
    features: ["Comparativo de Mercado", "Clusters de Maturidade", "Alertas de Oportunidade"],
    color: "accent",
  },
  {
    icon: Users,
    title: "Pessoas & Performance",
    description: "Avalie colaboradores com métricas objetivas. Score de performance, integração com clientes atendidos e ações recomendadas por IA.",
    features: ["Score de Performance", "Integração com Clientes", "Análise por IA"],
    color: "primary",
  },
];

const ModulesSection = () => {
  return (
    <section id="modules-section" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsla(174,72%,46%,0.05)_0%,_transparent_50%)]" />
      
      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
            Módulos
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Um sistema operacional{" "}
            <span className="gradient-text">completo</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Sete módulos integrados que cobrem todas as dimensões estratégicas 
            do seu escritório contábil.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {modules.map((module, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card md:p-8"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                  module.color === 'primary' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-accent/10 text-accent'
                } transition-colors group-hover:${module.color === 'primary' ? 'bg-primary/20' : 'bg-accent/20'}`}>
                  <module.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-display text-xl font-bold md:text-2xl">
                    {module.title}
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {module.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {module.features.map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          module.color === 'primary'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
