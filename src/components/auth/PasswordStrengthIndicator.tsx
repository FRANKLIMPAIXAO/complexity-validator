import React from 'react';
import { Check, X } from 'lucide-react';
import { validatePasswordRequirements } from '@/lib/passwordValidation';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const requirements = validatePasswordRequirements(password);
  const metCount = requirements.filter(r => r.met).length;
  const strength = metCount / requirements.length;

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-muted';
    if (strength < 0.4) return 'bg-destructive';
    if (strength < 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength < 0.4) return 'Fraca';
    if (strength < 0.8) return 'Média';
    if (strength < 1) return 'Boa';
    return 'Forte';
  };

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Força da senha</span>
          <span className={cn(
            "font-medium",
            strength < 0.4 && password.length > 0 && "text-destructive",
            strength >= 0.4 && strength < 0.8 && "text-yellow-500",
            strength >= 0.8 && "text-green-500"
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", getStrengthColor())}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements list */}
      <div className="grid grid-cols-1 gap-1.5">
        {requirements.map((req) => (
          <div 
            key={req.id}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              req.met ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {req.met ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
