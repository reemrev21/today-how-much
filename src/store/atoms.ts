import { atom } from "jotai";
import dayjs from "dayjs";
import type { TransactionFilter } from "../types";

export const selectedMonthAtom = atom(dayjs().format("YYYY-MM"));
export const selectedDateAtom = atom<string | null>(null);
export const historyFilterAtom = atom<TransactionFilter>({});
export const statsPeriodAtom = atom<"monthly" | "yearly">("monthly");
export const dbVersionAtom = atom(0);
