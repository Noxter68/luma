import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('luma.db');

export const initDatabase = () => {
  // Budgets table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL UNIQUE,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Expenses table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      budget_id TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (budget_id) REFERENCES budgets (id)
    );
  `);

  // Recurring expenses table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS recurring_expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  // Incomes table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS incomes (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      source TEXT NOT NULL,
      description TEXT,
      is_recurring INTEGER DEFAULT 0,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // User preferences table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      reset_day INTEGER NOT NULL DEFAULT 1,
      auto_close_month INTEGER DEFAULT 1,
      goal_type TEXT,
      personality_type TEXT,
      onboarding_completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // 🆕 Category budgets table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS category_budgets (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      is_recurring INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      UNIQUE(month, category)
    );
  `);

  // 🆕 Savings tracker table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS savings_tracker (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL UNIQUE,
      target_amount REAL NOT NULL,
      actual_saved REAL DEFAULT 0,
      total_accumulated REAL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Cleanup old tables
  db.execSync(`DROP TABLE IF EXISTS recurring_instances;`);
  db.execSync(`DROP TABLE IF EXISTS app_state;`);
};

export { db };
