import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../components/Card';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { X, Plus, Settings, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedBudget } from '../hooks/useSharedBudget';
import { supabase } from '../lib/supabase';
import { getCategoryById } from '../utils/categories';
import { getIncomeSourceById } from '../utils/incomeSources';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';

interface SharedAccountDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      accountId: string;
      accountName?: string;
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
  const { accountId, accountName } = route.params;
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();

  const { budgetSummary, loading, expenses, incomes } = useSharedBudget(accountId);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  // Refresh au focus de l'écran
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
      fetchMembers();
    }, [accountId])
  );

  useEffect(() => {
    fetchMembers();
    fetchCurrentUser();
  }, [accountId, refreshKey]);

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

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

  const getMemberName = (userId: string) => {
    const member = members.find((m) => m.user_id === userId);
    if (!member?.profile) return t('sharedAccounts.settings.unknownUser');

    if (userId === currentUserId) {
      return t('sharedAccounts.settings.you');
    }

    return member.profile.full_name?.split(' ')[0] || member.profile.email?.split('@')[0] || t('sharedAccounts.settings.unknownUser');
  };

  const handleAddExpense = () => {
    navigation.navigate('SharedAddExpense', { accountId });
  };

  const handleAddIncome = () => {
    navigation.navigate('SharedAddIncome', { accountId });
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

  // Grouper et trier l'activité récente par jour
  const groupedActivity = useMemo(() => {
    const combined = [...expenses.map((e) => ({ ...e, type: 'expense' as const })), ...incomes.map((i) => ({ ...i, type: 'income' as const }))].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const grouped: Record<string, typeof combined> = {};
    combined.forEach((item) => {
      const dayKey = format(new Date(item.date), 'yyyy-MM-dd');
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(item);
    });

    return grouped;
  }, [expenses, incomes]);

  const formatDayHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return locale === 'fr' ? "Aujourd'hui" : 'Today';
    }
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return locale === 'fr' ? 'Hier' : 'Yesterday';
    }
    return format(date, 'EEEE d MMMM', { locale: locale === 'fr' ? fr : enUS });
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
          {/* Header Compact */}
          <View style={tw`px-6 pt-2 pb-4`}>
            {/* Top Bar */}
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
                <X size={24} color="white" strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSettings} style={tw`p-2 -mr-2`}>
                <Settings size={24} color="white" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Account Name - Plus petit */}
            <Text style={tw`text-white text-base font-bold mb-3`}>{accountName || t('sharedAccounts.details.title')}</Text>

            {/* Budget Card - Simple et compact */}
            <View style={tw`bg-white/10 rounded-2xl p-3 mb-3`}>
              <Text style={tw`text-white/80 text-sm font-medium mb-2`}>{t('sharedAccounts.details.availableBudget')}</Text>
              <Text style={tw`text-white text-3xl font-bold`}>{formatCurrency(budgetSummary.remainingBudget)}</Text>
            </View>

            {/* Members sous la card */}
            {!loadingMembers && members.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-2 mb-3`}>
                {members.map((member) => (
                  <View key={member.id} style={tw`items-center`}>
                    <View style={tw`w-9 h-9 rounded-full items-center justify-center bg-white/20 mb-1`}>
                      {member.profile?.avatar_url ? (
                        <View style={tw`w-9 h-9 rounded-full bg-white/30`} />
                      ) : (
                        <Text style={tw`text-white text-xs font-semibold`}>{getInitials(member.profile?.full_name, member.profile?.email)}</Text>
                      )}
                    </View>
                    <Text style={tw`text-white/80 text-xs`} numberOfLines={1}>
                      {member.profile?.full_name?.split(' ')[0] || member.profile?.email?.split('@')[0] || 'User'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Boutons - Plus compacts */}
            <View style={tw`flex-row gap-2`}>
              <TouchableOpacity onPress={handleAddIncome} style={tw`flex-1 py-2.5 rounded-xl bg-white/20 border-2 border-white/40 flex-row items-center justify-center gap-1.5`}>
                <Plus size={18} color="white" strokeWidth={2.5} />
                <Text style={tw`text-white text-sm font-semibold`}>{locale === 'fr' ? 'Revenue' : 'Revenue'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleAddExpense} style={tw`flex-1 py-2.5 rounded-xl bg-white/20 border-2 border-white/40 flex-row items-center justify-center gap-1.5`}>
                <Plus size={18} color="white" strokeWidth={2.5} />
                <Text style={tw`text-white text-sm font-semibold`}>{locale === 'fr' ? 'Dépense' : 'Expense'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Section - Scrollable */}
          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-6`} showsVerticalScrollIndicator={false}>
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-6 pb-6`}>
                {/* Recent Activity */}
                <View>
                  {/* Recent Activity - Titre plus petit */}
                  <Text style={tw.style('text-base font-bold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('sharedAccounts.details.recentActivity')}</Text>

                  {Object.keys(groupedActivity).length === 0 ? (
                    <Card style={tw`overflow-hidden`}>
                      <Text style={tw.style('text-center py-4', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>
                        {locale === 'fr' ? 'Aucune activité récente' : 'No recent activity'}
                      </Text>
                    </Card>
                  ) : (
                    Object.keys(groupedActivity).map((dayKey) => {
                      const dayActivities = groupedActivity[dayKey];

                      return (
                        <View key={dayKey} style={tw`mb-4`}>
                          {/* Day Header */}
                          <Text style={tw.style('text-sm font-semibold mb-2 px-1', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{formatDayHeader(dayKey)}</Text>

                          {/* Activities */}
                          <Card style={tw`overflow-hidden`}>
                            {dayActivities.map((item, index) => {
                              const isExpense = item.type === 'expense';
                              const categoryData = isExpense ? getCategoryById(item.category) : null;
                              const incomeSourceData = !isExpense ? getIncomeSourceById(item.source) : null;
                              const IconComponent = isExpense ? categoryData?.icon : incomeSourceData?.icon;

                              return (
                                <View
                                  key={`${item.type}-${item.id}`}
                                  style={tw.style(
                                    'flex-row items-center py-2.5 ',
                                    index !== dayActivities.length - 1 && `border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`
                                  )}
                                >
                                  {/* Icon - Couleur neutre */}
                                  {IconComponent ? (
                                    <View style={tw.style('w-9 h-9 rounded-full items-center justify-center mr-2.5', `bg-[${colors.primary}]/20`)}>
                                      <IconComponent size={18} color={colors.primary} strokeWidth={2.5} />
                                    </View>
                                  ) : (
                                    <View style={tw.style('w-9 h-9 rounded-full items-center justify-center mr-2.5', `bg-[${colors.primary}]/20`)}>
                                      <Plus size={18} color={colors.primary} strokeWidth={2.5} />
                                    </View>
                                  )}

                                  {/* Details */}
                                  <View style={tw`flex-1`}>
                                    <Text style={tw.style('text-sm font-semibold mb-0.5', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                                      {isExpense ? t(`categories.${item.category}`) : item.source ? t(`sharedAccounts.incomeSources.${item.source}`) : item.description || t('revenue.title')}
                                    </Text>
                                    <View style={tw`flex-row items-center gap-1.5`}>
                                      <User size={11} color={isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2} />
                                      <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                                        {getMemberName(item.created_by)} • {format(new Date(item.date), 'HH:mm')}
                                      </Text>
                                    </View>
                                  </View>

                                  {/* Amount - Seul élément avec couleur */}
                                  <Text style={tw.style('text-sm font-bold', isExpense ? 'text-red-500' : 'text-green-500')}>
                                    {isExpense ? '-' : '+'}
                                    {formatCurrency(item.amount)}
                                  </Text>
                                </View>
                              );
                            })}
                          </Card>
                        </View>
                      );
                    })
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
