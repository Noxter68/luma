import { db } from './index';
import { Budget, Expense, RecurringExpense } from '../types';

// Budgets
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

// Expenses
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

// Recurring Expenses
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

export const deleteExpense = (id: string): void => {
  db.runSync('DELETE FROM expenses WHERE id = ?', [id]);
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

// App State
export const getLastProcessedMonth = (): string | null => {
  const result = db.getFirstSync<{ value: string }>('SELECT value FROM app_state WHERE key = ?', ['last_processed_month']);
  return result?.value || null;
};

export const setLastProcessedMonth = (month: string): void => {
  db.runSync('INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)', ['last_processed_month', month]);
};
