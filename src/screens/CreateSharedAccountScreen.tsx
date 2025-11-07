import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { useSharedAccount } from '../hooks/useSharedAccount';

interface CreateSharedAccountScreenProps {
  navigation: any;
}

export const CreateSharedAccountScreen = ({ navigation }: CreateSharedAccountScreenProps) => {
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const { createSharedAccount } = useSharedAccount();

  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  const handleCreate = async () => {
    if (!accountName.trim()) {
      Alert.alert(t('error'), t('sharedAccounts.enterName'));
      return;
    }

    try {
      setLoading(true);
      const newAccount = await createSharedAccount(accountName.trim());
      Alert.alert(t('success'), t('sharedAccounts.createSuccess'), [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
            // Optionnellement, naviguer vers le détail du compte
            // navigation.replace('SharedAccountDetails', { accountId: newAccount.id });
          },
        },
      ]);
    } catch (error) {
      Alert.alert(t('error'), t('sharedAccounts.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          {/* Header */}
          <View style={tw`px-6 pt-4 pb-4 flex-row items-center justify-between`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
              <X size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={tw`text-white text-lg font-semibold flex-1 text-center`}>{t('sharedAccounts.newAccount')}</Text>
            <View style={tw`w-10`} />
          </View>

          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={tw`px-6 pb-6`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-white/80 text-base mb-3 text-center`}>{t('sharedAccounts.nameYourAccount')}</Text>

                {/* Examples hint */}
                <Text style={tw`text-white/60 text-sm mb-4 text-center`}>{t('sharedAccounts.accountNameHint')}</Text>
              </View>
            </View>

            {/* Content Section */}
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-5 pb-6`}>
                {/* Account Name Input */}
                <Card style={tw`p-0 overflow-hidden mb-4`}>
                  <View style={tw`px-4 py-3 border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`}>
                    <Text style={tw.style('text-sm font-medium', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('sharedAccounts.accountName')}</Text>
                  </View>

                  <View style={tw`px-4 py-3`}>
                    <TextInput
                      value={accountName}
                      onChangeText={setAccountName}
                      placeholder={t('sharedAccounts.accountNamePlaceholder')}
                      style={tw.style('text-base', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}
                      placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                      autoFocus
                    />
                  </View>
                </Card>

                {/* Info Card */}
                <Card style={tw`mb-4`}>
                  <Text style={tw.style('text-sm leading-relaxed', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('sharedAccounts.creationInfo')}</Text>
                </Card>

                {/* Create Button */}
                <TouchableOpacity
                  onPress={handleCreate}
                  disabled={loading || !accountName.trim()}
                  style={tw.style('py-4 rounded-xl items-center', loading || !accountName.trim() ? 'opacity-50' : '', `bg-[${colors.primary}]`)}
                >
                  <Text style={tw`text-white text-base font-semibold`}>{loading ? '...' : t('sharedAccounts.createButton')}</Text>
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
