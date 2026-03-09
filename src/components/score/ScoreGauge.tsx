import { motion } from 'framer-motion';
import { ComplexityLevel } from '@/types/database';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  level: ComplexityLevel;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const levelColors: Record<ComplexityLevel, string> = {
  basico: '#22c55e',
  intermediario: '#3b82f6',
  avancado: '#eab308',
  alto_risco: '#f97316',
  critico: '#ef4444',
};

const sizeConfig = {
  sm: { size: 80, stroke: 6, fontSize: 'text-lg' },
  default: { size: 120, stroke: 8, fontSize: 'text-2xl' },
  lg: { size: 160, stroke: 10, fontSize: 'text-4xl' },
};

export default function ScoreGauge({ score, level, size = 'default', className }: ScoreGaugeProps) {
  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = levelColors[level];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-muted/30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('font-bold', config.fontSize)}
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">pontos</span>
      </div>
    </div>
  );
}
