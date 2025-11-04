import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('luma.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL UNIQUE,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

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

  db.execSync(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      reset_day INTEGER NOT NULL DEFAULT 1,
      goal_type TEXT,
      personality_type TEXT,
      onboarding_completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Nettoyage : Supprimer les tables inutiles si elles existent
  db.execSync(`DROP TABLE IF EXISTS recurring_instances;`);
  db.execSync(`DROP TABLE IF EXISTS app_state;`);
};

export { db };
