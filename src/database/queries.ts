import { db } from './index';
import { Budget, Expense } from '../types';

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
