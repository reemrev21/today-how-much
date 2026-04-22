import React, {useCallback, useRef, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAtom, useAtomValue} from 'jotai';
import dayjs from 'dayjs';
import BottomSheet, {BottomSheetView, BottomSheetBackdrop} from '@gorhom/bottom-sheet';

import {useTheme} from '../styles/theme';
import {selectedMonthAtom, selectedDateAtom, dbVersionAtom} from '../store/atoms';
import {getCurrentLedgerId} from '../store/settings';
import {getMonthDaySummaries} from '../db/transactionQueries';
import {useTransactions} from '../hooks/useTransactions';

import {MonthHeader} from '../components/calendar/MonthHeader';
import {CalendarGrid} from '../components/calendar/CalendarGrid';
import {LedgerSelector} from '../components/common/LedgerSelector';
import {TransactionList} from '../components/transaction/TransactionList';
import {TransactionForm} from '../components/transaction/TransactionForm';

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
        <Text style={[styles.appName, {color: theme.text}]}>가계부</Text>
        <LedgerSelector />
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
