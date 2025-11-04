import { CategoryBudget, Expense, Income, RecurringExpense, SavingsTracker, BudgetCalculation } from '../types';

/**
 * Calcule les métriques financières complètes du mois
 */
export const calculateBudgetMetrics = (
  incomes: Income[],
  recurringExpenses: RecurringExpense[],
  categoryBudgets: CategoryBudget[],
  expenses: Expense[],
  savingsTracker: SavingsTracker | null
): BudgetCalculation => {
  // Total revenue du mois
  const totalRevenue = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Total des dépenses récurrentes actives
  const totalRecurring = recurringExpenses.filter((r) => r.isActive).reduce((sum, r) => sum + r.amount, 0);

  // Disponible pour budgétiser = Revenue - Recurring
  const availableForBudget = totalRevenue - totalRecurring;

  // Total budgété sur les catégories
  const totalBudgeted = categoryBudgets.reduce((sum, cb) => sum + cb.amount, 0);

  // Objectif d'économies
  const targetSavings = savingsTracker?.targetAmount || 0;

  // Buffer = ce qui reste non alloué
  const buffer = availableForBudget - totalBudgeted - targetSavings;

  // Total réellement dépensé
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Savings réels = Disponible - Dépensé
  const actualSavings = availableForBudget - totalSpent;

  return {
    totalRevenue,
    totalRecurring,
    availableForBudget,
    totalBudgeted,
    targetSavings,
    buffer,
    totalSpent,
    actualSavings,
  };
};

/**
 * Calcule le % de consommation d'un budget catégoriel
 */
export const getCategoryBudgetProgress = (categoryId: string, categoryBudgets: CategoryBudget[], expenses: Expense[]): { spent: number; budget: number; percentage: number } => {
  // Trouver le budget de cette catégorie
  const categoryBudget = categoryBudgets.find((cb) => cb.category === categoryId);

  if (!categoryBudget) {
    return { spent: 0, budget: 0, percentage: 0 };
  }

  // Calculer le total dépensé dans cette catégorie
  const spent = expenses.filter((exp) => exp.category === categoryId).reduce((sum, exp) => sum + exp.amount, 0);

  // Calculer le pourcentage
  const percentage = categoryBudget.amount > 0 ? (spent / categoryBudget.amount) * 100 : 0;

  return {
    spent,
    budget: categoryBudget.amount,
    percentage,
  };
};

/**
 * Interface pour le tri des catégories
 */
export interface CategoryWithProgress extends CategoryBudget {
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  isNearLimit: boolean; // > 80%
}

/**
 * Enrichit les budgets catégoriels avec les données de progression
 */
export const enrichCategoryBudgets = (categoryBudgets: CategoryBudget[], expenses: Expense[]): CategoryWithProgress[] => {
  return categoryBudgets.map((cb) => {
    const progress = getCategoryBudgetProgress(cb.category, categoryBudgets, expenses);

    return {
      ...cb,
      spent: progress.spent,
      percentage: progress.percentage,
      remaining: cb.amount - progress.spent,
      isOverBudget: progress.spent > cb.amount,
      isNearLimit: progress.percentage >= 80 && progress.percentage < 100,
    };
  });
};

/**
 * Tri dynamique des catégories :
 * 1. Dépassées (> 100%)
 * 2. Proche limite (>= 80%)
 * 3. Plus gros montants
 */
export const sortCategoryBudgets = (enrichedBudgets: CategoryWithProgress[]): CategoryWithProgress[] => {
  return [...enrichedBudgets].sort((a, b) => {
    // Priorité 1 : Dépassées en premier
    if (a.isOverBudget && !b.isOverBudget) return -1;
    if (!a.isOverBudget && b.isOverBudget) return 1;

    // Priorité 2 : Proche limite (>= 80%)
    if (a.isNearLimit && !b.isNearLimit) return -1;
    if (!a.isNearLimit && b.isNearLimit) return 1;

    // Si les deux sont proche limite, trier par % décroissant
    if (a.isNearLimit && b.isNearLimit) {
      return b.percentage - a.percentage;
    }

    // Priorité 3 : Plus gros montants en premier
    return b.amount - a.amount;
  });
};

/**
 * Retourne les catégories qui nécessitent une alerte
 */
export const getCategoriesNeedingAlert = (enrichedBudgets: CategoryWithProgress[]): CategoryWithProgress[] => {
  return enrichedBudgets.filter((cb) => cb.isNearLimit || cb.isOverBudget);
};

/**
 * Vérifie si un mois doit être clôturé (basé sur le reset_day)
 */
export const shouldCloseMonth = (currentDate: Date, resetDay: number, lastClosedMonth: string): boolean => {
  const today = currentDate.getDate();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  // Si on est après le reset_day et que le mois n'a pas encore été clôturé
  if (today >= resetDay && lastClosedMonth !== currentMonth) {
    return true;
  }

  return false;
};

/**
 * Calcule le mois financier actuel basé sur reset_day
 */
export const getCurrentFinancialMonth = (currentDate: Date, resetDay: number): string => {
  const today = currentDate.getDate();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Si on est avant le reset_day, on est encore dans le mois financier précédent
  if (today < resetDay) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    return `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`;
  }

  // Sinon, on est dans le mois financier actuel
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

/**
 * Calcule le prochain mois financier
 */
export const getNextFinancialMonth = (currentMonth: string): string => {
  const [year, month] = currentMonth.split('-').map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
};

/**
 * Clone les budgets récurrents pour le mois suivant
 */
export const cloneRecurringBudgets = (recurringBudgets: CategoryBudget[], targetMonth: string): Omit<CategoryBudget, 'id' | 'createdAt'>[] => {
  return recurringBudgets
    .filter((cb) => cb.isRecurring)
    .map((cb) => ({
      month: targetMonth,
      category: cb.category,
      amount: cb.amount,
      isRecurring: true,
    }));
};
