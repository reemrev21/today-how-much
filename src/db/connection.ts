import { open, type DB } from "@op-engineering/op-sqlite";

let db: DB | null = null;

export function getDB(): DB {
  if (!db) {
    db = open({ name: "accountbook.db" });
  }
  return db;
}

export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
  }
}
