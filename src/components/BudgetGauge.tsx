import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';

interface BudgetGaugeProps {
  budget: number;
  spent: number;
  recurring: number;
}

export const BudgetGauge = ({ budget, spent, recurring }: BudgetGaugeProps) => {
  const { isDark, colors } = useTheme();

  const safeBudget = Number(budget) || 0;
  const safeSpent = Number(spent) || 0;
  const safeRecurring = Number(recurring) || 0;

  const totalConsumed = safeSpent + safeRecurring;
  const totalConsumedPercentage = safeBudget > 0 ? (totalConsumed / safeBudget) * 100 : 0;
  const remainingPercentage = Math.max(100 - totalConsumedPercentage, 0);

  const getDisplayPercentage = () => {
    if (isNaN(remainingPercentage)) return '0';
    if (remainingPercentage < 10 && remainingPercentage > 0) {
      return remainingPercentage.toFixed(1);
    }
    return Math.round(remainingPercentage).toString();
  };

  const displayPercentage = getDisplayPercentage();

  // Statut et couleur adaptés au thème
  const getStatus = () => {
    if (remainingPercentage >= 80) return { label: 'Excellent', color: colors.primary };
    if (remainingPercentage >= 50) return { label: 'Parfait', color: colors.primaryLight };
    if (remainingPercentage >= 25) return { label: 'Bon rythme', color: '#F4A460' };
    if (remainingPercentage >= 10) return { label: 'Attention', color: '#FF8C42' };
    if (remainingPercentage > 0) return { label: 'Prudence', color: '#FF6B6B' };
    return { label: 'Dépassé', color: '#E63946' };
  };

  const status = getStatus();

  // Couleur de fond adaptée au thème
  const backgroundColor = isDark ? colors.dark.border : colors.light.border;

  return (
    <View style={tw`items-center justify-center pt-6 pb-1 relative`}>
      {/* Background arc */}
      <View style={tw`items-center justify-center`}>
        <AnimatedCircularProgress size={240} width={20} fill={100} tintColor={backgroundColor} backgroundColor="transparent" rotation={270} arcSweepAngle={180} lineCap="round" duration={0} />
      </View>

      {/* Progress arc */}
      <View style={tw`items-center justify-center absolute top-6`}>
        <AnimatedCircularProgress
          size={240}
          width={20}
          fill={remainingPercentage}
          tintColor={status.color}
          backgroundColor="transparent"
          rotation={270}
          arcSweepAngle={180}
          lineCap="round"
          duration={800}
        />
      </View>

      {/* Center text */}
      <View style={tw`items-center justify-center -mt-36 mb-6`}>
        <Text style={[tw`text-4xl font-bold mb-1`, { color: status.color }]}>{displayPercentage}%</Text>
        <Text style={[tw`text-lg font-semibold`, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
};
