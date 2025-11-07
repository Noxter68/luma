import { useState, useEffect, useMemo } from 'react';
import { useSharedExpenses } from './useSharedExpenses';
import { useSharedIncomes } from './useSharedIncomes';
import { useSharedRecurringExpenses } from './useSharedRecurringExpenses';

interface BudgetSummary {
  totalIncomes: number;
  totalRecurringExpenses: number;
  totalExpenses: number;
  availableBudget: number;
  remainingBudget: number;
  spentPercentage: number;
}

/**
 * Hook pour calculer le budget global d'un shared account
 * Combine les revenus, dépenses récurrentes et dépenses du mois
 * Fournit un résumé complet du budget
 */
export const useSharedBudget = (accountId: string, month?: string) => {
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  // Récupérer toutes les données nécessaires
  const { expenses, loading: expensesLoading, getTotalExpenses } = useSharedExpenses(accountId, currentMonth);

  const { incomes, loading: incomesLoading, getTotalIncomes } = useSharedIncomes(accountId, currentMonth);

  const { recurringExpenses, loading: recurringLoading, getTotalRecurring } = useSharedRecurringExpenses(accountId);

  // Calculer le résumé du budget
  const budgetSummary = useMemo<BudgetSummary>(() => {
    const totalIncomes = getTotalIncomes();
    const totalRecurringExpenses = getTotalRecurring();
    const totalExpenses = getTotalExpenses();

    // Budget disponible = Revenus - Dépenses récurrentes
    const availableBudget = totalIncomes - totalRecurringExpenses;

    // Budget restant = Budget disponible - Dépenses du mois
    const remainingBudget = availableBudget - totalExpenses;

    // Pourcentage dépensé (basé sur le budget disponible)
    const spentPercentage = availableBudget > 0 ? (totalExpenses / availableBudget) * 100 : 0;

    return {
      totalIncomes,
      totalRecurringExpenses,
      totalExpenses,
      availableBudget,
      remainingBudget,
      spentPercentage,
    };
  }, [expenses, incomes, recurringExpenses]);

  // État de chargement global
  const loading = expensesLoading || incomesLoading || recurringLoading;

  // Déterminer l'état du budget (healthy, warning, danger)
  const budgetStatus = useMemo(() => {
    if (budgetSummary.spentPercentage >= 100) return 'danger';
    if (budgetSummary.spentPercentage >= 80) return 'warning';
    return 'healthy';
  }, [budgetSummary.spentPercentage]);

  return {
    budgetSummary,
    loading,
    budgetStatus,
    expenses,
    incomes,
    recurringExpenses,
  };
};
