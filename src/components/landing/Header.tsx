import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Entrar
            </Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/signup" className="flex items-center gap-2">
              Começar Grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
