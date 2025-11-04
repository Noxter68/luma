import { create } from 'zustand';
import { format } from 'date-fns';
import { Budget, Expense, RecurringExpense, Income, RecurringIncome } from '../types';
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
  createRecurringIncome as dbCreateRecurringIncome,
  updateRecurringIncome as dbUpdateRecurringIncome,
  deleteRecurringIncome as dbDeleteRecurringIncome,
} from '../database/queries';

interface BudgetStore {
  currentMonth: string;
  budget: Budget | null;
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  incomes: Income[];
  recurringIncomes: RecurringIncome[];

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
  refresh: () => void;
  computeTotals: () => void;
  loadRecurringIncomes: () => void;
  addRecurringIncome: (income: Omit<RecurringIncome, 'id' | 'createdAt'>) => void;
  updateRecurringIncome: (income: RecurringIncome) => void;
  deleteRecurringIncome: (id: string) => void;
}

// ⭐ Guard flag en dehors du store
let isRefreshing = false;

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  currentMonth: format(new Date(), 'yyyy-MM'),
  budget: null,
  expenses: [],
  recurringExpenses: [],
  incomes: [],
  recurringIncomes: [],

  totalSpent: 0,
  totalRecurring: 0,
  totalWithRecurring: 0,
  totalIncome: 0,
  remaining: 0,

  computeTotals: () => {
    const state = get();
    const totalSpent = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRecurring = state.recurringExpenses.filter((r) => r.isActive).reduce((sum, r) => sum + r.amount, 0);
    const totalIncome = state.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalWithRecurring = totalSpent + totalRecurring;

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
      id: `income-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  loadRecurringIncomes: () => {
    const recurring = getAllRecurringIncomes();
    set({ recurringIncomes: recurring });
  },

  addRecurringIncome: (incomeData) => {
    const income: RecurringIncome = {
      ...incomeData,
      id: `recurring-income-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    dbCreateRecurringIncome(income);
    get().loadRecurringIncomes();
  },

  updateRecurringIncome: (income: RecurringIncome) => {
    dbUpdateRecurringIncome(income);
    get().loadRecurringIncomes();
  },

  deleteRecurringIncome: (id: string) => {
    dbDeleteRecurringIncome(id);
    get().loadRecurringIncomes();
  },

  refresh: () => {
    if (isRefreshing) {
      console.log('⚠️ Refresh déjà en cours, ignoré');
      return;
    }

    isRefreshing = true;
    const { currentMonth } = get();

    try {
      get().loadBudget();
      get().loadExpenses();
      get().loadRecurringExpenses();
      get().loadRecurringIncomes(); // ⭐ Charger les templates

      // Charger les incomes INSTANCES du mois
      const existingIncomes = getIncomesByMonth(currentMonth);
      const recurringIncomeTemplates = getAllRecurringIncomes(); // ⭐ Templates seulement

      console.log(`📅 Refresh pour ${currentMonth}`);
      console.log(`💰 ${existingIncomes.length} revenus existants`);
      console.log(`🔄 ${recurringIncomeTemplates.length} templates récurrents`);

      let created = 0;
      recurringIncomeTemplates.forEach((template) => {
        const alreadyExists = existingIncomes.some((inc) => inc.month === currentMonth && inc.source === template.source && inc.amount === template.amount && inc.isRecurring === true);

        if (!alreadyExists) {
          console.log(`✨ Création instance : ${template.source} - ${template.amount}€`);

          const newIncome: Income = {
            id: `income-${currentMonth}-${template.source}-${Date.now()}`,
            month: currentMonth,
            amount: template.amount,
            source: template.source,
            description: template.description,
            isRecurring: true, // ⭐ Instance créée depuis un template
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };

          dbCreateIncome(newIncome);
          created++;
        }
      });

      if (created > 0) {
        console.log(`✅ ${created} instances créées`);
      }

      get().loadIncomes();
    } finally {
      isRefreshing = false;
    }
  },
}));
