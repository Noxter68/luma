import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Info, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BudgetMetricsCard } from '../components/BudgetMetricCard';
import { CategoryBudgetCard } from '../components/CategoryBudgetCard';
import { CategoryBudgetAlert } from '../components/CategoryBudgetAlert';
import { getCategoriesNeedingAlert } from '../utils/budgetCalculations';

export const BudgetScreen = ({ navigation }: any) => {
  const { budget, refresh, setBudget, budgetMetrics, sortedCategoryBudgets, categoryBudgets } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [alertCategory, setAlertCategory] = useState<any>(null);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (budget && !isEditing) {
      setAmount(budget.amount.toString());
    }
  }, [budget, isEditing]);

  // Vérifier si des catégories nécessitent une alerte
  useEffect(() => {
    const categoriesNeedingAlert = getCategoriesNeedingAlert(sortedCategoryBudgets);

    // Afficher une alerte seulement si c'est la première fois qu'on dépasse 80%
    // (pour éviter de spammer l'utilisateur à chaque navigation)
    if (categoriesNeedingAlert.length > 0 && !alertCategory) {
      // On prend la première catégorie qui nécessite une alerte
      setAlertCategory(categoriesNeedingAlert[0]);
    }
  }, [sortedCategoryBudgets]);

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const budgetAmount = budget?.amount || 0;
  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  // Grouper les catégories par groupe
  const groupedCategories: Record<string, typeof sortedCategoryBudgets> = {};

  sortedCategoryBudgets.forEach((catBudget) => {
    const categoryData = require('../utils/categories').getCategoryById(catBudget.category);
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
            {/* Header Section with Gradient */}
            <View style={tw`px-6 pt-4 pb-6`}>
              {/* Budget Input Section */}
              <View style={tw`items-center`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <Text style={tw`text-white/80 text-base mr-2`}>{t('budget.monthlyBudget')}</Text>
                  <TouchableOpacity onPress={() => setShowInfoModal(true)}>
                    <Info size={18} color="white" opacity={0.7} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                {isEditing ? (
                  <View style={tw`w-full items-center`}>
                    <View style={tw`w-full px-8`}>
                      <TextInput
                        value={amount}
                        onChangeText={setAmount}
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
                      <TouchableOpacity onPress={() => setIsEditing(false)} style={tw`flex-1 py-3 rounded-xl bg-white/20 items-center`}>
                        <Text style={tw`text-white text-base font-semibold`}>{t('cancel')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSave} style={tw`flex-1 py-3 rounded-xl bg-white items-center`}>
                        <Text style={tw.style('text-base font-semibold', `text-[${colors.primary}]`)}>{t('expense.save')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={tw`items-center`}>
                    <Text style={tw`text-6xl font-bold text-white mb-5`}>{formatCurrency(budgetAmount)}</Text>
                    <TouchableOpacity onPress={() => setIsEditing(true)} style={tw`px-8 py-3 rounded-xl bg-white/20 border-2 border-white/40`}>
                      <Text style={tw`text-white text-base font-semibold`}>{budget ? t('budget.editBudget') : t('budget.setBudget')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Content Section with Background Gradient */}
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-5 pb-6`}>
                {/* Budget Metrics Card */}
                {/* <BudgetMetricsCard metrics={budgetMetrics} /> */}

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
                      const CATEGORY_GROUPS = require('../utils/categories').CATEGORY_GROUPS;

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
            // Scroll to that category (optionnel)
          }}
        />
      )}
    </View>
  );
};
