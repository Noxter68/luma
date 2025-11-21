import { View, Text, ScrollView, TouchableOpacity, Alert, Animated, TextInput } from 'react-native';
import { useState, useRef } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { ChevronLeft, Trash2, Edit2, X, Check } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategoryById } from '../utils/categories';
import { Swipeable } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface ExpensesListScreenProps {
  navigation: any;
}

export const ExpensesListScreen = ({ navigation }: ExpensesListScreenProps) => {
  const { expenses, recurringExpenses, deleteExpense, deleteRecurringExpense, updateRecurringExpense } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'expenses' | 'recurring'>('expenses');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  const handleTabChange = (tab: 'expenses' | 'recurring') => {
    setSelectedTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === 'expenses' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMM yyyy', {
      locale: locale === 'fr' ? fr : enUS,
    });
  };

  const getCategoryLabel = (categoryId: string) => {
    const categoryData = getCategoryById(categoryId);
    return categoryData ? t(categoryData.translationKey) : categoryId;
  };

  const getCategoryIcon = (categoryId: string) => {
    const categoryData = getCategoryById(categoryId);
    return categoryData?.icon;
  };

  // Delete handlers
  const handleDeleteExpense = (id: string, description: string) => {
    Alert.alert(t('confirmDelete'), description || t('expense.amount'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => deleteExpense(id),
      },
    ]);
  };

  const handleDeleteRecurring = (id: string, description: string) => {
    Alert.alert(t('confirmDelete'), description || t('expense.recurring'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => deleteRecurringExpense(id),
      },
    ]);
  };

  // Edit handlers for recurring
  const startEditRecurring = (expense: any) => {
    setEditingId(expense.id);
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setEditDescription('');
  };

  const saveEditRecurring = (expense: any) => {
    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    updateRecurringExpense({
      ...expense,
      amount: parsedAmount,
      description: editDescription || undefined,
    });
    cancelEdit();
  };

  const renderRightActions = (id: string, description: string, isRecurring: boolean, dragX: any) => {
    const opacity = dragX.interpolate({
      inputRange: [-80, -20, 0],
      outputRange: [1, 0.9, 0],
      extrapolate: 'clamp',
    });

    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          tw`justify-center items-center ml-3`,
          {
            width: 70,
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => (isRecurring ? handleDeleteRecurring(id, description) : handleDeleteExpense(id, description))}
          style={tw`bg-red-500 w-14 h-14 rounded-2xl items-center justify-center`}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Trash2 size={22} color="white" strokeWidth={2.5} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Sort recurring by amount (highest first)
  const sortedRecurring = [...recurringExpenses].sort((a, b) => b.amount - a.amount);

  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <View style={tw`flex-1`}>
        <LinearGradient colors={headerGradient} style={tw`flex-1`}>
          <SafeAreaView edges={['top']} style={tw`flex-1`}>
            {/* Header */}
            <View style={tw`px-5 pt-4 pb-6`}>
              <View style={tw`flex-row items-center mb-6`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw`w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4`}>
                  <ChevronLeft size={24} color="white" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={tw`text-white text-xl font-bold flex-1`}>{t('expenses.list')}</Text>
              </View>

              {/* Tab Toggle */}
              <View style={tw`flex-row bg-white/20 rounded-2xl p-1 relative`}>
                {/* Sliding background */}
                <Animated.View
                  style={[
                    tw`absolute top-1 bottom-1 left-1 rounded-xl bg-white`,
                    {
                      width: '48%',
                      transform: [
                        {
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 170],
                          }),
                        },
                      ],
                    },
                  ]}
                />

                <TouchableOpacity onPress={() => handleTabChange('expenses')} style={tw`flex-1 py-3 rounded-xl items-center z-10`}>
                  <Text style={tw.style('text-sm font-semibold', selectedTab === 'expenses' ? `text-[${colors.primary}]` : 'text-white/80')}>{t('expenses.oneTime')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTabChange('recurring')} style={tw`flex-1 py-3 rounded-xl items-center z-10`}>
                  <Text style={tw.style('text-sm font-semibold', selectedTab === 'recurring' ? `text-[${colors.primary}]` : 'text-white/80')}>{t('expenses.recurring')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <View style={tw.style('flex-1 rounded-t-3xl', `bg-[${isDark ? colors.dark.bg : colors.light.bg}]`)}>
              <ScrollView style={tw`flex-1`} contentContainerStyle={tw`px-5 pt-6 pb-24`} showsVerticalScrollIndicator={false}>
                {selectedTab === 'expenses' ? (
                  // One-time expenses
                  sortedExpenses.length === 0 ? (
                    <Card>
                      <Text style={tw.style('text-base text-center py-8', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('expenses.noExpenses')}</Text>
                    </Card>
                  ) : (
                    sortedExpenses.map((expense) => {
                      const IconComponent = getCategoryIcon(expense.category);
                      return (
                        <Swipeable
                          key={expense.id}
                          renderRightActions={(progress, dragX) => renderRightActions(expense.id, expense.description || '', false, dragX)}
                          overshootRight={false}
                          friction={2}
                          rightThreshold={40}
                          containerStyle={tw`mb-3`}
                        >
                          <Card>
                            <View style={tw`flex-row items-center`}>
                              <View style={tw.style('w-12 h-12 rounded-full justify-center items-center mr-3', `bg-[${colors.primary}]/20`)}>
                                {IconComponent && <IconComponent size={22} color={colors.primary} strokeWidth={2} />}
                              </View>
                              <View style={tw`flex-1`}>
                                <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                                  {getCategoryLabel(expense.category)}
                                </Text>
                                {expense.description && (
                                  <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{expense.description}</Text>
                                )}
                                <Text style={tw.style('text-xs mt-1', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{formatDate(expense.date)}</Text>
                              </View>
                              <Text style={tw.style('text-lg font-bold', `text-[${colors.primary}]`)}>{formatCurrency(expense.amount)}</Text>
                            </View>
                          </Card>
                        </Swipeable>
                      );
                    })
                  )
                ) : (
                  // Recurring expenses
                  sortedRecurring.length === 0 ? (
                    <Card>
                      <Text style={tw.style('text-base text-center py-8', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('expenses.noRecurring')}</Text>
                    </Card>
                  ) : (
                    sortedRecurring.map((expense) => {
                      const IconComponent = getCategoryIcon(expense.category);
                      const isEditing = editingId === expense.id;

                      return (
                        <Swipeable
                          key={expense.id}
                          renderRightActions={(progress, dragX) => renderRightActions(expense.id, expense.description || '', true, dragX)}
                          overshootRight={false}
                          friction={2}
                          rightThreshold={40}
                          containerStyle={tw`mb-3`}
                          enabled={!isEditing}
                        >
                          <Card>
                            {isEditing ? (
                              // Edit mode
                              <View>
                                <View style={tw`flex-row items-center mb-3`}>
                                  <View style={tw.style('w-12 h-12 rounded-full justify-center items-center mr-3', `bg-[${colors.primary}]/20`)}>
                                    {IconComponent && <IconComponent size={22} color={colors.primary} strokeWidth={2} />}
                                  </View>
                                  <Text style={tw.style('flex-1 text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                                    {getCategoryLabel(expense.category)}
                                  </Text>
                                </View>

                                <View style={tw`mb-3`}>
                                  <Text style={tw.style('text-xs mb-1', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('expense.amount')}</Text>
                                  <TextInput
                                    value={editAmount}
                                    onChangeText={setEditAmount}
                                    keyboardType="decimal-pad"
                                    style={tw.style('text-lg font-bold py-2 px-3 rounded-xl', `bg-[${isDark ? colors.dark.border : colors.light.border}]`, `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}
                                  />
                                </View>

                                <View style={tw`mb-4`}>
                                  <Text style={tw.style('text-xs mb-1', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('expense.description')}</Text>
                                  <TextInput
                                    value={editDescription}
                                    onChangeText={setEditDescription}
                                    placeholder={t('descriptionPlaceholder')}
                                    style={tw.style('text-sm py-2 px-3 rounded-xl', `bg-[${isDark ? colors.dark.border : colors.light.border}]`, `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}
                                    placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                                  />
                                </View>

                                <View style={tw`flex-row gap-3`}>
                                  <TouchableOpacity onPress={cancelEdit} style={tw.style('flex-1 py-2.5 rounded-xl items-center flex-row justify-center', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)}>
                                    <X size={18} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2} />
                                    <Text style={tw.style('ml-2 font-semibold', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('cancel')}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={() => saveEditRecurring(expense)} style={tw.style('flex-1 py-2.5 rounded-xl items-center flex-row justify-center', `bg-[${colors.primary}]`)}>
                                    <Check size={18} color="white" strokeWidth={2} />
                                    <Text style={tw`ml-2 text-white font-semibold`}>{t('expense.save')}</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ) : (
                              // View mode
                              <View style={tw`flex-row items-center`}>
                                <View style={tw.style('w-12 h-12 rounded-full justify-center items-center mr-3', `bg-[${colors.primary}]/20`)}>
                                  {IconComponent && <IconComponent size={22} color={colors.primary} strokeWidth={2} />}
                                </View>
                                <View style={tw`flex-1`}>
                                  <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                                    {getCategoryLabel(expense.category)}
                                  </Text>
                                  {expense.description && (
                                    <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{expense.description}</Text>
                                  )}
                                  <View style={tw`flex-row items-center mt-1`}>
                                    <View style={tw.style('px-2 py-0.5 rounded-full', expense.isActive ? `bg-green-500/20` : `bg-[${isDark ? colors.dark.border : colors.light.border}]`)}>
                                      <Text style={tw.style('text-xs font-medium', expense.isActive ? 'text-green-600' : `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                                        {expense.isActive ? t('expenses.active') : t('expenses.inactive')}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                                <View style={tw`items-end`}>
                                  <Text style={tw.style('text-lg font-bold mb-2', `text-[${colors.primary}]`)}>{formatCurrency(expense.amount)}</Text>
                                  <TouchableOpacity onPress={() => startEditRecurring(expense)} style={tw.style('p-2 rounded-full', `bg-[${colors.primary}]/10`)}>
                                    <Edit2 size={16} color={colors.primary} strokeWidth={2} />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </Card>
                        </Swipeable>
                      );
                    })
                  )
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
};
