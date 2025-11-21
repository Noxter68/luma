import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Animated, Modal } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Trash2, Info, Users, ChevronRight, Edit2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INCOME_SOURCES } from '../utils/incomeSources';
import { CategoryBudgetCard } from '../components/CategoryBudgetCard';
import { getCategoryById, CATEGORY_GROUPS } from '../utils/categories';
import { useSharedAccount } from '../hooks/useSharedAccount';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

export const RevenueScreen = ({ navigation }: any) => {
  const { budget, incomes, refresh, setBudget, deleteIncome, totalIncome, sortedCategoryBudgets } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'revenue' | 'budget'>('revenue');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasShownSwipeHint, setHasShownSwipeHint] = useState(false);

  // Shared Accounts
  const { accounts, loading: accountsLoading, refresh: refreshSharedAccounts } = useSharedAccount();

  // Animation pour le toggle
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Ref pour le premier swipeable
  const firstSwipeableRef = useRef<Swipeable>(null);

  useEffect(() => {
    const initializeScreen = async () => {
      await refresh();
      setIsInitialLoading(false);
    };

    initializeScreen();
  }, []);

  // Rafraîchir les comptes partagés quand l'écran regagne le focus
  useFocusEffect(
    useCallback(() => {
      refreshSharedAccounts();
    }, [refreshSharedAccounts])
  );

  useEffect(() => {
    if (budget && !isEditingBudget) {
      setBudgetAmount(budget.amount > 0 ? budget.amount.toString() : '');
    } else if (isEditingBudget) {
      // Vider le champ quand on commence à éditer pour éviter le "0" initial
      setBudgetAmount('');
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

  // Montrer le swipe hint au premier chargement avec des revenus
  useEffect(() => {
    if (!isInitialLoading && incomes.length > 0 && !hasShownSwipeHint && selectedTab === 'revenue') {
      // Délai pour laisser le temps à l'UI de se charger
      const timer = setTimeout(() => {
        if (firstSwipeableRef.current) {
          // Ouvrir légèrement
          firstSwipeableRef.current.openRight();

          // Refermer après un court instant
          setTimeout(() => {
            firstSwipeableRef.current?.close();
            setHasShownSwipeHint(true);
          }, 800);
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isInitialLoading, incomes.length, hasShownSwipeHint, selectedTab]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDeleteIncome = (id: string, description: string) => {
    Alert.alert(t('revenue.deleteTitle'), `${t('revenue.deleteConfirm')} "${description}"?`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          deleteIncome(id);
          refresh();
        },
      },
    ]);
  };

  const renderRightActions = (incomeId: string, incomeDescription: string, dragX: any) => {
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
        <TouchableOpacity onPress={() => handleDeleteIncome(incomeId, incomeDescription)} style={tw`bg-red-500 w-14 h-14 rounded-2xl items-center justify-center`} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Trash2 size={22} color="white" strokeWidth={2.5} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
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

  const getIncomeSourceIcon = (sourceId: string) => {
    const source = INCOME_SOURCES.find((s) => s.id === sourceId);
    return source?.icon || null;
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

  const handleOpenSharedAccount = (accountId: string) => {
    navigation.navigate('SharedAccountDetails', { accountId });
  };

  const handleCreateSharedAccount = () => {
    navigation.navigate('CreateSharedAccount');
  };

  // Afficher le loader tant que les données ne sont pas toutes chargées
  if (isInitialLoading || accountsLoading) {
    return (
      <View style={tw`flex-1`}>
        <LinearGradient colors={headerGradient} style={tw`flex-1`}>
          <SafeAreaView edges={['top']} style={tw`flex-1 items-center justify-center`}>
            <View style={tw`bg-white/20 rounded-full p-4`}>
              <View style={tw`w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin`} />
            </View>
            <Text style={tw`text-white/80 text-base mt-4`}>{t('loading')}</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={tw`flex-1`}>
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

                {/* Header content based on selected tab */}
                {selectedTab === 'revenue' ? (
                  <View style={tw`items-center`}>
                    <Text style={tw`text-white/80 text-base mb-3`}>{t('revenue.totalRevenue')}</Text>
                    <Text style={tw`text-white text-6xl font-bold mb-5`}>{formatCurrency(totalIncome)}</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddIncome')}
                      style={tw`py-2.5 px-6 rounded-xl bg-white/20 border-2 border-white/40 flex-row items-center justify-center gap-1.5`}
                    >
                      <Plus size={18} color="white" strokeWidth={2.5} />
                      <Text style={tw`text-white text-sm font-semibold`}>{t('revenue.addRevenue')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
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
                        <TouchableOpacity onPress={() => setIsEditingBudget(true)} style={tw`py-2.5 px-6 rounded-xl bg-white/20 border-2 border-white/40 flex-row items-center justify-center gap-1.5`}>
                          <Edit2 size={18} color="white" strokeWidth={2.5} />
                          <Text style={tw`text-white text-sm font-semibold`}>{budget ? t('budget.editBudget') : t('budget.setBudget')}</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={tw`w-full px-8`}>
                        <Text style={tw`text-white/80 text-base mb-3 text-center`}>{t('budget.enterAmount')}</Text>
                        <TextInput
                          value={budgetAmount}
                          onChangeText={setBudgetAmount}
                          placeholder={budget?.amount ? budget.amount.toString() : '0'}
                          keyboardType="decimal-pad"
                          style={tw`text-6xl font-bold text-white text-center py-4 border-b-2 border-white/30 mb-5 min-h-28`}
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          autoFocus
                        />
                        <View style={tw`flex-row gap-3`}>
                          <TouchableOpacity onPress={() => setIsEditingBudget(false)} style={tw`flex-1 py-3 rounded-xl bg-white/10 border-2 border-white/30`}>
                            <Text style={tw`text-white text-base font-semibold text-center`}>{t('cancel')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleSaveBudget} style={tw`flex-1 py-3 rounded-xl bg-white border-2 border-white/40`}>
                            <Text style={tw.style('text-base font-semibold text-center', `text-[${colors.primary}]`)}>{t('expense.save')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Content Section */}
              <View style={tw`px-6`}>
                <LinearGradient
                  colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]}
                  style={tw`rounded-3xl px-5 pt-5 pb-6`}
                >
                  {/* Revenue Content */}
                  {selectedTab === 'revenue' && (
                    <View>
                      {/* Revenue List Header */}
                      <Text style={tw.style('text-xl font-bold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('revenue.list')}</Text>

                      {incomes.length === 0 ? (
                        <Card>
                          <Text style={tw.style('text-base text-center py-8', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('revenue.noRevenue')}</Text>
                        </Card>
                      ) : (
                        incomes.map((income, index) => {
                          const IconComponent = getIncomeSourceIcon(income.source);

                          return (
                            <Swipeable
                              key={income.id}
                              ref={index === 0 ? firstSwipeableRef : null}
                              renderRightActions={(progress, dragX) => renderRightActions(income.id, income.description || getIncomeSourceLabel(income.source), dragX)}
                              overshootRight={false}
                              friction={2}
                              rightThreshold={40}
                              enableTrackpadTwoFingerGesture
                              containerStyle={tw`mb-3`}
                            >
                              <Card>
                                <View style={tw`flex-row items-center`}>
                                  {IconComponent && (
                                    <View style={tw.style('w-10 h-10 rounded-full items-center justify-center mr-3', `bg-[${colors.primary}]/20`)}>
                                      <IconComponent size={20} color={colors.primary} strokeWidth={2} />
                                    </View>
                                  )}

                                  <View style={tw`flex-1`}>
                                    <View style={tw`flex-row items-center gap-1`}>
                                      <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                                        {income.description || getIncomeSourceLabel(income.source)}
                                      </Text>
                                      {income.isRecurring && (
                                        <View style={tw.style('rounded-xl px-1.5 py-0.5', `bg-[${colors.primary}]/20`)}>
                                          <Text style={tw.style('text-xs font-semibold', `text-[${colors.primary}]`)}>↻</Text>
                                        </View>
                                      )}
                                    </View>
                                    {income.description && (
                                      <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{getIncomeSourceLabel(income.source)}</Text>
                                    )}
                                  </View>

                                  <View style={tw`items-end`}>
                                    <Text style={tw.style('text-lg font-bold', `text-[${colors.primary}]`)}>{formatCurrency(income.amount)}</Text>
                                  </View>
                                </View>
                              </Card>
                            </Swipeable>
                          );
                        })
                      )}

                      {/* Shared Accounts Section */}
                      <View style={tw`mt-6`}>
                        <Text style={tw.style('text-xl font-bold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('sharedAccounts.title')}</Text>

                        {accounts.length === 0 ? (
                          <Card>
                            <Text style={tw.style('text-base text-center py-8', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('sharedAccounts.noAccounts')}</Text>
                          </Card>
                        ) : (
                          accounts.map((account) => (
                            <Card key={account.id} style={tw`mb-3`}>
                              <TouchableOpacity onPress={() => handleOpenSharedAccount(account.id)} style={tw`flex-row items-center`}>
                                <View style={tw.style('w-10 h-10 rounded-full items-center justify-center mr-3', `bg-[${colors.primary}]/20`)}>
                                  <Users size={20} color={colors.primary} strokeWidth={2} />
                                </View>

                                <View style={tw`flex-1`}>
                                  <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{account.name}</Text>
                                  <Text style={tw.style('text-sm mt-0.5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                                    {account.members.length} {account.members.length === 1 ? t('sharedAccounts.member') : t('sharedAccounts.members')}
                                  </Text>
                                </View>

                                <ChevronRight size={20} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
                              </TouchableOpacity>
                            </Card>
                          ))
                        )}

                        {/* Create Button */}
                        <TouchableOpacity
                          onPress={handleCreateSharedAccount}
                          style={tw.style(
                            'rounded-2xl p-4 flex-row items-center justify-center gap-2 border-2 border-dashed',
                            isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`
                          )}
                        >
                          <Plus size={20} color={colors.primary} strokeWidth={2.5} />
                          <Text style={tw.style('text-base font-semibold', `text-[${colors.primary}]`)}>{t('sharedAccounts.createAccount')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Budget Content */}
                  {selectedTab === 'budget' && (
                    <View>
                      {/* Add Category Button at the top */}
                      <TouchableOpacity
                        onPress={handleAddCategory}
                        style={tw.style(
                          'rounded-2xl p-4 mb-4 flex-row items-center justify-center gap-2 border-2 border-dashed',
                          isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`
                        )}
                      >
                        <Plus size={20} color={colors.primary} strokeWidth={2.5} />
                        <Text style={tw.style('text-base font-semibold', `text-[${colors.primary}]`)}>{locale === 'fr' ? 'Ajouter une catégorie de budget' : 'Add budget category'}</Text>
                      </TouchableOpacity>

                      {/* Category Budgets List */}
                      {sortedCategoryBudgets.length === 0 ? (
                        <View style={tw.style('rounded-2xl p-8 items-center', isDark ? `bg-[${colors.dark.card}]` : 'bg-white')}>
                          <Text style={tw.style('text-base text-center', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                            {locale === 'fr' ? 'Aucune catégorie de budget.\nCommence par en ajouter une !' : 'No budget categories.\nStart by adding one!'}
                          </Text>
                        </View>
                      ) : (
                        <>
                          {Object.keys(CATEGORY_GROUPS).map((groupKey) => {
                            const categoriesInGroup = groupedCategories[groupKey];
                            if (!categoriesInGroup || categoriesInGroup.length === 0) return null;

                            return (
                              <View key={groupKey} style={tw`mb-5`}>
                                <Text style={tw.style('text-sm font-semibold mb-2 px-1', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                                  {t(`categoryGroups.${groupKey}`)}
                                </Text>
                                {categoriesInGroup.map((catBudget) => (
                                  <CategoryBudgetCard key={catBudget.id} categoryBudget={catBudget} onEdit={() => handleEditCategory(catBudget)} />
                                ))}
                              </View>
                            );
                          })}
                        </>
                      )}

                      {/* Info Button */}
                      <TouchableOpacity onPress={() => setShowInfoModal(true)} style={tw`flex-row items-center justify-center gap-2 mt-6`}>
                        <Info size={18} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2} />
                        <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budget.howItWorks')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </LinearGradient>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>

        {/* Info Modal */}
        <Modal visible={showInfoModal} transparent animationType="fade" onRequestClose={() => setShowInfoModal(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowInfoModal(false)} style={tw`flex-1 bg-black/60 items-center justify-center px-6`}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={tw.style('w-full rounded-3xl p-6', isDark ? `bg-[${colors.dark.surface}]` : 'bg-white')}>
              <View style={tw`flex-row items-start justify-between mb-4`}>
                <View style={tw`flex-1 pr-4`}>
                  <Text style={tw.style('text-xl font-bold mb-2', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('budget.howItWorks')}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                  <View style={tw.style('w-8 h-8 rounded-full items-center justify-center', isDark ? `bg-[${colors.dark.card}]` : `bg-[${colors.light.border}]`)}>
                    <Text style={tw.style('text-xl font-medium', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>×</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={tw.style('text-base leading-relaxed mb-4', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budget.explanation1')}</Text>
              <Text style={tw.style('text-base leading-relaxed', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('budget.explanation2')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};
