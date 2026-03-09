import { motion } from "framer-motion";
import { AlertTriangle, Users, TrendingDown, HelpCircle, Clock } from "lucide-react";

const problems = [
  {
    icon: HelpCircle,
    title: "Precificação no feeling",
    description: "Sem dados concretos, a decisão vira adivinhação — e o prejuízo vem junto.",
  },
  {
    icon: TrendingDown,
    title: "Margem invisível",
    description: "Você não sabe quais clientes dão lucro e quais estão corroendo seu resultado.",
  },
  {
    icon: Users,
    title: "Equipe sobrecarregada",
    description: "Colaboradores esgotados atendendo clientes que não compensam o esforço.",
  },
  {
    icon: Clock,
    title: "Decisões tardias",
    description: "Quando você percebe o problema, já perdeu dinheiro e tempo.",
  },
  {
    icon: AlertTriangle,
    title: "Planejamento sem execução",
    description: "Estratégias que ficam no papel porque faltam indicadores e acompanhamento.",
  },
];

const ProblemSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsla(199,89%,48%,0.05)_0%,_transparent_50%)]" />
      
      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            O Problema
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Escritórios contábeis operam{" "}
            <span className="gradient-text">no escuro</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Sem visibilidade sobre rentabilidade, performance e estratégia, 
            decisões viram apostas — e o crescimento fica comprometido.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-destructive/30 hover:bg-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive/20">
                <problem.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                {problem.title}
              </h3>
              <p className="text-muted-foreground">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
