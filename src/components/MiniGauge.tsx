// src/components/MiniGauge.tsx

import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

interface MiniGaugeProps {
  budget: number;
  spent: number;
  recurring: number;
  income: number;
  mode: 'revenue' | 'budget';
}

export const MiniGauge = ({ budget, spent, recurring, income, mode }: MiniGaugeProps) => {
  const { isDark, colors } = useTheme();
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
    const availableAfterRecurring = safeIncome > 0 ? safeIncome - safeRecurring : safeBudget;
    remaining = availableAfterRecurring - safeSpent;
    total = safeIncome > 0 ? safeIncome : safeBudget;
    remainingPercentage = total > 0 ? (remaining / total) * 100 : 0;
  } else {
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

  const textColor = '#FAF8F5';

  const getStatusColor = () => {
    if (safeBudget === 0 && mode === 'budget') {
      return isDark ? colors.dark.textTertiary : colors.light.textTertiary;
    }
    if (safeIncome === 0 && mode === 'revenue') {
      return isDark ? colors.dark.textTertiary : colors.light.textTertiary;
    }

    if (remainingPercentage >= 80) return colors.primary;
    if (remainingPercentage >= 50) return colors.primaryLight;
    if (remainingPercentage >= 25) return '#E8A87C';
    if (remainingPercentage >= 10) return '#F0A868';
    if (remainingPercentage > 0) return '#E8896B';
    return '#f3bbb9';
  };

  const statusColor = getStatusColor();
  const backgroundColor = isDark ? colors.dark.border : colors.light.border;
  const shadowColor = isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)';

  // Mini gauge size - 120px (half of original 240px)
  const GAUGE_SIZE = 120;
  const GAUGE_WIDTH = 10;
  const SHADOW_WIDTH = 12;

  return (
    <View style={tw`items-center justify-center relative`}>
      {/* Background arc - Shadow layer */}
      <View style={tw`items-center justify-center`}>
        <AnimatedCircularProgress
          size={GAUGE_SIZE}
          width={SHADOW_WIDTH}
          fill={100}
          tintColor={shadowColor}
          backgroundColor="transparent"
          rotation={270}
          arcSweepAngle={180}
          lineCap="round"
          duration={0}
        />
      </View>

      {/* Background arc - Main layer */}
      <View style={tw`items-center justify-center absolute top-0`}>
        <AnimatedCircularProgress
          size={GAUGE_SIZE}
          width={GAUGE_WIDTH}
          fill={100}
          tintColor={backgroundColor}
          backgroundColor="transparent"
          rotation={270}
          arcSweepAngle={180}
          lineCap="round"
          duration={0}
        />
      </View>

      {/* Progress arc - Shadow layer */}
      <View style={tw`items-center justify-center absolute top-0`}>
        <AnimatedCircularProgress
          size={GAUGE_SIZE}
          width={SHADOW_WIDTH}
          fill={Math.max(0, Math.min(100, remainingPercentage))}
          tintColor={shadowColor}
          backgroundColor="transparent"
          rotation={270}
          arcSweepAngle={180}
          lineCap="round"
          duration={400}
        />
      </View>

      {/* Progress arc - Main layer */}
      <View style={tw`items-center justify-center absolute top-0`}>
        <AnimatedCircularProgress
          size={GAUGE_SIZE}
          width={GAUGE_WIDTH}
          fill={Math.max(0, Math.min(100, remainingPercentage))}
          tintColor={statusColor}
          backgroundColor="transparent"
          rotation={270}
          arcSweepAngle={180}
          lineCap="round"
          duration={400}
        />
      </View>

      {/* Center text */}
      <View style={[tw`items-center justify-center absolute`, { top: 55 }]}>
        <Text style={[tw`text-xl font-bold`, { color: textColor }]}>{displayPercentage}%</Text>
      </View>
    </View>
  );
};
