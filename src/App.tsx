import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { CompetenceProvider } from "@/contexts/CompetenceContext";
import ProtectedRoute from "@/components/app/ProtectedRoute";
import AppLayout from "@/components/app/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TrialExpired from "./pages/TrialExpired";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientNew from "./pages/ClientNew";
import ClientDetail from "./pages/ClientDetail";
import ClientEdit from "./pages/ClientEdit";
import Ranking from "./pages/Ranking";
import Strategy from "./pages/Strategy";
import Benchmark from "./pages/Benchmark";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import BetaAdmin from "./pages/BetaAdmin";
import Documents from "./pages/Documents";
import Videos from "./pages/Videos";
import Orcamento from "./pages/financeiro/Orcamento";
import Custos from "./pages/financeiro/Custos";
import PontoEquilibrio from "./pages/financeiro/PontoEquilibrio";
import SimuladorCrescimento from "./pages/financeiro/SimuladorCrescimento";
import Rentabilidade from "./pages/financeiro/Rentabilidade";
import RelatorioFinanceiro from "./pages/financeiro/RelatorioFinanceiro";
import AnaliseCarteira from "./pages/ia-estrategica/AnaliseCarteira";
import ClientesSubprecificados from "./pages/ia-estrategica/ClientesSubprecificados";
import RecomendacaoHonorarios from "./pages/ia-estrategica/RecomendacaoHonorarios";
import EstrategiaCrescimento from "./pages/ia-estrategica/EstrategiaCrescimento";
import StrategicAdvisor from "./pages/ia-estrategica/StrategicAdvisor";
import RadarVisaoGeral from "./pages/radar/RadarVisaoGeral";
import ReajustesRecomendados from "./pages/radar/ReajustesRecomendados";
import ClientesPrejuizo from "./pages/radar/ClientesPrejuizo";
import SegmentosOportunidades from "./pages/radar/SegmentosOportunidades";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <CompanyProvider>
          <CompetenceProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/trial-expired" element={<TrialExpired />} />
                  <Route path="/pricing" element={<Pricing />} />

                  {/* Protected routes */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/clients/new" element={<ClientNew />} />
                    <Route path="/clients/:id" element={<ClientDetail />} />
                    <Route path="/clients/:id/edit" element={<ClientEdit />} />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route path="/strategy" element={<Strategy />} />
                    <Route path="/benchmark" element={<Benchmark />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin/beta" element={<BetaAdmin />} />
                    <Route path="/financeiro/orcamento" element={<Orcamento />} />
                    <Route path="/financeiro/custos" element={<Custos />} />
                    <Route path="/financeiro/equilibrio" element={<PontoEquilibrio />} />
                    <Route path="/financeiro/simulador" element={<SimuladorCrescimento />} />
                    <Route path="/financeiro/rentabilidade" element={<Rentabilidade />} />
                    <Route path="/financeiro/relatorio" element={<RelatorioFinanceiro />} />
                    <Route path="/ia-estrategica/carteira" element={<AnaliseCarteira />} />
                    <Route path="/ia-estrategica/subprecificados" element={<ClientesSubprecificados />} />
                    <Route path="/ia-estrategica/honorarios" element={<RecomendacaoHonorarios />} />
                    <Route path="/ia-estrategica/crescimento" element={<EstrategiaCrescimento />} />
                    <Route path="/ia-estrategica/advisor" element={<StrategicAdvisor />} />
                    <Route path="/radar/visao-geral" element={<RadarVisaoGeral />} />
                    <Route path="/radar/reajustes" element={<ReajustesRecomendados />} />
                    <Route path="/radar/prejuizo" element={<ClientesPrejuizo />} />
                    <Route path="/radar/segmentos" element={<SegmentosOportunidades />} />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CompetenceProvider>
        </CompanyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
