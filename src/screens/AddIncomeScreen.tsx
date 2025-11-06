import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { useState } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INCOME_SOURCES } from '../utils/incomeSources';

interface AddIncomeScreenProps {
  navigation: any;
}

export const AddIncomeScreen = ({ navigation }: AddIncomeScreenProps) => {
  const { addIncome, addRecurringIncome, currentMonth } = useBudgetStore();
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    if (!source) {
      Alert.alert(t('error'), t('revenue.selectSource'));
      return;
    }

    setLoading(true);

    try {
      if (isRecurring) {
        // Créer un TEMPLATE récurrent
        addRecurringIncome({
          amount: parsedAmount,
          source: source as 'salary' | 'bonus' | 'freelance' | 'gift' | 'other',
          description: description || undefined,
          isActive: true,
        });
      } else {
        // Créer une instance unique
        addIncome({
          month: currentMonth,
          amount: parsedAmount,
          source: source as 'salary' | 'bonus' | 'freelance' | 'gift' | 'other',
          description: description || undefined,
          isRecurring: false,
          date: new Date().toISOString(),
        });
      }

      Alert.alert(t('success'), t('revenue.incomeAdded'), [{ text: 'OK', onPress: () => navigation.goBack() }]);

      setAmount('');
      setSource('');
      setDescription('');
      setIsRecurring(false);
    } catch (error) {
      Alert.alert(t('error'), t('revenue.cannotAddIncome'));
    } finally {
      setLoading(false);
    }
  };

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={tw`px-6 pt-4 pb-6`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-white/80 text-base mb-3`}>{t('revenue.amount')}</Text>

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
                {/* Source Selection */}
                <Card style={tw`p-0 overflow-hidden mb-4`}>
                  <View style={tw`px-4 py-3 border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`}>
                    <Text style={tw.style('text-sm font-medium', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('revenue.source')}</Text>
                  </View>

                  <View style={tw`p-3`}>
                    {INCOME_SOURCES.map((src, index) => {
                      const IconComponent = src.icon;
                      const isSelected = source === src.id;
                      const isLast = index === INCOME_SOURCES.length - 1;

                      return (
                        <View key={src.id}>
                          <TouchableOpacity onPress={() => setSource(src.id)} style={tw`flex-row items-center px-3 py-3`}>
                            {/* Icon - TOUJOURS le même style (comme HomeScreen) */}
                            <View style={tw.style('w-10 h-10 rounded-full items-center justify-center mr-3', `bg-[${colors.primary}]/20`)}>
                              <IconComponent size={20} color={colors.primary} strokeWidth={2} />
                            </View>

                            <Text style={tw.style('flex-1 text-base font-medium', isSelected ? `text-[${colors.primary}]` : `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                              {t(src.translationKey)}
                            </Text>

                            {isSelected && (
                              <View style={tw.style('w-6 h-6 rounded-full items-center justify-center', `bg-[${colors.primary}]`)}>
                                <Text style={tw`text-white text-xs font-bold`}>✓</Text>
                              </View>
                            )}
                          </TouchableOpacity>

                          {!isLast && <View style={tw.style('h-px ml-16 mr-3', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)} />}
                        </View>
                      );
                    })}
                  </View>
                </Card>

                {/* Description Input */}
                <Card style={tw`p-0 overflow-hidden mb-4`}>
                  <View style={tw`px-4 py-3 border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`}>
                    <Text style={tw.style('text-sm font-medium', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('revenue.description')}</Text>
                  </View>

                  <View style={tw`px-4 py-3`}>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder={t('revenue.descriptionPlaceholder')}
                      multiline
                      numberOfLines={3}
                      style={tw.style('text-sm min-h-20', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}
                      placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                    />
                  </View>
                </Card>

                {/* Recurring Toggle */}
                <Card style={tw`mb-4`}>
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-1 mr-4`}>
                      <Text style={tw.style('text-base font-semibold mb-1', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('revenue.recurring')}</Text>
                      <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('revenue.recurringHint')}</Text>
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
                <TouchableOpacity onPress={handleSave} disabled={loading} style={tw.style('py-4 rounded-xl items-center', loading ? 'opacity-50' : '', `bg-[${colors.primary}]`)}>
                  <Text style={tw`text-white text-base font-semibold`}>{loading ? '...' : t('expense.save')}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
