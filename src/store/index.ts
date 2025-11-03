import { create } from 'zustand';
import { format } from 'date-fns';
import { Budget, Expense, RecurringExpense } from '../types';
import {
  getBudgetByMonth,
  createBudget as dbCreateBudget,
  getExpensesByMonth,
  createExpense as dbCreateExpense,
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

  // Computed
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
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  updateRecurringExpense: (expense: RecurringExpense) => void;
  deleteRecurringExpense: (id: string) => void;
  processRecurringExpenses: () => void;
  refresh: () => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  currentMonth: format(new Date(), 'yyyy-MM'),
  budget: null,
  expenses: [],
  recurringExpenses: [],

  get totalSpent() {
    return get().expenses.reduce((sum, exp) => sum + exp.amount, 0);
  },

  get totalRecurring() {
    return get()
      .recurringExpenses.filter((r) => r.isActive)
      .reduce((sum, r) => sum + r.amount, 0);
  },

  get totalWithRecurring() {
    return get().totalSpent + get().totalRecurring;
  },

  get remaining() {
    const budget = get().budget;
    if (!budget) return 0;
    return budget.amount - get().totalWithRecurring;
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

  loadRecurringExpenses: () => {
    const recurring = getAllRecurringExpenses();
    set({ recurringExpenses: recurring });
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

    // Si déjà traité ce mois, on skip
    if (lastProcessed === currentMonth) {
      return;
    }

    const recurring = getAllRecurringExpenses();
    const { budget } = get();

    // Créer le budget si nécessaire
    if (!budget) {
      get().setBudget(0);
    }

    const budgetId = budget?.id || `budget-${currentMonth}`;

    // Ajouter seulement les dépenses récurrentes actives
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

    // Marquer le mois comme traité
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
