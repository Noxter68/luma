import { View, Text, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { useEffect, useState } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { format, addMonths, subMonths } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Home, ShoppingCart, Car, Popcorn, Smartphone, Lightbulb, Package, Trash2, ChevronLeft, ChevronRight, Briefcase, Gift, Laptop, DollarSign } from 'lucide-react-native';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Swipeable } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BudgetGauge } from '../components/BudgetGauge';

export const HomeScreen = () => {
  const { budget, expenses, recurringExpenses, incomes, totalSpent, totalRecurring, totalIncome, refresh, deleteExpense, setCurrentMonth, currentMonth } = useBudgetStore();

  const { t, locale } = useTranslation();
  const { isDark, palette, colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gaugeView, setGaugeView] = useState<'revenue' | 'budget'>('revenue');
  const [fadeAnim] = useState(new Animated.Value(1));
  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const monthStr = format(selectedDate, 'yyyy-MM');
    setCurrentMonth(monthStr);
  }, [selectedDate]);

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

  const formatMonthYear = (date: Date) => {
    return format(date, 'MMMM yyyy', {
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

  const getIncomeSourceIcon = (sourceId: string) => {
    const icons: Record<string, any> = {
      salary: Briefcase,
      bonus: Gift,
      freelance: Laptop,
      gift: Gift,
      other: DollarSign,
    };
    return icons[sourceId] || DollarSign;
  };

  const getIncomeSourceLabel = (sourceId: string) => {
    return t(`incomeSources.${sourceId}`);
  };

  const handleDeleteExpense = (expenseId: string, expenseDescription: string) => {
    Alert.alert(t('confirmDelete'), expenseDescription || t('expense.amount'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => deleteExpense(expenseId),
      },
    ]);
  };

  const renderRightActions = (expenseId: string, expenseDescription: string, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity onPress={() => handleDeleteExpense(expenseId, expenseDescription)} style={tw`bg-red-500 justify-center items-center w-20 rounded-3xl mb-3`}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Trash2 size={24} color="white" strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const handlePreviousMonth = () => {
    setSelectedDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate((prev) => addMonths(prev, 1));
  };

  const handleToggleGaugeView = (view: 'revenue' | 'budget') => {
    if (view === gaugeView) return;

    // Slide animation
    Animated.spring(slideAnim, {
      toValue: view === 'revenue' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();

    // Fade animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setGaugeView(view);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const isExpenseRecurring = (expenseCategory: string, expenseAmount: number, expenseDescription?: string): boolean => {
    return recurringExpenses.some((rec) => rec.isActive && rec.category === expenseCategory && rec.amount === expenseAmount && (expenseDescription ? rec.description === expenseDescription : true));
  };

  const budgetAmount = budget?.amount || 0;
  const activeRecurring = recurringExpenses.filter((r) => r.isActive);
  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-5`}>
            {/* Header Section with Gradient */}
            <View style={tw`px-5 pt-2 pb-8`}>
              {/* Month Navigator */}
              <View style={tw`flex-row items-center justify-between mb-6`}>
                <TouchableOpacity onPress={handlePreviousMonth} style={tw`w-10 h-10 rounded-full bg-white/20 items-center justify-center`}>
                  <ChevronLeft size={24} color="white" strokeWidth={2.5} />
                </TouchableOpacity>

                <Text style={tw`text-white text-xl font-semibold capitalize`}>{formatMonthYear(selectedDate)}</Text>

                <TouchableOpacity onPress={handleNextMonth} style={tw`w-10 h-10 rounded-full bg-white/20 items-center justify-center`}>
                  <ChevronRight size={24} color="white" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Gauge View Toggle */}
              <View style={tw`flex-row bg-white/20 rounded-2xl p-1 mb-4 mx-12 relative`}>
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
                            outputRange: [0, 125], // Distance ajustée pour rester dans le container
                          }),
                        },
                      ],
                    },
                  ]}
                />

                <TouchableOpacity onPress={() => handleToggleGaugeView('revenue')} style={tw`flex-1 py-2 rounded-xl items-center z-10`}>
                  <Text style={tw.style('text-sm font-semibold', gaugeView === 'revenue' ? `text-[${colors.primary}]` : 'text-white/80')}>{t('gaugeToggle.revenue')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleToggleGaugeView('budget')} style={tw`flex-1 py-2 rounded-xl items-center z-10`}>
                  <Text style={tw.style('text-sm font-semibold', gaugeView === 'budget' ? `text-[${colors.primary}]` : 'text-white/80')}>{t('gaugeToggle.budget')}</Text>
                </TouchableOpacity>
              </View>

              {/* Animated Gauge Container */}
              <Animated.View style={{ opacity: fadeAnim }}>
                <BudgetGauge budget={budgetAmount} spent={totalSpent} recurring={totalRecurring} income={totalIncome} mode={gaugeView} />
              </Animated.View>

              {/* Stats Row */}
              <View style={tw`flex-row justify-between px-4`}>
                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-white/70 text-xs mb-1`}>{totalIncome > 0 ? 'Revenue' : 'Projection'}</Text>
                  <Text style={tw`text-white text-lg font-bold`}>{formatCurrency(totalIncome > 0 ? totalIncome : budgetAmount)}</Text>
                </View>

                <View style={tw`w-px h-12 bg-white/20`} />

                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-white/70 text-xs mb-1`}>Recurring</Text>
                  <Text style={tw`text-white text-lg font-bold`}>{formatCurrency(totalRecurring)}</Text>
                </View>

                <View style={tw`w-px h-12 bg-white/20`} />

                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-white/70 text-xs mb-1`}>Spent</Text>
                  <Text style={tw`text-white text-lg font-bold`}>{formatCurrency(totalSpent)}</Text>
                </View>
              </View>
            </View>

            {/* Content Section */}
            <View style={tw.style('rounded-t-3xl px-5 pt-6', `bg-[${isDark ? colors.dark.bg : colors.light.bg}]`)}>
              {/* Income Summary - Si des incomes existent */}
              {incomes.length > 0 && (
                <View style={tw`mb-6`}>
                  <Card>
                    <View style={tw`flex-row justify-between items-center mb-3`}>
                      <Text style={tw.style('text-base font-semibold', `text-[${colors.primary}]`)}>{t('revenue.incomeMonth')}</Text>
                      <Text style={tw.style('text-lg font-bold', `text-[${colors.primary}]`)}>{formatCurrency(totalIncome)}</Text>
                    </View>
                    <View style={tw`gap-2`}>
                      {incomes.map((income) => {
                        const IconComponent = getIncomeSourceIcon(income.source);
                        return (
                          <View key={income.id} style={tw`flex-row items-center gap-2`}>
                            <View style={tw.style('w-7 h-7 rounded-full justify-center items-center', `bg-[${colors.primary}]/20`)}>
                              <IconComponent size={16} color={colors.primary} strokeWidth={2} />
                            </View>
                            <View style={tw`flex-1 flex-row items-center gap-1`}>
                              <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                                {income.description || getIncomeSourceLabel(income.source)}
                              </Text>
                              {income.isRecurring && (
                                <View style={tw.style('rounded-xl px-1.5 py-0.5', `bg-[${colors.primary}]/20`)}>
                                  <Text style={tw.style('text-xs font-semibold', `text-[${colors.primary}]`)}>↻</Text>
                                </View>
                              )}
                            </View>
                            <Text style={tw.style('text-sm font-semibold', `text-[${colors.primary}]`)}>{formatCurrency(income.amount)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </Card>
                </View>
              )}

              {/* Recurring Expenses Summary - Toujours affiché séparément */}
              {activeRecurring.length > 0 && (
                <View style={tw`mb-6`}>
                  <Card>
                    <View style={tw`flex-row justify-between items-center mb-3`}>
                      <Text style={tw.style('text-base font-semibold', `text-[${colors.primary}]`)}>Dépenses récurrentes</Text>
                      <Text style={tw.style('text-lg font-bold', `text-[${colors.primary}]`)}>{formatCurrency(totalRecurring)}</Text>
                    </View>
                    <View style={tw`gap-2`}>
                      {activeRecurring.map((rec) => {
                        const IconComponent = getCategoryIcon(rec.category);
                        return (
                          <View key={rec.id} style={tw`flex-row items-center gap-2`}>
                            <View style={tw.style('w-7 h-7 rounded-full justify-center items-center', `bg-[${colors.primary}]/20`)}>
                              <IconComponent size={16} color={colors.primary} strokeWidth={2} />
                            </View>
                            <Text style={tw.style('flex-1 text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                              {rec.description || getCategoryLabel(rec.category)}
                            </Text>
                            <Text style={tw.style('text-sm font-semibold', `text-[${colors.primary}]`)}>{formatCurrency(rec.amount)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </Card>
                </View>
              )}

              {/* Recent Expenses - Dépenses réelles du mois uniquement */}
              <View style={tw`mb-3`}>
                <Text style={tw.style('text-lg font-semibold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>Dépenses du mois</Text>

                {expenses.length === 0 ? (
                  <Card>
                    <Text style={tw.style('text-base text-center', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('home.noExpenses')}</Text>
                  </Card>
                ) : (
                  expenses.slice(0, 10).map((expense) => {
                    const IconComponent = getCategoryIcon(expense.category);
                    const showRecurringBadge = isExpenseRecurring(expense.category, expense.amount, expense.description);

                    return (
                      <Swipeable key={expense.id} renderRightActions={(progress, dragX) => renderRightActions(expense.id, expense.description || '', dragX)} overshootRight={false} rightThreshold={40}>
                        <Card style={tw`mb-3`}>
                          <View style={tw`flex-row items-center`}>
                            <View style={tw.style('w-10 h-10 rounded-full justify-center items-center mr-3', `bg-[${colors.primary}]/20`)}>
                              <IconComponent size={20} color={colors.primary} strokeWidth={2} />
                            </View>
                            <View style={tw`flex-1`}>
                              <View style={tw`flex-row items-center gap-1`}>
                                <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{getCategoryLabel(expense.category)}</Text>
                                {showRecurringBadge && (
                                  <View style={tw.style('rounded-xl px-1.5 py-0.5', `bg-[${colors.primary}]/20`)}>
                                    <Text style={tw.style('text-xs font-semibold', `text-[${colors.primary}]`)}>↻</Text>
                                  </View>
                                )}
                              </View>
                              {expense.description && (
                                <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{expense.description}</Text>
                              )}
                              <Text style={tw.style('text-xs mt-0.5', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{formatDate(expense.date)}</Text>
                            </View>
                            <Text style={tw.style('text-lg font-bold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{formatCurrency(expense.amount)}</Text>
                          </View>
                        </Card>
                      </Swipeable>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};
