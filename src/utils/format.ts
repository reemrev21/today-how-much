import type {TransactionType} from '../types';

export function formatAmount(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatAmountSigned(amount: number, type: TransactionType): string {
  const prefix = type === 'income' ? '+' : '-';
  return `${prefix}${formatAmount(amount)}`;
}
