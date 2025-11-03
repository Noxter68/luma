import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { colors, spacing, fontSize } from '../theme/colors';

interface BudgetGaugeProps {
  budget: number;
  spent: number;
  recurring: number;
}

export const BudgetGauge = ({ budget, spent, recurring }: BudgetGaugeProps) => {
  // Calcul des pourcentages
  const spentPercentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const recurringPercentage = budget > 0 ? Math.min((recurring / budget) * 100, 100) : 0;
  const totalPercentage = Math.min(spentPercentage + recurringPercentage, 100);

  // Ce qui reste disponible
  const remainingPercentage = Math.max(100 - totalPercentage, 0);

  // Déterminer la couleur et le status selon ce qui RESTE
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
      {/* Layer 1: Background (cream) */}
      <View style={styles.gaugeContainer}>
        <AnimatedCircularProgress size={240} width={20} fill={100} tintColor={colors.cream} backgroundColor="transparent" rotation={270} arcSweepAngle={180} lineCap="round" duration={0} />
      </View>

      {/* Layer 2: Recurring expenses (lavender) - sous les dépenses */}
      {recurringPercentage > 0 && (
        <View style={[styles.gaugeContainer, styles.absoluteGauge]}>
          <AnimatedCircularProgress
            size={240}
            width={20}
            fill={totalPercentage}
            tintColor={colors.lavender}
            backgroundColor="transparent"
            rotation={270}
            arcSweepAngle={180}
            lineCap="round"
            duration={800}
          />
        </View>
      )}

      {/* Layer 3: Spent (sage) - par dessus */}
      {spentPercentage > 0 && (
        <View style={[styles.gaugeContainer, styles.absoluteGauge]}>
          <AnimatedCircularProgress
            size={240}
            width={20}
            fill={spentPercentage}
            tintColor={colors.sage}
            backgroundColor="transparent"
            rotation={270}
            arcSweepAngle={180}
            lineCap="round"
            duration={800}
          />
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={[styles.percentage, { color: status.color }]}>{Math.round(remainingPercentage)}%</Text>
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
