import { create } from 'zustand';
import { format } from 'date-fns';
import { Budget, Expense, RecurringExpense, Income } from '../types';
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
  getIncomesByMonth,
  createIncome as dbCreateIncome,
  updateIncome as dbUpdateIncome,
  deleteIncome as dbDeleteIncome,
  getAllRecurringIncomes,
} from '../database/queries';

interface BudgetStore {
  currentMonth: string;
  budget: Budget | null;
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  incomes: Income[];

  // Computed values
  totalSpent: number;
  totalRecurring: number;
  totalWithRecurring: number;
  totalIncome: number;
  remaining: number;

  // Actions
  setCurrentMonth: (month: string) => void;
  loadBudget: () => void;
  loadExpenses: () => void;
  loadRecurringExpenses: () => void;
  loadIncomes: () => void;
  setBudget: (amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'budgetId' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  updateRecurringExpense: (expense: RecurringExpense) => void;
  deleteRecurringExpense: (id: string) => void;
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;
  processRecurringIncomes: () => void;
  refresh: () => void;
  computeTotals: () => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  currentMonth: format(new Date(), 'yyyy-MM'),
  budget: null,
  expenses: [],
  recurringExpenses: [],
  incomes: [],

  // Computed - valeurs par défaut
  totalSpent: 0,
  totalRecurring: 0,
  totalWithRecurring: 0,
  totalIncome: 0,
  remaining: 0,

  // Fonction pour recalculer les totaux
  computeTotals: () => {
    const state = get();
    const totalSpent = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRecurring = state.recurringExpenses.filter((r) => r.isActive).reduce((sum, r) => sum + r.amount, 0);
    const totalIncome = state.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalWithRecurring = totalSpent + totalRecurring;

    // Calcul basé sur les incomes si disponibles, sinon sur le budget
    const availableAmount = totalIncome > 0 ? totalIncome - totalRecurring : state.budget?.amount || 0;
    const remaining = availableAmount - totalSpent;

    set({
      totalSpent,
      totalRecurring,
      totalWithRecurring,
      totalIncome,
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

  loadIncomes: () => {
    const month = get().currentMonth;
    const incomes = getIncomesByMonth(month);
    set({ incomes });
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

  addIncome: (incomeData) => {
    const income: Income = {
      ...incomeData,
      id: `income-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    dbCreateIncome(income);
    get().loadIncomes();
  },

  updateIncome: (income: Income) => {
    dbUpdateIncome(income);
    get().loadIncomes();
  },

  deleteIncome: (id: string) => {
    dbDeleteIncome(id);
    get().loadIncomes();
  },

  // Auto-création des incomes récurrents pour le nouveau mois
  processRecurringIncomes: () => {
    const currentMonth = get().currentMonth;
    const existingIncomes = get().incomes;
    const recurringIncomes = getAllRecurringIncomes();

    // Pour chaque income récurrent, vérifier s'il existe déjà pour ce mois
    recurringIncomes.forEach((recurringIncome) => {
      const alreadyExists = existingIncomes.some(
        (income) => income.source === recurringIncome.source && income.amount === recurringIncome.amount && income.description === recurringIncome.description && income.isRecurring
      );

      if (!alreadyExists) {
        // Créer une copie pour le mois actuel
        const newIncome: Income = {
          id: `income-${Date.now()}-${Math.random()}`,
          month: currentMonth,
          amount: recurringIncome.amount,
          source: recurringIncome.source,
          description: recurringIncome.description,
          isRecurring: true,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        dbCreateIncome(newIncome);
      }
    });

    get().loadIncomes();
  },

  refresh: () => {
    get().loadBudget();
    get().loadExpenses();
    get().loadRecurringExpenses();
    get().loadIncomes();
    get().processRecurringIncomes();
  },
}));
