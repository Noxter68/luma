import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type SharedAccount = Database['public']['Tables']['shared_accounts']['Row'];
type SharedAccountMember = Database['public']['Tables']['shared_account_members']['Row'];

interface SharedAccountWithMembers extends SharedAccount {
  members: SharedAccountMember[];
}

/**
 * Hook pour gérer les shared accounts
 * - Récupère les shared accounts de l'utilisateur
 * - Permet de créer un nouveau shared account
 * - Gère la subscription temps réel
 */
export const useSharedAccount = () => {
  const [accounts, setAccounts] = useState<SharedAccountWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedAccounts();

    // Real-time subscription
    const channel = supabase
      .channel('shared_accounts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_accounts',
        },
        () => {
          fetchSharedAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSharedAccounts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      // Récupérer les shared accounts auxquels l'utilisateur appartient
      const { data: memberData, error: memberError } = await supabase.from('shared_account_members').select('shared_account_id').eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      const accountIds = memberData.map((m) => m.shared_account_id);

      // Récupérer les détails des shared accounts
      const { data: accountsData, error: accountsError } = await supabase.from('shared_accounts').select('*').in('id', accountIds);

      if (accountsError) throw accountsError;

      // Récupérer les membres pour chaque account
      const accountsWithMembers = await Promise.all(
        (accountsData || []).map(async (account) => {
          const { data: membersData } = await supabase.from('shared_account_members').select('*').eq('shared_account_id', account.id);

          return {
            ...account,
            members: membersData || [],
          };
        })
      );

      setAccounts(accountsWithMembers);
      setError(null);
    } catch (err) {
      console.error('Error fetching shared accounts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createSharedAccount = async (name: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      // 🔧 Utiliser la fonction SQL helper au lieu de 2 requêtes séparées
      const { data: accountId, error: createError } = await supabase.rpc('create_shared_account_with_owner', {
        account_name: name,
      });

      if (createError) throw createError;

      // Récupérer les données complètes du compte créé
      const { data: accountData, error: fetchError } = await supabase.from('shared_accounts').select('*').eq('id', accountId).single();

      if (fetchError) throw fetchError;

      await fetchSharedAccounts();
      return accountData;
    } catch (err) {
      console.error('Error creating shared account:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const inviteMember = async (accountId: string, email: string) => {
    try {
      // TODO: Implémenter l'invitation par email
      // Pour l'instant, on cherche l'utilisateur par email et on l'ajoute directement
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('id').eq('email', email).single();

      if (profileError) throw new Error('User not found');

      const { error: memberError } = await supabase.from('shared_account_members').insert({
        shared_account_id: accountId,
        user_id: profileData.id,
        role: 'member',
      });

      if (memberError) throw memberError;

      await fetchSharedAccounts();
    } catch (err) {
      console.error('Error inviting member:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteSharedAccount = async (accountId: string) => {
    try {
      const { error } = await supabase.from('shared_accounts').delete().eq('id', accountId);

      if (error) throw error;

      await fetchSharedAccounts();
    } catch (err) {
      console.error('Error deleting shared account:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return {
    accounts,
    loading,
    error,
    createSharedAccount,
    inviteMember,
    deleteSharedAccount,
    refresh: fetchSharedAccounts,
  };
};
