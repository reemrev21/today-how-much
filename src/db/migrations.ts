import {getDB} from './connection';

export function runMigrations(): void {
  const db = getDB();

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS ledgers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      ledger_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      memo TEXT,
      date TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE
    );
  `);

  db.executeSync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_ledger_date
    ON transactions(ledger_id, date);
  `);

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS recurring_rules (
      id TEXT PRIMARY KEY,
      ledger_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      memo TEXT,
      day_of_month INTEGER NOT NULL CHECK(day_of_month BETWEEN 1 AND 31),
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE
    );
  `);

  // Migration: add sort_order to existing recurring_rules
  try {
    db.executeSync('ALTER TABLE recurring_rules ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0');
  } catch (_) {
    // column already exists
  }
}
