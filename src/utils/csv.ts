import Papa from "papaparse";
import type { Transaction, RecurringRule, TransactionType } from "../types";

const TYPE_MAP: Record<string, TransactionType> = { 수입: "income", 지출: "expense" };
const TYPE_MAP_REVERSE: Record<TransactionType, string> = { income: "수입", expense: "지출" };

const RECURRING_SECTION_MARKER = "[반복거래]";

export interface CsvRow {
  date: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
}

export interface CsvRecurringRow {
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  day_of_month: number;
  is_active: boolean;
}

export interface ParsedCsv {
  transactions: CsvRow[];
  recurringRules: CsvRecurringRow[];
}

function transactionsToCsv(transactions: Transaction[]): string {
  const rows = transactions.map(t => ({
    날짜: t.date,
    유형: TYPE_MAP_REVERSE[t.type],
    금액: t.amount,
    카테고리: t.category,
    결제수단: t.payment_method,
    메모: t.memo ?? ""
  }));
  return Papa.unparse(rows, { newline: "\n" });
}

function recurringRulesToCsv(rules: RecurringRule[]): string {
  const rows = rules.map(r => ({
    유형: TYPE_MAP_REVERSE[r.type],
    금액: r.amount,
    카테고리: r.category,
    결제수단: r.payment_method,
    메모: r.memo ?? "",
    반복일: r.day_of_month,
    활성: r.is_active ? "Y" : "N"
  }));
  return Papa.unparse(rows, { newline: "\n" });
}

export function buildExportCsv(transactions: Transaction[], rules: RecurringRule[]): string {
  let csv = transactionsToCsv(transactions);
  if (rules.length > 0) {
    csv += "\n\n" + RECURRING_SECTION_MARKER + "\n" + recurringRulesToCsv(rules);
  }
  return csv;
}

export function parseCsv(csvString: string): ParsedCsv {
  const markerIdx = csvString.indexOf(RECURRING_SECTION_MARKER);

  const txSection = markerIdx === -1 ? csvString : csvString.slice(0, markerIdx);
  const parsed = Papa.parse<Record<string, string>>(txSection, { header: true, skipEmptyLines: true });
  const transactions: CsvRow[] = parsed.data
    .filter(row => row["날짜"])
    .map(row => ({
      date: row["날짜"],
      type: TYPE_MAP[row["유형"]] ?? "expense",
      amount: parseInt(row["금액"], 10),
      category: row["카테고리"],
      payment_method: row["결제수단"],
      memo: row["메모"] || null
    }));

  let recurringRules: CsvRecurringRow[] = [];
  if (markerIdx !== -1) {
    const rrSection = csvString.slice(markerIdx + RECURRING_SECTION_MARKER.length);
    const rrParsed = Papa.parse<Record<string, string>>(rrSection, { header: true, skipEmptyLines: true });
    recurringRules = rrParsed.data
      .filter(row => row["금액"])
      .map(row => ({
        type: TYPE_MAP[row["유형"]] ?? "expense",
        amount: parseInt(row["금액"], 10),
        category: row["카테고리"],
        payment_method: row["결제수단"],
        memo: row["메모"] || null,
        day_of_month: parseInt(row["반복일"], 10),
        is_active: row["활성"] !== "N"
      }));
  }

  return { transactions, recurringRules };
}

export function buildTemplateCsv(): string {
  const txHeader = "날짜,유형,금액,카테고리,결제수단,메모";
  const txExample = "2025-01-15,지출,12000,식비,카드,점심식사";
  const rrHeader = "유형,금액,카테고리,결제수단,메모,반복일,활성";
  const rrExample = "지출,50000,통신비,계좌이체,휴대폰요금,25,Y";
  return `${txHeader}\n${txExample}\n\n${RECURRING_SECTION_MARKER}\n${rrHeader}\n${rrExample}`;
}

// Legacy exports for backward compatibility
export { transactionsToCsv, recurringRulesToCsv };
export function csvToTransactions(csvString: string): CsvRow[] {
  return parseCsv(csvString).transactions;
}
