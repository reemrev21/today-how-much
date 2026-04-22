import Papa from 'papaparse';
import type {Transaction, TransactionType} from '../types';

const TYPE_MAP: Record<string, TransactionType> = { '수입': 'income', '지출': 'expense' };
const TYPE_MAP_REVERSE: Record<TransactionType, string> = { income: '수입', expense: '지출' };

interface CsvRow {
  date: string; type: TransactionType; amount: number;
  category: string; payment_method: string; memo: string | null;
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const rows = transactions.map(t => ({
    '날짜': t.date, '유형': TYPE_MAP_REVERSE[t.type], '금액': t.amount,
    '카테고리': t.category, '결제수단': t.payment_method, '메모': t.memo ?? '',
  }));
  return Papa.unparse(rows, {newline: '\n'});
}

export function csvToTransactions(csvString: string): CsvRow[] {
  const parsed = Papa.parse<Record<string, string>>(csvString, { header: true, skipEmptyLines: true });
  return parsed.data.map(row => ({
    date: row['날짜'], type: TYPE_MAP[row['유형']] ?? 'expense',
    amount: parseInt(row['금액'], 10), category: row['카테고리'],
    payment_method: row['결제수단'], memo: row['메모'] || null,
  }));
}
