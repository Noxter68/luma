import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { useTranslation } from '../hooks/useTranslation';
import { Home, ShoppingCart, Car, Popcorn, Smartphone, Lightbulb, Package, Plus, Trash2, Edit3 } from 'lucide-react-native';
import { RecurringExpense } from '../types';

export const RecurringExpensesScreen = ({ navigation }: any) => {
  const { recurringExpenses, loadRecurringExpenses, deleteRecurringExpense, updateRecurringExpense } = useBudgetStore();
  const { t, locale } = useTranslation();

  useEffect(() => {
    loadRecurringExpenses();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
    }).format(amount);
  };

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, any> = {
      rent: Home,
      food: ShoppingCart,
      transport: Car,
      entertainment: Popcorn,
      subscription: Smartphone,
      utilities: Lightbulb,
      other: Package,
    };
    return icons[categoryId] || Package;
  };

  const getCategoryLabel = (categoryId: string) => {
    return t(`categories.${categoryId}`);
  };

  const handleToggleActive = (recurring: RecurringExpense) => {
    updateRecurringExpense({
      ...recurring,
      isActive: !recurring.isActive,
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('confirmDelete'), t('confirmDeleteRecurring'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => deleteRecurringExpense(id),
      },
    ]);
  };

  const totalRecurring = recurringExpenses.filter((r) => r.isActive).reduce((sum, r) => sum + r.amount, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <Card>
          <Text style={styles.label}>{t('totalRecurring')}</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalRecurring)}</Text>
          <Text style={styles.hint}>{t('recurringHint')}</Text>
        </Card>

        {/* Recurring Expenses List */}
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>{t('recurringExpenses')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddRecurring')} style={styles.addButton}>
            <Plus size={20} color={colors.white} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {recurringExpenses.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>{t('noRecurringExpenses')}</Text>
          </Card>
        ) : (
          recurringExpenses.map((recurring) => {
            const IconComponent = getCategoryIcon(recurring.category);

            return (
              <Card key={recurring.id} style={styles.recurringCard}>
                <View style={styles.recurringRow}>
                  <TouchableOpacity onPress={() => handleToggleActive(recurring)} style={[styles.checkbox, recurring.isActive && styles.checkboxActive]}>
                    {recurring.isActive && <View style={styles.checkboxInner} />}
                  </TouchableOpacity>

                  <View style={[styles.iconContainer, !recurring.isActive && styles.iconContainerInactive]}>
                    <IconComponent size={20} color={recurring.isActive ? colors.sage : colors.warmGray} strokeWidth={2} />
                  </View>

                  <View style={styles.recurringInfo}>
                    <Text style={[styles.recurringCategory, !recurring.isActive && styles.textInactive]}>{getCategoryLabel(recurring.category)}</Text>
                    {recurring.description && <Text style={[styles.recurringDescription, !recurring.isActive && styles.textInactive]}>{recurring.description}</Text>}
                  </View>

                  <Text style={[styles.recurringAmount, !recurring.isActive && styles.textInactive]}>{formatCurrency(recurring.amount)}</Text>

                  <TouchableOpacity onPress={() => handleDelete(recurring.id)} style={styles.deleteButton}>
                    <Trash2 size={18} color={colors.warmGray} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
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
    marginBottom: spacing.xs,
  },
  totalAmount: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.warmGray,
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.black,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.warmGray,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  recurringCard: {
    marginBottom: spacing.md,
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.warmGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: colors.sage,
    backgroundColor: colors.sage + '15',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.sage,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sage + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerInactive: {
    backgroundColor: colors.warmGray + '15',
  },
  recurringInfo: {
    flex: 1,
  },
  recurringCategory: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  recurringDescription: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  recurringAmount: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.black,
  },
  textInactive: {
    opacity: 0.4,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});
