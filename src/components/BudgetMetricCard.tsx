import { View, Text } from 'react-native';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { BudgetCalculation } from '../types';
import { CategoryWithProgress } from '../utils/budgetCalculations';
import { getCategoryById } from '../utils/categories';
import { Wallet, TrendingUp } from 'lucide-react-native';

interface BudgetMetricsCardProps {
  metrics: BudgetCalculation;
  categoryBudgets?: CategoryWithProgress[];
}

export const BudgetMetricsCard = ({ metrics, categoryBudgets }: BudgetMetricsCardProps) => {
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

  const isPositive = metrics.buffer >= 0;

  return (
    <View style={tw`mb-4`}>
      {/* Budget Global Overview */}
      <View style={tw.style('rounded-2xl p-5 mb-4', isDark ? `bg-[${colors.dark.card}]` : 'bg-white', 'shadow-sm')}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <View style={tw.style('w-8 h-8 rounded-full justify-center items-center', `bg-[${colors.primary}]/20`)}>
                <Wallet size={16} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={tw.style('text-xs font-medium', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('budgetProgress.availableBudget')}</Text>
            </View>
            <Text style={tw.style('text-2xl font-bold', `text-[${colors.primary}]`)}>{formatCurrency(metrics.availableForBudget)}</Text>
          </View>

          <View style={tw`items-end`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <View style={tw.style('w-8 h-8 rounded-full justify-center items-center', isPositive ? `bg-[${colors.primary}]/20` : 'bg-orange-500/20')}>
                <TrendingUp size={16} color={isPositive ? colors.primary : '#F59E0B'} strokeWidth={2} />
              </View>
              <Text style={tw.style('text-xs font-medium', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('budgetProgress.remaining')}</Text>
            </View>
            <Text style={tw.style('text-2xl font-bold', `text-[${isPositive ? colors.primary : '#F59E0B'}]`)}>{formatCurrency(metrics.buffer)}</Text>
          </View>
        </View>

        {/* Info text */}
        <Text style={tw.style('text-xs text-center', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
          {locale === 'fr' ? 'Budget disponible après dépenses récurrentes' : 'Available budget after recurring expenses'}
        </Text>
      </View>

      {/* Category Budgets List */}
      {categoryBudgets.length > 0 && (
        <View>
          <Text style={tw.style('text-base font-semibold mb-3 px-1', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('categoryBudgets')}</Text>

          {categoryBudgets.map((catBudget) => {
            const categoryData = getCategoryById(catBudget.category);
            const IconComponent = categoryData?.icon;

            // Déterminer la couleur selon le statut
            const getStatusColor = () => {
              if (catBudget.isOverBudget) return '#EF4444'; // Red
              if (catBudget.isNearLimit) return '#F97316'; // Orange
              return colors.primary;
            };

            const statusColor = getStatusColor();

            return (
              <View key={catBudget.id} style={tw.style('rounded-2xl p-4 mb-3', isDark ? `bg-[${colors.dark.card}]` : 'bg-white', 'shadow-sm')}>
                {/* Header */}
                <View style={tw`flex-row items-center mb-3`}>
                  {/* Icon */}
                  <View style={tw.style('w-8 h-8 rounded-full justify-center items-center mr-3', `bg-[${colors.primary}]/20`)}>
                    {IconComponent && <IconComponent size={20} color={colors.primary} strokeWidth={2} />}
                  </View>

                  {/* Category name + spent/budget */}
                  <View style={tw`flex-1`}>
                    <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                      {categoryData ? t(categoryData.translationKey) : catBudget.category}
                    </Text>
                    <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                      {formatCurrency(catBudget.spent)} / {formatCurrency(catBudget.amount)}
                    </Text>
                  </View>

                  {/* Percentage */}
                  <Text style={tw.style('text-lg font-bold', { color: statusColor })}>{Math.round(catBudget.percentage)}%</Text>
                </View>

                {/* Progress bar */}
                <View style={tw.style('h-2 rounded-full overflow-hidden', `bg-[${isDark ? colors.dark.surface : colors.light.border}]`)}>
                  <View
                    style={[
                      tw`h-full rounded-full`,
                      {
                        width: `${Math.min(catBudget.percentage, 100)}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>

                {/* Remaining amount */}
                <View style={tw`flex-row justify-between items-center mt-2`}>
                  <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                    {catBudget.remaining > 0 ? t('budgetProgress.remaining') : t('budgetProgress.overBudget')}
                  </Text>
                  <Text style={tw.style('text-sm font-semibold', { color: statusColor })}>{formatCurrency(Math.abs(catBudget.remaining))}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};
