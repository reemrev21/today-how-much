import React, {useCallback, useRef, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAtom, useAtomValue} from 'jotai';
import dayjs from 'dayjs';
import BottomSheet, {BottomSheetView, BottomSheetBackdrop} from '@gorhom/bottom-sheet';

import {useTheme} from '../styles/theme';
import {selectedMonthAtom, selectedDateAtom, dbVersionAtom} from '../store/atoms';
import {getCurrentLedgerId} from '../store/settings';
import {getMonthDaySummaries, getMonthTotals} from '../db/transactionQueries';
import {useTransactions} from '../hooks/useTransactions';

import {MonthHeader} from '../components/calendar/MonthHeader';
import {CalendarGrid} from '../components/calendar/CalendarGrid';
import {LedgerSelector} from '../components/common/LedgerSelector';
import {TransactionList} from '../components/transaction/TransactionList';
import {TransactionForm} from '../components/transaction/TransactionForm';

import {formatAmount} from '../utils/format';
import type {Transaction} from '../types';

export function CalendarScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [yearMonth, setYearMonth] = useAtom(selectedMonthAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const dbVersion = useAtomValue(dbVersionAtom);
  const {update} = useTransactions();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const ledgerId = getCurrentLedgerId() ?? '';

  // Re-derive summaries whenever month or db changes
  const summaries = React.useMemo(() => {
    if (!ledgerId) {return [];}
    return getMonthDaySummaries(ledgerId, yearMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, yearMonth, dbVersion]);

  const monthTotals = React.useMemo(() => {
    if (!ledgerId) {return {income: 0, expense: 0};}
    return getMonthTotals(ledgerId, yearMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, yearMonth, dbVersion]);

  const todayStr = dayjs().format('YYYY-MM-DD');
  const todaySummary = React.useMemo(() => {
    return summaries.find(s => s.date === todayStr);
  }, [summaries, todayStr]);

  const handlePrev = useCallback(() => {
    setYearMonth(prev => dayjs(`${prev}-01`).subtract(1, 'month').format('YYYY-MM'));
    setSelectedDate(null);
  }, [setYearMonth, setSelectedDate]);

  const handleNext = useCallback(() => {
    setYearMonth(prev => dayjs(`${prev}-01`).add(1, 'month').format('YYYY-MM'));
    setSelectedDate(null);
  }, [setYearMonth, setSelectedDate]);

  const handleDayPress = useCallback(
    (date: string) => {
      setSelectedDate(prev => (prev === date ? null : date));
    },
    [setSelectedDate],
  );

  const handleEdit = useCallback(
    (transaction: Transaction) => {
      setEditingTransaction(transaction);
      bottomSheetRef.current?.expand();
    },
    [],
  );

  const handleSave = useCallback(
    (params: Omit<Transaction, 'id' | 'created_at'>) => {
      if (editingTransaction) {
        update(editingTransaction.id, {
          type: params.type,
          amount: params.amount,
          category: params.category,
          payment_method: params.payment_method,
          memo: params.memo,
          date: params.date,
        });
      }
      setEditingTransaction(undefined);
      bottomSheetRef.current?.close();
    },
    [editingTransaction, update],
  );

  const handleCancel = useCallback(() => {
    setEditingTransaction(undefined);
    bottomSheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background, paddingTop: insets.top}]}>
      {/* Top bar: Ledger selector */}
      <View style={[styles.topBar, {borderBottomColor: theme.border}]}>
        <Text style={[styles.appName, {color: theme.text}]}>오늘얼마</Text>
        <LedgerSelector />
      </View>

      {/* Today + Month summary */}
      <View style={[styles.summaryCard, {backgroundColor: theme.surface}]}>
        <View style={styles.summaryCol}>
          <Text style={[styles.summaryLabel, {color: theme.textSecondary}]}>오늘 지출</Text>
          <Text style={[styles.summaryValue, {color: theme.expense}]}>
            {todaySummary?.expense ? formatAmount(todaySummary.expense) : '0'}
          </Text>
        </View>
        <View style={[styles.summaryVertDivider, {backgroundColor: theme.border}]} />
        <View style={styles.summaryCol}>
          <Text style={[styles.summaryLabel, {color: theme.textSecondary}]}>
            {dayjs(`${yearMonth}-01`).format('M월')} 지출
          </Text>
          <Text style={[styles.summaryValue, {color: theme.expense}]}>
            {monthTotals.expense ? formatAmount(monthTotals.expense) : '0'}
          </Text>
        </View>
        <View style={[styles.summaryVertDivider, {backgroundColor: theme.border}]} />
        <View style={styles.summaryCol}>
          <Text style={[styles.summaryLabel, {color: theme.textSecondary}]}>
            {dayjs(`${yearMonth}-01`).format('M월')} 수입
          </Text>
          <Text style={[styles.summaryValue, {color: theme.income}]}>
            {monthTotals.income ? formatAmount(monthTotals.income) : '0'}
          </Text>
        </View>
      </View>

      {/* Month navigation */}
      <MonthHeader yearMonth={yearMonth} onPrev={handlePrev} onNext={handleNext} />

      {/* Calendar grid */}
      <CalendarGrid
        yearMonth={yearMonth}
        selectedDate={selectedDate}
        summaries={summaries}
        onDayPress={handleDayPress}
      />

      {/* Transaction list for selected date */}
      {selectedDate ? (
        <View style={[styles.listContainer, {borderTopColor: theme.border}]}>
          <Text style={[styles.dateLabel, {color: theme.textSecondary}]}>
            {dayjs(selectedDate).format('M월 D일 (ddd)')}
          </Text>
          <TransactionList
            ledgerId={ledgerId}
            date={selectedDate}
            onEdit={handleEdit}
          />
        </View>
      ) : null}

      {/* Edit transaction bottom sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['85%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{backgroundColor: theme.surface}}
        handleIndicatorStyle={{backgroundColor: theme.textSecondary}}
        onClose={handleCancel}
      >
        <BottomSheetView style={styles.sheetContent}>
          <TransactionForm
            ledgerId={ledgerId}
            initialDate={selectedDate ?? undefined}
            editTransaction={editingTransaction}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appName: {fontSize: 18, fontWeight: '700'},
  summaryCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 14,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {fontSize: 11, fontWeight: '500'},
  summaryValue: {fontSize: 15, fontWeight: '700'},
  summaryVertDivider: {width: StyleSheet.hairlineWidth, marginHorizontal: 4},
  listContainer: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sheetContent: {flex: 1},
});
