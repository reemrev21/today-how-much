import { useAtom } from "jotai";
import { useCallback } from "react";
import { dbVersionAtom } from "../store/atoms";
import { createTransaction, updateTransaction, deleteTransaction } from "../db/transactionQueries";
import { getCurrentLedgerId } from "../store/settings";
import type { Transaction, TransactionType } from "../types";

interface AddParams {
  ledger_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  date: string;
}

export function useTransactions() {
  const [, setDbVersion] = useAtom(dbVersionAtom);

  const bump = useCallback(() => {
    setDbVersion(v => v + 1);
  }, [setDbVersion]);

  const add = useCallback(
    (params: AddParams): Transaction => {
      const tx = createTransaction(params);
      bump();
      return tx;
    },
    [bump]
  );

  const update = useCallback(
    (
      id: string,
      params: {
        type: TransactionType;
        amount: number;
        category: string;
        payment_method: string;
        memo: string | null;
        date: string;
      }
    ): void => {
      updateTransaction(id, params);
      bump();
    },
    [bump]
  );

  const remove = useCallback(
    (id: string): void => {
      deleteTransaction(id);
      bump();
    },
    [bump]
  );

  const getLedgerId = useCallback((): string => {
    return getCurrentLedgerId() ?? "";
  }, []);

  return { add, update, remove, getLedgerId };
}
