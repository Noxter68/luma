import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Home, ShoppingCart, Car, Popcorn, Smartphone, Lightbulb, Package, Plus, Trash2 } from 'lucide-react-native';
import { RecurringExpense } from '../types';

export const RecurringExpensesScreen = ({ navigation }: any) => {
  const { recurringExpenses, loadRecurringExpenses, deleteRecurringExpense, updateRecurringExpense } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors } = useTheme();

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
    <View style={tw.style('flex-1', `bg-[${isDark ? colors.dark.bg : colors.light.bg}]`)}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-6`}>
        {/* Summary Card */}
        <Card>
          <Text style={tw.style('text-sm mb-1', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('totalRecurring')}</Text>
          <Text style={tw.style('text-4xl font-bold mb-2', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{formatCurrency(totalRecurring)}</Text>
          <Text style={tw.style('text-xs italic', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('recurringHint')}</Text>
        </Card>

        {/* Recurring Expenses List */}
        <View style={tw`flex-row justify-between items-center mt-8 mb-3`}>
          <Text style={tw.style('text-lg font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('recurringExpenses')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddRecurring')} style={tw.style('w-9 h-9 rounded-full justify-center items-center', `bg-[${colors.primary}]`)}>
            <Plus size={20} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {recurringExpenses.length === 0 ? (
          <Card>
            <Text style={tw.style('text-base text-center py-8', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('noRecurringExpenses')}</Text>
          </Card>
        ) : (
          recurringExpenses.map((recurring) => {
            const IconComponent = getCategoryIcon(recurring.category);

            return (
              <Card key={recurring.id} style={tw`mb-3`}>
                <View style={tw`flex-row items-center gap-4`}>
                  <TouchableOpacity
                    onPress={() => handleToggleActive(recurring)}
                    style={tw.style(
                      'w-6 h-6 rounded-full border-2 justify-center items-center',
                      recurring.isActive ? `border-[${colors.primary}] bg-[${colors.primary}]/20` : `border-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`
                    )}
                  >
                    {recurring.isActive && <View style={tw.style('w-3 h-3 rounded-full', `bg-[${colors.primary}]`)} />}
                  </TouchableOpacity>

                  <View
                    style={tw.style(
                      'w-10 h-10 rounded-full justify-center items-center',
                      recurring.isActive ? `bg-[${colors.primary}]/20` : isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.border}]`
                    )}
                  >
                    <IconComponent size={20} color={recurring.isActive ? colors.primary : isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
                  </View>

                  <View style={tw`flex-1`}>
                    <Text style={tw.style('text-base font-semibold mb-0.5', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`, !recurring.isActive && 'opacity-40')}>
                      {getCategoryLabel(recurring.category)}
                    </Text>
                    {recurring.description && (
                      <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`, !recurring.isActive && 'opacity-40')}>{recurring.description}</Text>
                    )}
                  </View>

                  <Text style={tw.style('text-lg font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`, !recurring.isActive && 'opacity-40')}>
                    {formatCurrency(recurring.amount)}
                  </Text>

                  <TouchableOpacity onPress={() => handleDelete(recurring.id)} style={tw`p-1`}>
                    <Trash2 size={18} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
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
