import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Check, Users, DollarSign, Gift, Repeat, CircleDollarSign } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { useSharedIncomes } from '../hooks/useSharedIncomes';

interface SharedAddIncomeScreenProps {
  navigation: any;
  route: {
    params: {
      accountId: string;
    };
  };
}

// Sources de revenus adaptées aux comptes partagés
const SHARED_INCOME_SOURCES = [
  { id: 'contribution', icon: Users, translationKey: 'sharedAccounts.incomeSources.contribution' },
  { id: 'refund', icon: CircleDollarSign, translationKey: 'sharedAccounts.incomeSources.refund' },
  { id: 'gift', icon: Gift, translationKey: 'sharedAccounts.incomeSources.gift' },
  { id: 'reimbursement', icon: Repeat, translationKey: 'sharedAccounts.incomeSources.reimbursement' },
  { id: 'other', icon: DollarSign, translationKey: 'sharedAccounts.incomeSources.other' },
];

export const SharedAddIncomeScreen = ({ navigation, route }: SharedAddIncomeScreenProps) => {
  const { accountId } = route.params;
  const { t } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const { createIncome } = useSharedIncomes(accountId);

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('contribution');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('error'), t('invalidAmount'));
      return;
    }

    if (!source) {
      Alert.alert(t('error'), t('sharedAccounts.selectSource'));
      return;
    }

    setLoading(true);

    try {
      await createIncome({
        accountId,
        amount: parsedAmount,
        source,
        description: description.trim() || undefined,
        date: new Date().toISOString(),
        isRecurring,
      });

      Alert.alert(t('success'), t('sharedAccounts.incomeAdded'), [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);

      setAmount('');
      setSource('contribution');
      setDescription('');
      setIsRecurring(false);
    } catch (error) {
      console.error('Error adding income:', error);
      Alert.alert(t('error'), t('sharedAccounts.cannotAddIncome'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={tw`px-6 pt-4 pb-6`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-white/80 text-base mb-3`}>{t('amount')}</Text>

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
                {/* Recurring Toggle */}
                {/* <Card style={tw`p-0 overflow-hidden mb-4`}>
                  <TouchableOpacity onPress={() => setIsRecurring(!isRecurring)} style={tw`px-4 py-4 flex-row items-center justify-between`}>
                    <View style={tw`flex-1`}>
                      <Text style={tw.style('text-base font-semibold mb-1', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('revenue.recurring')}</Text>
                      <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('revenue.recurringHint')}</Text>
                    </View>

                    <View style={tw.style('w-12 h-7 rounded-full p-0.5', isRecurring ? `bg-[${colors.primary}]` : `bg-[${isDark ? colors.dark.border : colors.light.border}]`)}>
                      <View style={tw.style('w-6 h-6 rounded-full bg-white', isRecurring && 'ml-auto')} />
                    </View>
                  </TouchableOpacity>
                </Card> */}

                {/* Source Selection */}
                <Card style={tw`p-0 overflow-hidden mb-4`}>
                  <View style={tw`px-4 py-3 border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`}>
                    <Text style={tw.style('text-md font-bold p-2', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('sharedAccounts.incomeSource')}</Text>
                  </View>

                  <View style={tw`p-3`}>
                    {SHARED_INCOME_SOURCES.map((src, index) => {
                      const IconComponent = src.icon;
                      const isSelected = source === src.id;
                      const isLast = index === SHARED_INCOME_SOURCES.length - 1;

                      return (
                        <View key={src.id}>
                          <TouchableOpacity onPress={() => setSource(src.id)} style={tw`flex-row items-center px-3 py-3`}>
                            {/* Icon */}
                            <View style={tw.style('w-10 h-10 rounded-full items-center justify-center mr-3', `bg-[${colors.primary}]/20`)}>
                              <IconComponent size={20} color={colors.primary} strokeWidth={2} />
                            </View>

                            <Text style={tw.style('flex-1 text-base font-medium', isSelected ? `text-[${colors.primary}]` : `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                              {t(src.translationKey)}
                            </Text>

                            {/* Check Icon */}
                            {isSelected && <Check size={20} color={colors.primary} strokeWidth={2.5} />}
                          </TouchableOpacity>

                          {!isLast && <View style={tw.style('h-px mx-3', isDark ? `bg-[${colors.dark.border}]` : `bg-[${colors.light.border}]`)} />}
                        </View>
                      );
                    })}
                  </View>
                </Card>

                {/* Description Input */}
                <Card style={tw`p-0 overflow-hidden mb-4`}>
                  <View style={tw`px-4 py-3 border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`}>
                    <Text style={tw.style('text-sm font-medium', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('description')}</Text>
                  </View>

                  <View style={tw`px-4 py-3`}>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder={t('sharedAccounts.incomeDescriptionPlaceholder')}
                      style={tw.style('text-base', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}
                      placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </Card>

                {/* Save Button */}
                <TouchableOpacity onPress={handleSave} disabled={loading} style={tw.style('py-4 rounded-xl items-center', loading ? 'opacity-50' : '', `bg-[${colors.primary}]`)}>
                  <Text style={tw`text-white text-base font-semibold`}>{loading ? '...' : t('save')}</Text>
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
