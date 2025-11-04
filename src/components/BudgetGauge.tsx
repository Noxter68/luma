import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';

interface BudgetGaugeProps {
  budget: number;
  spent: number;
  recurring: number;
  income: number;
  mode: 'revenue' | 'budget'; // ← AJOUTE ÇA
}

export const BudgetGauge = ({ budget, spent, recurring, income, mode }: BudgetGaugeProps) => {
  const { isDark, colors } = useTheme();

  const safeIncome = Number(income) || 0;
  const safeRecurring = Number(recurring) || 0;
  const safeSpent = Number(spent) || 0;
  const safeBudget = Number(budget) || 0;

  // Calcul selon le mode
  let remaining: number;
  let total: number;
  let remainingPercentage: number;

  if (mode === 'revenue') {
    // MODE REVENUE : Tout par rapport au revenue total
    const availableAfterRecurring = safeIncome > 0 ? safeIncome - safeRecurring : safeBudget;
    remaining = availableAfterRecurring - safeSpent;
    total = safeIncome > 0 ? safeIncome : safeBudget;
    remainingPercentage = total > 0 ? (remaining / total) * 100 : 0;
  } else {
    // MODE BUDGET : Tout par rapport au budget défini
    remaining = safeBudget - safeSpent;
    total = safeBudget;
    remainingPercentage = safeBudget > 0 ? (remaining / safeBudget) * 100 : 0;
  }

  const getDisplayPercentage = () => {
    if (isNaN(remainingPercentage)) return '0';
    if (remainingPercentage < 10 && remainingPercentage > 0) {
      return remainingPercentage.toFixed(1);
    }
    return Math.round(remainingPercentage).toString();
  };

  const displayPercentage = getDisplayPercentage();

  const getStatus = () => {
    if (remainingPercentage >= 80) return { label: 'Excellent', color: colors.primary };
    if (remainingPercentage >= 50) return { label: 'Parfait', color: colors.primaryLight };
    if (remainingPercentage >= 25) return { label: 'Bon rythme', color: '#F4A460' };
    if (remainingPercentage >= 10) return { label: 'Attention', color: '#FF8C42' };
    if (remainingPercentage > 0) return { label: 'Prudence', color: '#FF6B6B' };
    return { label: 'Dépassé', color: '#E63946' };
  };

  const status = getStatus();
  const backgroundColor = isDark ? colors.dark.border : colors.light.border;

  return (
    <View style={tw`items-center justify-center pt-6 pb-1 relative`}>
      {/* Background arc */}
      <View style={tw`items-center justify-center`}>
        <AnimatedCircularProgress size={240} width={20} fill={100} tintColor={backgroundColor} backgroundColor="transparent" rotation={270} arcSweepAngle={180} lineCap="round" duration={0} />
      </View>

      {/* Progress arc */}
      <View style={tw`items-center justify-center absolute top-6`}>
        <AnimatedCircularProgress
          size={240}
          width={20}
          fill={Math.max(0, Math.min(100, remainingPercentage))}
          tintColor={status.color}
          backgroundColor="transparent"
          rotation={270}
          arcSweepAngle={180}
          lineCap="round"
          duration={800}
        />
      </View>

      {/* Center text - Aligned with arc center */}
      <View style={[tw`items-center justify-center absolute`, { top: 120 }]}>
        <Text style={[tw`text-4xl font-bold mb-1`, { color: status.color }]}>{displayPercentage}%</Text>
        <Text style={[tw`text-lg font-semibold`, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
};
