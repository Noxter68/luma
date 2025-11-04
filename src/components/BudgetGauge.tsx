import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import tw from '../lib/tailwind';

interface BudgetGaugeProps {
  budget: number;
  spent: number;
  recurring: number;
}

export const BudgetGauge = ({ budget, spent, recurring }: BudgetGaugeProps) => {
  // Sécurité : convertir en nombres et gérer les valeurs invalides
  const safeBudget = Number(budget) || 0;
  const safeSpent = Number(spent) || 0;
  const safeRecurring = Number(recurring) || 0;

  // Calcul du total consommé
  const totalConsumed = safeSpent + safeRecurring;
  const totalConsumedPercentage = safeBudget > 0 ? (totalConsumed / safeBudget) * 100 : 0;

  // Ce qui reste disponible (limité à 0 minimum)
  const remainingPercentage = Math.max(100 - totalConsumedPercentage, 0);

  // Affichage avec précision adaptative
  const getDisplayPercentage = () => {
    if (isNaN(remainingPercentage)) return '0';

    // Si moins de 10%, afficher 1 décimale
    if (remainingPercentage < 10 && remainingPercentage > 0) {
      return remainingPercentage.toFixed(1);
    }

    // Sinon, arrondir
    return Math.round(remainingPercentage).toString();
  };

  const displayPercentage = getDisplayPercentage();

  // Statut et couleur basés sur ce qui RESTE
  const getStatus = () => {
    if (remainingPercentage >= 80) return { label: 'Excellent', color: tw.color('sage') };
    if (remainingPercentage >= 50) return { label: 'Parfait', color: tw.color('oliveGreen') };
    if (remainingPercentage >= 25) return { label: 'Bon rythme', color: '#F4A460' };
    if (remainingPercentage >= 10) return { label: 'Attention', color: '#FF8C42' };
    if (remainingPercentage > 0) return { label: 'Prudence', color: '#FF6B6B' };
    return { label: 'Dépassé', color: '#E63946' };
  };

  const status = getStatus();

  return (
    <View style={tw`items-center justify-center pt-6 pb-1 relative`}>
      {/* Background: fond crème */}
      <View style={tw`items-center justify-center`}>
        <AnimatedCircularProgress size={240} width={20} fill={100} tintColor={tw.color('cream')} backgroundColor="transparent" rotation={270} arcSweepAngle={180} lineCap="round" duration={0} />
      </View>

      {/* Jauge principale: ce qui RESTE */}
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

      {/* Texte central */}
      <View style={tw`items-center justify-center -mt-36 mb-6`}>
        <Text style={[tw`text-4xl font-bold mb-1`, { color: status.color }]}>{displayPercentage}%</Text>
        <Text style={[tw`text-lg font-semibold`, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
};
