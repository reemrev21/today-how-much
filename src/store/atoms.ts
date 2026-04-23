import { atom } from "jotai";
import dayjs from "dayjs";
import type { TransactionFilter, ThemeMode } from "../types";
import { getThemeMode, getHideIncome } from "./settings";

export const selectedMonthAtom = atom(dayjs().format("YYYY-MM"));
export const selectedDateAtom = atom<string | null>(null);
export const historyFilterAtom = atom<TransactionFilter>({});
export const statsPeriodAtom = atom<"monthly" | "yearly">("monthly");
export const dbVersionAtom = atom(0);
export const themeModeAtom = atom<ThemeMode>(getThemeMode());
export const hideIncomeAtom = atom<boolean>(getHideIncome());
