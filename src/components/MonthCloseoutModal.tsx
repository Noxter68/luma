import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { BudgetCalculation } from '../types';
import { Sparkles, TrendingUp } from 'lucide-react-native';

interface MonthCloseoutModalProps {
  visible: boolean;
  month: string;
  metrics: BudgetCalculation;
  totalAccumulated: number;
  onViewEvolution?: () => void;
  onClose: () => void;
}

export const MonthCloseoutModal = ({ visible, month, metrics, totalAccumulated, onViewEvolution, onClose }: MonthCloseoutModalProps) => {
  const { isDark, colors, palette } = useTheme();
  const { t, locale } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });
  };

  const hasSaved = metrics.actualSavings > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={tw`flex-1 bg-black/60 justify-center items-center px-6`}>
        <View style={tw.style('rounded-3xl overflow-hidden max-w-md w-full', isDark ? `bg-[${colors.dark.card}]` : 'bg-white')}>
          {/* Header avec gradient */}
          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={tw`px-6 pt-8 pb-6 items-center`}>
            <View style={tw`w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4`}>
              <Sparkles size={32} color="white" strokeWidth={2.5} />
            </View>
            <Text style={tw`text-white text-2xl font-bold mb-1`}>{hasSaved ? '🎉 Bravo !' : '📊 Bilan du mois'}</Text>
            <Text style={tw`text-white/80 text-base`}>{formatMonth(month)}</Text>
          </LinearGradient>

          {/* Content */}
          <View style={tw`p-6`}>
            {/* Summary */}
            <View style={tw.style('rounded-2xl p-4 mb-4', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.bg}]`)}>
              <View style={tw`gap-2`}>
                <View style={tw`flex-row justify-between`}>
                  <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>💰 {t('budgetProgress.totalRevenue')}</Text>
                  <Text style={tw.style('text-sm font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{formatCurrency(metrics.totalRevenue)}</Text>
                </View>

                <View style={tw`flex-row justify-between`}>
                  <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>🔄 Recurring</Text>
                  <Text style={tw.style('text-sm font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>-{formatCurrency(metrics.totalRecurring)}</Text>
                </View>

                <View style={tw`flex-row justify-between`}>
                  <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>💳 {t('budgetProgress.consumed')}</Text>
                  <Text style={tw.style('text-sm font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>-{formatCurrency(metrics.totalSpent)}</Text>
                </View>

                <View style={tw.style('h-px my-2', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)} />

                {hasSaved ? (
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text style={tw.style('text-base font-bold', `text-[${colors.primary}]`)}>✨ {locale === 'fr' ? 'Tu as économisé :' : 'You saved:'}</Text>
                    <Text style={tw.style('text-2xl font-bold', `text-[${colors.primary}]`)}>{formatCurrency(metrics.actualSavings)}</Text>
                  </View>
                ) : (
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text style={tw.style('text-base font-bold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                      {locale === 'fr' ? 'Dépenses totales :' : 'Total expenses:'}
                    </Text>
                    <Text style={tw.style('text-xl font-bold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{formatCurrency(metrics.totalSpent)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Cagnotte */}
            {hasSaved && (
              <View style={tw.style('rounded-2xl p-4 mb-4', `bg-[${colors.primary}]/10`)}>
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw.style('text-sm mb-1', `text-[${colors.primary}]`)}>🏦 {locale === 'fr' ? 'Ta cagnotte :' : 'Your piggy bank:'}</Text>
                    <Text style={tw.style('text-3xl font-bold', `text-[${colors.primary}]`)}>{formatCurrency(totalAccumulated)}</Text>
                    <Text style={tw.style('text-xs mt-1', `text-[${colors.primary}]/70`)}>
                      📈 +{formatCurrency(metrics.actualSavings)} {locale === 'fr' ? 'ce mois' : 'this month'}
                    </Text>
                  </View>
                  <View style={tw.style('w-16 h-16 rounded-full items-center justify-center', `bg-[${colors.primary}]/20`)}>
                    <TrendingUp size={28} color={colors.primary} strokeWidth={2.5} />
                  </View>
                </View>
              </View>
            )}

            {/* Motivational message */}
            <Text style={tw.style('text-sm text-center mb-4 italic', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
              {hasSaved
                ? locale === 'fr'
                  ? 'Continue comme ça, tu gères ! 💪'
                  : "Keep it up, you're doing great! 💪"
                : locale === 'fr'
                ? 'Prochain mois sera meilleur ! 💪'
                : 'Next month will be better! 💪'}
            </Text>

            {/* Actions */}
            <View style={tw`flex-row gap-3`}>
              {onViewEvolution && hasSaved && (
                <TouchableOpacity onPress={onViewEvolution} style={tw.style('flex-1 py-3 rounded-xl items-center', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.border}]`)}>
                  <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                    {locale === 'fr' ? "Voir l'évolution" : 'View progress'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={tw.style('flex-1 py-3 rounded-xl items-center', `bg-[${colors.primary}]`)}>
                <Text style={tw`text-white text-base font-semibold`}>{locale === 'fr' ? 'Clôturer' : 'Close'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
