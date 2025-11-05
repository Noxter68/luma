import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { CategoryWithProgress } from '../utils/budgetCalculations';
import { getCategoryById } from '../utils/categories';
import { ChevronRight, Repeat } from 'lucide-react-native';

interface CategoryBudgetCardProps {
  categoryBudget: CategoryWithProgress;
  onEdit: () => void;
}

export const CategoryBudgetCard = ({ categoryBudget, onEdit }: CategoryBudgetCardProps) => {
  const { isDark, colors } = useTheme();
  const { t, locale } = useTranslation();

  const categoryData = getCategoryById(categoryBudget.category);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Couleur progressive basée sur la palette uniquement
  const getProgressColor = () => {
    if (categoryBudget.percentage >= 100) return colors.primary;
    if (categoryBudget.percentage >= 80) return colors.primaryLight;
    return colors.primary;
  };

  const progressColor = getProgressColor();
  const Icon = categoryData?.icon;

  return (
    <TouchableOpacity
      onPress={onEdit}
      activeOpacity={0.7}
      style={tw.style('rounded-2xl p-5 mb-3', isDark ? `bg-[${colors.dark.card}]` : 'bg-white', 'border', isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`)}
    >
      {/* Header Row */}
      <View style={tw`flex-row items-start justify-between mb-4`}>
        {/* Left: Icon + Name */}
        <View style={tw`flex-1 flex-row items-start gap-3`}>
          {/* Icon avec background subtil */}
          {Icon && (
            <View style={tw.style('w-6 h-6 rounded-xl items-center justify-center', `bg-[${colors.primary}]/10`)}>
              <Icon size={22} color={colors.primary} strokeWidth={2} />
            </View>
          )}

          {/* Category Info */}
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center gap-2 mb-1`}>
              <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                {categoryData ? t(categoryData.translationKey) : categoryBudget.category}
              </Text>

              {/* Badge récurrent minimaliste */}
              {categoryBudget.isRecurring && (
                <View style={tw.style('w-2 h-2 rounded items-center justify-center', `bg-[${colors.primary}]/15`)}>
                  <Repeat size={9} color={colors.primary} strokeWidth={2.5} />
                </View>
              )}
            </View>

            {/* Budget Info - Compact et discret */}
            <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>Budget: {formatCurrency(categoryBudget.amount)}</Text>
          </View>
        </View>

        {/* Right: Percentage + Arrow */}
        <View style={tw`items-end ml-3`}>
          <Text
            style={tw.style('text-2xl font-bold leading-none mb-1', {
              color: progressColor,
            })}
          >
            {Math.round(categoryBudget.percentage)}%
          </Text>
          <ChevronRight size={16} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
        </View>
      </View>

      {/* Progress Bar - Fine et élégante */}
      <View style={tw.style('h-1.5 rounded-full overflow-hidden', `bg-[${isDark ? colors.dark.surface : colors.light.bg}]`)}>
        <View
          style={[
            tw`h-full rounded-full`,
            {
              width: `${Math.min(categoryBudget.percentage, 100)}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};
