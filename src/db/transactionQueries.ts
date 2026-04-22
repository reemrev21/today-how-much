import uuid from 'react-native-uuid';
import {getDB} from './connection';
import type {
  Transaction, TransactionType, DaySummary, CategorySummary,
  PaymentMethodSummary, MonthlyTrend, TransactionFilter,
} from '../types';

export function createTransaction(params: {
  ledger_id: string; type: TransactionType; amount: number;
  category: string; payment_method: string; memo: string | null; date: string;
}): Transaction {
  const db = getDB();
  const id = uuid.v4() as string;
  const created_at = Date.now();
  db.executeSync(
    `INSERT INTO transactions (id, ledger_id, type, amount, category, payment_method, memo, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, params.ledger_id, params.type, params.amount, params.category, params.payment_method, params.memo, params.date, created_at],
  );
  return {id, ...params, created_at};
}

export function updateTransaction(id: string, params: {
  type: TransactionType; amount: number; category: string;
  payment_method: string; memo: string | null; date: string;
}): void {
  const db = getDB();
  db.executeSync(
    `UPDATE transactions SET type=?, amount=?, category=?, payment_method=?, memo=?, date=? WHERE id=?`,
    [params.type, params.amount, params.category, params.payment_method, params.memo, params.date, id],
  );
}

export function deleteTransaction(id: string): void {
  const db = getDB();
  db.executeSync('DELETE FROM transactions WHERE id = ?', [id]);
}

export function getTransactionsByDate(ledgerId: string, date: string): Transaction[] {
  const db = getDB();
  const result = db.executeSync(
    'SELECT * FROM transactions WHERE ledger_id = ? AND date = ? ORDER BY created_at DESC',
    [ledgerId, date],
  );
  return (result.rows ?? []) as Transaction[];
}

export function getMonthDaySummaries(ledgerId: string, yearMonth: string): DaySummary[] {
  const db = getDB();
  const result = db.executeSync(
    `SELECT date,
       SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
     FROM transactions WHERE ledger_id = ? AND date LIKE ?
     GROUP BY date ORDER BY date`,
    [ledgerId, `${yearMonth}%`],
  );
  return (result.rows ?? []) as DaySummary[];
}

export function getMonthTotals(ledgerId: string, yearMonth: string): {income: number; expense: number} {
  const db = getDB();
  const result = db.executeSync(
    `SELECT
       SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
     FROM transactions WHERE ledger_id = ? AND date LIKE ?`,
    [ledgerId, `${yearMonth}%`],
  );
  const row = result.rows?.[0];
  return {income: (row?.income as number) ?? 0, expense: (row?.expense as number) ?? 0};
}

export function getCategorySummary(ledgerId: string, yearMonth: string): CategorySummary[] {
  const db = getDB();
  const result = db.executeSync(
    `SELECT category, SUM(amount) as total FROM transactions
     WHERE ledger_id = ? AND date LIKE ? AND type = 'expense'
     GROUP BY category ORDER BY total DESC`,
    [ledgerId, `${yearMonth}%`],
  );
  return (result.rows ?? []) as CategorySummary[];
}

export function getPaymentMethodSummary(ledgerId: string, yearMonth: string): PaymentMethodSummary[] {
  const db = getDB();
  const result = db.executeSync(
    `SELECT payment_method, SUM(amount) as total FROM transactions
     WHERE ledger_id = ? AND date LIKE ?
     GROUP BY payment_method ORDER BY total DESC`,
    [ledgerId, `${yearMonth}%`],
  );
  return (result.rows ?? []) as PaymentMethodSummary[];
}

export function getMonthlyTrend(ledgerId: string, year: string): MonthlyTrend[] {
  const db = getDB();
  const result = db.executeSync(
    `SELECT substr(date, 1, 7) as month,
       SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
     FROM transactions WHERE ledger_id = ? AND date LIKE ?
     GROUP BY month ORDER BY month`,
    [ledgerId, `${year}%`],
  );
  return (result.rows ?? []) as MonthlyTrend[];
}

export function getFilteredTransactions(
  ledgerId: string, filter: TransactionFilter, limit: number, offset: number,
): Transaction[] {
  const db = getDB();
  const conditions = ['ledger_id = ?'];
  const params: (string | number)[] = [ledgerId];
  if (filter.category) { conditions.push('category = ?'); params.push(filter.category); }
  if (filter.payment_method) { conditions.push('payment_method = ?'); params.push(filter.payment_method); }
  if (filter.type) { conditions.push('type = ?'); params.push(filter.type); }
  if (filter.search) { conditions.push('memo LIKE ?'); params.push(`%${filter.search}%`); }
  params.push(limit, offset);
  const result = db.executeSync(
    `SELECT * FROM transactions WHERE ${conditions.join(' AND ')} ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`,
    params,
  );
  return (result.rows ?? []) as Transaction[];
}

export function getTransactionsForExport(ledgerId: string, startDate?: string, endDate?: string): Transaction[] {
  const db = getDB();
  let query = 'SELECT * FROM transactions WHERE ledger_id = ?';
  const params: string[] = [ledgerId];
  if (startDate && endDate) { query += ' AND date >= ? AND date <= ?'; params.push(startDate, endDate); }
  query += ' ORDER BY date ASC, created_at ASC';
  const result = db.executeSync(query, params);
  return (result.rows ?? []) as Transaction[];
}
