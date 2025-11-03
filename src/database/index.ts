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
};

export { db };
