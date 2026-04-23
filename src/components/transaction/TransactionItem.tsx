import React, {useCallback, useRef} from 'react';
import {View, Text, TouchableOpacity, Animated, StyleSheet, Alert} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {useTheme} from '../../styles/theme';
import {formatAmount} from '../../utils/format';
import type {Transaction} from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionItem({
  transaction,
  onPress,
  onDelete,
}: TransactionItemProps): React.JSX.Element {
  const theme = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const amountPrefix = transaction.type === 'income' ? '+' : '\u2212';
  const amountColor = transaction.type === 'income' ? theme.mute1 : theme.ink;

  const handleDelete = useCallback(() => {
    Alert.alert('거래 삭제', '이 거래를 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel', onPress: () => swipeableRef.current?.close()},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => onDelete(transaction),
      },
    ]);
  }, [onDelete, transaction]);

  const renderRightActions = useCallback(
    (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [1, 0.5],
        extrapolate: 'clamp',
      });
      return (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Animated.Text style={[styles.deleteText, {transform: [{scale}]}]}>
            {'\u2715'}
          </Animated.Text>
        </TouchableOpacity>
      );
    },
    [handleDelete],
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={[styles.container, {backgroundColor: theme.card, borderBottomColor: theme.rule}]}
        onPress={() => onPress(transaction)}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          <Text style={[styles.category, {color: theme.ink}]}>
            {transaction.category}
          </Text>
          {transaction.memo ? (
            <Text style={[styles.memo, {color: theme.mute1}]} numberOfLines={1}>
              {transaction.memo}
            </Text>
          ) : null}
          <Text style={[styles.method, {color: theme.mute2}]}>
            {transaction.payment_method}
          </Text>
        </View>
        <Text style={[styles.amount, {color: amountColor}]}>
          {amountPrefix}{formatAmount(transaction.amount)}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  left: {flex: 1, marginRight: 12},
  category: {fontSize: 15, fontWeight: '700', marginBottom: 2},
  memo: {fontSize: 13, marginBottom: 2},
  method: {fontSize: 11, fontWeight: '600', letterSpacing: 0.5},
  amount: {fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums']},
  deleteAction: {
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
