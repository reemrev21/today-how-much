import type { TransactionType } from "../types";

export function formatAmount(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatAmountInput(text: string): string {
  const digits = text.replace(/[^0-9]/g, "");
  if (!digits) {
    return "";
  }
  return Number(digits).toLocaleString("ko-KR");
}

export function formatAmountSigned(amount: number, type: TransactionType): string {
  const prefix = type === "income" ? "+" : "\u2212";
  return `${prefix}${formatAmount(amount)}`;
}

/**
 * Compact amount for calendar cells:
 * >= 10000 → "N만" or "N.N만"
 * >= 1000  → "N천"
 * < 1000   → raw number
 */
export function formatShort(amount: number): string {
  if (amount >= 10000) {
    const man = amount / 10000;
    if (Number.isInteger(man)) return `${man}만`;
    return `${Math.floor(man * 10) / 10}만`;
  }
  if (amount >= 1000) {
    return `${Math.floor(amount / 1000)}천`;
  }
  return `${amount}`;
}
