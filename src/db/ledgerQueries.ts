import uuid from "react-native-uuid";
import { getDB } from "./connection";
import type { Ledger } from "../types";

export function createLedger(name: string): Ledger {
  const db = getDB();
  const id = uuid.v4() as string;
  const created_at = Date.now();
  db.executeSync("INSERT INTO ledgers (id, name, created_at) VALUES (?, ?, ?)", [id, name, created_at]);
  return { id, name, created_at };
}

export function getAllLedgers(): Ledger[] {
  const db = getDB();
  const result = db.executeSync("SELECT * FROM ledgers ORDER BY created_at ASC");
  return (result.rows ?? []) as Ledger[];
}

export function renameLedger(id: string, name: string): void {
  const db = getDB();
  db.executeSync("UPDATE ledgers SET name = ? WHERE id = ?", [name, id]);
}

export function deleteLedger(id: string): void {
  const db = getDB();
  db.executeSync("DELETE FROM ledgers WHERE id = ?", [id]);
}
