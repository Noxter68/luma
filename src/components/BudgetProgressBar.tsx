import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

interface BudgetProgressBarProps {
  revenue: number;
  budget: number;
  spent: number;
  recurring: number;
}

export const BudgetProgressBar = ({ revenue, budget, spent, recurring }: BudgetProgressBarProps) => {
  const { isDark, colors } = useTheme();
  const { t, locale } = useTranslation();

  const safeRevenue = Number(revenue) || 0;
  const safeBudget = Number(budget) || 0;
  const safeSpent = Number(spent) || 0;
  const safeRecurring = Number(recurring) || 0;

  const totalConsumed = safeSpent + safeRecurring;
  const remaining = safeRevenue - totalConsumed;
  const budgetPercentage = safeRevenue > 0 ? (safeBudget / safeRevenue) * 100 : 0;
  const consumedPercentage = safeRevenue > 0 ? (totalConsumed / safeRevenue) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status basé sur budget vs dépenses
  const getStatus = () => {
    if (safeBudget === 0) return { label: t('budgetProgress.noBudget'), color: isDark ? colors.dark.textTertiary : colors.light.textTertiary };

    const percentUsed = (totalConsumed / safeBudget) * 100;
    if (percentUsed <= 50) return { label: t('budgetProgress.onTrack'), color: colors.primary };
    if (percentUsed <= 80) return { label: t('budgetProgress.careful'), color: '#F4A460' };
    if (percentUsed <= 100) return { label: t('budgetProgress.nearLimit'), color: '#FF8C42' };
    return { label: t('budgetProgress.overBudget'), color: '#E63946' };
  };

  const status = getStatus();

  return (
    <View style={tw`items-center justify-center pt-6 pb-4`}>
      {/* Revenue Total */}
      <View style={tw`mb-6 items-center`}>
        <Text style={tw.style('text-sm mb-2', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budgetProgress.totalRevenue')}</Text>
        <Text style={tw.style('text-5xl font-bold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{formatCurrency(safeRevenue)}</Text>
      </View>

      {/* Budget Bar */}
      {safeBudget > 0 && (
        <View style={tw`w-full px-8 mb-6`}>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <View>
              <Text style={tw.style('text-sm font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('budgetProgress.budgetLimit')}</Text>
              <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                {budgetPercentage.toFixed(0)}% {t('budgetProgress.ofRevenue')}
              </Text>
            </View>
            <Text style={tw.style('text-lg font-bold', `text-[${colors.primary}]`)}>{formatCurrency(safeBudget)}</Text>
          </View>

          {/* Progress Bar Container */}
          <View style={tw.style('h-8 rounded-full overflow-hidden', `bg-[${isDark ? colors.dark.surface : colors.light.border}]`)}>
            {/* Budget Line (background) */}
            <View style={tw`absolute left-0 top-0 h-full w-full flex-row`}>
              <View style={[{ width: `${Math.min(budgetPercentage, 100)}%` }, tw.style('h-full', `bg-[${colors.primary}]/20`)]} />
            </View>

            {/* Consumed (foreground) */}
            <View style={tw`absolute left-0 top-0 h-full overflow-hidden`} pointerEvents="none">
              <LinearGradient
                colors={[status.color, `${status.color}CC`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[{ width: `${Math.min(consumedPercentage * (100 / budgetPercentage), 100)}%` }, tw`h-full`]}
              />
            </View>

            {/* Budget marker */}
            <View style={[tw`absolute top-0 h-full w-1`, { left: `${Math.min(budgetPercentage, 100)}%` }, tw.style(`bg-[${colors.primary}]`)]} />
          </View>

          {/* Legend */}
          <View style={tw`flex-row justify-between mt-2 px-1`}>
            <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>0€</Text>
            <Text style={tw.style('text-xs font-medium', { color: status.color })}>{status.label}</Text>
            <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{formatCurrency(safeRevenue)}</Text>
          </View>
        </View>
      )}

      {/* Stats Grid */}
      <View style={tw`w-full px-8 flex-row gap-3`}>
        <View style={tw.style('flex-1 rounded-2xl p-4', isDark ? `bg-[${colors.dark.card}]` : 'bg-white shadow-sm')}>
          <Text style={tw.style('text-xs mb-1', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('budgetProgress.consumed')}</Text>
          <Text style={tw.style('text-lg font-bold', { color: status.color })}>{formatCurrency(totalConsumed)}</Text>
        </View>

        <View style={tw.style('flex-1 rounded-2xl p-4', isDark ? `bg-[${colors.dark.card}]` : 'bg-white shadow-sm')}>
          <Text style={tw.style('text-xs mb-1', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('budgetProgress.remaining')}</Text>
          <Text style={tw.style('text-lg font-bold', `text-[${colors.primary}]`)}>{formatCurrency(remaining)}</Text>
        </View>
      </View>
    </View>
  );
};
