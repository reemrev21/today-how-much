import React, {useCallback} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {useAtomValue} from 'jotai';
import {dbVersionAtom} from '../../store/atoms';
import {getTransactionsByDate} from '../../db/transactionQueries';
import {useTransactions} from '../../hooks/useTransactions';
import {useTheme} from '../../styles/theme';
import {TransactionItem} from './TransactionItem';
import type {Transaction} from '../../types';

interface TransactionListProps {
  ledgerId: string;
  date: string;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({
  ledgerId,
  date,
  onEdit,
}: TransactionListProps): React.JSX.Element {
  const theme = useTheme();
  const dbVersion = useAtomValue(dbVersionAtom);
  const {remove} = useTransactions();

  const transactions = React.useMemo(() => {
    if (!ledgerId || !date) {return [];}
    return getTransactionsByDate(ledgerId, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, date, dbVersion]);

  const handlePress = useCallback(
    (transaction: Transaction) => {
      onEdit?.(transaction);
    },
    [onEdit],
  );

  const handleDelete = useCallback(
    (transaction: Transaction) => {
      remove(transaction.id);
    },
    [remove],
  );

  const renderItem = useCallback(
    ({item}: {item: Transaction}) => (
      <TransactionItem
        transaction={item}
        onPress={handlePress}
        onDelete={handleDelete}
      />
    ),
    [handlePress, handleDelete],
  );

  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, {color: theme.mute2}]}>
          거래 내역이 없습니다
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      style={[styles.list, {backgroundColor: theme.card}]}
    />
  );
}

const styles = StyleSheet.create({
  list: {flex: 1},
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {fontSize: 14},
});
