import { View, Text, TouchableOpacity, Modal } from 'react-native';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { getCategoryById } from '../utils/categories';
import { CategoryWithProgress } from '../utils/budgetCalculations';
import { AlertTriangle, X } from 'lucide-react-native';

interface CategoryBudgetAlertProps {
  category: CategoryWithProgress;
  visible: boolean;
  onClose: () => void;
  onViewDetails?: () => void;
}

export const CategoryBudgetAlert = ({ category, visible, onClose, onViewDetails }: CategoryBudgetAlertProps) => {
  const { isDark, colors } = useTheme();
  const { t, locale } = useTranslation();

  const categoryData = getCategoryById(category.category);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMessage = () => {
    const categoryName = categoryData ? t(categoryData.translationKey) : category.category;

    if (category.isOverBudget) {
      return locale === 'fr' ? `Tu as dépassé ton budget ${categoryName} ! 🚨` : `You've exceeded your ${categoryName} budget! 🚨`;
    }

    if (category.isNearLimit) {
      return locale === 'fr'
        ? `Hey, tu as atteint ${Math.round(category.percentage)}% de ton budget ${categoryName} ⚠️`
        : `Hey, you've reached ${Math.round(category.percentage)}% of your ${categoryName} budget ⚠️`;
    }

    return '';
  };

  const getMotivationalMessage = () => {
    if (locale === 'fr') {
      return 'Continue comme ça pour atteindre tes objectifs ! 💪';
    }
    return 'Keep it up to reach your goals! 💪';
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={tw`flex-1 bg-black/60 justify-center items-center px-6`}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={tw.style('rounded-3xl p-6 max-w-md', isDark ? `bg-[${colors.dark.card}]` : 'bg-white')}>
            {/* Header */}
            <View style={tw`flex-row items-start justify-between mb-4`}>
              <View style={tw`flex-1 mr-3`}>
                <View style={tw`flex-row items-center gap-2 mb-2`}>
                  <AlertTriangle size={24} color={category.isOverBudget ? '#EF4444' : '#F97316'} strokeWidth={2.5} />
                  <Text style={tw.style('text-xl font-bold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{getMessage()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={tw`p-1`}>
                <X size={24} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={tw.style('rounded-2xl p-4 mb-4', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.bg}]`)}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budgetProgress.consumed')}</Text>
                <Text style={tw.style('text-base font-bold', { color: category.isOverBudget ? '#EF4444' : '#F97316' })}>
                  {formatCurrency(category.spent)} / {formatCurrency(category.amount)}
                </Text>
              </View>

              <View style={tw.style('h-2 rounded-full overflow-hidden', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)}>
                <View
                  style={[
                    tw`h-full rounded-full`,
                    {
                      width: `${Math.min(category.percentage, 100)}%`,
                      backgroundColor: category.isOverBudget ? '#EF4444' : '#F97316',
                    },
                  ]}
                />
              </View>

              <View style={tw`flex-row justify-between items-center mt-2`}>
                <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                  {category.remaining > 0 ? t('budgetProgress.remaining') : t('budgetProgress.overBudget')}
                </Text>
                <Text style={tw.style('text-base font-bold', { color: category.isOverBudget ? '#EF4444' : '#F97316' })}>
                  {category.remaining > 0 ? formatCurrency(category.remaining) : `+${formatCurrency(Math.abs(category.remaining))}`}
                </Text>
              </View>
            </View>

            {/* Motivational message */}
            <Text style={tw.style('text-sm text-center mb-4 italic', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{getMotivationalMessage()}</Text>

            {/* Actions */}
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity onPress={onClose} style={tw.style('flex-1 py-3 rounded-xl items-center', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.border}]`)}>
                <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{locale === 'fr' ? 'OK, merci' : 'OK, thanks'}</Text>
              </TouchableOpacity>

              {onViewDetails && (
                <TouchableOpacity onPress={onViewDetails} style={tw.style('flex-1 py-3 rounded-xl items-center', `bg-[${colors.primary}]`)}>
                  <Text style={tw`text-white text-base font-semibold`}>{locale === 'fr' ? 'Voir détails' : 'View details'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
