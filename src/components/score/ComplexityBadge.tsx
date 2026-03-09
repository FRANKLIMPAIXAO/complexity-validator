import { Badge } from '@/components/ui/badge';
import { ComplexityLevel, COMPLEXITY_LEVEL_LABELS } from '@/types/database';
import { cn } from '@/lib/utils';

interface ComplexityBadgeProps {
  level: ComplexityLevel;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const levelStyles: Record<ComplexityLevel, string> = {
  basico: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediario: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  avancado: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  alto_risco: 'bg-red-500/20 text-red-400 border-red-500/30',
  critico: 'bg-red-700/20 text-red-300 border-red-700/30',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  default: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export default function ComplexityBadge({ level, size = 'default', className }: ComplexityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(levelStyles[level], sizeStyles[size], className)}
    >
      {COMPLEXITY_LEVEL_LABELS[level]}
    </Badge>
  );
}
