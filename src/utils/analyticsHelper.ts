import { Expense } from '../types';
import { getCategoryById } from '../utils/categories';

// Top 5 plus grosses dépenses
export const getTopExpenses = (expenses: Expense[], limit: number = 5) => {
  return [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((exp) => ({
      ...exp,
      categoryData: getCategoryById(exp.category),
    }));
};

// Répartition par catégorie
export const getCategoryBreakdown = (expenses: Expense[]) => {
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((exp) => {
    if (!categoryTotals[exp.category]) {
      categoryTotals[exp.category] = 0;
    }
    categoryTotals[exp.category] += exp.amount;
  });

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const breakdown = Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .map(([categoryId, amount]) => ({
      categoryId,
      categoryData: getCategoryById(categoryId),
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return breakdown;
};

// Comparaison avec le mois précédent
export interface MonthComparison {
  currentExpenses: number;
  previousExpenses: number;
  expenseDiff: number;
  expensePercentChange: number;
  currentSavings: number;
  previousSavings: number;
  savingsDiff: number;
  savingsPercentChange: number;
}

export const getMonthComparison = (currentExpenses: number, previousExpenses: number, currentIncome: number, previousIncome: number): MonthComparison => {
  const currentSavings = currentIncome - currentExpenses;
  const previousSavings = previousIncome - previousExpenses;

  const expenseDiff = currentExpenses - previousExpenses;
  const expensePercentChange = previousExpenses > 0 ? (expenseDiff / previousExpenses) * 100 : 0;

  const savingsDiff = currentSavings - previousSavings;
  const savingsPercentChange = previousSavings !== 0 ? (savingsDiff / previousSavings) * 100 : 0;

  return {
    currentExpenses,
    previousExpenses,
    expenseDiff,
    expensePercentChange,
    currentSavings,
    previousSavings,
    savingsDiff,
    savingsPercentChange,
  };
};

// Daily burn rate
export interface DailyBurnRate {
  currentDailyAvg: number;
  previousDailyAvg: number;
  projectedMonthTotal: number;
  daysInMonth: number;
  daysElapsed: number;
}

export const getDailyBurnRate = (currentExpenses: number, previousExpenses: number, currentMonth: Date): DailyBurnRate => {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const daysElapsed = currentMonth.getDate();

  const currentDailyAvg = daysElapsed > 0 ? currentExpenses / daysElapsed : 0;
  const previousDailyAvg = previousExpenses / daysInMonth;

  const projectedMonthTotal = currentDailyAvg * daysInMonth;

  return {
    currentDailyAvg,
    previousDailyAvg,
    projectedMonthTotal,
    daysInMonth,
    daysElapsed,
  };
};
