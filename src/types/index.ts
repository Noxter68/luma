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

export interface RecurringIncome {
  id: string;
  amount: number;
  source: 'salary' | 'bonus' | 'freelance' | 'gift' | 'other';
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
  goalType?: 'savings' | 'control' | 'stress-free';
  personalityType?: 'motivated' | 'data-driven' | 'fun';
  onboardingCompleted: boolean;
  createdAt: string;
}
