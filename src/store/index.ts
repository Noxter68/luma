import { create } from 'zustand';
import { format } from 'date-fns';
import { Budget, Expense } from '../types';
import { getBudgetByMonth, createBudget as dbCreateBudget, getExpensesByMonth, createExpense as dbCreateExpense } from '../database/queries';

interface BudgetStore {
  currentMonth: string;
  budget: Budget | null;
  expenses: Expense[];

  // Computed
  totalSpent: number;
  remaining: number;

  // Actions
  setCurrentMonth: (month: string) => void;
  loadBudget: () => void;
  loadExpenses: () => void;
  setBudget: (amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'budgetId' | 'createdAt'>) => void;
  refresh: () => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  currentMonth: format(new Date(), 'yyyy-MM'),
  budget: null,
  expenses: [],

  get totalSpent() {
    return get().expenses.reduce((sum, exp) => sum + exp.amount, 0);
  },

  get remaining() {
    const budget = get().budget;
    if (!budget) return 0;
    return budget.amount - get().totalSpent;
  },

  setCurrentMonth: (month: string) => {
    set({ currentMonth: month });
    get().refresh();
  },

  loadBudget: () => {
    const month = get().currentMonth;
    const budget = getBudgetByMonth(month);
    set({ budget });
  },

  loadExpenses: () => {
    const month = get().currentMonth;
    const expenses = getExpensesByMonth(month);
    set({ expenses });
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
  },

  addExpense: (expenseData) => {
    const { budget, currentMonth } = get();

    // Créer le budget si nécessaire
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

  refresh: () => {
    get().loadBudget();
    get().loadExpenses();
  },
}));
