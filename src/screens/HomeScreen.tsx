import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Home, ShoppingCart, Car, Popcorn, Smartphone, Lightbulb, Package } from 'lucide-react-native';
import { colors, spacing } from '../theme/colors';
import { useTranslation } from '../hooks/useTranslation';

export const HomeScreen = () => {
  const { budget, expenses, totalSpent, remaining, refresh } = useBudgetStore();
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Budget Overview */}
        <Card>
          <Text style={styles.cardTitle}>{t('home.budget')}</Text>
          <Text style={styles.budgetAmount}>{budget ? formatCurrency(budget.amount) : formatCurrency(0)}</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: budget ? `${Math.min((totalSpent / budget.amount) * 100, 100)}%` : '0%' }]} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('home.spent')}</Text>
              <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('home.remaining')}</Text>
              <Text style={[styles.statValue, { color: colors.sage }]}>{formatCurrency(remaining)}</Text>
            </View>
          </View>
        </Card>

        {/* Recent Expenses */}
        <Text style={styles.sectionTitle}>{t('expense.add')}</Text>

        {expenses.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>{t('home.noExpenses')}</Text>
          </Card>
        ) : (
          expenses.slice(0, 10).map((expense) => {
            const IconComponent = getCategoryIcon(expense.category);

            return (
              <Card key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseRow}>
                  <View style={styles.expenseIcon}>
                    <IconComponent size={20} color={colors.sage} strokeWidth={2} />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseCategory}>{getCategoryLabel(expense.category)}</Text>
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
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sage + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
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
  cardTitle: {
    fontSize: 16,
    color: colors.warmGray,
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8E6DE',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.sage,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: colors.warmGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
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
  expenseInfo: {
    flex: 1,
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
});
