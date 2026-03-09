import cortexcontLogo from "@/assets/cortexcont-logo.png";

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={cortexcontLogo} 
        alt="CORTEXCONT Logo" 
        className="h-10 w-auto object-contain"
      />
      <div className="flex flex-col">
        <span className="font-display text-xl font-bold leading-tight tracking-tight">
          CORTEXCONT
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Sistema Operacional Estratégico
        </span>
      </div>
    </div>
  );
};

export default Logo;
