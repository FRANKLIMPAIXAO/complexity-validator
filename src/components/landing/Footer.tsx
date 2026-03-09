import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />
          <p className="text-center text-sm text-muted-foreground">
            © 2026 CORTEXCONT. Todos os direitos reservados.
          </p>
          <p className="text-center text-xs text-muted-foreground/70">
            Sistema Operacional Estratégico para Escritórios Contábeis.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
