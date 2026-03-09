import { motion } from "framer-motion";
import { BarChart3, Brain, Target, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA Estratégica",
    description: "Consultor Estratégico com IA analisa portfólio, identifica riscos e gera recomendações automaticamente.",
  },
  {
    icon: Target,
    title: "Radar de Oportunidades",
    description: "Detecte clientes com prejuízo, reajustes recomendados e segmentos mais rentáveis.",
  },
  {
    icon: BarChart3,
    title: "Score de Complexidade",
    description: "Motor automático que classifica cada cliente por complexidade operacional para precificação inteligente.",
  },
  {
    icon: Zap,
    title: "Crescimento Sustentável",
    description: "Simulador de crescimento, análise de capacidade e potencial de expansão por segmento.",
  },
];

const SolutionSection = () => {
  return (
    <section id="solution-section" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(199,89%,48%,0.05)_0%,_transparent_50%)]" />
      
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              A Solução
            </span>
            <h2 className="mb-6 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
              Conheça o{" "}
              <span className="gradient-text">PRAXIS</span>
            </h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Uma plataforma de decisão e execução com IA que transforma dados operacionais 
              em estratégia, precificação inteligente e crescimento sustentável.
            </p>
            <p className="text-lg text-muted-foreground">
              PRAXIS integra score de complexidade, radar de oportunidades, consultor estratégico, 
              benchmark e gestão de pessoas em um sistema operacional completo.
            </p>
          </motion.div>

          {/* Right Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group gradient-border rounded-xl p-5 transition-all duration-300 hover:shadow-lg"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-display text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
