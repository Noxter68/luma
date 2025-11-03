import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { Home, ShoppingCart, Car, Popcorn, Smartphone, Lightbulb, Package } from 'lucide-react-native';
import { Button } from '../components/Buttons';
import { useTranslation } from '../hooks/useTranslation';

const CATEGORIES = [
  { id: 'rent', icon: Home },
  { id: 'food', icon: ShoppingCart },
  { id: 'transport', icon: Car },
  { id: 'entertainment', icon: Popcorn },
  { id: 'subscription', icon: Smartphone },
  { id: 'utilities', icon: Lightbulb },
  { id: 'other', icon: Package },
];

interface AddRecurringScreenProps {
  navigation: any;
}

export const AddRecurringScreen = ({ navigation }: AddRecurringScreenProps) => {
  const { addRecurringExpense } = useBudgetStore();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    if (!category) {
      Alert.alert(t('error'), t('selectCategory'));
      return;
    }

    setLoading(true);

    try {
      addRecurringExpense({
        amount: parsedAmount,
        category,
        description: description || undefined,
        isActive: true,
      });

      Alert.alert(t('success'), t('recurringAdded'), [{ text: 'OK', onPress: () => navigation.goBack() }]);

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
    } catch (error) {
      Alert.alert(t('error'), t('cannotAddRecurring'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card>
          <Input label={t('expense.amount')} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />

          <Text style={styles.label}>{t('expense.category')}</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = category === cat.id;

              return (
                <TouchableOpacity key={cat.id} onPress={() => setCategory(cat.id)} style={[styles.categoryButton, isSelected && styles.categoryButtonActive]}>
                  <IconComponent size={32} color={isSelected ? colors.sage : colors.warmGray} strokeWidth={2} />
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>{t(`categories.${cat.id}`)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input label={t('expense.description')} value={description} onChangeText={setDescription} placeholder={t('descriptionPlaceholder')} multiline />
        </Card>

        <View style={styles.buttonContainer}>
          <Button onPress={handleSave} loading={loading}>
            {t('expense.save')}
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
