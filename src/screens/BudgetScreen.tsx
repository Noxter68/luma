import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';

export const BudgetScreen = () => {
  const { budget, refresh, setBudget } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (budget && !isEditing) {
      setAmount(budget.amount.toString());
    }
  }, [budget, isEditing]);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    setBudget(parsedAmount);
    setIsEditing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
    }).format(value);
  };

  return (
    <View style={tw.style('flex-1', `bg-[${isDark ? colors.dark.bg : colors.light.bg}]`)}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-6`}>
        <Card>
          <Text style={tw.style('text-base mb-2', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budget.monthlyBudget')}</Text>

          {isEditing ? (
            <View>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                keyboardType="numeric"
                style={tw.style('text-4xl font-semibold py-2 mb-6 border-b-2', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`, `border-[${colors.primary}]`)}
                placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                autoFocus
              />
              <View style={tw`flex-row gap-4`}>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={tw.style('flex-1 py-4 rounded-2xl items-center', `bg-[${isDark ? colors.dark.surface : colors.light.border}]`)}>
                  <Text style={tw`text-white text-base font-semibold`}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={tw.style('flex-1 py-4 rounded-2xl items-center', `bg-[${colors.primary}]`)}>
                  <Text style={tw`text-white text-base font-semibold`}>{t('expense.save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={tw.style('text-4xl font-semibold mb-6', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                {budget ? formatCurrency(budget.amount) : formatCurrency(0)}
              </Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={tw.style('py-4 rounded-2xl items-center', `bg-[${colors.primary}]`)}>
                <Text style={tw`text-white text-base font-semibold`}>{budget ? t('budget.editBudget') : t('budget.setBudget')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Categories suggestion */}
        <Text style={tw.style('text-lg font-semibold mt-8 mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('suggestedAllocation')}</Text>
        <Card>
          <View style={tw.style('flex-row justify-between items-center py-4 border-b', `border-[${isDark ? colors.dark.border : colors.light.border}]`)}>
            <Text style={tw.style('text-base', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('essentials')}</Text>
            <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
              {budget ? formatCurrency(budget.amount * 0.5) : formatCurrency(0)}
            </Text>
          </View>
          <View style={tw.style('flex-row justify-between items-center py-4 border-b', `border-[${isDark ? colors.dark.border : colors.light.border}]`)}>
            <Text style={tw.style('text-base', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('categories.food')}</Text>
            <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
              {budget ? formatCurrency(budget.amount * 0.2) : formatCurrency(0)}
            </Text>
          </View>
          <View style={tw.style('flex-row justify-between items-center py-4 border-b', `border-[${isDark ? colors.dark.border : colors.light.border}]`)}>
            <Text style={tw.style('text-base', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('categories.entertainment')}</Text>
            <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
              {budget ? formatCurrency(budget.amount * 0.15) : formatCurrency(0)}
            </Text>
          </View>
          <View style={tw.style('flex-row justify-between items-center py-4 border-b', `border-[${isDark ? colors.dark.border : colors.light.border}]`)}>
            <Text style={tw.style('text-base', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('categories.other')}</Text>
            <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
              {budget ? formatCurrency(budget.amount * 0.15) : formatCurrency(0)}
            </Text>
          </View>
        </Card>

        <Text style={tw.style('text-sm text-center mt-6 italic', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('tipText')}</Text>
      </ScrollView>
    </View>
  );
};
