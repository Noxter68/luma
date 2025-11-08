// src/components/BudgetGauge.tsx

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
  const { isDark, colors, palette } = useTheme();
  const { t } = useTranslation();

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
    // Si aucun budget défini en mode budget
    if (safeBudget === 0 && mode === 'budget') {
      return {
        label: t('budgetProgress.noBudget'),
        color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
        textColor: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
      };
    }

    // Si aucun revenu défini en mode revenue
    if (safeIncome === 0 && mode === 'revenue') {
      return {
        label: t('budgetProgress.noRevenue'),
        color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
        textColor: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
      };
    }

    // Couleur du texte optimisée pour Aurora au-dessus de 50%
    const getTextColor = (barColor: string) => {
      // Pour Aurora avec palette claire au-dessus de 50%, utiliser une couleur plus contrastée
      if (palette === 'aurora' && remainingPercentage >= 50) {
        return isDark ? colors.dark.textPrimary : '#3D3B4A'; // Texte foncé pour contraste
      }
      return barColor;
    };

    if (remainingPercentage >= 80) {
      const barColor = colors.primary;
      return {
        label: 'Excellent',
        color: barColor,
        textColor: palette === 'aurora' ? (isDark ? colors.dark.textPrimary : colors.light.border) : getTextColor(barColor), // Crème de la palette Aurora
      };
    }
    if (remainingPercentage >= 50) {
      const barColor = colors.primaryLight;
      return {
        label: 'Parfait',
        color: barColor,
        textColor: getTextColor(barColor),
      };
    }
    if (remainingPercentage >= 25) {
      return {
        label: 'Bon rythme',
        color: '#E8A87C', // Orangé doux (était #F4A460)
        textColor: '#E8A87C',
      };
    }
    if (remainingPercentage >= 10) {
      return {
        label: 'Attention',
        color: '#F0A868', // Orangé chaud doux (était #FF8C42)
        textColor: '#F0A868',
      };
    }
    if (remainingPercentage > 0) {
      return {
        label: 'Prudence',
        color: '#E8896B', // Rouge/orangé doux (était #FF6B6B)
        textColor: '#E8896B',
      };
    }
    return {
      label: 'Dépassé',
      color: '#f3bbb9', // Rouge doux et bienveillant (était #E63946)
      textColor: '#f3bbb9',
    };
  };

  const status = getStatus();
  const backgroundColor = isDark ? colors.dark.border : colors.light.border;

  return (
    <View style={tw`items-center justify-center pt-3 pb-1 relative`}>
      {/* Background arc */}
      <View style={tw`items-center justify-center`}>
        <AnimatedCircularProgress size={240} width={20} fill={100} tintColor={backgroundColor} backgroundColor="transparent" rotation={270} arcSweepAngle={180} lineCap="round" duration={0} />
      </View>

      {/* Progress arc */}
      <View style={tw`items-center justify-center absolute top-3`}>
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
      <View style={[tw`items-center justify-center absolute`, { top: 117 }]}>
        <Text style={[tw`text-4xl font-bold mb-1`, { color: status.textColor }]}>{displayPercentage}%</Text>
        <Text style={[tw`text-lg font-semibold`, { color: status.textColor }]}>{status.label}</Text>
      </View>
    </View>
  );
};
