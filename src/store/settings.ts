import { createMMKV } from "react-native-mmkv";
import type { ThemeMode } from "../types";

export const storage = createMMKV();

const KEYS = {
  CURRENT_LEDGER_ID: "current_ledger_id",
  THEME_MODE: "theme_mode",
  CATEGORIES: "categories",
  PAYMENT_METHODS: "payment_methods",
  LAST_RECURRING_CHECK: "last_recurring_check"
} as const;

const DEFAULT_CATEGORIES = [
  "식비",
  "교통비",
  "주거비",
  "통신비",
  "의료비",
  "문화생활",
  "쇼핑",
  "교육",
  "경조사",
  "기타지출",
  "월급",
  "부수입",
  "용돈",
  "기타수입"
];

const DEFAULT_PAYMENT_METHODS = ["현금", "카드", "계좌이체"];

export function getCurrentLedgerId(): string | undefined {
  return storage.getString(KEYS.CURRENT_LEDGER_ID);
}
export function setCurrentLedgerId(id: string): void {
  storage.set(KEYS.CURRENT_LEDGER_ID, id);
}
export function getThemeMode(): ThemeMode {
  return (storage.getString(KEYS.THEME_MODE) as ThemeMode) ?? "system";
}
export function setThemeMode(mode: ThemeMode): void {
  storage.set(KEYS.THEME_MODE, mode);
}
export function getCategories(): string[] {
  const raw = storage.getString(KEYS.CATEGORIES);
  if (!raw) {
    storage.set(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(raw);
}
export function setCategories(categories: string[]): void {
  storage.set(KEYS.CATEGORIES, JSON.stringify(categories));
}
export function getPaymentMethods(): string[] {
  const raw = storage.getString(KEYS.PAYMENT_METHODS);
  if (!raw) {
    storage.set(KEYS.PAYMENT_METHODS, JSON.stringify(DEFAULT_PAYMENT_METHODS));
    return DEFAULT_PAYMENT_METHODS;
  }
  return JSON.parse(raw);
}
export function setPaymentMethods(methods: string[]): void {
  storage.set(KEYS.PAYMENT_METHODS, JSON.stringify(methods));
}
export function getLastRecurringCheck(): string | undefined {
  return storage.getString(KEYS.LAST_RECURRING_CHECK);
}
export function setLastRecurringCheck(date: string): void {
  storage.set(KEYS.LAST_RECURRING_CHECK, date);
}
