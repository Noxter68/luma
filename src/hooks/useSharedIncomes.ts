import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type SharedIncome = Database['public']['Tables']['shared_incomes']['Row'];

interface CreateIncomeParams {
  accountId: string;
  amount: number;
  source: string;
  description?: string;
  isRecurring?: boolean;
  date: string;
}

/**
 * Hook pour gérer les revenus d'un shared account
 * - Récupère les revenus du mois en cours
 * - Permet d'ajouter/modifier/supprimer des revenus
 * - Sync temps réel entre les membres
 */
export const useSharedIncomes = (accountId: string, month?: string) => {
  const [incomes, setIncomes] = useState<SharedIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = month || new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!accountId) {
      setIncomes([]);
      setLoading(false);
      return;
    }

    fetchIncomes();

    // Real-time subscription
    const channel = supabase
      .channel(`shared_incomes:${accountId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_incomes',
          filter: `shared_account_id=eq.${accountId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIncomes((prev) => [payload.new as SharedIncome, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIncomes((prev) => prev.map((inc) => (inc.id === payload.new.id ? (payload.new as SharedIncome) : inc)));
          } else if (payload.eventType === 'DELETE') {
            setIncomes((prev) => prev.filter((inc) => inc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId, currentMonth]);

  const fetchIncomes = async () => {
    try {
      setLoading(true);

      const startDate = `${currentMonth}-01`;
      const endDate = `${currentMonth}-31`;

      const { data, error: fetchError } = await supabase
        .from('shared_incomes')
        .select('*')
        .eq('shared_account_id', accountId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setIncomes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching shared incomes:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addIncome = async (params: CreateIncomeParams) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('shared_incomes')
        .insert({
          shared_account_id: params.accountId,
          amount: params.amount,
          source: params.source,
          description: params.description || null,
          is_recurring: params.isRecurring || false,
          date: params.date,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err) {
      console.error('Error adding income:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateIncome = async (incomeId: string, updates: Partial<Omit<SharedIncome, 'id' | 'created_at' | 'created_by'>>) => {
    try {
      const { data, error: updateError } = await supabase.from('shared_incomes').update(updates).eq('id', incomeId).select().single();

      if (updateError) throw updateError;

      return data;
    } catch (err) {
      console.error('Error updating income:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteIncome = async (incomeId: string) => {
    try {
      const { error: deleteError } = await supabase.from('shared_incomes').delete().eq('id', incomeId);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error deleting income:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const getTotalIncomes = () => {
    return incomes.reduce((sum, inc) => sum + inc.amount, 0);
  };

  const getRecurringIncomes = () => {
    return incomes.filter((inc) => inc.is_recurring);
  };

  return {
    incomes,
    loading,
    error,
    addIncome,
    updateIncome,
    deleteIncome,
    getTotalIncomes,
    getRecurringIncomes,
    refresh: fetchIncomes,
  };
};
