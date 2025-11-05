import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

interface BudgetGaugeProps {
  budget: number;
  spent: number;
  recurring: number;
  income: number;
  mode: 'revenue' | 'budget';
}

export const BudgetGauge = ({ budget, spent, recurring, income, mode }: BudgetGaugeProps) => {
  const { isDark, colors } = useTheme();
  const { t, locale } = useTranslation();

  const safeIncome = Number(income) || 0;
  const safeRecurring = Number(recurring) || 0;
  const safeSpent = Number(spent) || 0;
  const safeBudget = Number(budget) || 0;

  // Calcul selon le mode
  let remaining: number;
  let total: number;
  let remainingPercentage: number;

  if (mode === 'revenue') {
    const availableAfterRecurring = safeIncome > 0 ? safeIncome - safeRecurring : safeBudget;
    remaining = availableAfterRecurring - safeSpent;
    total = safeIncome > 0 ? safeIncome : safeBudget;
    remainingPercentage = total > 0 ? (remaining / total) * 100 : 0;
  } else {
    remaining = safeBudget - safeSpent;
    total = safeBudget;
    remainingPercentage = safeBudget > 0 ? (remaining / safeBudget) * 100 : 0;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDisplayPercentage = () => {
    if (isNaN(remainingPercentage)) return '0';
    if (remainingPercentage < 10 && remainingPercentage > 0) {
      return remainingPercentage.toFixed(1);
    }
    return Math.round(remainingPercentage).toString();
  };

  const displayPercentage = getDisplayPercentage();

  const getStatus = () => {
    if (safeBudget === 0 && mode === 'budget') {
      return { label: t('budgetProgress.noBudget'), color: isDark ? colors.dark.textTertiary : colors.light.textTertiary };
    }

    if (safeIncome === 0 && mode === 'revenue') {
      return { label: t('budgetProgress.noRevenue'), color: isDark ? colors.dark.textTertiary : colors.light.textTertiary };
    }

    // Utiliser la palette pour les couleurs
    if (remainingPercentage >= 80) return { label: 'Excellent', color: colors.primary };
    if (remainingPercentage >= 50) return { label: 'Parfait', color: colors.primaryLight };
    if (remainingPercentage >= 25) return { label: 'Bon rythme', color: colors.primaryLight };
    if (remainingPercentage >= 10) return { label: 'Attention', color: isDark ? colors.dark.textSecondary : colors.light.textSecondary };
    if (remainingPercentage > 0) return { label: 'Prudence', color: isDark ? colors.dark.textSecondary : colors.light.textSecondary };
    return { label: 'Dépassé', color: isDark ? colors.dark.textSecondary : colors.light.textSecondary };
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

      {/* Center text */}
      <View style={[tw`items-center justify-center absolute`, { top: 110 }]}>
        <Text style={[tw`text-4xl font-bold mb-1`, { color: status.color }]}>{displayPercentage}%</Text>
        <Text style={[tw`text-lg font-semibold mb-2`, { color: status.color }]}>{status.label}</Text>
        {/* Afficher le montant du budget en mode budget */}
        {mode === 'budget' && safeBudget > 0 && <Text style={tw`text-sm text-white/70`}>{formatCurrency(safeBudget)}</Text>}
      </View>
    </View>
  );
};
