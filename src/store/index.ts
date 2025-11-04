// src/store/index.ts

import { create } from 'zustand';
import { format } from 'date-fns';
import { Budget, Expense, RecurringExpense } from '../types';
import {
  getBudgetByMonth,
  createBudget as dbCreateBudget,
  getExpensesByMonth,
  createExpense as dbCreateExpense,
  deleteExpense as dbDeleteExpense,
  getAllRecurringExpenses,
  createRecurringExpense as dbCreateRecurringExpense,
  updateRecurringExpense as dbUpdateRecurringExpense,
  deleteRecurringExpense as dbDeleteRecurringExpense,
  getLastProcessedMonth,
  setLastProcessedMonth,
} from '../database/queries';

interface BudgetStore {
  currentMonth: string;
  budget: Budget | null;
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];

  // Computed - maintenant en propriétés normales
  totalSpent: number;
  totalRecurring: number;
  totalWithRecurring: number;
  remaining: number;

  // Actions
  setCurrentMonth: (month: string) => void;
  loadBudget: () => void;
  loadExpenses: () => void;
  loadRecurringExpenses: () => void;
  setBudget: (amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'budgetId' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  updateRecurringExpense: (expense: RecurringExpense) => void;
  deleteRecurringExpense: (id: string) => void;
  processRecurringExpenses: () => void;
  refresh: () => void;
  computeTotals: () => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  currentMonth: format(new Date(), 'yyyy-MM'),
  budget: null,
  expenses: [],
  recurringExpenses: [],

  // Computed - valeurs par défaut
  totalSpent: 0,
  totalRecurring: 0,
  totalWithRecurring: 0,
  remaining: 0,

  // Nouvelle fonction pour recalculer les totaux
  computeTotals: () => {
    const state = get();
    const totalSpent = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRecurring = state.recurringExpenses.filter((r) => r.isActive).reduce((sum, r) => sum + r.amount, 0);
    const totalWithRecurring = totalSpent + totalRecurring;
    const remaining = state.budget ? state.budget.amount - totalWithRecurring : 0;

    set({
      totalSpent,
      totalRecurring,
      totalWithRecurring,
      remaining,
    });
  },

  setCurrentMonth: (month: string) => {
    set({ currentMonth: month });
    get().refresh();
  },

  loadBudget: () => {
    const month = get().currentMonth;
    const budget = getBudgetByMonth(month);
    set({ budget });
    get().computeTotals();
  },

  loadExpenses: () => {
    const month = get().currentMonth;
    const expenses = getExpensesByMonth(month);
    set({ expenses });
    get().computeTotals();
  },

  loadRecurringExpenses: () => {
    const recurring = getAllRecurringExpenses();
    set({ recurringExpenses: recurring });
    get().computeTotals();
  },

  setBudget: (amount: number) => {
    const month = get().currentMonth;
    const budget: Budget = {
      id: `budget-${month}`,
      month,
      amount,
      createdAt: new Date().toISOString(),
    };

    dbCreateBudget(budget);
    set({ budget });
    get().computeTotals();
  },

  addExpense: (expenseData) => {
    const { budget, currentMonth } = get();

    if (!budget) {
      get().setBudget(0);
    }

    const budgetId = budget?.id || `budget-${currentMonth}`;

    const expense: Expense = {
      ...expenseData,
      id: `expense-${Date.now()}`,
      budgetId,
      createdAt: new Date().toISOString(),
    };

    dbCreateExpense(expense);
    get().loadExpenses();
  },

  deleteExpense: (id: string) => {
    dbDeleteExpense(id);
    get().loadExpenses();
  },

  addRecurringExpense: (expenseData) => {
    const expense: RecurringExpense = {
      ...expenseData,
      id: `recurring-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    dbCreateRecurringExpense(expense);
    get().loadRecurringExpenses();
  },

  updateRecurringExpense: (expense: RecurringExpense) => {
    dbUpdateRecurringExpense(expense);
    get().loadRecurringExpenses();
  },

  deleteRecurringExpense: (id: string) => {
    dbDeleteRecurringExpense(id);
    get().loadRecurringExpenses();
  },

  processRecurringExpenses: () => {
    const currentMonth = get().currentMonth;
    const lastProcessed = getLastProcessedMonth();

    if (lastProcessed === currentMonth) {
      return;
    }

    const recurring = getAllRecurringExpenses();
    const { budget } = get();

    if (!budget) {
      get().setBudget(0);
    }

    const budgetId = budget?.id || `budget-${currentMonth}`;

    recurring
      .filter((rec) => rec.isActive)
      .forEach((rec) => {
        const expense: Expense = {
          id: `expense-recurring-${rec.id}-${Date.now()}`,
          budgetId,
          amount: rec.amount,
          category: rec.category,
          description: rec.description,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        dbCreateExpense(expense);
      });

    setLastProcessedMonth(currentMonth);
    get().loadExpenses();
  },

  refresh: () => {
    get().loadBudget();
    get().loadExpenses();
    get().loadRecurringExpenses();
    get().processRecurringExpenses();
  },
}));
