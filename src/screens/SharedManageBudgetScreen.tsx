import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { X, Trash2, Edit2, Check, DollarSign } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { useSharedRecurringExpenses } from '../hooks/useSharedRecurringExpenses';
import { CATEGORIES } from '../utils/categories';

interface SharedManageBudgetScreenProps {
  navigation: any;
  route: {
    params: {
      accountId: string;
    };
  };
}

export const SharedManageBudgetScreen = ({ navigation, route }: SharedManageBudgetScreenProps) => {
  const { accountId } = route.params;
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const { recurringExpenses, loading, createRecurring, updateRecurring, deleteRecurring } = useSharedRecurringExpenses(accountId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  const totalRecurring = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (categoryKey: string) => {
    const category = CATEGORIES.find((c) => c.key === categoryKey);
    return category?.icon || 'circle';
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    try {
      setSaving(true);
      await updateRecurring(editingId, {
        amount: parsedAmount,
        description: editDescription.trim() || undefined,
      });
      setEditingId(null);
      setEditAmount('');
      setEditDescription('');
    } catch (error) {
      console.error('Error updating recurring:', error);
      Alert.alert(t('error'), t('sharedAccounts.updateRecurringError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (expenseId: string) => {
    Alert.alert(t('confirmDelete'), t('sharedAccounts.confirmDeleteRecurring'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecurring(expenseId);
          } catch (error) {
            console.error('Error deleting recurring:', error);
            Alert.alert(t('error'), t('sharedAccounts.deleteRecurringError'));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          {/* Header */}
          <View style={tw`px-6 pt-4 pb-6 flex-row items-center justify-between`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
              <X size={24} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={tw`text-white text-lg font-semibold flex-1 text-center`}>{t('sharedAccounts.manageBudget')}</Text>
            <View style={tw`w-10`} />
          </View>

          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-6 pb-6`}>
                {/* Total Recurring */}
                <Card style={tw`mb-4 bg-${colors.primary}/10`}>
                  <Text style={tw.style('text-sm font-medium mb-1', `text-[${colors.primary}]`)}>{t('totalRecurring')}</Text>
                  <Text style={tw.style('text-3xl font-bold', `text-[${colors.primary}]`)}>{formatCurrency(totalRecurring)}</Text>
                  <Text style={tw.style('text-xs mt-2', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('recurringHint')}</Text>
                </Card>

                {/* Recurring Expenses List */}
                {recurringExpenses.length === 0 ? (
                  <Card>
                    <Text style={tw.style('text-center', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('noRecurringExpenses')}</Text>
                  </Card>
                ) : (
                  <Card>
                    {recurringExpenses.map((expense, index) => {
                      const isEditing = editingId === expense.id;

                      return (
                        <View
                          key={expense.id}
                          style={tw.style('py-3', index !== recurringExpenses.length - 1 && `border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`)}
                        >
                          {isEditing ? (
                            <View>
                              <View style={tw`flex-row items-center gap-2 mb-2`}>
                                <DollarSign size={20} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
                                <TextInput
                                  value={editAmount}
                                  onChangeText={setEditAmount}
                                  keyboardType="decimal-pad"
                                  style={tw.style(
                                    'flex-1 text-lg font-bold px-3 py-2 rounded-lg',
                                    isDark ? `bg-[${colors.dark.bg}] text-[${colors.dark.textPrimary}]` : `bg-[${colors.light.border}] text-[${colors.light.textPrimary}]`
                                  )}
                                  autoFocus
                                />
                              </View>
                              <TextInput
                                value={editDescription}
                                onChangeText={setEditDescription}
                                placeholder={t('descriptionPlaceholder')}
                                placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                                style={tw.style(
                                  'text-sm px-3 py-2 rounded-lg mb-2',
                                  isDark ? `bg-[${colors.dark.bg}] text-[${colors.dark.textPrimary}]` : `bg-[${colors.light.border}] text-[${colors.light.textPrimary}]`
                                )}
                              />
                              <View style={tw`flex-row gap-2`}>
                                <TouchableOpacity onPress={handleSaveEdit} disabled={saving} style={tw.style('flex-1 py-2 rounded-lg items-center', saving && 'opacity-50', `bg-[${colors.primary}]`)}>
                                  {saving ? <ActivityIndicator size="small" color="white" /> : <Text style={tw`text-white font-semibold`}>{t('save')}</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => setEditingId(null)}
                                  style={tw.style('flex-1 py-2 rounded-lg items-center', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.border}]`)}
                                >
                                  <Text style={tw.style('font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('cancel')}</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <View style={tw`flex-row items-center justify-between`}>
                              <View style={tw`flex-1`}>
                                <Text style={tw.style('text-base font-semibold mb-0.5', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                                  {t(`categories.${expense.category}`)}
                                </Text>
                                {expense.description && <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{expense.description}</Text>}
                              </View>
                              <View style={tw`flex-row items-center gap-3`}>
                                <Text style={tw.style('text-lg font-bold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{formatCurrency(expense.amount)}</Text>
                                <TouchableOpacity onPress={() => handleEdit(expense)} style={tw`p-1.5`}>
                                  <Edit2 size={18} color={colors.primary} strokeWidth={2} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(expense.id)} style={tw`p-1.5`}>
                                  <Trash2 size={18} color={colors.error} strokeWidth={2} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </Card>
                )}
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
