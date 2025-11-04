import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { getCategoryById } from '../utils/categories';
import { CategoryWithProgress } from '../utils/budgetCalculations';
import { Edit2, Repeat } from 'lucide-react-native';

interface CategoryBudgetCardProps {
  categoryBudget: CategoryWithProgress;
  onEdit: () => void;
}

export const CategoryBudgetCard = ({ categoryBudget, onEdit }: CategoryBudgetCardProps) => {
  const { isDark, colors } = useTheme();
  const { t, locale } = useTranslation();

  const categoryData = getCategoryById(categoryBudget.category);
  const IconComponent = categoryData?.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Déterminer la couleur selon le statut
  const getStatusColor = () => {
    if (categoryBudget.isOverBudget) return '#EF4444'; // Red
    if (categoryBudget.isNearLimit) return '#F97316'; // Orange
    return colors.primary;
  };

  const statusColor = getStatusColor();

  // Emoji de statut
  const getStatusEmoji = () => {
    if (categoryBudget.isOverBudget) return '🚨';
    if (categoryBudget.isNearLimit) return '⚠️';
    return '✅';
  };

  return (
    <View style={tw.style('rounded-2xl p-4 mb-3', isDark ? `bg-[${colors.dark.card}] border border-[${colors.dark.border}]` : 'bg-white shadow-sm')}>
      {/* Header */}
      <View style={tw`flex-row items-center mb-3`}>
        {/* Icon avec gradient */}
        <View style={tw`w-10 h-10 rounded-xl mr-3 overflow-hidden`}>
          <LinearGradient colors={[statusColor, statusColor + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tw`w-full h-full items-center justify-center`}>
            <View style={tw`absolute top-0 left-0 w-full h-1/2 opacity-30`}>
              <LinearGradient colors={['rgba(255,255,255,0.4)', 'transparent']} style={tw`w-full h-full`} />
            </View>
            {IconComponent && <IconComponent size={20} color="white" strokeWidth={2.5} />}
          </LinearGradient>
        </View>

        {/* Category name + badges */}
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center gap-2`}>
            <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
              {categoryData ? t(categoryData.translationKey) : categoryBudget.category}
            </Text>
            {categoryBudget.isRecurring && (
              <View style={tw.style('px-2 py-0.5 rounded-lg flex-row items-center gap-1', `bg-[${colors.primary}]/15`)}>
                <Repeat size={12} color={colors.primary} strokeWidth={2.5} />
              </View>
            )}
          </View>

          {/* Amount spent / budget */}
          <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
            {formatCurrency(categoryBudget.spent)} / {formatCurrency(categoryBudget.amount)}
          </Text>
        </View>

        {/* Status emoji + percentage */}
        <View style={tw`items-end`}>
          <Text style={tw`text-2xl mb-1`}>{getStatusEmoji()}</Text>
          <Text style={tw.style('text-lg font-bold', { color: statusColor })}>{Math.round(categoryBudget.percentage)}%</Text>
        </View>

        {/* Edit button */}
        <TouchableOpacity onPress={onEdit} style={tw`ml-2 p-2`}>
          <Edit2 size={18} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={tw.style('h-2 rounded-full overflow-hidden', `bg-[${isDark ? colors.dark.surface : colors.light.border}]`)}>
        <View
          style={[
            tw`h-full rounded-full`,
            {
              width: `${Math.min(categoryBudget.percentage, 100)}%`,
              backgroundColor: statusColor,
            },
          ]}
        />
      </View>

      {/* Remaining amount */}
      <View style={tw`flex-row justify-between items-center mt-2`}>
        <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
          {categoryBudget.remaining > 0 ? t('budgetProgress.remaining') : t('budgetProgress.overBudget')}
        </Text>
        <Text style={tw.style('text-sm font-semibold', { color: statusColor })}>
          {categoryBudget.remaining > 0 ? formatCurrency(categoryBudget.remaining) : formatCurrency(Math.abs(categoryBudget.remaining))}
        </Text>
      </View>
    </View>
  );
};
