import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { getCategoryById } from '../utils/categories';
import { CategoryBudget } from '../types';

interface AddCategoryBudgetScreenProps {
  navigation: any;
  route: {
    params?: {
      categoryBudget?: CategoryBudget;
      mode: 'add' | 'edit';
    };
  };
}

export const AddCategoryBudgetScreen = ({ navigation, route }: AddCategoryBudgetScreenProps) => {
  const { addCategoryBudget, updateCategoryBudget, deleteCategoryBudget } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();

  const mode = route.params?.mode || 'add';
  const existingBudget = route.params?.categoryBudget;

  const [amount, setAmount] = useState(existingBudget?.amount.toString() || '');
  const [category, setCategory] = useState(existingBudget?.category || '');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(existingBudget?.isRecurring || false);
  const [loading, setLoading] = useState(false);

  const headerGradient = getPaletteGradient(palette, isDark, 'header');
  const selectedCategoryData = category ? getCategoryById(category) : null;

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    if (!category) {
      Alert.alert(t('error'), t('selectCategory'));
      return;
    }

    setLoading(true);

    try {
      if (mode === 'edit' && existingBudget) {
        // Update existing
        updateCategoryBudget({
          ...existingBudget,
          amount: parsedAmount,
          isRecurring,
        });
        Alert.alert(t('success'), locale === 'fr' ? 'Budget mis à jour' : 'Budget updated', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        // Add new
        addCategoryBudget({
          category,
          amount: parsedAmount,
          isRecurring,
          month: '', // Will be set by the store
        });
        Alert.alert(t('success'), locale === 'fr' ? 'Budget catégoriel ajouté' : 'Category budget added', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }

      setAmount('');
      setCategory('');
      setIsRecurring(false);
    } catch (error) {
      Alert.alert(t('error'), locale === 'fr' ? "Impossible d'ajouter le budget" : 'Cannot add budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!existingBudget) return;

    Alert.alert(t('confirmDelete'), locale === 'fr' ? 'Supprimer ce budget catégoriel ?' : 'Delete this category budget?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          deleteCategoryBudget(existingBudget.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSelectCategory = (categoryId: string) => {
    setCategory(categoryId);
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={tw`px-6 pt-4 pb-6`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-white/80 text-base mb-3`}>{mode === 'edit' ? (locale === 'fr' ? 'Modifier le budget' : 'Edit budget') : t('expense.amount')}</Text>

                {/* Amount Input */}
                <View style={tw`w-full px-8`}>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    style={tw`text-6xl font-bold text-white text-center py-2 border-b-2 border-white/30 min-h-20`}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoFocus={mode === 'add'}
                    multiline={false}
                    textAlignVertical="center"
                  />
                </View>
              </View>
            </View>

            {/* Content Section */}
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-5 pb-6`}>
                {/* Category Selection */}
                <Card style={tw`p-0 overflow-hidden mb-4`}>
                  <View style={tw`px-4 py-3 border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`}>
                    <Text style={tw.style('text-sm font-medium', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('expense.category')}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('CategorySelector', {
                        selectedCategory: category,
                        onSelect: handleSelectCategory,
                      })
                    }
                    disabled={mode === 'edit'}
                    style={tw`px-4 py-4 flex-row items-center`}
                  >
                    {selectedCategoryData ? (
                      <>
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
                            <selectedCategoryData.icon size={18} color="white" strokeWidth={2.5} />
                          </LinearGradient>
                        </View>

                        <Text style={tw.style('flex-1 text-base font-medium', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t(selectedCategoryData.translationKey)}</Text>
                      </>
                    ) : (
                      <Text style={tw.style('flex-1 text-base', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('selectCategory')}</Text>
                    )}

                    {mode === 'add' && <ChevronRight size={20} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />}
                  </TouchableOpacity>
                </Card>

                {/* Recurring Toggle */}
                <Card style={tw`mb-4`}>
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-1 mr-4`}>
                      <Text style={tw.style('text-base font-semibold mb-1', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                        🔄 {locale === 'fr' ? 'Récurrent chaque mois' : 'Recurring every month'}
                      </Text>
                      <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                        {locale === 'fr' ? 'Sera automatiquement recréé le mois suivant' : 'Will be automatically recreated next month'}
                      </Text>
                    </View>
                    <Switch
                      value={isRecurring}
                      onValueChange={setIsRecurring}
                      trackColor={{ false: isDark ? colors.dark.border : colors.light.border, true: `${colors.primary}80` }}
                      thumbColor={isRecurring ? colors.primary : isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                    />
                  </View>
                </Card>

                {/* Save Button */}
                <TouchableOpacity onPress={handleSave} disabled={loading} style={tw.style('py-4 rounded-xl items-center mb-3', loading ? 'opacity-50' : '', `bg-[${colors.primary}]`)}>
                  <Text style={tw`text-white text-base font-semibold`}>{loading ? '...' : t('expense.save')}</Text>
                </TouchableOpacity>

                {/* Delete Button (only in edit mode) */}
                {mode === 'edit' && (
                  <TouchableOpacity onPress={handleDelete} style={tw.style('py-3 rounded-xl items-center', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.border}]`)}>
                    <Text style={tw`text-red-500 text-base font-semibold`}>{t('delete')}</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
