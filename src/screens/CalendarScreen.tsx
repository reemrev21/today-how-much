import React, { useCallback, useRef, useState } from "react";
import { View, Text, StyleSheet, Keyboard } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { useAtom, useAtomValue } from "jotai";
import dayjs from "dayjs";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

import { useTheme } from "../styles/theme";
import { selectedMonthAtom, selectedDateAtom, dbVersionAtom } from "../store/atoms";
import { getCurrentLedgerId } from "../store/settings";
import { getMonthDaySummaries, getMonthTotals } from "../db/transactionQueries";
import { useTransactions } from "../hooks/useTransactions";

import { MonthHeader } from "../components/calendar/MonthHeader";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { LedgerSelector } from "../components/common/LedgerSelector";
import { TransactionList } from "../components/transaction/TransactionList";
import { TransactionForm } from "../components/transaction/TransactionForm";

import { formatAmount } from "../utils/format";
import type { Transaction } from "../types";

export function CalendarScreen(): React.JSX.Element {
  const theme = useTheme();

  const [yearMonth, setYearMonth] = useAtom(selectedMonthAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const dbVersion = useAtomValue(dbVersionAtom);
  const { add, update, remove } = useTransactions();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [formDate, setFormDate] = useState<string | undefined>();
  const listSheetRef = useRef<BottomSheet>(null);
  const editSheetRef = useRef<BottomSheet>(null);

  const ledgerId = getCurrentLedgerId() ?? "";

  const summaries = React.useMemo(() => {
    if (!ledgerId) {
      return [];
    }
    return getMonthDaySummaries(ledgerId, yearMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, yearMonth, dbVersion]);

  const monthTotals = React.useMemo(() => {
    if (!ledgerId) {
      return { income: 0, expense: 0 };
    }
    return getMonthTotals(ledgerId, yearMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, yearMonth, dbVersion]);

  const thisMonth = dayjs().format("YYYY-MM");

  // Hero always shows THIS month, not the selected month
  const thisMonthTotals = React.useMemo(() => {
    if (!ledgerId) {
      return { income: 0, expense: 0 };
    }
    return getMonthTotals(ledgerId, thisMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, thisMonth, dbVersion]);

  const todayStr = dayjs().format("YYYY-MM-DD");
  const todaySummary = React.useMemo(() => {
    // If viewing this month, use summaries; otherwise query directly
    if (yearMonth === thisMonth) {
      return summaries.find(s => s.date === todayStr);
    }
    const daySummaries = getMonthDaySummaries(ledgerId, thisMonth);
    return daySummaries.find(s => s.date === todayStr);
  }, [summaries, todayStr, yearMonth, thisMonth, ledgerId]);

  const todayExpense = todaySummary?.expense ?? 0;

  const handlePrev = useCallback(() => {
    setYearMonth(prev => dayjs(`${prev}-01`).subtract(1, "month").format("YYYY-MM"));
    setSelectedDate(null);
  }, [setYearMonth, setSelectedDate]);

  const handleNext = useCallback(() => {
    setYearMonth(prev => dayjs(`${prev}-01`).add(1, "month").format("YYYY-MM"));
    setSelectedDate(null);
  }, [setYearMonth, setSelectedDate]);

  const handleDayPress = useCallback(
    (date: string) => {
      if (selectedDate === date) {
        setSelectedDate(null);
        listSheetRef.current?.close();
      } else {
        setSelectedDate(date);
        listSheetRef.current?.snapToIndex(0);
      }
    },
    [selectedDate, setSelectedDate]
  );

  const handleAddForDate = useCallback(() => {
    if (!selectedDate) {
      return;
    }
    setEditingTransaction(undefined);
    setFormDate(selectedDate);
    listSheetRef.current?.close();
    setTimeout(() => editSheetRef.current?.expand(), 200);
  }, [selectedDate]);

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    listSheetRef.current?.close();
    setTimeout(() => editSheetRef.current?.expand(), 300);
  }, []);

  const handleSave = useCallback(
    (params: Omit<Transaction, "id" | "created_at">) => {
      Keyboard.dismiss();
      if (editingTransaction) {
        update(editingTransaction.id, {
          type: params.type,
          amount: params.amount,
          category: params.category,
          payment_method: params.payment_method,
          memo: params.memo,
          date: params.date
        });
      } else {
        add(params);
      }
      setEditingTransaction(undefined);
      setFormDate(undefined);
      editSheetRef.current?.close();
    },
    [editingTransaction, update, add]
  );

  const handleCancel = useCallback(() => {
    Keyboard.dismiss();
    setEditingTransaction(undefined);
    editSheetRef.current?.close();
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      remove(id);
      setEditingTransaction(undefined);
      editSheetRef.current?.close();
    },
    [remove]
  );

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const todayDay = dayjs();
  const heroDateStr = todayDay.format("MM.DD");
  const heroDayName = ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"][todayDay.day()];

  return (
    <View style={[styles.container, { backgroundColor: theme.paper }]}>
      {/* === BrutHeader === */}
      <View style={[styles.header, { borderBottomColor: theme.ink }]}>
        <Text style={[styles.appTitle, { color: theme.ink }]}>{"\uC624\uB298\uC5BC\uB9C8"}</Text>
        <LedgerSelector />
      </View>

      {/* === BrutTodayHero — black block === */}
      <View style={[styles.hero, { backgroundColor: theme.ink }]}>
        {/* Top row: today */}
        <View style={styles.heroRow}>
          <View style={styles.heroLabelRow}>
            <View style={[styles.heroSquare, { backgroundColor: theme.card }]} />
            <Text style={[styles.heroEyebrowText, { color: theme.mute2 }]}>
              {"\uC624\uB298 \u00B7 "}
              {heroDateStr} {heroDayName}
            </Text>
          </View>
          <Text style={[styles.heroAmount, { color: theme.card }]}>
            {todayExpense > 0 ? `\u2212${formatAmount(todayExpense)}` : "0"}
          </Text>
        </View>
        {/* Divider */}
        <View style={[styles.heroDivider, { backgroundColor: theme.hair }]} />
        {/* Bottom row: month total */}
        <View style={styles.heroRow}>
          <Text style={[styles.heroEyebrowText, { color: theme.mute2 }]}>
            {dayjs(`${thisMonth}-01`).format("M")}
            {"\uC6D4 \uD569\uACC4"}
          </Text>
          <View style={styles.heroMonthTotals}>
            <Text style={[styles.heroMonthValue, { color: theme.mute2 }]}>+{formatAmount(thisMonthTotals.income)}</Text>
            <Text style={[styles.heroMonthValue, { color: theme.card }]}>
              {"\u2212"}
              {formatAmount(thisMonthTotals.expense)}
            </Text>
          </View>
        </View>
      </View>

      {/* === BrutMonthBar === */}
      <MonthHeader
        yearMonth={yearMonth}
        onPrev={handlePrev}
        onNext={handleNext}
        monthIncome={monthTotals.income}
        monthExpense={monthTotals.expense}
      />

      {/* === Calendar grid === */}
      <CalendarGrid
        yearMonth={yearMonth}
        selectedDate={selectedDate}
        summaries={summaries}
        onDayPress={handleDayPress}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* Transaction list bottom sheet */}
      <BottomSheet
        ref={listSheetRef}
        index={-1}
        snapPoints={["35%", "60%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.mute2 }}
        onClose={() => setSelectedDate(null)}
      >
        <BottomSheetView style={styles.sheetContent}>
          {selectedDate && (
            <>
              <View style={styles.sheetHeader}>
                <Text style={[styles.dateLabel, { color: theme.ink }]}>
                  {dayjs(selectedDate).format("MM.DD")}{" "}
                  {["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"][dayjs(selectedDate).day()]}
                </Text>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: theme.ink }]}
                  onPress={handleAddForDate}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.addBtnText, { color: theme.card }]}>+ 추가</Text>
                </TouchableOpacity>
              </View>
              <TransactionList ledgerId={ledgerId} date={selectedDate} onEdit={handleEdit} />
            </>
          )}
        </BottomSheetView>
      </BottomSheet>

      {/* Edit transaction bottom sheet */}
      <BottomSheet
        ref={editSheetRef}
        index={-1}
        snapPoints={["85%"]}
        enablePanDownToClose
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.mute2 }}
        onClose={handleCancel}
      >
        <TransactionForm
          ledgerId={ledgerId}
          initialDate={formDate ?? selectedDate ?? undefined}
          editTransaction={editingTransaction}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // BrutHeader
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.88
  },

  // BrutTodayHero
  hero: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  heroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  heroSquare: {
    width: 6,
    height: 6
  },
  heroEyebrowText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1.4,
    fontVariant: ["tabular-nums"]
  },
  heroDivider: {
    height: 1
  },
  heroMonthTotals: {
    flexDirection: "row",
    gap: 12
  },
  heroMonthValue: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"]
  },

  // BottomSheet
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.28,
    fontVariant: ["tabular-nums"]
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "800"
  },
  sheetContent: { flex: 1 }
});
