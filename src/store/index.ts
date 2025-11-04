import { create } from 'zustand';
import { format } from 'date-fns';
import { Budget, Expense, RecurringExpense, Income, CategoryBudget, SavingsTracker, BudgetCalculation } from '../types';
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
  getCategoryBudgetsByMonth,
  createCategoryBudget as dbCreateCategoryBudget,
  updateCategoryBudget as dbUpdateCategoryBudget,
  deleteCategoryBudget as dbDeleteCategoryBudget,
  getAllRecurringCategoryBudgets,
  getSavingsTrackerByMonth,
  createSavingsTracker as dbCreateSavingsTracker,
  updateSavingsTracker as dbUpdateSavingsTracker,
  getTotalAccumulatedSavings,
} from '../database/queries';
import { calculateBudgetMetrics, enrichCategoryBudgets, sortCategoryBudgets, CategoryWithProgress } from '../utils/budgetCalculations';

interface BudgetStore {
  currentMonth: string;
  budget: Budget | null;
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  incomes: Income[];
  categoryBudgets: CategoryBudget[];
  savingsTracker: SavingsTracker | null;

  // Computed values (old)
  totalSpent: number;
  totalRecurring: number;
  totalWithRecurring: number;
  totalIncome: number;
  remaining: number;

  // 🆕 Computed values (new)
  budgetMetrics: BudgetCalculation;
  enrichedCategoryBudgets: CategoryWithProgress[];
  sortedCategoryBudgets: CategoryWithProgress[];
  totalAccumulatedSavings: number;

  // Actions
  setCurrentMonth: (month: string) => void;
  loadBudget: () => void;
  loadExpenses: () => void;
  loadRecurringExpenses: () => void;
  loadIncomes: () => void;
  loadCategoryBudgets: () => void;
  loadSavingsTracker: () => void;
  loadTotalAccumulatedSavings: () => void;
  setBudget: (amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'budgetId' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  updateRecurringExpense: (expense: RecurringExpense) => void;
  deleteRecurringExpense: (id: string) => void;
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;
  addCategoryBudget: (categoryBudget: Omit<CategoryBudget, 'id' | 'createdAt'>) => void;
  updateCategoryBudget: (categoryBudget: CategoryBudget) => void;
  deleteCategoryBudget: (id: string) => void;
  setSavingsTarget: (targetAmount: number) => void;
  closeMonth: () => void;
  refresh: () => void;
  computeTotals: () => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  currentMonth: format(new Date(), 'yyyy-MM'),
  budget: null,
  expenses: [],
  recurringExpenses: [],
  incomes: [],
  categoryBudgets: [],
  savingsTracker: null,

  // Old computed - kept for backward compatibility
  totalSpent: 0,
  totalRecurring: 0,
  totalWithRecurring: 0,
  totalIncome: 0,
  remaining: 0,

  // New computed
  budgetMetrics: {
    totalRevenue: 0,
    totalRecurring: 0,
    availableForBudget: 0,
    totalBudgeted: 0,
    targetSavings: 0,
    buffer: 0,
    totalSpent: 0,
    actualSavings: 0,
  },
  enrichedCategoryBudgets: [],
  sortedCategoryBudgets: [],
  totalAccumulatedSavings: 0,

  computeTotals: () => {
    const state = get();

    // Old calculations (kept for backward compatibility)
    const totalSpent = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRecurring = state.recurringExpenses.filter((r) => r.isActive).reduce((sum, r) => sum + r.amount, 0);
    const totalIncome = state.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalWithRecurring = totalSpent + totalRecurring;
    const availableAmount = totalIncome > 0 ? totalIncome - totalRecurring : state.budget?.amount || 0;
    const remaining = availableAmount - totalSpent;

    // New calculations
    const budgetMetrics = calculateBudgetMetrics(state.incomes, state.recurringExpenses, state.categoryBudgets, state.expenses, state.savingsTracker);

    const enrichedCategoryBudgets = enrichCategoryBudgets(state.categoryBudgets, state.expenses);

    const sortedCategoryBudgets = sortCategoryBudgets(enrichedCategoryBudgets);

    set({
      totalSpent,
      totalRecurring,
      totalWithRecurring,
      totalIncome,
      remaining,
      budgetMetrics,
      enrichedCategoryBudgets,
      sortedCategoryBudgets,
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

  loadCategoryBudgets: () => {
    const month = get().currentMonth;
    const categoryBudgets = getCategoryBudgetsByMonth(month);
    set({ categoryBudgets });
    get().computeTotals();
  },

  loadSavingsTracker: () => {
    const month = get().currentMonth;
    const savingsTracker = getSavingsTrackerByMonth(month);
    set({ savingsTracker });
    get().computeTotals();
  },

  loadTotalAccumulatedSavings: () => {
    const totalAccumulatedSavings = getTotalAccumulatedSavings();
    set({ totalAccumulatedSavings });
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

  addCategoryBudget: (categoryBudgetData) => {
    const month = get().currentMonth;
    const categoryBudget: CategoryBudget = {
      ...categoryBudgetData,
      id: `category-budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      month,
      createdAt: new Date().toISOString(),
    };

    dbCreateCategoryBudget(categoryBudget);
    get().loadCategoryBudgets();
  },

  updateCategoryBudget: (categoryBudget: CategoryBudget) => {
    dbUpdateCategoryBudget(categoryBudget);
    get().loadCategoryBudgets();
  },

  deleteCategoryBudget: (id: string) => {
    dbDeleteCategoryBudget(id);
    get().loadCategoryBudgets();
  },

  setSavingsTarget: (targetAmount: number) => {
    const month = get().currentMonth;
    const existingTracker = get().savingsTracker;

    const savingsTracker: SavingsTracker = existingTracker
      ? {
          ...existingTracker,
          targetAmount,
        }
      : {
          id: `savings-${month}`,
          month,
          targetAmount,
          actualSaved: 0,
          totalAccumulated: get().totalAccumulatedSavings,
          createdAt: new Date().toISOString(),
        };

    if (existingTracker) {
      dbUpdateSavingsTracker(savingsTracker);
    } else {
      dbCreateSavingsTracker(savingsTracker);
    }

    get().loadSavingsTracker();
  },

  closeMonth: () => {
    const state = get();
    const { budgetMetrics, savingsTracker, totalAccumulatedSavings, currentMonth } = state;

    // Créer un tracker si il n'existe pas
    if (!savingsTracker) {
      const newTracker: SavingsTracker = {
        id: `savings-${currentMonth}`,
        month: currentMonth,
        targetAmount: 0,
        actualSaved: Math.max(0, budgetMetrics.actualSavings),
        totalAccumulated: totalAccumulatedSavings + Math.max(0, budgetMetrics.actualSavings),
        createdAt: new Date().toISOString(),
      };
      dbCreateSavingsTracker(newTracker);
    } else {
      // Calculer les économies réelles
      const actualSaved = Math.max(0, budgetMetrics.actualSavings);

      // Mettre à jour le tracker avec les économies réelles
      const updatedTracker: SavingsTracker = {
        ...savingsTracker,
        actualSaved,
        totalAccumulated: totalAccumulatedSavings + actualSaved,
      };

      dbUpdateSavingsTracker(updatedTracker);
    }

    // Recharger
    get().loadSavingsTracker();
    get().loadTotalAccumulatedSavings();

    // TODO: Cloner les budgets récurrents pour le mois suivant
    // TODO: Cloner les incomes récurrents pour le mois suivant

    return budgetMetrics.actualSavings; // Return for modal
  },

  refresh: () => {
    get().loadBudget();
    get().loadExpenses();
    get().loadRecurringExpenses();
    get().loadIncomes();
    get().loadCategoryBudgets();
    get().loadSavingsTracker();
    get().loadTotalAccumulatedSavings();
  },
}));
