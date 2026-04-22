import {transactionsToCsv, csvToTransactions} from '../../src/utils/csv';
import type {Transaction} from '../../src/types';

const sampleTransactions: Transaction[] = [
  { id: '1', ledger_id: 'L1', type: 'expense', amount: 45000, category: '식비', payment_method: '카드', memo: '점심 회식', date: '2026-04-22', created_at: 0 },
  { id: '2', ledger_id: 'L1', type: 'income', amount: 3200000, category: '월급', payment_method: '계좌이체', memo: '4월 급여', date: '2026-04-09', created_at: 0 },
];

describe('transactionsToCsv', () => {
  it('generates CSV with correct headers', () => {
    const csv = transactionsToCsv(sampleTransactions);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('날짜,유형,금액,카테고리,결제수단,메모');
    expect(lines[1]).toBe('2026-04-22,지출,45000,식비,카드,점심 회식');
    expect(lines[2]).toBe('2026-04-09,수입,3200000,월급,계좌이체,4월 급여');
  });
});

describe('csvToTransactions', () => {
  it('parses CSV back to transaction data', () => {
    const csv = '날짜,유형,금액,카테고리,결제수단,메모\n2026-04-22,지출,45000,식비,카드,점심 회식';
    const result = csvToTransactions(csv);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-04-22');
    expect(result[0].type).toBe('expense');
    expect(result[0].amount).toBe(45000);
    expect(result[0].category).toBe('식비');
    expect(result[0].payment_method).toBe('카드');
    expect(result[0].memo).toBe('점심 회식');
  });
});
