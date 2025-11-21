import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type SharedRecurringExpense = Database['public']['Tables']['shared_recurring_expenses']['Row'];

interface CreateRecurringParams {
  accountId: string;
  amount: number;
  category: string;
  description?: string;
}

/**
 * Hook pour gérer les dépenses récurrentes d'un shared account
 * - Récupère toutes les dépenses récurrentes actives
 * - Permet d'ajouter/modifier/désactiver des récurrences
 * - Sync temps réel entre les membres
 */
export const useSharedRecurringExpenses = (accountId: string) => {
  const [recurringExpenses, setRecurringExpenses] = useState<SharedRecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      setRecurringExpenses([]);
      setLoading(false);
      return;
    }

    fetchRecurringExpenses();

    // Real-time subscription
    const channel = supabase
      .channel(`shared_recurring:${accountId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_recurring_expenses',
          filter: `shared_account_id=eq.${accountId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRecurringExpenses((prev) => [payload.new as SharedRecurringExpense, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRecurringExpenses((prev) => prev.map((rec) => (rec.id === payload.new.id ? (payload.new as SharedRecurringExpense) : rec)));
          } else if (payload.eventType === 'DELETE') {
            setRecurringExpenses((prev) => prev.filter((rec) => rec.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId]);

  const fetchRecurringExpenses = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('shared_recurring_expenses')
        .select('*')
        .eq('shared_account_id', accountId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRecurringExpenses(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching recurring expenses:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  const addRecurringExpense = async (params: CreateRecurringParams) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('shared_recurring_expenses')
        .insert({
          shared_account_id: params.accountId,
          amount: params.amount,
          category: params.category,
          description: params.description || null,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err) {
      console.error('Error adding recurring expense:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateRecurringExpense = async (recurringId: string, updates: Partial<Omit<SharedRecurringExpense, 'id' | 'created_at' | 'created_by'>>) => {
    try {
      const { data, error: updateError } = await supabase.from('shared_recurring_expenses').update(updates).eq('id', recurringId).select().single();

      if (updateError) throw updateError;

      return data;
    } catch (err) {
      console.error('Error updating recurring expense:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const toggleRecurringExpense = async (recurringId: string, isActive: boolean) => {
    try {
      const { data, error: toggleError } = await supabase.from('shared_recurring_expenses').update({ is_active: isActive }).eq('id', recurringId).select().single();

      if (toggleError) throw toggleError;

      return data;
    } catch (err) {
      console.error('Error toggling recurring expense:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteRecurringExpense = async (recurringId: string) => {
    try {
      const { error: deleteError } = await supabase.from('shared_recurring_expenses').delete().eq('id', recurringId);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error deleting recurring expense:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const getTotalRecurring = () => {
    return recurringExpenses.filter((rec) => rec.is_active).reduce((sum, rec) => sum + rec.amount, 0);
  };

  return {
    recurringExpenses,
    loading,
    error,
    addRecurringExpense,
    updateRecurringExpense,
    toggleRecurringExpense,
    deleteRecurringExpense,
    getTotalRecurring,
    refresh: fetchRecurringExpenses,
  };
};
