import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type SharedExpense = Database['public']['Tables']['shared_expenses']['Row'];

interface CreateExpenseParams {
  accountId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

/**
 * Hook pour gérer les dépenses d'un shared account
 * - Récupère les dépenses du mois en cours
 * - Permet d'ajouter/modifier/supprimer des dépenses
 * - Sync temps réel entre les membres
 */
export const useSharedExpenses = (accountId: string, month?: string) => {
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format: "2025-01" pour le mois en cours
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!accountId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    fetchExpenses();

    // Real-time subscription pour ce shared account
    const channel = supabase
      .channel(`shared_expenses:${accountId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_expenses',
          filter: `shared_account_id=eq.${accountId}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);

          if (payload.eventType === 'INSERT') {
            setExpenses((prev) => [payload.new as SharedExpense, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setExpenses((prev) => prev.map((exp) => (exp.id === payload.new.id ? (payload.new as SharedExpense) : exp)));
          } else if (payload.eventType === 'DELETE') {
            setExpenses((prev) => prev.filter((exp) => exp.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId, currentMonth]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const startDate = `${currentMonth}-01`;

      // ✅ Calcul du dernier jour du mois dynamiquement
      const [year, month] = currentMonth.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate(); // Donne 28, 29, 30 ou 31
      const endDate = `${currentMonth}-${lastDay.toString().padStart(2, '0')}`;

      const { data, error: fetchError } = await supabase
        .from('shared_expenses')
        .select('*')
        .eq('shared_account_id', accountId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setExpenses(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching shared expenses:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (params: CreateExpenseParams) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('shared_expenses')
        .insert({
          shared_account_id: params.accountId,
          amount: params.amount,
          category: params.category,
          description: params.description || null,
          date: params.date,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateExpense = async (expenseId: string, updates: Partial<Omit<SharedExpense, 'id' | 'created_at' | 'created_by'>>) => {
    try {
      const { data, error: updateError } = await supabase.from('shared_expenses').update(updates).eq('id', expenseId).select().single();

      if (updateError) throw updateError;

      return data;
    } catch (err) {
      console.error('Error updating expense:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      const { error: deleteError } = await supabase.from('shared_expenses').delete().eq('id', expenseId);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getExpensesByCategory = () => {
    return expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = 0;
      }
      acc[exp.category] += exp.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalExpenses,
    getExpensesByCategory,
    refresh: fetchExpenses,
  };
};
