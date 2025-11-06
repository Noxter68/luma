import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, PiggyBank } from 'lucide-react-native';
import { subMonths, format } from 'date-fns';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SegmentedControl } from '../components/analytics/SegmentControl';
import { SwipeableChart } from '../components/analytics/SwipeableChart';
import { SwipeableComparisons } from '../components/analytics/SwipeableComparisons';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { getTopExpenses, getCategoryBreakdown, getMonthComparison, getDailyBurnRate } from '../utils/analyticsHelper';

interface AnalyticsScreenProps {
  navigation: any;
}

export const AnalyticsScreen = ({ navigation }: AnalyticsScreenProps) => {
  // ============================================
  // HOOKS & STATE
  // ============================================
  const { expenses, incomes } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<1 | 3 | 6>(1);
  const [chartMode, setChartMode] = useState<'expenses' | 'savings'>('expenses');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // ============================================
  // DATA FETCHING
  // ============================================
  const { historicalData, globalScale } = useHistoricalData(selectedPeriod, locale);

  // ============================================
  // UTILS
  // ============================================
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  // Stats affichées dans le chart principal
  const displayedStats = useMemo(() => {
    if (selectedPointIndex !== null && historicalData[selectedPointIndex]) {
      const selectedData = historicalData[selectedPointIndex];
      return {
        expenses: selectedData.expenses,
        income: selectedData.income,
        savings: selectedData.savings,
        label: selectedData.monthFull,
      };
    }

    const totalExpenses = historicalData.reduce((sum, d) => sum + d.expenses, 0);
    const totalSavings = historicalData.reduce((sum, d) => sum + d.savings, 0);

    return {
      expenses: totalExpenses,
      income: 0,
      savings: totalSavings,
      label: null,
    };
  }, [selectedPointIndex, historicalData]);

  // Top 5 plus grosses dépenses
  const topExpenses = useMemo(() => getTopExpenses(expenses, 5), [expenses]);

  // Répartition par catégorie
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(expenses), [expenses]);

  // Comparaison avec le mois précédent
  const monthComparison = useMemo(() => {
    const currentMonth = new Date();
    const previousMonth = subMonths(currentMonth, 1);
    const currentMonthKey = format(currentMonth, 'yyyy-MM');
    const previousMonthKey = format(previousMonth, 'yyyy-MM');

    const currentExpenses = expenses.filter((exp) => exp.date.startsWith(currentMonthKey)).reduce((sum, exp) => sum + exp.amount, 0);

    const previousExpenses = expenses.filter((exp) => exp.date.startsWith(previousMonthKey)).reduce((sum, exp) => sum + exp.amount, 0);

    const currentIncome = incomes.filter((inc) => inc.month === currentMonthKey).reduce((sum, inc) => sum + inc.amount, 0);

    const previousIncome = incomes.filter((inc) => inc.month === previousMonthKey).reduce((sum, inc) => sum + inc.amount, 0);

    return getMonthComparison(currentExpenses, previousExpenses, currentIncome, previousIncome);
  }, [expenses, incomes]);

  // Daily burn rate (moyenne quotidienne)
  const dailyBurnRate = useMemo(() => {
    const currentMonth = new Date();
    const previousMonth = subMonths(currentMonth, 1);
    const currentMonthKey = format(currentMonth, 'yyyy-MM');
    const previousMonthKey = format(previousMonth, 'yyyy-MM');

    const currentExpenses = expenses.filter((exp) => exp.date.startsWith(currentMonthKey)).reduce((sum, exp) => sum + exp.amount, 0);

    const previousExpenses = expenses.filter((exp) => exp.date.startsWith(previousMonthKey)).reduce((sum, exp) => sum + exp.amount, 0);

    return getDailyBurnRate(currentExpenses, previousExpenses, currentMonth);
  }, [expenses]);

  // Projection annuelle
  const yearPrediction = useMemo(() => {
    if (historicalData.length < 2) return null;

    const monthsLeft = 12 - (new Date().getMonth() + 1);
    if (monthsLeft <= 0) return null;

    const totalSavings = historicalData.reduce((sum, d) => sum + d.savings, 0);
    const avgSavings = totalSavings / selectedPeriod;
    const projectedSavings = avgSavings * monthsLeft;
    const totalYearSavings = totalSavings + projectedSavings;

    return {
      projected: projectedSavings,
      total: totalYearSavings,
      monthsLeft,
    };
  }, [historicalData, selectedPeriod]);

  // ============================================
  // UI CONFIG
  // ============================================
  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  const periodOptions = [
    { value: 1 as const, label: '1M' },
    { value: 3 as const, label: '3M' },
    { value: 6 as const, label: '6M' },
  ];

  const chartModeOptions = [
    {
      value: 'expenses' as const,
      label: '',
      icon: <Wallet size={14} color={chartMode === 'expenses' ? 'white' : isDark ? colors.dark?.textSecondary : colors.light?.textSecondary} strokeWidth={2} />,
    },
    {
      value: 'savings' as const,
      label: '',
      icon: <PiggyBank size={14} color={chartMode === 'savings' ? 'white' : isDark ? colors.dark?.textSecondary : colors.light?.textSecondary} strokeWidth={2} />,
    },
  ];

  // ============================================
  // COMPONENTS
  // ============================================
  const Divider = () => (
    <View
      style={[
        tw`my-6`,
        {
          height: 1,
          backgroundColor: isDark ? colors.dark?.border : colors.light?.border,
          opacity: 0.2,
        },
      ]}
    />
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <View style={tw`flex-1`}>
        <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
          <SafeAreaView edges={['top']} style={tw`flex-1`}>
            <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
              {/* ============================================ */}
              {/* HEADER */}
              {/* ============================================ */}
              <View style={tw`px-4 pt-2 pb-4`}>
                <Text style={tw`text-white text-2xl font-bold mb-1`}>{t('analytics.title')}</Text>
                <Text style={tw`text-white/70 text-sm`}>{t('analytics.subtitle')}</Text>
              </View>

              {/* ============================================ */}
              {/* CONTENT CONTAINER */}
              {/* ============================================ */}
              <View style={tw`px-4`}>
                <LinearGradient
                  colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]}
                  style={tw`rounded-3xl px-6 pt-4 pb-6`}
                >
                  {/* ============================================ */}
                  {/* PERIOD SELECTOR */}
                  {/* ============================================ */}
                  <View style={tw`mb-4`}>
                    <SegmentedControl
                      options={periodOptions}
                      value={selectedPeriod}
                      onChange={(value) => {
                        setSelectedPeriod(value);
                        setSelectedPointIndex(null);
                      }}
                      type="compact"
                    />
                  </View>

                  {/* ============================================ */}
                  {/* MAIN CHART (Swipeable Line/Bar) */}
                  {/* ============================================ */}
                  <Card style={[tw`mb-6`, { padding: 0, overflow: 'visible' }]}>
                    {/* Chart Header */}
                    <View style={tw`px-4 pt-4 pb-3`}>
                      <View style={tw`flex-row items-start justify-between`}>
                        <View style={tw`flex-1`}>
                          {displayedStats.label && <Text style={[{ fontSize: 11, fontWeight: '600', marginBottom: 2 }, { color: colors.primary }]}>{displayedStats.label}</Text>}

                          <Text
                            style={[
                              { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
                              {
                                color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
                              },
                            ]}
                          >
                            {chartMode === 'expenses' ? formatCurrency(displayedStats.expenses) : formatCurrency(displayedStats.savings)}
                          </Text>

                          <Text
                            style={[
                              {
                                fontSize: 13,
                                fontWeight: '600',
                                letterSpacing: -0.3,
                                marginTop: 2,
                              },
                              {
                                color: isDark ? colors.dark?.textSecondary : colors.light?.textSecondary,
                              },
                            ]}
                          >
                            {chartMode === 'expenses' ? t('analytics.totalSpent') : t('analytics.totalSaved')}
                          </Text>
                        </View>

                        {/* Chart Mode Toggle (Expenses/Savings) */}
                        <View style={{ width: 80, marginTop: 4 }}>
                          <SegmentedControl options={chartModeOptions} value={chartMode} onChange={setChartMode} type="icon" />
                        </View>
                      </View>
                    </View>

                    {/* Chart Component */}
                    <View style={tw`pt-2 pb-4`}>
                      <SwipeableChart
                        data={historicalData}
                        mode={chartMode}
                        onPointSelect={setSelectedPointIndex}
                        selectedIndex={selectedPointIndex}
                        isDark={isDark}
                        colors={colors}
                        formatCurrency={formatCurrency}
                        globalScale={globalScale}
                      />
                    </View>

                    {/* Swipe Hint */}
                    <Text
                      style={[
                        tw`text-center pb-2`,
                        {
                          fontSize: 10,
                          color: isDark ? colors.dark?.textTertiary : colors.light?.textTertiary,
                          opacity: 0.6,
                        },
                      ]}
                    >
                      {locale === 'fr' ? '← Glissez pour changer de vue →' : '← Swipe to change view →'}
                    </Text>
                  </Card>

                  <Divider />

                  {/* ============================================ */}
                  {/* LARGEST EXPENSES (Top 5) */}
                  {/* ============================================ */}
                  {topExpenses.length > 0 && (
                    <>
                      <View style={tw`mb-4`}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '700',
                            letterSpacing: -0.3,
                            color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
                          }}
                        >
                          {locale === 'fr' ? 'Plus grosses dépenses' : 'Largest Expenses'}
                        </Text>
                      </View>

                      {topExpenses.map((expense) => {
                        const IconComponent = expense.categoryData?.icon;
                        return (
                          <View key={expense.id} style={tw`mb-4`}>
                            <View style={tw`flex-row items-center justify-between`}>
                              <View style={tw`flex-row items-center flex-1 gap-3`}>
                                {/* Category Icon */}
                                {IconComponent && (
                                  <View style={[tw`w-10 h-10 rounded-xl justify-center items-center`, { backgroundColor: `${colors.primary}10` }]}>
                                    <IconComponent size={18} color={colors.primary} strokeWidth={2} />
                                  </View>
                                )}

                                {/* Expense Info */}
                                <View style={tw`flex-1`}>
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      fontWeight: '600',
                                      color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
                                    }}
                                    numberOfLines={1}
                                  >
                                    {expense.description || t(expense.categoryData?.translationKey || 'categories.other')}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color: isDark ? colors.dark?.textTertiary : colors.light?.textTertiary,
                                    }}
                                  >
                                    {t(expense.categoryData?.translationKey || 'categories.other')}
                                  </Text>
                                </View>
                              </View>

                              {/* Amount */}
                              <Text
                                style={{
                                  fontSize: 17,
                                  fontWeight: '700',
                                  color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
                                }}
                              >
                                {formatCurrency(expense.amount)}
                              </Text>
                            </View>
                          </View>
                        );
                      })}

                      <Divider />
                    </>
                  )}

                  {/* ============================================ */}
                  {/* MONTH COMPARISON CAROUSEL */}
                  {/* Swipeable: Expenses | Savings | Daily Avg */}
                  {/* ============================================ */}
                  <View style={tw`mb-6`}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        letterSpacing: -0.3,
                        marginBottom: 16,
                        color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
                      }}
                    >
                      {locale === 'fr' ? 'Comparaison mensuelle' : 'Month Comparison'}
                    </Text>

                    <SwipeableComparisons
                      expensesData={{
                        previous: monthComparison.previousExpenses,
                        current: monthComparison.currentExpenses,
                      }}
                      savingsData={{
                        previous: monthComparison.previousSavings,
                        current: monthComparison.currentSavings,
                      }}
                      dailyData={{
                        previous: dailyBurnRate.previousDailyAvg,
                        current: dailyBurnRate.currentDailyAvg,
                        projected: dailyBurnRate.projectedMonthTotal,
                      }}
                      formatCurrency={formatCurrency}
                      isDark={isDark}
                      colors={colors}
                      locale={locale}
                    />
                  </View>

                  <Divider />

                  {/* ============================================ */}
                  {/* SPENDING BY CATEGORY */}
                  {/* With badges and progress bars */}
                  {/* ============================================ */}
                  {categoryBreakdown.length > 0 && (
                    <>
                      <View style={tw`mb-6`}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '700',
                            letterSpacing: -0.3,
                            color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
                          }}
                        >
                          {locale === 'fr' ? 'Dépenses par catégorie' : 'Spending by Category'}
                        </Text>
                      </View>

                      {categoryBreakdown.map((item) => {
                        const IconComponent = item.categoryData?.icon;
                        return (
                          <View key={item.categoryId} style={tw`mb-6`}>
                            <View style={tw`flex-row items-center justify-between mb-3`}>
                              <View style={tw`flex-row items-center gap-3 flex-1`}>
                                {/* Category Badge */}
                                {IconComponent && (
                                  <View style={[tw`w-11 h-11 rounded-xl justify-center items-center`, { backgroundColor: `${colors.primary}12` }]}>
                                    <IconComponent size={20} color={colors.primary} strokeWidth={2} />
                                  </View>
                                )}

                                {/* Category Name */}
                                <Text
                                  style={{
                                    fontSize: 15,
                                    fontWeight: '600',
                                    color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
                                  }}
                                >
                                  {t(item.categoryData?.translationKey || 'categories.other')}
                                </Text>
                              </View>

                              {/* Amount & Percentage */}
                              <View style={tw`items-end gap-1`}>
                                <Text
                                  style={{
                                    fontSize: 17,
                                    fontWeight: '700',
                                    color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
                                  }}
                                >
                                  {formatCurrency(item.amount)}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontWeight: '600',
                                    color: isDark ? colors.dark?.textTertiary : colors.light?.textTertiary,
                                  }}
                                >
                                  {item.percentage.toFixed(0)}%
                                </Text>
                              </View>
                            </View>

                            {/* Progress Bar */}
                            <View
                              style={[
                                tw`h-2.5 rounded-full overflow-hidden`,
                                {
                                  backgroundColor: isDark ? `${colors.dark?.border}30` : `${colors.light?.border}40`,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  tw`h-full rounded-full`,
                                  {
                                    width: `${item.percentage}%`,
                                    backgroundColor: colors.primary,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        );
                      })}

                      <Divider />
                    </>
                  )}

                  {/* ============================================ */}
                  {/* YEAR PROJECTION */}
                  {/* ============================================ */}
                  {yearPrediction && (
                    <View>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '700',
                          letterSpacing: -0.3,
                          marginBottom: 8,
                          color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
                        }}
                      >
                        {t('analytics.yearProjection')}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          lineHeight: 20,
                          color: isDark ? colors.dark?.textSecondary : colors.light?.textSecondary,
                        }}
                      >
                        {t('analytics.projectionDesc', {
                          amount: formatCurrency(yearPrediction.total),
                          months: yearPrediction.monthsLeft,
                        })}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
};
