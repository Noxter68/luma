import { db } from './index';
import { Budget, Expense, RecurringExpense, Income, CategoryBudget, SavingsTracker } from '../types';

// ============================================
// BUDGETS
// ============================================
export const getBudgetByMonth = (month: string): Budget | null => {
  const result = db.getFirstSync<{
    id: string;
    month: string;
    amount: number;
    created_at: string;
  }>('SELECT * FROM budgets WHERE month = ?', [month]);

  if (!result) return null;

  return {
    id: result.id,
    month: result.month,
    amount: result.amount,
    createdAt: result.created_at,
  };
};

export const createBudget = (budget: Budget): void => {
  db.runSync('INSERT OR REPLACE INTO budgets (id, month, amount, created_at) VALUES (?, ?, ?, ?)', [budget.id, budget.month, budget.amount, budget.createdAt]);
};

// ============================================
// EXPENSES
// ============================================
export const getExpensesByMonth = (month: string): Expense[] => {
  const results = db.getAllSync<{
    id: string;
    budget_id: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
    created_at: string;
  }>(
    `SELECT e.* FROM expenses e
     JOIN budgets b ON e.budget_id = b.id
     WHERE b.month = ?
     ORDER BY e.date DESC`,
    [month]
  );

  return results.map((row) => ({
    id: row.id,
    budgetId: row.budget_id,
    amount: row.amount,
    category: row.category,
    description: row.description || undefined,
    date: row.date,
    createdAt: row.created_at,
  }));
};

export const createExpense = (expense: Expense): void => {
  db.runSync('INSERT INTO expenses (id, budget_id, amount, category, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    expense.id,
    expense.budgetId,
    expense.amount,
    expense.category,
    expense.description || null,
    expense.date,
    expense.createdAt,
  ]);
};

export const deleteExpense = (id: string): void => {
  db.runSync('DELETE FROM expenses WHERE id = ?', [id]);
};

// ============================================
// RECURRING EXPENSES
// ============================================
export const getAllRecurringExpenses = (): RecurringExpense[] => {
  const results = db.getAllSync<{
    id: string;
    amount: number;
    category: string;
    description: string | null;
    is_active: number;
    created_at: string;
  }>('SELECT * FROM recurring_expenses ORDER BY created_at DESC');

  return results.map((row) => ({
    id: row.id,
    amount: row.amount,
    category: row.category,
    description: row.description || undefined,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  }));
};

export const createRecurringExpense = (recurring: RecurringExpense): void => {
  db.runSync('INSERT INTO recurring_expenses (id, amount, category, description, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    recurring.id,
    recurring.amount,
    recurring.category,
    recurring.description || null,
    recurring.isActive ? 1 : 0,
    recurring.createdAt,
  ]);
};

export const updateRecurringExpense = (recurring: RecurringExpense): void => {
  db.runSync('UPDATE recurring_expenses SET amount = ?, category = ?, description = ?, is_active = ? WHERE id = ?', [
    recurring.amount,
    recurring.category,
    recurring.description || null,
    recurring.isActive ? 1 : 0,
    recurring.id,
  ]);
};

export const deleteRecurringExpense = (id: string): void => {
  db.runSync('DELETE FROM recurring_expenses WHERE id = ?', [id]);
};

// ============================================
// INCOMES
// ============================================
export const getIncomesByMonth = (month: string): Income[] => {
  const results = db.getAllSync<{
    id: string;
    month: string;
    amount: number;
    source: string;
    description: string | null;
    is_recurring: number;
    date: string;
    created_at: string;
  }>('SELECT * FROM incomes WHERE month = ? ORDER BY date DESC', [month]);

  return results.map((row) => ({
    id: row.id,
    month: row.month,
    amount: row.amount,
    source: row.source as Income['source'],
    description: row.description || undefined,
    isRecurring: row.is_recurring === 1,
    date: row.date,
    createdAt: row.created_at,
  }));
};

export const createIncome = (income: Income): void => {
  db.runSync('INSERT INTO incomes (id, month, amount, source, description, is_recurring, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    income.id,
    income.month,
    income.amount,
    income.source,
    income.description || null,
    income.isRecurring ? 1 : 0,
    income.date,
    income.createdAt,
  ]);
};

export const updateIncome = (income: Income): void => {
  db.runSync('UPDATE incomes SET amount = ?, source = ?, description = ?, is_recurring = ? WHERE id = ?', [
    income.amount,
    income.source,
    income.description || null,
    income.isRecurring ? 1 : 0,
    income.id,
  ]);
};

export const deleteIncome = (id: string): void => {
  db.runSync('DELETE FROM incomes WHERE id = ?', [id]);
};

export const getAllRecurringIncomes = (): Income[] => {
  const results = db.getAllSync<{
    id: string;
    month: string;
    amount: number;
    source: string;
    description: string | null;
    is_recurring: number;
    date: string;
    created_at: string;
  }>('SELECT * FROM incomes WHERE is_recurring = 1 ORDER BY created_at DESC');

  return results.map((row) => ({
    id: row.id,
    month: row.month,
    amount: row.amount,
    source: row.source as Income['source'],
    description: row.description || undefined,
    isRecurring: row.is_recurring === 1,
    date: row.date,
    createdAt: row.created_at,
  }));
};

// ============================================
// 🆕 CATEGORY BUDGETS
// ============================================
export const getCategoryBudgetsByMonth = (month: string): CategoryBudget[] => {
  const results = db.getAllSync<{
    id: string;
    month: string;
    category: string;
    amount: number;
    is_recurring: number;
    created_at: string;
  }>('SELECT * FROM category_budgets WHERE month = ? ORDER BY amount DESC', [month]);

  return results.map((row) => ({
    id: row.id,
    month: row.month,
    category: row.category,
    amount: row.amount,
    isRecurring: row.is_recurring === 1,
    createdAt: row.created_at,
  }));
};

export const createCategoryBudget = (categoryBudget: CategoryBudget): void => {
  db.runSync('INSERT OR REPLACE INTO category_budgets (id, month, category, amount, is_recurring, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    categoryBudget.id,
    categoryBudget.month,
    categoryBudget.category,
    categoryBudget.amount,
    categoryBudget.isRecurring ? 1 : 0,
    categoryBudget.createdAt,
  ]);
};

export const updateCategoryBudget = (categoryBudget: CategoryBudget): void => {
  db.runSync('UPDATE category_budgets SET amount = ?, is_recurring = ? WHERE id = ?', [categoryBudget.amount, categoryBudget.isRecurring ? 1 : 0, categoryBudget.id]);
};

export const deleteCategoryBudget = (id: string): void => {
  db.runSync('DELETE FROM category_budgets WHERE id = ?', [id]);
};

export const getAllRecurringCategoryBudgets = (): CategoryBudget[] => {
  const results = db.getAllSync<{
    id: string;
    month: string;
    category: string;
    amount: number;
    is_recurring: number;
    created_at: string;
  }>('SELECT * FROM category_budgets WHERE is_recurring = 1 ORDER BY created_at DESC');

  return results.map((row) => ({
    id: row.id,
    month: row.month,
    category: row.category,
    amount: row.amount,
    isRecurring: row.is_recurring === 1,
    createdAt: row.created_at,
  }));
};

// ============================================
// 🆕 SAVINGS TRACKER
// ============================================
export const getSavingsTrackerByMonth = (month: string): SavingsTracker | null => {
  const result = db.getFirstSync<{
    id: string;
    month: string;
    target_amount: number;
    actual_saved: number;
    total_accumulated: number;
    created_at: string;
  }>('SELECT * FROM savings_tracker WHERE month = ?', [month]);

  if (!result) return null;

  return {
    id: result.id,
    month: result.month,
    targetAmount: result.target_amount,
    actualSaved: result.actual_saved,
    totalAccumulated: result.total_accumulated,
    createdAt: result.created_at,
  };
};

export const createSavingsTracker = (savingsTracker: SavingsTracker): void => {
  db.runSync('INSERT OR REPLACE INTO savings_tracker (id, month, target_amount, actual_saved, total_accumulated, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
    savingsTracker.id,
    savingsTracker.month,
    savingsTracker.targetAmount,
    savingsTracker.actualSaved,
    savingsTracker.totalAccumulated,
    savingsTracker.createdAt,
  ]);
};

export const updateSavingsTracker = (savingsTracker: SavingsTracker): void => {
  db.runSync('UPDATE savings_tracker SET target_amount = ?, actual_saved = ?, total_accumulated = ? WHERE id = ?', [
    savingsTracker.targetAmount,
    savingsTracker.actualSaved,
    savingsTracker.totalAccumulated,
    savingsTracker.id,
  ]);
};

export const getAllSavingsTrackers = (): SavingsTracker[] => {
  const results = db.getAllSync<{
    id: string;
    month: string;
    target_amount: number;
    actual_saved: number;
    total_accumulated: number;
    created_at: string;
  }>('SELECT * FROM savings_tracker ORDER BY month DESC');

  return results.map((row) => ({
    id: row.id,
    month: row.month,
    targetAmount: row.target_amount,
    actualSaved: row.actual_saved,
    totalAccumulated: row.total_accumulated,
    createdAt: row.created_at,
  }));
};

// ============================================
// 🆕 HELPER: Get Total Accumulated Savings
// ============================================
export const getTotalAccumulatedSavings = (): number => {
  const result = db.getFirstSync<{ total: number }>('SELECT COALESCE(MAX(total_accumulated), 0) as total FROM savings_tracker');

  return result?.total || 0;
};
