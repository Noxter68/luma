import { Briefcase, Gift, Laptop, DollarSign, TrendingUp, type LucideIcon } from 'lucide-react-native';

export interface IncomeSourceDefinition {
  id: 'salary' | 'bonus' | 'freelance' | 'gift' | 'other';
  icon: LucideIcon;
  translationKey: string;
}

export const INCOME_SOURCES: IncomeSourceDefinition[] = [
  { id: 'salary', icon: Briefcase, translationKey: 'incomeSources.salary' },
  { id: 'bonus', icon: TrendingUp, translationKey: 'incomeSources.bonus' },
  { id: 'freelance', icon: Laptop, translationKey: 'incomeSources.freelance' },
  { id: 'gift', icon: Gift, translationKey: 'incomeSources.gift' },
  { id: 'other', icon: DollarSign, translationKey: 'incomeSources.other' },
];

export const getIncomeSourceById = (id: string): IncomeSourceDefinition | undefined => {
  return INCOME_SOURCES.find((source) => source.id === id);
};
