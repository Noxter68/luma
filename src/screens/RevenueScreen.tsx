import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Animated, Modal } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Trash2, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INCOME_SOURCES } from '../utils/incomeSources';
import { BudgetMetricsCard } from '../components/BudgetMetricCard';
import { CategoryBudgetCard } from '../components/CategoryBudgetCard';
import { CategoryBudgetAlert } from '../components/CategoryBudgetAlert';
import { getCategoriesNeedingAlert } from '../utils/budgetCalculations';
import { getCategoryById, CATEGORY_GROUPS } from '../utils/categories';

export const RevenueScreen = ({ navigation }: any) => {
  const { budget, incomes, refresh, setBudget, deleteIncome, totalIncome, budgetMetrics, sortedCategoryBudgets } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'revenue' | 'budget'>('revenue');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [alertCategory, setAlertCategory] = useState<any>(null);

  // Animation pour le toggle
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (budget && !isEditingBudget) {
      setBudgetAmount(budget.amount.toString());
    }
  }, [budget, isEditingBudget]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedTab === 'revenue' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [selectedTab]);

  // Vérifier si des catégories nécessitent une alerte (seulement en mode Budget)
  useEffect(() => {
    if (selectedTab === 'budget') {
      const categoriesNeedingAlert = getCategoriesNeedingAlert(sortedCategoryBudgets);

      if (categoriesNeedingAlert.length > 0 && !alertCategory) {
        setAlertCategory(categoriesNeedingAlert[0]);
      }
    }
  }, [sortedCategoryBudgets, selectedTab]);

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
    return source?.icon;
  };

  const getIncomeSourceLabel = (sourceId: string) => {
    const source = INCOME_SOURCES.find((s) => s.id === sourceId);
    return source ? t(source.translationKey) : sourceId;
  };

  const budgetAmountValue = budget?.amount || 0;
  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  // Grouper les catégories par groupe
  const groupedCategories: Record<string, typeof sortedCategoryBudgets> = {};

  sortedCategoryBudgets.forEach((catBudget) => {
    const categoryData = getCategoryById(catBudget.category);
    const group = categoryData?.group || 'other';

    if (!groupedCategories[group]) {
      groupedCategories[group] = [];
    }
    groupedCategories[group].push(catBudget);
  });

  const handleEditCategory = (categoryBudget: any) => {
    navigation.navigate('AddCategoryBudget', {
      categoryBudget,
      mode: 'edit',
    });
  };

  const handleAddCategory = () => {
    navigation.navigate('AddCategoryBudget', {
      mode: 'add',
    });
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={tw`px-6 pt-4 pb-6`}>
              {/* Tab Selector with fluid animation */}
              <View style={tw`flex-row bg-white/20 rounded-2xl p-1 mb-6 mx-12 relative`}>
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

                <TouchableOpacity onPress={() => setSelectedTab('revenue')} style={tw`flex-1 py-2 rounded-xl items-center z-10`}>
                  <Text style={tw.style('text-sm font-semibold', selectedTab === 'revenue' ? `text-[${colors.primary}]` : 'text-white/80')}>{t('revenue.title')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab('budget')} style={tw`flex-1 py-2 rounded-xl items-center z-10`}>
                  <Text style={tw.style('text-sm font-semibold', selectedTab === 'budget' ? `text-[${colors.primary}]` : 'text-white/80')}>{t('budget.title')}</Text>
                </TouchableOpacity>
              </View>

              {/* Revenue Tab */}
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

              {/* Budget Tab */}
              {selectedTab === 'budget' && (
                <View style={tw`items-center`}>
                  {!isEditingBudget ? (
                    <>
                      <View style={tw`flex-row items-center mb-3`}>
                        <Text style={tw`text-white/80 text-base mr-2`}>{t('budget.monthlyBudget')}</Text>
                        <TouchableOpacity onPress={() => setShowInfoModal(true)}>
                          <Info size={18} color="white" opacity={0.7} strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                      <Text style={tw`text-6xl font-bold text-white mb-5`}>{formatCurrency(budgetAmountValue)}</Text>
                      <TouchableOpacity onPress={() => setIsEditingBudget(true)} style={tw`px-8 py-3 rounded-xl bg-white/20 border-2 border-white/40`}>
                        <Text style={tw`text-white text-base font-semibold`}>{budget ? t('budget.editBudget') : t('budget.setBudget')}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
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
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-5 pb-6`}>
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
                              <View style={tw`w-9 h-9 rounded-lg mr-3 overflow-hidden`}>
                                <LinearGradient
                                  colors={isDark ? [colors.primary, colors.primaryDark] : [colors.primaryLight, colors.primary]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={tw`w-full h-full items-center justify-center`}
                                >
                                  <View style={tw`absolute top-0 left-0 w-full h-1/2 opacity-30`}>
                                    <LinearGradient colors={['rgba(255,255,255,0.4)', 'transparent']} style={tw`w-full h-full`} />
                                  </View>
                                  {IconComponent && <IconComponent size={18} color="white" strokeWidth={2.5} />}
                                </LinearGradient>
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

                {/* Budget Content */}
                {selectedTab === 'budget' && (
                  <View>
                    {/* Budget Metrics Card */}
                    <BudgetMetricsCard metrics={budgetMetrics} />

                    {/* Section Header */}
                    <View style={tw`flex-row justify-between items-center mb-3`}>
                      <View>
                        <Text style={tw.style('text-lg font-semibold mb-0.5', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('categoryBudgets')}</Text>
                        <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                          {sortedCategoryBudgets.length} {sortedCategoryBudgets.length === 1 ? 'catégorie' : 'catégories'}
                        </Text>
                      </View>

                      <TouchableOpacity onPress={handleAddCategory} style={tw.style('px-4 py-2 rounded-xl flex-row items-center gap-2', `bg-[${colors.primary}]`)}>
                        <Plus size={18} color="white" strokeWidth={2.5} />
                        <Text style={tw`text-white text-sm font-semibold`}>{locale === 'fr' ? 'Ajouter' : 'Add'}</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Category Budgets List */}
                    {sortedCategoryBudgets.length === 0 ? (
                      <View style={tw.style('rounded-2xl p-8 items-center', isDark ? `bg-[${colors.dark.card}]` : 'bg-white')}>
                        <Text style={tw.style('text-base text-center mb-4', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                          {locale === 'fr' ? 'Aucun budget catégoriel défini.\nCommence par ajouter une catégorie !' : 'No category budgets defined.\nStart by adding a category!'}
                        </Text>
                        <TouchableOpacity onPress={handleAddCategory} style={tw.style('px-6 py-3 rounded-xl', `bg-[${colors.primary}]`)}>
                          <Text style={tw`text-white text-base font-semibold`}>{locale === 'fr' ? 'Ajouter une catégorie' : 'Add a category'}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        {Object.keys(groupedCategories).map((groupKey) => {
                          const categoriesInGroup = groupedCategories[groupKey];

                          return (
                            <View key={groupKey} style={tw`mb-4`}>
                              {/* Group Header */}
                              <Text style={tw.style('text-xs font-semibold uppercase tracking-wider mb-2 px-1', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                                {t(CATEGORY_GROUPS[groupKey])}
                              </Text>

                              {/* Categories in this group */}
                              {categoriesInGroup.map((catBudget) => (
                                <CategoryBudgetCard key={catBudget.id} categoryBudget={catBudget} onEdit={() => handleEditCategory(catBudget)} />
                              ))}
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* Tip */}
                    {sortedCategoryBudgets.length > 0 && (
                      <Text style={tw.style('text-xs text-center italic px-2 mt-3', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                        {locale === 'fr' ? '💡 Les catégories proches de la limite apparaissent en premier' : '💡 Categories close to limit appear first'}
                      </Text>
                    )}
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

      {/* Category Alert Modal */}
      {alertCategory && (
        <CategoryBudgetAlert
          category={alertCategory}
          visible={!!alertCategory}
          onClose={() => setAlertCategory(null)}
          onViewDetails={() => {
            setAlertCategory(null);
          }}
        />
      )}
    </View>
  );
};
