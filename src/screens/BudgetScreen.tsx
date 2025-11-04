import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Info, DollarSign, Percent, Home, ShoppingCart, Popcorn, PiggyBank } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';

const ALLOCATION_CATEGORIES = [
  { id: 'essentials', key: 'essentials', percentage: 0.5, icon: Home },
  { id: 'food', key: 'categories.food', percentage: 0.2, icon: ShoppingCart },
  { id: 'entertainment', key: 'categories.entertainment', percentage: 0.15, icon: Popcorn },
  { id: 'savings', key: 'savings', percentage: 0.15, icon: PiggyBank },
];

export const BudgetScreen = () => {
  const { budget, refresh, setBudget } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [showPercentage, setShowPercentage] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (budget && !isEditing) {
      setAmount(budget.amount.toString());
    }
  }, [budget, isEditing]);

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
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-4 pb-6`}>
                {/* Suggested Allocation Header */}
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <View>
                    <Text style={tw.style('text-base font-semibold mb-0.5', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('suggestedAllocation')}</Text>
                    <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('allocationSubtitle')}</Text>
                  </View>

                  {/* Simple Toggle Icon */}
                  <TouchableOpacity onPress={() => setShowPercentage(!showPercentage)} style={tw.style('w-9 h-9 rounded-lg items-center justify-center', `bg-[${colors.primary}]/10`)}>
                    {showPercentage ? <DollarSign size={16} color={colors.primary} strokeWidth={2.5} /> : <Percent size={16} color={colors.primary} strokeWidth={2.5} />}
                  </TouchableOpacity>
                </View>

                {/* Allocation Grid - Optimized */}
                <Card style={tw`p-0 overflow-hidden mb-4`}>
                  {ALLOCATION_CATEGORIES.map((category, index) => {
                    const allocatedAmount = budgetAmount * category.percentage;
                    const IconComponent = category.icon;
                    const isLast = index === ALLOCATION_CATEGORIES.length - 1;

                    return (
                      <View key={category.id}>
                        <View style={tw`px-4 py-2.5`}>
                          <View style={tw`flex-row items-center mb-2`}>
                            {/* Icon with Gradient */}
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

                            {/* Label */}
                            <Text style={tw.style('flex-1 text-sm font-medium', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t(category.key)}</Text>

                            {/* Amount Display */}
                            <Text style={tw.style('text-base font-bold', `text-[${colors.primary}]`)}>
                              {showPercentage ? `${(category.percentage * 100).toFixed(0)}%` : formatCurrency(allocatedAmount)}
                            </Text>
                          </View>

                          {/* Progress Bar */}
                          <View style={tw`flex-row items-center ml-11`}>
                            <View style={tw.style('flex-1 h-1.5 rounded-full overflow-hidden mr-2', `bg-[${isDark ? colors.dark.surface : colors.light.border}]`)}>
                              <View style={[tw.style('h-full rounded-full', `bg-[${colors.primary}]`), { width: `${category.percentage * 100}%` }]} />
                            </View>
                            {/* <Text style={tw.style('text-xs font-medium w-10 text-right', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                              {(category.percentage * 100).toFixed(0)}%
                            </Text> */}
                          </View>
                        </View>

                        {/* Divider */}
                        {!isLast && <View style={tw.style('h-px mx-4', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)} />}
                      </View>
                    );
                  })}
                </Card>

                {/* Tip */}
                <Text style={tw.style('text-xs text-center italic px-2 mt-3 mb-4', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('tipText')}</Text>
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
