import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ClientPlan } from '@/types/clientPlan';

interface PlanBadgeProps {
  plan: ClientPlan | null | undefined;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  default: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default function PlanBadge({ plan, size = 'default', className }: PlanBadgeProps) {
  if (!plan) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'bg-muted text-muted-foreground border-border',
          sizeStyles[size],
          className
        )}
      >
        Sem plano
      </Badge>
    );
  }

  const textColor = getContrastColor(plan.color);

  return (
    <Badge
      className={cn(sizeStyles[size], className)}
      style={{
        backgroundColor: plan.color,
        color: textColor,
        borderColor: plan.color,
      }}
    >
      {plan.name}
    </Badge>
  );
}
