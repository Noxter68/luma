import { View, Text } from 'react-native';
import { Card } from './Card';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { BudgetCalculation } from '../types';

interface BudgetMetricsCardProps {
  metrics: BudgetCalculation;
}

export const BudgetMetricsCard = ({ metrics }: BudgetMetricsCardProps) => {
  const { isDark, colors } = useTheme();
  const { t, locale } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card style={tw`mb-4`}>
      <View style={tw`flex-row items-center mb-3`}>
        <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>📊 {t('budgetProgress.availableBudget')}</Text>
      </View>

      <View style={tw`gap-2`}>
        {/* Revenue */}
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>💰 {t('budgetProgress.totalRevenue')}</Text>
          <Text style={tw.style('text-sm font-semibold', `text-[${colors.primary}]`)}>{formatCurrency(metrics.totalRevenue)}</Text>
        </View>

        {/* Recurring */}
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>🔄 Recurring</Text>
          <Text style={tw.style('text-sm font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>-{formatCurrency(metrics.totalRecurring)}</Text>
        </View>

        {/* Divider */}
        <View style={tw.style('h-px my-1', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)} />

        {/* Available */}
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('budgetProgress.availableBudget')}</Text>
          <Text style={tw.style('text-lg font-bold', `text-[${colors.primary}]`)}>{formatCurrency(metrics.availableForBudget)}</Text>
        </View>

        {/* Budgeted */}
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>📝 {t('budgetProgress.consumed')}</Text>
          <Text style={tw.style('text-sm font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>-{formatCurrency(metrics.totalBudgeted)}</Text>
        </View>

        {/* Target Savings */}
        {metrics.targetSavings > 0 && (
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>💾 Savings ciblé</Text>
            <Text style={tw.style('text-sm font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>-{formatCurrency(metrics.targetSavings)}</Text>
          </View>
        )}

        {/* Divider */}
        <View style={tw.style('h-px my-1', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)} />

        {/* Buffer */}
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>✨ Buffer libre</Text>
          <Text style={tw.style('text-lg font-bold', { color: metrics.buffer >= 0 ? colors.primary : '#EF4444' })}>{formatCurrency(metrics.buffer)}</Text>
        </View>
      </View>

      {/* Warning si buffer négatif */}
      {metrics.buffer < 0 && (
        <View style={tw`mt-3 p-3 rounded-xl bg-red-500/10`}>
          <Text style={tw`text-red-500 text-xs font-medium text-center`}>⚠️ {locale === 'fr' ? 'Ton budget dépasse le disponible' : 'Your budget exceeds available amount'}</Text>
        </View>
      )}
    </Card>
  );
};
