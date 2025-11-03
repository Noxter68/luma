import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { BudgetGauge } from '../components/BudgetGauge';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Home, ShoppingCart, Car, Popcorn, Smartphone, Lightbulb, Package } from 'lucide-react-native';
import { colors, spacing, fontSize } from '../theme/colors';
import { useTranslation } from '../hooks/useTranslation';

export const HomeScreen = () => {
  const { budget, expenses, recurringExpenses, totalSpent, totalRecurring, totalWithRecurring, remaining, refresh } = useBudgetStore();
  const { t, locale } = useTranslation();

  useEffect(() => {
    refresh();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMM', {
      locale: locale === 'fr' ? fr : enUS,
    });
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

  const activeRecurring = recurringExpenses.filter((r) => r.isActive);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Budget Gauge */}
        <Card>
          <BudgetGauge budget={budget?.amount || 0} spent={totalSpent} recurring={totalRecurring} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('home.budget')}</Text>
              <Text style={styles.statValue}>{formatCurrency(budget?.amount || 0)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('home.spent')}</Text>
              <Text style={[styles.statValue, { color: colors.sage }]}>{formatCurrency(totalSpent)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('home.remaining')}</Text>
              <Text style={[styles.statValue, { color: remaining < 0 ? colors.gray : colors.black }]}>{formatCurrency(remaining)}</Text>
            </View>
          </View>
        </Card>

        {/* Recurring Summary */}
        {activeRecurring.length > 0 && (
          <Card style={styles.recurringCard}>
            <View style={styles.recurringHeader}>
              <Text style={styles.recurringTitle}>Dépenses récurrentes</Text>
              <Text style={styles.recurringTotal}>{formatCurrency(totalRecurring)}</Text>
            </View>
            <View style={styles.recurringList}>
              {activeRecurring.map((rec) => {
                const IconComponent = getCategoryIcon(rec.category);
                return (
                  <View key={rec.id} style={styles.recurringItem}>
                    <View style={styles.recurringIconContainer}>
                      <IconComponent size={16} color={colors.lavender} strokeWidth={2} />
                    </View>
                    <Text style={styles.recurringName}>{rec.description || getCategoryLabel(rec.category)}</Text>
                    <Text style={styles.recurringAmount}>{formatCurrency(rec.amount)}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {/* Recent Expenses */}
        <Text style={styles.sectionTitle}>Dépenses du mois</Text>

        {expenses.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>{t('home.noExpenses')}</Text>
          </Card>
        ) : (
          expenses.slice(0, 10).map((expense) => {
            const IconComponent = getCategoryIcon(expense.category);
            const isRecurring = recurringExpenses.some((rec) => rec.description === expense.description && rec.isActive);

            return (
              <Card key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseRow}>
                  <View style={styles.expenseIcon}>
                    <IconComponent size={20} color={colors.sage} strokeWidth={2} />
                  </View>
                  <View style={styles.expenseInfo}>
                    <View style={styles.categoryRow}>
                      <Text style={styles.expenseCategory}>{getCategoryLabel(expense.category)}</Text>
                      {isRecurring && (
                        <View style={styles.recurringBadge}>
                          <Text style={styles.recurringText}>↻</Text>
                        </View>
                      )}
                    </View>
                    {expense.description && <Text style={styles.expenseDescription}>{expense.description}</Text>}
                    <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
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
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.cream,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.cream,
  },
  statLabel: {
    fontSize: 12,
    color: colors.warmGray,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
  },
  recurringCard: {
    marginTop: spacing.md,
    backgroundColor: colors.lavender + '10',
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recurringTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.lavender,
  },
  recurringTotal: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.lavender,
  },
  recurringList: {
    gap: spacing.sm,
  },
  recurringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recurringIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lavender + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recurringName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  recurringAmount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.lavender,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.warmGray,
    textAlign: 'center',
    paddingVertical: 20,
  },
  expenseCard: {
    marginBottom: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sage + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  expenseInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  expenseDescription: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.warmGray,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  recurringBadge: {
    backgroundColor: colors.lavender + '30',
    borderRadius: 12,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  recurringText: {
    fontSize: fontSize.xs,
    color: colors.lavender,
    fontWeight: '600',
  },
});
