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
