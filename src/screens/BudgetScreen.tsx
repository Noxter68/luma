import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

export const BudgetScreen = () => {
  const { budget, refresh, setBudget } = useBudgetStore();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');

  // Séparer les effets pour éviter la boucle
  useEffect(() => {
    refresh();
  }, []); // Charge une seule fois au montage

  useEffect(() => {
    if (budget && !isEditing) {
      setAmount(budget.amount.toString());
    }
  }, [budget, isEditing]); // Met à jour amount quand budget change

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    setBudget(parsedAmount);
    setIsEditing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.label}>Budget mensuel</Text>

          {isEditing ? (
            <View>
              <TextInput value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" style={styles.input} autoFocus />
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.button, styles.cancelButton]}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.budgetAmount}>{budget ? formatCurrency(budget.amount) : '€0'}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>{budget ? 'Modifier' : 'Définir le budget'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Categories suggestion */}
        <Text style={styles.sectionTitle}>Suggestions de répartition</Text>
        <Card>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryName}>Essentiels</Text>
            <Text style={styles.categoryAmount}>{budget ? formatCurrency(budget.amount * 0.5) : '€0'}</Text>
          </View>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryName}>Alimentation</Text>
            <Text style={styles.categoryAmount}>{budget ? formatCurrency(budget.amount * 0.2) : '€0'}</Text>
          </View>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryName}>Loisirs</Text>
            <Text style={styles.categoryAmount}>{budget ? formatCurrency(budget.amount * 0.15) : '€0'}</Text>
          </View>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryName}>Autre</Text>
            <Text style={styles.categoryAmount}>{budget ? formatCurrency(budget.amount * 0.15) : '€0'}</Text>
          </View>
        </Card>

        <Text style={styles.tipText}>💡 Ces suggestions sont indicatives. Adaptez-les selon vos besoins.</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.warmGray,
    marginBottom: spacing.sm,
  },
  budgetAmount: {
    fontSize: fontSize.xxxl,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.lg,
  },
  input: {
    fontSize: fontSize.xxxl,
    fontWeight: '600',
    color: colors.black,
    borderBottomWidth: 2,
    borderBottomColor: colors.sage,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.warmGray,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.sage,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: colors.sage,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.black,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cream,
  },
  categoryName: {
    fontSize: fontSize.md,
    color: colors.gray,
  },
  categoryAmount: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.black,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.warmGray,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
});
