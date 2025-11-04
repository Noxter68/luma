import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useBudgetStore } from '../store';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import tw from '../lib/tailwind';
import { Home, ShoppingCart, Car, Popcorn, Smartphone, Lightbulb, Package } from 'lucide-react-native';
import { Button } from '../components/Buttons';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';

const CATEGORIES = [
  { id: 'rent', icon: Home },
  { id: 'food', icon: ShoppingCart },
  { id: 'transport', icon: Car },
  { id: 'entertainment', icon: Popcorn },
  { id: 'subscription', icon: Smartphone },
  { id: 'utilities', icon: Lightbulb },
  { id: 'other', icon: Package },
];

interface AddRecurringScreenProps {
  navigation: any;
}

export const AddRecurringScreen = ({ navigation }: AddRecurringScreenProps) => {
  const { addRecurringExpense } = useBudgetStore();
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();
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
      addRecurringExpense({
        amount: parsedAmount,
        category,
        description: description || undefined,
        isActive: true,
      });

      Alert.alert(t('success'), t('recurringAdded'), [{ text: 'OK', onPress: () => navigation.goBack() }]);

      setAmount('');
      setCategory('');
      setDescription('');
    } catch (error) {
      Alert.alert(t('error'), t('cannotAddRecurring'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw.style('flex-1', `bg-[${isDark ? colors.dark.bg : colors.light.bg}]`)}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-6`}>
        <Card>
          <Input label={t('expense.amount')} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />

          <Text style={tw.style('text-sm mb-2 font-medium', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('expense.category')}</Text>
          <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = category === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={tw.style(
                    'w-[30%] aspect-square rounded-2xl border-2 justify-center items-center p-2',
                    isDark ? `bg-[${colors.dark.surface}]` : 'bg-white',
                    isSelected ? `border-[${colors.primary}] bg-[${colors.primary}]/10` : `border-[${isDark ? colors.dark.border : colors.light.border}]`
                  )}
                >
                  <IconComponent size={32} color={isSelected ? colors.primary : isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2} />
                  <Text
                    style={tw.style('text-xs text-center mt-1', isSelected ? `text-[${colors.primary}] font-semibold` : `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}
                  >
                    {t(`categories.${cat.id}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input label={t('expense.description')} value={description} onChangeText={setDescription} placeholder={t('descriptionPlaceholder')} multiline />
        </Card>

        <View style={tw`mt-6`}>
          <Button onPress={handleSave} loading={loading}>
            {t('expense.save')}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};
