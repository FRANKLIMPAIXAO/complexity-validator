import Logo from "./Logo";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/556231901562?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20CortexCont.";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm text-muted-foreground">
              © 2026 CORTEXCONT. Todos os direitos reservados.
            </p>
            <p className="text-center text-xs text-muted-foreground/70">
              Sistema Operacional Estratégico para Escritórios Contábeis.
            </p>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
          >
            <MessageCircle className="h-4 w-4" />
            Suporte via WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
