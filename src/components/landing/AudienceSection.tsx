import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const forWho = [
  "Escritórios contábeis com equipe estruturada",
  "Donos de escritório que querem escalar com controle",
  "Profissionais orientados a dados e resultados",
  "Gestores que buscam decisões estratégicas, não operacionais",
];

const notForWho = [
  "Contadores iniciantes sem carteira de clientes",
  "Quem busca ferramentas pontuais sem visão integrada",
];

const AudienceSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsla(199,89%,48%,0.05)_0%,_transparent_50%)]" />
      
      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            Para quem é
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Feito para escritórios que querem{" "}
            <span className="gradient-text">crescer com estratégia</span>
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* For Who */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8"
          >
            <h3 className="mb-6 font-display text-xl font-bold text-primary">
              ✓ O CORTEXCONT é para você se:
            </h3>
            <ul className="space-y-4">
              {forWho.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Not For Who */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border border-muted bg-muted/30 p-6 md:p-8"
          >
            <h3 className="mb-6 font-display text-xl font-bold text-muted-foreground">
              ✕ Não é a melhor opção se:
            </h3>
            <ul className="space-y-4">
              {notForWho.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground/70">
              Sem problemas — o CORTEXCONT é uma plataforma estratégica. 
              Se você está começando, recomendamos focar primeiro na captação e estruturação básica.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
