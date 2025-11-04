import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Info, DollarSign, Percent, Home, ShoppingCart, Popcorn, PiggyBank, Plus, Trash2, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INCOME_SOURCES } from '../utils/incomeSources';

const ALLOCATION_CATEGORIES = [
  { id: 'essentials', key: 'essentials', percentage: 0.5, icon: Home },
  { id: 'food', key: 'categories.food', percentage: 0.2, icon: ShoppingCart },
  { id: 'entertainment', key: 'categories.entertainment', percentage: 0.15, icon: Popcorn },
  { id: 'savings', key: 'savings', percentage: 0.15, icon: PiggyBank },
];

export const RevenueScreen = ({ navigation }: any) => {
  const { budget, incomes, refresh, setBudget, deleteIncome, totalIncome, totalRecurring } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'revenue' | 'budget'>('revenue');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [showPercentage, setShowPercentage] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (budget && !isEditingBudget) {
      setBudgetAmount(budget.amount.toString());
    }
  }, [budget, isEditingBudget]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveBudget = () => {
    const parsedAmount = parseFloat(budgetAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    // ⚠️ GARDE-FOU: Budget ne peut pas dépasser Revenue - Recurring
    const maxBudget = totalIncome - totalRecurring;

    if (totalIncome > 0 && parsedAmount > maxBudget) {
      Alert.alert(
        t('error'),
        `${t('budgetProgress.budgetTooHigh')}\n\n` + `Revenue: ${formatCurrency(totalIncome)}\n` + `Recurring: ${formatCurrency(totalRecurring)}\n` + `Max budget: ${formatCurrency(maxBudget)}`,
        [{ text: 'OK' }]
      );
      return;
    }

    setBudget(parsedAmount);
    setIsEditingBudget(false);
  };

  const handleDeleteIncome = (incomeId: string, incomeDescription: string) => {
    Alert.alert(t('confirmDelete'), incomeDescription || t('revenue.totalRevenue'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => deleteIncome(incomeId),
      },
    ]);
  };

  const getIncomeSourceIcon = (sourceId: string) => {
    const source = INCOME_SOURCES.find((s) => s.id === sourceId);
    return source?.icon || DollarSign;
  };

  const getIncomeSourceLabel = (sourceId: string) => {
    const source = INCOME_SOURCES.find((s) => s.id === sourceId);
    return source ? t(source.translationKey) : sourceId;
  };

  const budgetAmountValue = budget?.amount || 0;
  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            {/* Header Section with Gradient */}
            <View style={tw`px-6 pt-4 pb-6`}>
              {/* Tab Selector - Même taille que Home */}
              <View style={tw`flex-row bg-white/20 rounded-2xl p-1 mb-6 mx-12`}>
                <TouchableOpacity onPress={() => setSelectedTab('revenue')} style={tw.style('flex-1 py-2 rounded-xl items-center', selectedTab === 'revenue' && 'bg-white')}>
                  <Text style={tw.style('text-sm font-semibold', selectedTab === 'revenue' ? `text-[${colors.primary}]` : 'text-white/80')}>{t('revenue.title')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab('budget')} style={tw.style('flex-1 py-2 rounded-xl items-center', selectedTab === 'budget' && 'bg-white')}>
                  <Text style={tw.style('text-sm font-semibold', selectedTab === 'budget' ? `text-[${colors.primary}]` : 'text-white/80')}>{t('budget.title')}</Text>
                </TouchableOpacity>
              </View>

              {/* Revenue Tab Content */}
              {selectedTab === 'revenue' && (
                <View style={tw`items-center`}>
                  <Text style={tw`text-white/80 text-base mb-3`}>{t('revenue.totalRevenue')}</Text>
                  <Text style={tw`text-6xl font-bold text-white mb-5`}>{formatCurrency(totalIncome)}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('AddIncome')} style={tw`px-8 py-3 rounded-xl bg-white/20 border-2 border-white/40 flex-row items-center gap-2`}>
                    <Plus size={20} color="white" strokeWidth={2.5} />
                    <Text style={tw`text-white text-base font-semibold`}>{t('revenue.addRevenue')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Budget Tab Content - Plus propre et pro */}
              {selectedTab === 'budget' && (
                <View style={tw`items-center`}>
                  {!isEditingBudget ? (
                    <>
                      {/* Budget Display */}
                      <View style={tw`items-center mb-6`}>
                        <Text style={tw`text-white/80 text-base mb-3`}>{t('budget.monthlyBudget')}</Text>
                        <Text style={tw`text-6xl font-bold text-white mb-3`}>{formatCurrency(budgetAmountValue)}</Text>

                        {/* Budget indicator - Plus compact */}
                        {totalIncome > 0 && totalRecurring > 0 && (
                          <View style={tw`flex-row items-center gap-2 mb-4`}>
                            <View style={tw`flex-row items-center gap-1`}>
                              <Text style={tw`text-white/60 text-sm`}>{formatCurrency(totalIncome)} revenue</Text>
                              <Text style={tw`text-white/40 text-sm`}>-</Text>
                              <Text style={tw`text-white/60 text-sm`}>{formatCurrency(totalRecurring)} recurring</Text>
                            </View>
                            {budgetAmountValue <= totalIncome - totalRecurring && (
                              <View style={tw`bg-green-500/20 px-2 py-0.5 rounded-lg`}>
                                <Text style={tw`text-green-400 text-xs font-semibold`}>✓</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>

                      {/* Action Button */}
                      <TouchableOpacity onPress={() => setIsEditingBudget(true)} style={tw`px-8 py-3 rounded-xl bg-white/20 border-2 border-white/40`}>
                        <Text style={tw`text-white text-base font-semibold`}>{budget ? t('budget.editBudget') : t('budget.setBudget')}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    /* Edit Mode - Inchangé */
                    <View style={tw`w-full items-center`}>
                      <Text style={tw`text-white/80 text-base mb-3`}>{t('budget.monthlyBudget')}</Text>
                      <View style={tw`w-full px-8`}>
                        <TextInput
                          value={budgetAmount}
                          onChangeText={setBudgetAmount}
                          placeholder="0"
                          keyboardType="numeric"
                          style={tw`text-5xl font-bold text-white text-center py-2 border-b-2 border-white/30 mb-6 min-h-20`}
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          autoFocus
                          multiline={false}
                          textAlignVertical="center"
                        />
                      </View>
                      <View style={tw`flex-row gap-3 w-full px-8`}>
                        <TouchableOpacity onPress={() => setIsEditingBudget(false)} style={tw`flex-1 py-3 rounded-xl bg-white/20 items-center`}>
                          <Text style={tw`text-white text-base font-semibold`}>{t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSaveBudget} style={tw`flex-1 py-3 rounded-xl bg-white items-center`}>
                          <Text style={tw.style('text-base font-semibold', `text-[${colors.primary}]`)}>{t('expense.save')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Content Section */}
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-4 pb-6`}>
                {/* Revenue List */}
                {selectedTab === 'revenue' && (
                  <View>
                    <Text style={tw.style('text-lg font-semibold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('revenue.list')}</Text>

                    {incomes.length === 0 ? (
                      <Card>
                        <Text style={tw.style('text-base text-center py-8', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('revenue.noRevenue')}</Text>
                      </Card>
                    ) : (
                      incomes.map((income) => {
                        const IconComponent = getIncomeSourceIcon(income.source);

                        return (
                          <Card key={income.id} style={tw`mb-3`}>
                            <View style={tw`flex-row items-center`}>
                              <View style={tw.style('w-10 h-10 rounded-full justify-center items-center mr-3', `bg-[${colors.primary}]/20`)}>
                                <IconComponent size={20} color={colors.primary} strokeWidth={2} />
                              </View>
                              <View style={tw`flex-1`}>
                                <View style={tw`flex-row items-center gap-1`}>
                                  <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                                    {getIncomeSourceLabel(income.source)}
                                  </Text>
                                  {income.isRecurring && (
                                    <View style={tw.style('rounded-xl px-1.5 py-0.5', `bg-[${colors.primary}]/20`)}>
                                      <Text style={tw.style('text-xs font-semibold', `text-[${colors.primary}]`)}>↻</Text>
                                    </View>
                                  )}
                                </View>
                                {income.description && (
                                  <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{income.description}</Text>
                                )}
                              </View>
                              <Text style={tw.style('text-lg font-bold mr-2', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{formatCurrency(income.amount)}</Text>
                              <TouchableOpacity onPress={() => handleDeleteIncome(income.id, income.description || '')} style={tw`p-1`}>
                                <Trash2 size={18} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
                              </TouchableOpacity>
                            </View>
                          </Card>
                        );
                      })
                    )}
                  </View>
                )}

                {/* Budget Allocation */}
                {selectedTab === 'budget' && (
                  <View>
                    {/* Budget Overview Card - Si revenue existe */}
                    {totalIncome > 0 && budgetAmountValue > 0 && (
                      <Card style={tw`mb-4`}>
                        <View style={tw`flex-row items-center justify-between mb-3`}>
                          <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('budgetProgress.overview')}</Text>
                          <TrendingUp size={20} color={colors.primary} strokeWidth={2.5} />
                        </View>

                        <View style={tw`mb-3`}>
                          <View style={tw`flex-row justify-between mb-2`}>
                            <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budgetProgress.totalRevenue')}</Text>
                            <Text style={tw.style('text-sm font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{formatCurrency(totalIncome)}</Text>
                          </View>
                          <View style={tw`flex-row justify-between mb-2`}>
                            <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budgetProgress.budgetLimit')}</Text>
                            <Text style={tw.style('text-sm font-semibold', `text-[${colors.primary}]`)}>{formatCurrency(budgetAmountValue)}</Text>
                          </View>

                          {/* Progress Bar */}
                          <View style={tw.style('h-2 rounded-full overflow-hidden mt-2', `bg-[${isDark ? colors.dark.surface : colors.light.border}]`)}>
                            <View style={[tw.style('h-full', `bg-[${colors.primary}]`), { width: `${Math.min((budgetAmountValue / totalIncome) * 100, 100)}%` }]} />
                          </View>

                          <View style={tw`flex-row justify-between mt-2`}>
                            <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                              {((budgetAmountValue / totalIncome) * 100).toFixed(0)}% {t('budgetProgress.ofRevenue')}
                            </Text>
                            <Text style={tw.style('text-xs font-semibold', `text-[${colors.primary}]`)}>
                              {formatCurrency(totalIncome - budgetAmountValue)} {t('budgetProgress.toSave')}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    )}

                    <View style={tw`flex-row justify-between items-center mb-3`}>
                      <View>
                        <Text style={tw.style('text-base font-semibold mb-0.5', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('suggestedAllocation')}</Text>
                        <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('allocationSubtitle')}</Text>
                      </View>

                      <TouchableOpacity onPress={() => setShowPercentage(!showPercentage)} style={tw.style('w-9 h-9 rounded-lg items-center justify-center', `bg-[${colors.primary}]/10`)}>
                        {showPercentage ? <DollarSign size={16} color={colors.primary} strokeWidth={2.5} /> : <Percent size={16} color={colors.primary} strokeWidth={2.5} />}
                      </TouchableOpacity>
                    </View>

                    <Card style={tw`p-0 overflow-hidden mb-4`}>
                      {ALLOCATION_CATEGORIES.map((category, index) => {
                        const allocatedAmount = budgetAmountValue * category.percentage;
                        const IconComponent = category.icon;
                        const isLast = index === ALLOCATION_CATEGORIES.length - 1;

                        return (
                          <View key={category.id}>
                            <View style={tw`px-4 py-2.5`}>
                              <View style={tw`flex-row items-center mb-2`}>
                                <View style={tw`w-8 h-8 rounded-lg mr-3 overflow-hidden`}>
                                  <LinearGradient
                                    colors={isDark ? [colors.primary, colors.primaryDark, colors.primary] : [colors.primaryLight, colors.primary, colors.primaryLight]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={tw`w-full h-full items-center justify-center`}
                                  >
                                    <View style={tw`absolute top-0 left-0 w-full h-1/2 opacity-30`}>
                                      <LinearGradient colors={['rgba(255,255,255,0.4)', 'transparent']} style={tw`w-full h-full`} />
                                    </View>
                                    <IconComponent size={16} color="white" strokeWidth={2.5} />
                                  </LinearGradient>
                                </View>

                                <Text style={tw.style('flex-1 text-sm font-medium', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t(category.key)}</Text>

                                <Text style={tw.style('text-base font-bold', `text-[${colors.primary}]`)}>
                                  {showPercentage ? `${(category.percentage * 100).toFixed(0)}%` : formatCurrency(allocatedAmount)}
                                </Text>
                              </View>

                              <View style={tw`flex-row items-center ml-11`}>
                                <View style={tw.style('flex-1 h-1.5 rounded-full overflow-hidden mr-2', `bg-[${isDark ? colors.dark.surface : colors.light.border}]`)}>
                                  <View style={[tw.style('h-full rounded-full', `bg-[${colors.primary}]`), { width: `${category.percentage * 100}%` }]} />
                                </View>
                              </View>
                            </View>

                            {!isLast && <View style={tw.style('h-px mx-4', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)} />}
                          </View>
                        );
                      })}
                    </Card>

                    <Text style={tw.style('text-xs text-center italic px-2 mt-3 mb-4', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('tipText')}</Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Info Modal */}
      <Modal visible={showInfoModal} transparent animationType="fade" onRequestClose={() => setShowInfoModal(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setShowInfoModal(false)} style={tw`flex-1 bg-black/60 justify-center items-center px-8`}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={tw.style('rounded-3xl p-6 max-w-md', isDark ? `bg-[${colors.dark.card}]` : 'bg-white')}>
              <Text style={tw.style('text-xl font-bold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>💰 {t('budget.monthlyBudget')}</Text>
              <Text style={tw.style('text-base leading-6 mb-4', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budgetInfo')}</Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)} style={tw.style('py-3 rounded-xl items-center', `bg-[${colors.primary}]`)}>
                <Text style={tw`text-white text-base font-semibold`}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
