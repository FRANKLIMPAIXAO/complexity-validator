import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PLANS = [
  {
    id: "monthly" as const,
    name: "Plano Mensal",
    price: 49,
    period: "mês",
    badge: null,
    color: "border-border",
    highlight: false,
    features: [
      "Acesso completo ao sistema",
      "Análise de honorários",
      "Métricas do escritório",
      "Dashboard financeiro",
      "Suporte por e-mail",
    ],
  },
  {
    id: "yearly" as const,
    name: "Plano Anual",
    price: 297,
    period: "ano",
    badge: "⭐ MAIS POPULAR",
    color: "border-primary",
    highlight: true,
    features: [
      "Acesso completo ao sistema",
      "Análise de carteira completa",
      "Radar de clientes subprecificados",
      "Benchmark de honorários",
      "IA estratégica ilimitada",
      "Suporte prioritário",
    ],
  },
];

interface PricingSectionProps {
  showTitle?: boolean;
}

export default function PricingSection({ showTitle = true }: PricingSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(planId: "monthly" | "yearly") {
    if (!user) {
      navigate("/signup");
      return;
    }

    setLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke("asaas-checkout", {
        body: { plan: planId },
      });

      if (error || !data?.paymentUrl) {
        // Tentar extrair mensagem de erro da resposta
        let errorMsg = "Erro ao iniciar assinatura. Tente novamente.";
        if (error?.context) {
          try {
            const errData = await error.context.json();
            errorMsg = errData.error ?? errorMsg;
          } catch {}
        }
        toast.error(errorMsg);
        return;
      }

      // Redireciona para a página de pagamento do Asaas
      window.open(data.paymentUrl, "_blank");
      toast.success("Redirecionando para o pagamento...");
    } catch (err) {
      console.error("Erro ao assinar:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section id="planos" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4"
        style={{ background: "linear-gradient(90deg, transparent, hsl(199,89%,48%,0.5), transparent)" }}
      />

      <div className="container relative mx-auto px-4 md:px-6">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Comece agora
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Escolha seu plano{" "}
              <span className="gradient-text">CortexCont</span>
            </h2>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Descubra onde está o lucro do seu escritório.
            </p>
          </motion.div>
        )}

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`relative flex flex-col rounded-2xl border-2 ${plan.color} bg-card/80 p-8 shadow-xl shadow-black/20 backdrop-blur-sm transition-shadow hover:shadow-primary/10`}
            >
              {/* Badge popular */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  {plan.badge}
                </div>
              )}

              {plan.highlight && (
                <div
                  className="absolute inset-0 rounded-2xl opacity-10"
                  style={{ background: "radial-gradient(circle at 50% 0%, hsl(199,89%,48%) 0%, transparent 70%)" }}
                />
              )}

              <div className="relative">
                <h3 className="mb-1 text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mb-6 flex items-end gap-1">
                  <span className="font-display text-5xl font-bold text-foreground">
                    R$ {plan.price}
                  </span>
                  <span className="mb-2 text-muted-foreground">/ {plan.period}</span>
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={plan.highlight ? "hero" : "outline"}
                    size="lg"
                    className="group w-full"
                    disabled={loading === plan.id}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {loading === plan.id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {plan.highlight ? <Star className="h-4 w-4" /> : null}
                        Assinar agora
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </motion.div>

                {plan.id === "yearly" && (
                  <p className="mt-2 text-center text-xs text-primary/70">
                    Equivale a R$ 24,75/mês — economize R$ 291/ano
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Pagamento seguro via PIX, boleto ou cartão de crédito. Cancele quando quiser.
        </motion.p>
      </div>
    </section>
  );
}
