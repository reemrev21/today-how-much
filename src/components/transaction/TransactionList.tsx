import React, {useCallback} from 'react';
import {View, Text, Alert, FlatList, StyleSheet} from 'react-native';
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

  // Re-read whenever dbVersion changes
  const transactions = React.useMemo(() => {
    if (!ledgerId || !date) {return [];}
    return getTransactionsByDate(ledgerId, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, date, dbVersion]);

  const handleLongPress = useCallback(
    (transaction: Transaction) => {
      Alert.alert('거래 삭제', '이 거래를 삭제하시겠습니까?', [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => remove(transaction.id),
        },
      ]);
    },
    [remove],
  );

  const handlePress = useCallback(
    (transaction: Transaction) => {
      onEdit?.(transaction);
    },
    [onEdit],
  );

  const renderItem = useCallback(
    ({item}: {item: Transaction}) => (
      <TransactionItem
        transaction={item}
        onPress={handlePress}
        onLongPress={handleLongPress}
      />
    ),
    [handlePress, handleLongPress],
  );

  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
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
      style={[styles.list, {backgroundColor: theme.background}]}
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
