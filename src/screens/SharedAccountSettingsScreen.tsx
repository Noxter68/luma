import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { X, Mail, UserMinus, Trash2, User, Pencil } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { useSharedAccount } from '../hooks/useSharedAccount';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface SharedAccountSettingsScreenProps {
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
  joined_at: string;
  profile?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export const SharedAccountSettingsScreen = ({ navigation, route }: SharedAccountSettingsScreenProps) => {
  const { accountId } = route.params;
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const { inviteMember, deleteSharedAccount } = useSharedAccount();
  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [accountName, setAccountName] = useState('');
  const [editedAccountName, setEditedAccountName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    fetchAccountDetails();
    fetchCurrentUser();
  }, [accountId]);

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);

      // Fetch account name
      const { data: accountData, error: accountError } = await supabase.from('shared_accounts').select('name').eq('id', accountId).single();

      if (accountError) throw accountError;
      setAccountName(accountData.name);
      setEditedAccountName(accountData.name);

      // Fetch members with profiles
      const { data: membersData, error: membersError } = await supabase.from('shared_account_members').select('id, user_id, role, joined_at').eq('shared_account_id', accountId);

      if (membersError) throw membersError;

      // Fetch profiles for each member
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
      console.error('Error fetching account details:', error);
      Alert.alert(t('error'), 'Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccountName = async () => {
    if (!editedAccountName.trim()) {
      Alert.alert(t('error'), t('sharedAccounts.settings.enterAccountName'));
      return;
    }

    if (editedAccountName.trim() === accountName) {
      setIsEditingName(false);
      return;
    }

    try {
      setSavingName(true);

      const { error } = await supabase.from('shared_accounts').update({ name: editedAccountName.trim() }).eq('id', accountId);

      if (error) throw error;

      setAccountName(editedAccountName.trim());
      setIsEditingName(false);
      Alert.alert(t('success'), t('sharedAccounts.settings.nameUpdated'));
    } catch (error) {
      console.error('Error updating account name:', error);
      Alert.alert(t('error'), t('sharedAccounts.settings.nameUpdateError'));
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEditName = () => {
    setEditedAccountName(accountName);
    setIsEditingName(false);
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert(t('error'), t('sharedAccounts.settings.enterEmail'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      Alert.alert(t('error'), t('sharedAccounts.settings.invalidEmail'));
      return;
    }

    try {
      setInviting(true);
      await inviteMember(accountId, inviteEmail.trim());
      Alert.alert(t('success'), t('sharedAccounts.settings.inviteSuccess'));
      setInviteEmail('');
      await fetchAccountDetails();
    } catch (error: any) {
      if (error.message === 'User not found') {
        Alert.alert(t('error'), t('sharedAccounts.settings.userNotFound'));
      } else {
        Alert.alert(t('error'), t('sharedAccounts.settings.inviteError'));
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName?: string) => {
    Alert.alert(t('sharedAccounts.settings.removeMember'), t('sharedAccounts.settings.removeMemberConfirm', { name: memberName || t('sharedAccounts.settings.thisMember') }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('shared_account_members').delete().eq('id', memberId);

            if (error) throw error;

            Alert.alert(t('success'), t('sharedAccounts.settings.memberRemoved'));
            await fetchAccountDetails();
          } catch (error) {
            Alert.alert(t('error'), t('sharedAccounts.settings.removeError'));
          }
        },
      },
    ]);
  };

  const handleLeaveAccount = async () => {
    const isOwner = members.find((m) => m.user_id === currentUserId)?.role === 'owner';

    if (isOwner && members.length > 1) {
      Alert.alert(t('error'), t('sharedAccounts.settings.ownerCantLeave'));
      return;
    }

    Alert.alert(t('sharedAccounts.settings.leaveAccount'), t('sharedAccounts.settings.leaveConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('sharedAccounts.settings.leave'),
        style: 'destructive',
        onPress: async () => {
          try {
            const memberToDelete = members.find((m) => m.user_id === currentUserId);
            if (!memberToDelete) return;

            const { error } = await supabase.from('shared_account_members').delete().eq('id', memberToDelete.id);

            if (error) throw error;

            Alert.alert(t('success'), t('sharedAccounts.settings.leftSuccess'), [{ text: 'OK', onPress: () => navigation.navigate('Tabs') }]);
          } catch (error) {
            Alert.alert(t('error'), t('sharedAccounts.settings.leaveError'));
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    const isOwner = members.find((m) => m.user_id === currentUserId)?.role === 'owner';

    if (!isOwner) {
      Alert.alert(t('error'), t('sharedAccounts.settings.onlyOwnerDelete'));
      return;
    }

    Alert.alert(t('sharedAccounts.settings.deleteAccount'), t('sharedAccounts.settings.deleteConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSharedAccount(accountId);
            Alert.alert(t('success'), t('sharedAccounts.settings.deleteSuccess'), [{ text: 'OK', onPress: () => navigation.navigate('Tabs') }]);
          } catch (error) {
            Alert.alert(t('error'), t('sharedAccounts.settings.deleteError'));
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: locale === 'fr' ? fr : enUS });
  };

  const currentUserRole = members.find((m) => m.user_id === currentUserId)?.role;

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
            <Text style={tw`text-white text-lg font-semibold flex-1 text-center`}>{t('sharedAccounts.settings.title')}</Text>
            <View style={tw`w-10`} />
          </View>

          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-24`} showsVerticalScrollIndicator={false}>
            <View style={tw`px-6`}>
              <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`rounded-3xl px-5 pt-5 pb-6`}>
                {/* Account Info */}
                <Card style={tw`mb-4`}>
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-1`}>
                      <Text style={tw.style('text-sm font-medium mb-2', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('sharedAccounts.settings.accountName')}</Text>
                      {isEditingName ? (
                        <View>
                          <TextInput
                            value={editedAccountName}
                            onChangeText={setEditedAccountName}
                            style={tw.style(
                              'text-base font-semibold px-3 py-2 rounded-lg mb-2',
                              isDark ? `bg-[${colors.dark.bg}] text-[${colors.dark.textPrimary}]` : `bg-[${colors.light.border}] text-[${colors.light.textPrimary}]`
                            )}
                            autoFocus
                          />
                          <View style={tw`flex-row gap-2`}>
                            <TouchableOpacity
                              onPress={handleSaveAccountName}
                              disabled={savingName}
                              style={tw.style('flex-1 py-2 rounded-lg items-center', savingName ? 'opacity-50' : '', `bg-[${colors.primary}]`)}
                            >
                              {savingName ? <ActivityIndicator size="small" color="white" /> : <Text style={tw`text-white font-semibold`}>{t('sharedAccounts.settings.save')}</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={handleCancelEditName}
                              disabled={savingName}
                              style={tw.style('flex-1 py-2 rounded-lg items-center', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.border}]`)}
                            >
                              <Text style={tw.style('font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('cancel')}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <Text style={tw.style('text-lg font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{accountName}</Text>
                      )}
                    </View>

                    {!isEditingName && currentUserRole === 'owner' && (
                      <TouchableOpacity onPress={() => setIsEditingName(true)} style={tw`p-2 ml-2`}>
                        <Pencil size={20} color={colors.primary} strokeWidth={2} />
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>

                {/* Members Section */}
                <Card style={tw`mb-4`}>
                  <View style={tw`mb-4`}>
                    <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                      {t('sharedAccounts.settings.members')} ({members.length})
                    </Text>
                  </View>

                  {/* Members List - Style "Recent Transaction" */}
                  {members.map((member, index) => (
                    <View
                      key={member.id}
                      style={tw.style('flex-row items-center py-3', index !== members.length - 1 && `border-b ${isDark ? `border-[${colors.dark.border}]` : `border-[${colors.light.border}]`}`)}
                    >
                      {/* Avatar Circle */}
                      <View style={tw`w-12 h-12 rounded-full items-center justify-center mr-3 bg-gray-200`}>
                        {member.profile?.avatar_url ? (
                          <View style={tw`w-12 h-12 rounded-full bg-gray-300`} />
                        ) : (
                          <User size={24} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2} />
                        )}
                      </View>

                      {/* Member Info */}
                      <View style={tw`flex-1`}>
                        <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                          {member.profile?.full_name || member.profile?.email || t('sharedAccounts.settings.unknownUser')}
                          {member.user_id === currentUserId && ` (${t('sharedAccounts.settings.you')})`}
                        </Text>
                        <Text style={tw.style('text-sm mt-1', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{formatDate(member.joined_at)}</Text>
                      </View>

                      {/* Remove Button */}
                      {currentUserRole === 'owner' && member.user_id !== currentUserId && (
                        <TouchableOpacity onPress={() => handleRemoveMember(member.id, member.profile?.full_name)} style={tw`p-2`}>
                          <UserMinus size={20} color={colors.error} strokeWidth={2} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </Card>

                {/* Invite Member Section */}
                <Card style={tw`mb-4`}>
                  <Text style={tw.style('text-base font-semibold mb-3', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('sharedAccounts.settings.inviteMember')}</Text>

                  <View style={tw`flex-row items-center gap-2`}>
                    <View style={tw`flex-1`}>
                      <TextInput
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        placeholder={t('sharedAccounts.settings.emailPlaceholder')}
                        placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={tw.style(
                          'px-4 py-3 rounded-xl text-base',
                          isDark ? `bg-[${colors.dark.bg}] text-[${colors.dark.textPrimary}]` : `bg-[${colors.light.border}] text-[${colors.light.textPrimary}]`
                        )}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleInviteMember}
                      disabled={inviting || !inviteEmail.trim()}
                      style={tw.style('p-3 rounded-xl', inviting || !inviteEmail.trim() ? 'opacity-50' : '', `bg-[${colors.primary}]`)}
                    >
                      {inviting ? <ActivityIndicator size="small" color="white" /> : <Mail size={22} color="white" strokeWidth={2} />}
                    </TouchableOpacity>
                  </View>

                  <Text style={tw.style('text-xs mt-2', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('sharedAccounts.settings.inviteHint')}</Text>
                </Card>

                {/* Actions */}
                <View style={tw`gap-3`}>
                  {/* Leave Account */}
                  <TouchableOpacity
                    onPress={handleLeaveAccount}
                    style={tw.style('py-4 px-4 rounded-xl flex-row items-center justify-center gap-2', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.border}]`)}
                  >
                    <UserMinus size={20} color={isDark ? colors.dark.textPrimary : colors.light.textPrimary} strokeWidth={2} />
                    <Text style={tw.style('text-base font-semibold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('sharedAccounts.settings.leaveAccount')}</Text>
                  </TouchableOpacity>

                  {/* Delete Account (only owner) */}
                  {currentUserRole === 'owner' && (
                    <TouchableOpacity onPress={handleDeleteAccount} style={tw`py-4 px-4 rounded-xl bg-red-500/10 flex-row items-center justify-center gap-2`}>
                      <Trash2 size={20} color={colors.error} strokeWidth={2} />
                      <Text style={tw`text-base font-semibold text-red-500`}>{t('sharedAccounts.settings.deleteAccount')}</Text>
                    </TouchableOpacity>
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
