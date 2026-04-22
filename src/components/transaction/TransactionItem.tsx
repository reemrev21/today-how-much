import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../../styles/theme';
import {formatAmount} from '../../utils/format';
import type {Transaction} from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
  onLongPress: (transaction: Transaction) => void;
}

export function TransactionItem({
  transaction,
  onPress,
  onLongPress,
}: TransactionItemProps): React.JSX.Element {
  const theme = useTheme();
  const amountColor =
    transaction.type === 'income' ? theme.income : theme.expense;
  const amountPrefix = transaction.type === 'income' ? '+' : '-';

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: theme.card, borderBottomColor: theme.border}]}
      onPress={() => onPress(transaction)}
      onLongPress={() => onLongPress(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={[styles.category, {color: theme.text}]}>
          {transaction.category}
        </Text>
        {transaction.memo ? (
          <Text style={[styles.memo, {color: theme.textSecondary}]} numberOfLines={1}>
            {transaction.memo}
          </Text>
        ) : null}
        <Text style={[styles.method, {color: theme.textSecondary}]}>
          {transaction.payment_method}
        </Text>
      </View>
      <Text style={[styles.amount, {color: amountColor}]}>
        {amountPrefix}
        {formatAmount(transaction.amount)}원
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {flex: 1, marginRight: 12},
  category: {fontSize: 15, fontWeight: '600', marginBottom: 2},
  memo: {fontSize: 13, marginBottom: 2},
  method: {fontSize: 12},
  amount: {fontSize: 16, fontWeight: '700'},
});
