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
      return locale === 'fr' ? `Budget ${categoryName} dépassé` : `${categoryName} budget exceeded`;
    }

    if (category.isNearLimit) {
      return locale === 'fr' ? `${Math.round(category.percentage)}% du budget ${categoryName} atteint` : `${Math.round(category.percentage)}% of ${categoryName} budget reached`;
    }

    return '';
  };

  const getDescription = () => {
    if (category.isOverBudget) {
      return locale === 'fr' ? 'Vous avez dépassé la limite fixée pour cette catégorie.' : 'You have exceeded the set limit for this category.';
    }

    return locale === 'fr' ? 'Vous approchez de la limite de cette catégorie.' : 'You are approaching the limit for this category.';
  };

  // Couleur basée sur la palette
  const alertColor = category.isOverBudget ? colors.primary : colors.primaryLight;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={tw`flex-1 bg-black/60 justify-center items-center px-6`}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={tw.style('rounded-3xl p-6 w-full max-w-md', isDark ? `bg-[${colors.dark.card}]` : 'bg-white')}>
            {/* Header */}
            <View style={tw`flex-row items-start justify-between mb-4`}>
              <View style={tw`flex-1 mr-3`}>
                <View style={tw`flex-row items-center gap-2 mb-2`}>
                  <AlertTriangle size={24} color={alertColor} strokeWidth={2} />
                  <Text style={tw.style('text-lg font-bold flex-1', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{getMessage()}</Text>
                </View>
                <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{getDescription()}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={tw`p-1`}>
                <X size={20} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={tw.style('rounded-2xl p-4 mb-4', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.bg}]`)}>
              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budgetProgress.consumed')}</Text>
                <Text style={tw.style('text-base font-bold', `text-[${alertColor}]`)}>
                  {formatCurrency(category.spent)} / {formatCurrency(category.amount)}
                </Text>
              </View>

              {/* Progress bar avec couleurs palette */}
              <View style={tw.style('h-2 rounded-full overflow-hidden', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)}>
                <View
                  style={[
                    tw`h-full rounded-full`,
                    {
                      width: `${Math.min(category.percentage, 100)}%`,
                      backgroundColor: alertColor,
                    },
                  ]}
                />
              </View>

              <View style={tw`flex-row justify-between items-center mt-3`}>
                <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                  {category.remaining > 0 ? t('budgetProgress.remaining') : t('budgetProgress.overBudget')}
                </Text>
                <Text style={tw.style('text-base font-bold', `text-[${alertColor}]`)}>
                  {category.remaining > 0 ? formatCurrency(category.remaining) : formatCurrency(Math.abs(category.remaining))}
                </Text>
              </View>
            </View>

            {/* Action button */}
            <TouchableOpacity onPress={onClose} style={tw.style('py-3 rounded-xl items-center', `bg-[${colors.primary}]`)}>
              <Text style={tw`text-white text-base font-semibold`}>{locale === 'fr' ? 'Compris' : 'Got it'}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
