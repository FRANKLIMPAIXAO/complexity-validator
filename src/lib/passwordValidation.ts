import { z } from 'zod';

export const passwordRequirements = [
  { id: 'length', label: 'Mínimo 8 caracteres', regex: /.{8,}/ },
  { id: 'uppercase', label: 'Uma letra maiúscula', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'Uma letra minúscula', regex: /[a-z]/ },
  { id: 'number', label: 'Um número', regex: /[0-9]/ },
  { id: 'symbol', label: 'Um símbolo (!@#$%^&*)', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

export const strongPasswordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um símbolo (!@#$%^&*)');

export const validatePasswordRequirements = (password: string) => {
  return passwordRequirements.map(req => ({
    ...req,
    met: req.regex.test(password),
  }));
};

export const isPasswordStrong = (password: string): boolean => {
  return passwordRequirements.every(req => req.regex.test(password));
};
