import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { X, Plus, Settings, HandCoins, RefreshCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedBudget } from '../hooks/useSharedBudget';
import { supabase } from '../lib/supabase';

interface SharedAccountDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      accountId: string;
    };
  };
}

interface MemberWithProfile {
  id: string;
  user_id: string;
  role: 'owner' | 'member';
  profile?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export const SharedAccountDetailsScreen = ({ navigation, route }: SharedAccountDetailsScreenProps) => {
  const { accountId } = route.params;
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();

  const { budgetSummary, loading, budgetStatus, expenses } = useSharedBudget(accountId);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  useEffect(() => {
    fetchMembers();
  }, [accountId]);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);

      const { data: membersData, error: membersError } = await supabase.from('shared_account_members').select('id, user_id, role').eq('shared_account_id', accountId);

      if (membersError) throw membersError;

      const membersWithProfiles = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: profileData } = await supabase.from('profiles').select('full_name, email, avatar_url').eq('id', member.user_id).single();

          return {
            ...member,
            profile: profileData || undefined,
          };
        })
      );

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: locale === 'fr' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddExpense = () => {
    navigation.navigate('SharedAddExpense', { accountId });
  };

  const handleSettings = () => {
    navigation.navigate('SharedAccountSettings', { accountId });
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1 pt-6`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          {/* Header */}
          <View style={tw`px-6 pt-4 pb-4 flex-row items-center justify-between`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
              <X size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={tw`text-white text-lg font-semibold flex-1 text-center`}>{t('sharedAccounts.details.title')}</Text>
            <TouchableOpacity onPress={handleSettings} style={tw`p-2 -mr-2`}>
              <Settings size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            {/* Budget Overview Section */}
            <View style={tw`px-6 pb-6`}>
              <View style={tw`items-center mb-4`}>
                <Text style={tw`text-white/80 text-base mb-2`}>{t('sharedAccounts.details.availableBudget')}</Text>
                <Text style={tw`text-5xl font-bold text-white mb-2`}>{formatCurrency(budgetSummary.availableBudget)}</Text>
                <Text style={tw`text-white/60 text-sm`}>
                  {t('sharedAccounts.details.spent')}: {formatCurrency(budgetSummary.totalExpenses)} • {t('sharedAccounts.details.remaining')}: {formatCurrency(budgetSummary.remainingBudget)}
                </Text>
              </View>

              {/* Members Row - Horizontal Scrollable */}
              {!loadingMembers && members.length > 0 && (
                <View style={tw`mb-4`}>
                  <Text style={tw`text-white/80 text-sm mb-2 font-medium`}>{t('sharedAccounts.settings.members')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-3`}>
                    {members.map((member) => (
                      <View key={member.id} style={tw`items-center`}>
                        {/* Avatar Circle */}
                        <View style={tw`w-12 h-12 rounded-full items-center justify-center bg-white/20 mb-1`}>
                          {member.profile?.avatar_url ? (
                            <View style={tw`w-12 h-12 rounded-full bg-white/30`} />
                          ) : (
                            <Text style={tw`text-white text-base font-bold`}>{getInitials(member.profile?.full_name, member.profile?.email)}</Text>
                          )}
                        </View>
                        {/* Name */}
                        <Text style={tw`text-white/80 text-xs max-w-16 text-center`} numberOfLines={1}>
                          {member.profile?.full_name?.split(' ')[0] || member.profile?.email?.split('@')[0] || 'User'}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Quick Stats Cards */}
              <View style={tw`flex-row gap-3 mb-4`}>
                <View style={tw`flex-1 bg-white/10 rounded-2xl p-4`}>
                  <View style={tw`flex-row items-center gap-2 mb-2`}>
                    <View style={tw`w-8 h-8 rounded-full bg-white/20 items-center justify-center`}>
                      <HandCoins size={18} color="white" strokeWidth={2.5} />
                    </View>
                    <Text style={tw`text-white/80 text-sm font-bold`}>{t('sharedAccounts.details.income')}</Text>
                  </View>
                  <Text style={tw`text-white text-xl font-bold`}>{formatCurrency(budgetSummary.totalIncomes)}</Text>
                </View>

                <View style={tw`flex-1 bg-white/10 rounded-2xl p-4`}>
                  <View style={tw`flex-row items-center gap-2 mb-2`}>
                    <View style={tw`w-8 h-8 rounded-full bg-white/20 items-center justify-center`}>
                      <RefreshCcw size={18} color="white" strokeWidth={2.5} />
                    </View>
                    <Text style={tw`text-white/80 text-sm font-bold`}>{t('sharedAccounts.details.recurring')}</Text>
                  </View>
                  <Text style={tw`text-white text-xl font-bold`}>{formatCurrency(budgetSummary.totalRecurringExpenses)}</Text>
                </View>
              </View>

              {/* Add Expense Button */}
              <TouchableOpacity onPress={handleAddExpense} style={tw`bg-white rounded-2xl py-4 flex-row items-center justify-center gap-2`}>
                <Plus size={22} color={colors.primary} strokeWidth={2.5} />
                <Text style={tw.style('text-base font-semibold', `text-[${colors.primary}]`)}>{t('sharedAccounts.details.addExpense')}</Text>
              </TouchableOpacity>
            </View>

            {/* Content Section */}
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-5 pb-6`}>
                {/* Recent Expenses */}
                <View style={tw`mb-4`}>
                  <Text style={tw.style('text-base font-semibold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('sharedAccounts.details.recentExpenses')}</Text>

                  {expenses.length === 0 ? (
                    <Card>
                      <Text style={tw.style('text-center py-4', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('sharedAccounts.details.noExpenses')}</Text>
                    </Card>
                  ) : (
                    expenses.slice(0, 5).map((expense, index) => (
                      <Card key={expense.id} style={tw`${index !== 0 ? 'mt-3' : ''}`}>
                        <View style={tw`flex-row items-center justify-between`}>
                          <View style={tw`flex-1`}>
                            <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{expense.category}</Text>
                            {expense.description && <Text style={tw.style('text-sm mt-1', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{expense.description}</Text>}
                          </View>
                          <Text style={tw.style('text-lg font-bold', `text-[${colors.error}]`)}>-{formatCurrency(expense.amount)}</Text>
                        </View>
                      </Card>
                    ))
                  )}
                </View>
              </LinearGradient>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
