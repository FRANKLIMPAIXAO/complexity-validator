import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "7 dias grátis para testar",
  "Sem cartão de crédito",
  "Acesso completo a todas as funcionalidades",
  "Cancele quando quiser",
];

const CTASection = () => {
  return (
    <section id="cta-section" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsla(199,89%,48%,0.1)_0%,_transparent_50%)]" />
      <div className="absolute left-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
      
      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4" />
            Comece Agora
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Transforme a gestão do seu{" "}
            <span className="gradient-text">escritório contábil</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Comece seu período de teste gratuito de 7 dias e descubra como o CORTEXCONT 
            pode revolucionar sua precificação e gestão estratégica.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-xl"
        >
          <div className="gradient-border rounded-2xl bg-card/80 p-6 backdrop-blur-sm md:p-8 text-center">
            <div className="mb-6 space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-center gap-2 text-muted-foreground"
                >
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            <Button
              variant="hero"
              size="xl"
              className="w-full"
              asChild
            >
              <Link to="/signup">
                Começar Trial Grátis de 7 Dias
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Crie sua conta em menos de 2 minutos. Sem compromisso.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
