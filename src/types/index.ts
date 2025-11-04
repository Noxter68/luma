export interface Budget {
  id: string;
  month: string; // Format: "YYYY-MM"
  amount: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  budgetId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface RecurringExpense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Income {
  id: string;
  month: string; // Format: "YYYY-MM"
  amount: number;
  source: 'salary' | 'bonus' | 'freelance' | 'gift' | 'other';
  description?: string;
  isRecurring: boolean;
  date: string;
  createdAt: string;
}

export interface UserPreferences {
  id: string;
  resetDay: number; // 1-28
  autoCloseMonth: boolean;
  goalType?: 'savings' | 'control' | 'stress-free';
  personalityType?: 'motivated' | 'data-driven' | 'fun';
  onboardingCompleted: boolean;
  createdAt: string;
}

// 🆕 Category Budget
export interface CategoryBudget {
  id: string;
  month: string; // Format: "YYYY-MM"
  category: string; // Category ID from utils/categories
  amount: number;
  isRecurring: boolean;
  createdAt: string;
}

// 🆕 Savings Tracker
export interface SavingsTracker {
  id: string;
  month: string; // Format: "YYYY-MM"
  targetAmount: number;
  actualSaved: number;
  totalAccumulated: number;
  createdAt: string;
}

// 🆕 Budget calculation helper type
export interface BudgetCalculation {
  totalRevenue: number;
  totalRecurring: number;
  availableForBudget: number; // Revenue - Recurring
  totalBudgeted: number; // Sum of all category budgets
  targetSavings: number; // From savings_tracker
  buffer: number; // Available - Budgeted - TargetSavings
  totalSpent: number; // Real expenses
  actualSavings: number; // Available - Spent
}
