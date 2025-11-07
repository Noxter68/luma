import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { X, Plus, Trash2, Settings, Users, TrendingUp, TrendingDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedBudget } from '../hooks/useSharedBudget';
import { useSharedExpenses } from '../hooks/useSharedExpenses';

interface SharedAccountDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      accountId: string;
    };
  };
}

export const SharedAccountDetailsScreen = ({ navigation, route }: SharedAccountDetailsScreenProps) => {
  const { accountId } = route.params;
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();

  // Hooks pour récupérer les données du shared account
  const { budgetSummary, loading, budgetStatus, expenses } = useSharedBudget(accountId);

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddExpense = () => {
    navigation.navigate('SharedAddExpense', { accountId });
  };

  const handleSettings = () => {
    navigation.navigate('SharedAccountSettings', { accountId });
  };

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw.style('text-base', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('sharedAccounts.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          {/* Header */}
          <View style={tw`px-6 pt-4 pb-4 flex-row items-center justify-between`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
              <X size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={tw`text-white text-lg font-semibold flex-1 text-center`}>{t('sharedAccounts.details.title')}</Text>
            <TouchableOpacity onPress={handleSettings} style={tw`p-2 -mr-2`}>
              <Settings size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            {/* Budget Overview Section */}
            <View style={tw`px-6 pb-6`}>
              <View style={tw`items-center mb-4`}>
                <Text style={tw`text-white/80 text-base mb-2`}>{t('sharedAccounts.details.availableBudget')}</Text>
                <Text style={tw`text-5xl font-bold text-white mb-2`}>{formatCurrency(budgetSummary.availableBudget)}</Text>
                <Text style={tw`text-white/60 text-sm`}>
                  {t('sharedAccounts.details.spent')}: {formatCurrency(budgetSummary.totalExpenses)} • {t('sharedAccounts.details.remaining')}: {formatCurrency(budgetSummary.remainingBudget)}
                </Text>
              </View>

              {/* Quick Stats Cards */}
              <View style={tw`flex-row gap-3 mb-4`}>
                <View style={tw`flex-1 bg-white/10 rounded-2xl p-4`}>
                  <View style={tw`flex-row items-center gap-2 mb-1`}>
                    <TrendingUp size={16} color="white" strokeWidth={2} />
                    <Text style={tw`text-white/80 text-xs font-medium`}>{t('sharedAccounts.details.income')}</Text>
                  </View>
                  <Text style={tw`text-white text-xl font-bold`}>{formatCurrency(budgetSummary.totalIncomes)}</Text>
                </View>

                <View style={tw`flex-1 bg-white/10 rounded-2xl p-4`}>
                  <View style={tw`flex-row items-center gap-2 mb-1`}>
                    <TrendingDown size={16} color="white" strokeWidth={2} />
                    <Text style={tw`text-white/80 text-xs font-medium`}>{t('sharedAccounts.details.recurring')}</Text>
                  </View>
                  <Text style={tw`text-white text-xl font-bold`}>{formatCurrency(budgetSummary.totalRecurringExpenses)}</Text>
                </View>
              </View>

              {/* Add Expense Button */}
              <TouchableOpacity onPress={handleAddExpense} style={tw`px-8 py-3 rounded-xl bg-white/20 border-2 border-white/40 flex-row items-center justify-center gap-2`}>
                <Plus size={20} color="white" strokeWidth={2.5} />
                <Text style={tw`text-white text-base font-semibold`}>{t('sharedAccounts.details.addExpense')}</Text>
              </TouchableOpacity>
            </View>

            {/* Content Section */}
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-5 pb-6`}>
                {/* Recent Expenses */}
                <Text style={tw.style('text-xl font-bold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('sharedAccounts.details.recentExpenses')}</Text>

                {expenses.length === 0 ? (
                  <Card>
                    <Text style={tw.style('text-base text-center py-8', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('sharedAccounts.details.noExpenses')}</Text>
                  </Card>
                ) : (
                  expenses.slice(0, 10).map((expense) => (
                    <Card key={expense.id} style={tw`mb-3`}>
                      <View style={tw`flex-row items-center`}>
                        {/* Category Icon */}
                        <View style={tw.style('w-10 h-10 rounded-full items-center justify-center mr-3', `bg-[${colors.primary}]/20`)}>
                          <Text style={tw`text-lg`}>💰</Text>
                        </View>

                        {/* Expense Info */}
                        <View style={tw`flex-1`}>
                          <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{expense.category}</Text>
                          {expense.description && <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{expense.description}</Text>}
                          <Text style={tw.style('text-xs mt-1', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                            {new Date(expense.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </Text>
                        </View>

                        {/* Amount */}
                        <Text style={tw.style('text-lg font-bold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{formatCurrency(expense.amount)}</Text>
                      </View>
                    </Card>
                  ))
                )}
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
