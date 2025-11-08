import { View, Text, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { format, addMonths, subMonths, startOfDay, isToday, isYesterday } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Trash2, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react-native';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Swipeable } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BudgetGauge } from '../components/BudgetGauge';
import { getCategoryById } from '../utils/categories';

export const HomeScreen = () => {
  const { budget, expenses, recurringExpenses, incomes, totalSpent, totalRecurring, totalIncome, refresh, deleteExpense, setCurrentMonth, currentMonth } = useBudgetStore();

  const { t, locale } = useTranslation();
  const { isDark, palette, colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gaugeView, setGaugeView] = useState<'revenue' | 'budget'>('revenue');
  const [fadeAnim] = useState(new Animated.Value(1));
  const slideAnim = useState(new Animated.Value(0))[0];
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollToTopButtonOpacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const monthStr = format(selectedDate, 'yyyy-MM');
    setCurrentMonth(monthStr);
  }, [selectedDate]);

  // Animation du bouton scroll to top
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      const threshold = 150;

      if (value > threshold) {
        Animated.spring(scrollToTopButtonOpacity, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }).start();
      } else {
        Animated.spring(scrollToTopButtonOpacity, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }).start();
      }
    });

    return () => scrollY.removeListener(listenerId);
  }, []);

  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

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

  const formatDaySection = (date: Date) => {
    if (isToday(date)) {
      return locale === 'fr' ? "Aujourd'hui" : 'Today';
    }
    if (isYesterday(date)) {
      return locale === 'fr' ? 'Hier' : 'Yesterday';
    }
    return format(date, 'EEEE d MMMM', {
      locale: locale === 'fr' ? fr : enUS,
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = getCategoryById(category);
    return categoryData?.icon;
  };

  const getCategoryLabel = (category: string) => {
    const categoryData = getCategoryById(category);
    return categoryData ? t(categoryData.translationKey) : category;
  };

  const getIncomeSourceIcon = (sourceId: string) => {
    const categoryData = getCategoryById(sourceId);
    return categoryData?.icon;
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
        <TouchableOpacity onPress={() => handleDeleteExpense(expenseId, expenseDescription)} style={tw`bg-red-500 w-14 h-14 rounded-2xl items-center justify-center`} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Trash2 size={22} color="white" strokeWidth={2.5} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
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

  // Group expenses by day
  const expensesByDay = useMemo(() => {
    const grouped: { [key: string]: typeof expenses } = {};

    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedExpenses.forEach((expense) => {
      const dateKey = format(startOfDay(new Date(expense.date)), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });

    return Object.entries(grouped).map(([dateKey, expenses]) => ({
      date: new Date(dateKey),
      expenses,
    }));
  }, [expenses]);

  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          <Animated.ScrollView
            ref={scrollViewRef}
            style={tw`flex-1`}
            contentContainerStyle={tw``}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
            scrollEventThrottle={16}
          >
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
                            outputRange: [0, 125],
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

              {/* Stats Row with Fade Animation */}
              <Animated.View style={[tw`flex-row justify-between px-2`, { opacity: fadeAnim }]}>
                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-white/70 text-xs mb-1`}>{gaugeView === 'revenue' ? (totalIncome > 0 ? 'Revenue' : 'Projection') : 'Budget'}</Text>
                  <Text style={tw`text-white text-lg font-bold`}>{gaugeView === 'revenue' ? formatCurrency(totalIncome > 0 ? totalIncome : budgetAmount) : formatCurrency(budgetAmount)}</Text>
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
              </Animated.View>
            </View>

            {/* Content Section */}
            <View style={tw.style('rounded-t-3xl px-5 pt-6', `bg-[${isDark ? colors.dark.bg : colors.light.bg}]`)}>
              {/* Recent Expenses - Groupées par jour */}
              <View style={tw`mb-3`}>
                <Text style={tw.style('text-lg font-semibold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>Dépenses du mois</Text>

                {expenses.length === 0 ? (
                  <Card>
                    <Text style={tw.style('text-base text-center', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('home.noExpenses')}</Text>
                  </Card>
                ) : (
                  expensesByDay.map((dayGroup, dayIndex) => (
                    <View key={dayGroup.date.toISOString()} style={tw`${dayIndex > 0 ? 'mt-5' : ''}`}>
                      {/* Day Header */}
                      <View style={tw`flex-row items-center justify-between px-1 mb-2`}>
                        <Text style={tw.style('text-sm font-semibold capitalize', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{formatDaySection(dayGroup.date)}</Text>
                        <Text style={tw.style('text-sm font-semibold', `text-[${colors.primary}]`)}>{formatCurrency(dayGroup.expenses.reduce((sum, e) => sum + e.amount, 0))}</Text>
                      </View>

                      {/* Expenses for this day */}
                      {dayGroup.expenses.map((expense) => {
                        const IconComponent = getCategoryIcon(expense.category);
                        const showRecurringBadge = isExpenseRecurring(expense.category, expense.amount, expense.description);

                        return (
                          <Swipeable
                            key={expense.id}
                            renderRightActions={(progress, dragX) => renderRightActions(expense.id, expense.description || '', dragX)}
                            overshootRight={false}
                            friction={2}
                            rightThreshold={40}
                            enableTrackpadTwoFingerGesture
                            containerStyle={tw`mb-3`}
                          >
                            <Card>
                              <View style={tw`flex-row items-center`}>
                                <View style={tw.style('w-10 h-10 rounded-full justify-center items-center mr-3', `bg-[${colors.primary}]/20`)}>
                                  {IconComponent && <IconComponent size={20} color={colors.primary} strokeWidth={2} />}
                                </View>
                                <View style={tw`flex-1`}>
                                  <View style={tw`flex-row items-center gap-1`}>
                                    <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                                      {getCategoryLabel(expense.category)}
                                    </Text>
                                    {showRecurringBadge && (
                                      <View style={tw.style('rounded-xl px-1.5 py-0.5', `bg-[${colors.primary}]/20`)}>
                                        <Text style={tw.style('text-xs font-semibold', `text-[${colors.primary}]`)}>↻</Text>
                                      </View>
                                    )}
                                  </View>
                                  {expense.description && (
                                    <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{expense.description}</Text>
                                  )}
                                </View>
                                <Text style={tw.style('text-base font-bold', `text-[${colors.primary}]`)}>{formatCurrency(expense.amount)}</Text>
                              </View>
                            </Card>
                          </Swipeable>
                        );
                      })}
                    </View>
                  ))
                )}
              </View>
            </View>
          </Animated.ScrollView>

          {/* Scroll to Top Button */}
          <Animated.View
            style={[
              tw`absolute self-center`,
              {
                bottom: 10,
                opacity: scrollToTopButtonOpacity,
                transform: [
                  {
                    scale: scrollToTopButtonOpacity,
                  },
                  {
                    translateY: scrollToTopButtonOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity onPress={handleScrollToTop} style={tw.style('w-12 h-12 rounded-full items-center justify-center shadow-lg', `bg-[${colors.primary}]`)} activeOpacity={0.8}>
              <ArrowUp size={20} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};
