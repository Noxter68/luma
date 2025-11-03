import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { Home, ShoppingCart, Car, Popcorn, Smartphone, Lightbulb, Package } from 'lucide-react-native';
import { Button } from '../components/Buttons';

const CATEGORIES = [
  { id: 'rent', label: 'Loyer', icon: Home },
  { id: 'food', label: 'Alimentation', icon: ShoppingCart },
  { id: 'transport', label: 'Transport', icon: Car },
  { id: 'entertainment', label: 'Loisirs', icon: Popcorn },
  { id: 'subscription', label: 'Abonnements', icon: Smartphone },
  { id: 'utilities', label: 'Charges', icon: Lightbulb },
  { id: 'other', label: 'Autre', icon: Package },
];

interface AddExpenseScreenProps {
  navigation: any;
}

export const AddExpenseScreen = ({ navigation }: AddExpenseScreenProps) => {
  const { addExpense } = useBudgetStore();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    if (!category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    setLoading(true);

    try {
      addExpense({
        amount: parsedAmount,
        category,
        description: description || undefined,
        date: new Date().toISOString(),
      });

      Alert.alert('Succès', 'Dépense ajoutée', [{ text: 'OK', onPress: () => navigation.navigate('Home') }]);

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ajouter la dépense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card>
          <Input label="Montant" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />

          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = category === cat.id;

              return (
                <TouchableOpacity key={cat.id} onPress={() => setCategory(cat.id)} style={[styles.categoryButton, isSelected && styles.categoryButtonActive]}>
                  <IconComponent size={32} color={isSelected ? colors.sage : colors.warmGray} strokeWidth={2} />
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input label="Description (optionnel)" value={description} onChangeText={setDescription} placeholder="Ex: Course du samedi" multiline />
        </Card>

        <View style={styles.buttonContainer}>
          <Button onPress={handleSave} loading={loading}>
            Enregistrer
          </Button>
        </View>
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
    fontSize: fontSize.sm,
    color: colors.warmGray,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  categoryButtonActive: {
    borderColor: colors.sage,
    backgroundColor: colors.sage + '15',
  },
  categoryLabel: {
    fontSize: fontSize.xs,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  categoryLabelActive: {
    color: colors.sage,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});
