// src/components/BudgetGauge.tsx

import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { colors, spacing, fontSize } from '../theme/colors';

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
    if (remainingPercentage >= 80) return { label: 'Excellent', color: colors.sage };
    if (remainingPercentage >= 50) return { label: 'Parfait', color: colors.oliveGreen };
    if (remainingPercentage >= 25) return { label: 'Bon rythme', color: '#F4A460' };
    if (remainingPercentage >= 10) return { label: 'Attention', color: '#FF8C42' };
    if (remainingPercentage > 0) return { label: 'Prudence', color: '#FF6B6B' };
    return { label: 'Dépassé', color: '#E63946' };
  };

  const status = getStatus();

  return (
    <View style={styles.container}>
      {/* Background: fond crème */}
      <View style={styles.gaugeContainer}>
        <AnimatedCircularProgress size={240} width={20} fill={100} tintColor={colors.cream} backgroundColor="transparent" rotation={270} arcSweepAngle={180} lineCap="round" duration={0} />
      </View>

      {/* Jauge principale: ce qui RESTE */}
      <View style={[styles.gaugeContainer, styles.absoluteGauge]}>
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
      <View style={styles.textContainer}>
        <Text style={[styles.percentage, { color: status.color }]}>{displayPercentage}%</Text>
        <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    position: 'relative',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteGauge: {
    position: 'absolute',
    top: spacing.lg,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -150,
    marginBottom: spacing.lg,
  },
  percentage: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  status: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
