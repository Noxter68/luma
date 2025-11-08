import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { X, Check, DollarSign, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { useSharedRecurringExpenses } from '../hooks/useSharedRecurringExpenses';

import * as Icons from 'lucide-react-native';
import { CATEGORIES } from '../utils/categories';

interface SharedAddRecurringScreenProps {
  navigation: any;
  route: {
    params: {
      accountId: string;
    };
  };
}

export const SharedAddRecurringScreen = ({ navigation, route }: SharedAddRecurringScreenProps) => {
  const { accountId } = route.params;
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const { createRecurring } = useSharedRecurringExpenses(accountId);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  const filteredCategories = CATEGORIES.filter((cat) => t(`categories.${cat.key}`).toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    if (!category) {
      Alert.alert(t('error'), t('selectCategory'));
      return;
    }

    try {
      setSaving(true);

      await createRecurring({
        accountId,
        amount: parsedAmount,
        category,
        description: description.trim() || undefined,
      });

      Alert.alert(t('success'), t('sharedAccounts.recurringAdded'));
      navigation.goBack();
    } catch (error) {
      console.error('Error adding recurring:', error);
      Alert.alert(t('error'), t('sharedAccounts.cannotAddRecurring'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          {/* Header */}
          <View style={tw`px-6 pt-4 pb-6 flex-row items-center justify-between`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
              <X size={24} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={tw`text-white text-lg font-semibold flex-1 text-center`}>{t('sharedAccounts.addRecurring')}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving || !amount || !category} style={tw.style('p-2 -mr-2', (saving || !amount || !category) && 'opacity-50')}>
              {saving ? <ActivityIndicator size="small" color="white" /> : <Check size={24} color="white" strokeWidth={2.5} />}
            </TouchableOpacity>
          </View>

          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-6 pb-6`}>
                {/* Amount Input */}
                <Card style={tw`mb-4`}>
                  <Text style={tw.style('text-sm font-medium mb-2', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('amount')}</Text>
                  <View style={tw`flex-row items-center`}>
                    <DollarSign size={24} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0"
                      placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                      keyboardType="decimal-pad"
                      style={tw.style('flex-1 text-3xl font-bold ml-2', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}
                      autoFocus
                    />
                  </View>
                </Card>

                {/* Category Selection */}
                <Card style={tw`mb-4`}>
                  <Text style={tw.style('text-sm font-medium mb-3', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('category')}</Text>

                  {/* Search */}
                  <View style={tw`flex-row items-center mb-3 px-3 py-2 rounded-xl ${isDark ? `bg-[${colors.dark.bg}]` : `bg-[${colors.light.border}]`}`}>
                    <Search size={18} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder={t('searchCategory')}
                      placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                      style={tw.style('flex-1 ml-2 text-base', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}
                    />
                  </View>

                  {/* Categories Grid */}
                  <View style={tw`flex-row flex-wrap gap-2`}>
                    {filteredCategories.map((cat) => {
                      const isSelected = category === cat.key;
                      const IconComponent = Icons[cat.icon as keyof typeof Icons] as any;

                      return (
                        <TouchableOpacity
                          key={cat.key}
                          onPress={() => setCategory(cat.key)}
                          style={tw.style(
                            'flex-row items-center px-3 py-2.5 rounded-xl gap-2',
                            isSelected ? `bg-[${colors.primary}]` : isDark ? `bg-[${colors.dark.bg}]` : `bg-[${colors.light.border}]`
                          )}
                        >
                          {IconComponent && <IconComponent size={18} color={isSelected ? 'white' : cat.color} strokeWidth={2} />}
                          <Text style={tw.style('text-sm font-semibold', isSelected ? 'text-white' : `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                            {t(`categories.${cat.key}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {filteredCategories.length === 0 && (
                    <Text style={tw.style('text-center text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('noCategoryFound')}</Text>
                  )}
                </Card>

                {/* Description */}
                <Card>
                  <Text style={tw.style('text-sm font-medium mb-2', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('description')}</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('descriptionPlaceholder')}
                    placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                    style={tw.style(
                      'px-4 py-3 rounded-xl text-base',
                      isDark ? `bg-[${colors.dark.bg}] text-[${colors.dark.textPrimary}]` : `bg-[${colors.light.border}] text-[${colors.light.textPrimary}]`
                    )}
                    multiline
                    numberOfLines={3}
                  />
                </Card>
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
