import cortexcontLogo from "@/assets/cortexcont-logo.png";

const Logo = () => {
  return (
    <div className="flex items-center">
      <img 
        src={cortexcontLogo} 
        alt="CORTEXCONT Logo" 
        className="h-10 w-auto object-contain"
      />
    </div>
  );
};

export default Logo;
