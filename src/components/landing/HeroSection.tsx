import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient orbs
const GradientOrbs = () => {
  return (
    <>
      <motion.div
        className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(199, 89%, 48%) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -left-20 top-1/2 h-[400px] w-[400px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, hsl(174, 72%, 46%) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute left-1/3 bottom-1/4 h-[300px] w-[300px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(220, 70%, 50%) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
};

// Animated grid lines
const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="hsl(220, 20%, 25%)"
              strokeWidth="0.5"
            />
          </pattern>
          <linearGradient id="gridFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#gridFade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)" />
      </svg>
      
      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        animate={{
          top: ["0%", "100%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

// Glowing text effect
const GlowingBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6 relative"
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <span className="relative inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
        <motion.span
          className="h-2 w-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        15 Dias Grátis • Teste Completo
      </span>
    </motion.div>
  );
};

const HeroSection = () => {
  const scrollToModules = () => {
    document.getElementById("modules-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
      <GradientOrbs />
      <AnimatedGrid />
      <FloatingParticles />

      <div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center md:px-6">
        <GlowingBadge />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
        >
          Pare de gerenciar seu escritório{" "}
          <motion.span
            className="gradient-text inline-block"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            no escuro.
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 max-w-3xl text-lg text-muted-foreground md:text-xl"
        >
          PRAXIS é o sistema operacional estratégico que transforma dados contábeis 
          em decisões, execução e crescimento sustentável.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="hero" size="xl" asChild className="relative overflow-hidden group">
              <Link to="/signup">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Começar Trial Grátis
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="heroOutline" size="xl" onClick={scrollToModules} className="group">
              <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
              Ver os módulos
            </Button>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          Sem cartão de crédito. Cancele quando quiser.
        </motion.p>

        {/* Stats Preview with hover effects */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-4 md:gap-8"
        >
          {[
            { value: "7", label: "módulos integrados" },
            { value: "IA", label: "insights estratégicos" },
            { value: "100%", label: "baseado em dados reais" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                borderColor: "hsl(199, 89%, 48%)",
              }}
              className="relative rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm md:p-6 cursor-default transition-colors"
            >
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary/5 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="relative font-display text-2xl font-bold text-primary md:text-3xl"
                animate={{
                  textShadow: [
                    "0 0 0px hsl(199, 89%, 48%)",
                    "0 0 10px hsl(199, 89%, 48%)",
                    "0 0 0px hsl(199, 89%, 48%)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
              >
                {stat.value}
              </motion.div>
              <div className="relative mt-1 text-xs text-muted-foreground md:text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground/50 uppercase tracking-widest">Scroll</span>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-2 w-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
