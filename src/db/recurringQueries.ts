import uuid from "react-native-uuid";
import dayjs from "dayjs";
import { getDB } from "./connection";
import type { RecurringRule, TransactionType } from "../types";

export function createRecurringRule(params: {
  ledger_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  day_of_month: number;
}): RecurringRule {
  const db = getDB();
  const id = uuid.v4() as string;
  const row = db.executeSync(
    "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM recurring_rules WHERE ledger_id = ?",
    [params.ledger_id]
  ).rows?.[0] as { max_order: number } | undefined;
  const maxOrder = row?.max_order ?? -1;
  const sort_order = maxOrder + 1;
  db.executeSync(
    `INSERT INTO recurring_rules (id, ledger_id, type, amount, category, payment_method, memo, day_of_month, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      id,
      params.ledger_id,
      params.type,
      params.amount,
      params.category,
      params.payment_method,
      params.memo,
      params.day_of_month,
      sort_order
    ]
  );
  return { id, ...params, is_active: true, sort_order };
}

export function updateRecurringRule(
  id: string,
  params: {
    type: TransactionType;
    amount: number;
    category: string;
    payment_method: string;
    memo: string | null;
    day_of_month: number;
    is_active: boolean;
  }
): void {
  const db = getDB();
  db.executeSync(
    `UPDATE recurring_rules SET type=?, amount=?, category=?, payment_method=?, memo=?, day_of_month=?, is_active=? WHERE id=?`,
    [
      params.type,
      params.amount,
      params.category,
      params.payment_method,
      params.memo,
      params.day_of_month,
      params.is_active ? 1 : 0,
      id
    ]
  );
}

export function deleteRecurringRule(id: string): void {
  const db = getDB();
  db.executeSync("DELETE FROM recurring_rules WHERE id = ?", [id]);
}

export function getRecurringRules(ledgerId: string): RecurringRule[] {
  const db = getDB();
  const result = db.executeSync(
    "SELECT * FROM recurring_rules WHERE ledger_id = ? ORDER BY sort_order ASC, day_of_month ASC",
    [ledgerId]
  );
  return ((result.rows ?? []) as Array<Omit<RecurringRule, "is_active"> & { is_active: number }>).map(row => ({
    ...row,
    is_active: row.is_active === 1
  }));
}

export function reorderRecurringRules(orderedIds: string[]): void {
  const db = getDB();
  for (let i = 0; i < orderedIds.length; i++) {
    db.executeSync("UPDATE recurring_rules SET sort_order = ? WHERE id = ?", [i, orderedIds[i]]);
  }
}

export function processRecurringRules(ledgerId: string, lastCheck: string, today: string): number {
  const db = getDB();
  const rules = getRecurringRules(ledgerId).filter(r => r.is_active);
  let created = 0;
  const startDate = dayjs(lastCheck).add(1, "day");
  const endDate = dayjs(today);
  for (const rule of rules) {
    let current = startDate.startOf("month");
    while (current.isBefore(endDate) || current.isSame(endDate, "month")) {
      const daysInMonth = current.daysInMonth();
      const day = Math.min(rule.day_of_month, daysInMonth);
      const targetDate = current.date(day).format("YYYY-MM-DD");
      if (targetDate > lastCheck && targetDate <= today) {
        const existing = db.executeSync(
          `SELECT id FROM transactions WHERE ledger_id = ? AND date = ? AND category = ? AND amount = ? AND type = ? LIMIT 1`,
          [ledgerId, targetDate, rule.category, rule.amount, rule.type]
        );
        if ((existing.rows?.length ?? 0) === 0) {
          const id = uuid.v4() as string;
          db.executeSync(
            `INSERT INTO transactions (id, ledger_id, type, amount, category, payment_method, memo, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              ledgerId,
              rule.type,
              rule.amount,
              rule.category,
              rule.payment_method,
              rule.memo,
              targetDate,
              Date.now()
            ]
          );
          created++;
        }
      }
      current = current.add(1, "month");
    }
  }
  return created;
}
