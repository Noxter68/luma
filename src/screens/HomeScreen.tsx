import { View, Text, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { useEffect, useState } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { format, addMonths, subMonths } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Home, ShoppingCart, Car, Popcorn, Smartphone, Lightbulb, Package, Trash2, ChevronLeft, ChevronRight } from 'lucide-react-native';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Swipeable } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomeScreen = () => {
  const { budget, expenses, recurringExpenses, totalSpent, totalRecurring, totalWithRecurring, remaining, refresh, deleteExpense, setCurrentMonth, currentMonth } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, palette, colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    refresh();
  }, []);

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

  const budgetAmount = budget?.amount || 0;
  const activeRecurring = recurringExpenses.filter((r) => r.isActive);

  // Gradient adapté à la palette
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

              {/* Budget Circle */}
              <View style={tw`items-center mb-6`}>
                <View style={tw`w-48 h-48 rounded-full bg-white/10 items-center justify-center border-8 border-white/30`}>
                  <View style={tw`items-center`}>
                    <Home size={48} color="white" strokeWidth={2} />
                    <Text style={tw`text-white text-3xl font-bold mt-3`}>{formatCurrency(remaining)}</Text>
                    <Text style={tw`text-white/80 text-sm mt-1`}>LEFT TO SPEND</Text>
                  </View>
                </View>
              </View>

              {/* Stats Row */}
              <View style={tw`flex-row justify-between px-4`}>
                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-white/70 text-xs mb-1`}>Projection</Text>
                  <Text style={tw`text-white text-lg font-bold`}>{formatCurrency(budgetAmount)}</Text>
                </View>

                <View style={tw`w-px h-12 bg-white/20`} />

                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-white/70 text-xs mb-1`}>Daily budget</Text>
                  <Text style={tw`text-white text-lg font-bold`}>{formatCurrency(budgetAmount > 0 ? budgetAmount / 30 : 0)}</Text>
                </View>

                <View style={tw`w-px h-12 bg-white/20`} />

                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-white/70 text-xs mb-1`}>Total Spent</Text>
                  <Text style={tw`text-white text-lg font-bold`}>{formatCurrency(totalSpent)}</Text>
                </View>
              </View>
            </View>

            {/* Content Section */}
            <View style={tw.style('rounded-t-3xl px-5 pt-6', `bg-[${isDark ? colors.dark.bg : colors.light.bg}]`)}>
              {/* Recurring Summary */}
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

              {/* Recent Expenses */}
              <View style={tw`mb-3`}>
                <Text style={tw.style('text-lg font-semibold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>Dépenses du mois</Text>

                {expenses.length === 0 ? (
                  <Card>
                    <Text style={tw.style('text-base text-center', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('home.noExpenses')}</Text>
                  </Card>
                ) : (
                  expenses.slice(0, 10).map((expense) => {
                    const IconComponent = getCategoryIcon(expense.category);
                    const isRecurring = recurringExpenses.some((rec) => rec.description === expense.description && rec.isActive);

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
                                {isRecurring && (
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
