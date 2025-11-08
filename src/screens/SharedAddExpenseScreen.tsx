import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategoryById } from '../utils/categories';
import { useSharedExpenses } from '../hooks/useSharedExpenses';

interface SharedAddExpenseScreenProps {
  navigation: any;
  route: {
    params: {
      accountId: string;
    };
  };
}

export const SharedAddExpenseScreen = ({ navigation, route }: SharedAddExpenseScreenProps) => {
  const { accountId } = route.params;
  const { addExpense } = useSharedExpenses(accountId);
  const { t } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

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
      await addExpense({
        accountId,
        amount: parsedAmount,
        category,
        description: description || undefined,
        date: new Date().toISOString(),
      });

      Alert.alert(t('success'), t('expenseAdded'), [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);

      setAmount('');
      setCategory('');
      setDescription('');
    } catch (error) {
      Alert.alert(t('error'), t('cannotAddExpense'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setCategory(categoryId);
  };

  const selectedCategoryData = category ? getCategoryById(category) : null;
  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={tw`px-6 pt-4 pb-6`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-white/80 text-base mb-3`}>{t('expense.amount')}</Text>

                {/* Amount Input */}
                <View style={tw`w-full px-8`}>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    style={tw`text-6xl font-bold text-white text-center py-2 border-b-2 border-white/30 min-h-20`}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoFocus
                    multiline={false}
                    textAlignVertical="center"
                  />
                </View>
              </View>
            </View>

            {/* Content Section */}
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-5 pb-6`}>
                {/* Category Selection Button */}
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
                    style={tw`px-4 py-4 flex-row items-center`}
                  >
                    {selectedCategoryData ? (
                      <>
                        <View style={tw.style('w-10 h-10 rounded-full items-center justify-center mr-3', `bg-[${colors.primary}]/20`)}>
                          <selectedCategoryData.icon size={20} color={colors.primary} strokeWidth={2} />
                        </View>

                        <Text style={tw.style('flex-1 text-base font-medium', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t(selectedCategoryData.translationKey)}</Text>
                      </>
                    ) : (
                      <Text style={tw.style('flex-1 text-base', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('selectCategory')}</Text>
                    )}

                    <ChevronRight size={20} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
                  </TouchableOpacity>
                </Card>

                {/* Description Input */}
                <Card style={tw`p-0 overflow-hidden mb-4`}>
                  <View style={tw`px-4 py-3 border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`}>
                    <Text style={tw.style('text-sm font-medium', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('expense.description')}</Text>
                  </View>

                  <View style={tw`px-4 py-3`}>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder={t('descriptionPlaceholder')}
                      style={tw.style('text-base', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}
                      placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </Card>

                {/* Save Button */}
                <TouchableOpacity onPress={handleSave} disabled={loading} style={tw.style('py-4 rounded-xl items-center', loading ? 'opacity-50' : '', `bg-[${colors.primary}]`)}>
                  <Text style={tw`text-white text-base font-semibold`}>{loading ? '...' : t('sharedAccounts.addExpense.save')}</Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw.style('py-3 rounded-xl items-center mt-3', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.border}]`)}>
                  <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('cancel')}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
