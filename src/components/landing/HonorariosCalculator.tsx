import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ChevronRight, Sparkles, ArrowRight, TrendingUp, Users, FileText, Building2, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// ─── Tipagem ───────────────────────────────────────────────────────────────
type Regime = "mei" | "simples" | "presumido" | "real";
type Atividade = "comercio" | "servicos" | "industria" | "liberal";

interface FormState {
  faturamento: string;
  regime: Regime;
  funcionarios: string;
  notasFiscais: string;
  atividade: Atividade;
  complexidades: string[];
}

// ─── Lógica de cálculo ─────────────────────────────────────────────────────
const REGIME_SCORE: Record<Regime, number> = {
  mei: 10,
  simples: 30,
  presumido: 50,
  real: 70,
};

const COMPLEXIDADE_LABELS: Record<string, string> = {
  substituicao: "Substituição Tributária",
  importacao: "Importação",
  ecommerce: "E-commerce",
  folha_complexa: "Folha Complexa",
};

function calcularHonorario(form: FormState): number {
  let score = REGIME_SCORE[form.regime];

  // Funcionários: cada 2 funcionários = +5 pontos (máx +30)
  const func = parseInt(form.funcionarios) || 0;
  score += Math.min(30, Math.floor(func / 2) * 5);

  // Notas fiscais: cada 20 notas = +5 pontos (máx +20)
  const nfs = parseInt(form.notasFiscais) || 0;
  score += Math.min(20, Math.floor(nfs / 20) * 5);

  // Complexidades: cada uma +10
  score += form.complexidades.length * 10;

  // Faturação: pega apenas os dígitos do campo formatado
  const fat = parseInt(form.faturamento.replace(/\D/g, "")) || 0;
  let fatorFat = 1.0;
  if (fat > 500000) fatorFat = 1.5;
  else if (fat > 200000) fatorFat = 1.3;
  else if (fat > 100000) fatorFat = 1.15;
  else if (fat > 50000) fatorFat = 1.05;

  // Fator atividade
  const fatAtividade: Record<Atividade, number> = {
    comercio: 1.0,
    servicos: 1.1,
    industria: 1.2,
    liberal: 1.0,
  };

  // Honorário = score × fator base × fator faturamento × fator atividade
  const fatorBase = 16; // R$ por ponto de score
  return Math.round(score * fatorBase * fatorFat * fatAtividade[form.atividade] / 10) * 10;
}

// ─── Utilidades ───────────────────────────────────────────────────────────
function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatFaturamento(raw: string) {
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";
  const num = parseInt(digits);
  // Formata como moeda sem decimais (o usuário digita o valor cheio, ex: 50000 = R$ 50.000)
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(num);
}

// ─── Componente principal ─────────────────────────────────────────────────
export default function HonorariosCalculator() {
  const [form, setForm] = useState<FormState>({
    faturamento: "",
    regime: "simples",
    funcionarios: "",
    notasFiscais: "",
    atividade: "servicos",
    complexidades: [],
  });

  const [resultado, setResultado] = useState<number | null>(null);
  const [calculando, setCalculando] = useState(false);

  function toggleComplexidade(key: string) {
    setForm((prev) => ({
      ...prev,
      complexidades: prev.complexidades.includes(key)
        ? prev.complexidades.filter((c) => c !== key)
        : [...prev.complexidades, key],
    }));
    setResultado(null);
  }

  async function handleCalcular() {
    setCalculando(true);
    setResultado(null);
    await new Promise((r) => setTimeout(r, 800));
    setResultado(calcularHonorario(form));
    setCalculando(false);
    // Scroll suave para o resultado
    setTimeout(() => {
      document.getElementById("calc-result")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  // Válido se faturamento foi digitado. Funcionários e notas são opcionais (0 é aceito).
  const isValid = form.faturamento.length > 0;

  return (
    <section id="calculadora" className="relative py-24 overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-background to-card/30" />
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4"
        style={{ background: "linear-gradient(90deg, transparent, hsl(199,89%,48%,0.5), transparent)" }}
      />

      <div className="container relative mx-auto px-4 md:px-6">
        {/* Cabeçalho da seção */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Calculator className="h-4 w-4" />
            Ferramenta Gratuita
          </div>
          <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Calculadora de{" "}
            <span className="gradient-text">Honorários Contábeis</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Descubra rapidamente quanto você deveria cobrar de cada cliente.
          </p>
        </motion.div>

        {/* Card do formulário */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-3xl"
        >
          <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm md:p-8">
            
            {/* Grid de campos */}
            <div className="grid gap-5 sm:grid-cols-2">
              
              {/* Faturamento */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Faturamento mensal do cliente
                </label>
                <input
                  type="text"
                  placeholder="R$ 0"
                  value={form.faturamento}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, faturamento: formatFaturamento(e.target.value) }));
                    setResultado(null);
                  }}
                  className="w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              {/* Regime tributário */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  Regime tributário
                </label>
                <select
                  value={form.regime}
                  onChange={(e) => { setForm((f) => ({ ...f, regime: e.target.value as Regime })); setResultado(null); }}
                  className="w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="mei">MEI</option>
                  <option value="simples">Simples Nacional</option>
                  <option value="presumido">Lucro Presumido</option>
                  <option value="real">Lucro Real</option>
                </select>
              </div>

              {/* Funcionários */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Quantidade de funcionários
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="Ex: 5"
                  value={form.funcionarios}
                  onChange={(e) => { setForm((f) => ({ ...f, funcionarios: e.target.value })); setResultado(null); }}
                  className="w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              {/* Notas fiscais */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  Média de notas fiscais/mês
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="Ex: 40"
                  value={form.notasFiscais}
                  onChange={(e) => { setForm((f) => ({ ...f, notasFiscais: e.target.value })); setResultado(null); }}
                  className="w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              {/* Atividade */}
              <div className="space-y-2 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  Tipo de atividade
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(["comercio", "servicos", "industria", "liberal"] as Atividade[]).map((a) => {
                    const label = { comercio: "Comércio", servicos: "Serviços", industria: "Indústria", liberal: "Prof. Liberal" }[a];
                    return (
                      <button
                        key={a}
                        onClick={() => { setForm((f) => ({ ...f, atividade: a })); setResultado(null); }}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                          form.atividade === a
                            ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                            : "border-border bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complexidades */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Complexidade adicional</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(COMPLEXIDADE_LABELS).map(([key, label]) => {
                    const checked = form.complexidades.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleComplexidade(key)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                          checked
                            ? "border-primary/60 bg-primary/10 text-primary"
                            : "border-border bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {checked ? (
                          <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 shrink-0" />
                        )}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Botão calcular */}
            <motion.div className="mt-7" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="hero"
                size="xl"
                className="relative w-full overflow-hidden group"
                disabled={!isValid || calculando}
                onClick={handleCalcular}
              >
                {calculando ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Calculando...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calcular Honorário Ideal
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Resultado */}
            <AnimatePresence>
              {resultado !== null && (
                <motion.div
                  id="calc-result"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                  className="mt-6"
                >
                  {/* Card do resultado */}
                  <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-cyan-500/10 p-6 text-center shadow-lg shadow-primary/10">
                    {/* Brilho */}
                    <div className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(circle at 50% 0%, hsl(199,89%,48%,0.15) 0%, transparent 70%)" }} />
                    
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                    >
                      <div className="relative mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                        <Sparkles className="h-4 w-4" />
                        Honorário Recomendado
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <motion.div
                        className="mb-2 font-display text-5xl font-bold text-foreground md:text-6xl"
                        animate={{ textShadow: ["0 0 0px hsl(199,89%,48%)", "0 0 20px hsl(199,89%,48%,0.5)", "0 0 0px hsl(199,89%,48%)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {formatCurrency(resultado)}
                      </motion.div>
                      <div className="text-lg font-medium text-primary">/ mês</div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Esse valor é baseado na complexidade operacional do cliente.
                      </p>
                    </motion.div>
                  </div>

                  {/* Seção CTA após resultado */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 rounded-xl border border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 p-6"
                  >
                    {/* Cabeçalho do CTA */}
                    <div className="mb-4 text-center">
                      <p className="text-base font-semibold text-foreground">
                        Essa análise mostra apenas{" "}
                        <span className="text-primary">1 cliente.</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        O CortexCont analisa toda sua carteira e revela
                        onde está o lucro do seu escritório.
                      </p>
                    </div>

                    {/* Lista de benefícios */}
                    <div className="mb-5 space-y-2">
                      {[
                        "Clientes subprecificados",
                        "Honorários abaixo do ideal",
                        "Oportunidades de lucro no escritório",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                            <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="font-medium text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Texto antes do botão */}
                    <p className="mb-4 text-center text-xs text-muted-foreground">
                      Esse cálculo mostra apenas um cliente.
                      <br />
                      <span className="font-medium text-foreground/70">O CortexCont revela quanto sua carteira inteira pode estar deixando na mesa.</span>
                    </p>

                    {/* Botão principal */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="hero" size="lg" asChild className="group w-full">
                        <Link to="/signup">
                          <span className="flex items-center justify-center gap-2">
                            👉 Analisar toda minha carteira
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Link>
                      </Button>
                    </motion.div>

                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      Experimente 7 dias gr\u00e1tis. Cancele quando quiser.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
