import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export type PeriodValue = 'all' | 'this-month' | 'last-quarter' | 'this-year';

interface PeriodFilterProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
}

export function getPeriodDateRange(period: PeriodValue): { start: Date | null; end: Date | null } {
  const now = new Date();
  switch (period) {
    case 'this-month':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
    case 'last-quarter': {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return { start: threeMonthsAgo, end: now };
    }
    case 'this-year':
      return { start: new Date(now.getFullYear(), 0, 1), end: now };
    default:
      return { start: null, end: null };
  }
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodValue)}>
      <SelectTrigger className="w-full sm:w-48">
        <Calendar className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todo período</SelectItem>
        <SelectItem value="this-month">Este mês</SelectItem>
        <SelectItem value="last-quarter">Último trimestre</SelectItem>
        <SelectItem value="this-year">Este ano</SelectItem>
      </SelectContent>
    </Select>
  );
}
