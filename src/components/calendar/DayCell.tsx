import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../../styles/theme';
import {formatAmount} from '../../utils/format';
import type {DaySummary} from '../../types';

interface DayCellProps {
  date: string; // "YYYY-MM-DD"
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  summary: DaySummary | undefined;
  onPress: (date: string) => void;
}

export function DayCell({
  date,
  dayNumber,
  isCurrentMonth,
  isToday,
  isSelected,
  summary,
  onPress,
}: DayCellProps): React.JSX.Element {
  const theme = useTheme();

  const dayNumColor = isSelected
    ? theme.fabText
    : isCurrentMonth
    ? theme.text
    : theme.textSecondary;

  return (
    <TouchableOpacity
      style={[styles.cell, isSelected && {backgroundColor: theme.primary}]}
      onPress={() => onPress(date)}
      activeOpacity={0.7}
    >
      {/* Today indicator ring */}
      <View style={[styles.dayNumWrapper, isToday && !isSelected && {borderColor: theme.primary, borderWidth: 1.5, borderRadius: 12}]}>
        <Text style={[styles.dayNum, {color: dayNumColor}, !isCurrentMonth && styles.faded]}>
          {dayNumber}
        </Text>
      </View>

      {/* Income amount */}
      {summary && summary.income > 0 ? (
        <Text style={[styles.amount, {color: isSelected ? theme.fabText : theme.income}]} numberOfLines={1}>
          {formatAmount(summary.income)}
        </Text>
      ) : (
        <View style={styles.amountPlaceholder} />
      )}

      {/* Expense amount */}
      {summary && summary.expense > 0 ? (
        <Text style={[styles.amount, {color: isSelected ? theme.fabText : theme.expense}]} numberOfLines={1}>
          {formatAmount(summary.expense)}
        </Text>
      ) : (
        <View style={styles.amountPlaceholder} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 1,
    minHeight: 64,
    borderRadius: 6,
  },
  dayNumWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '600',
  },
  faded: {
    opacity: 0.35,
  },
  amount: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },
  amountPlaceholder: {
    height: 12,
  },
});
