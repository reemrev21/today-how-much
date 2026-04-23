import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../../styles/theme';
import {formatAmount} from '../../utils/format';

interface MonthHeaderProps {
  yearMonth: string; // "YYYY-MM"
  onPrev: () => void;
  onNext: () => void;
  monthIncome?: number;
  monthExpense?: number;
}

export function MonthHeader({
  yearMonth,
  onPrev,
  onNext,
  monthIncome = 0,
  monthExpense = 0,
}: MonthHeaderProps): React.JSX.Element {
  const theme = useTheme();
  const label = yearMonth.replace('-', '.');

  return (
    <View style={[styles.container, {borderTopColor: theme.ink, borderBottomColor: theme.ink}]}>
      {/* Top row: nav */}
      <View style={[styles.navRow, {borderBottomColor: theme.ink}]}>
        <TouchableOpacity onPress={onPrev} style={styles.navBtn} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={[styles.arrow, {color: theme.ink}]}>{'\u25C0'}</Text>
        </TouchableOpacity>
        <Text style={[styles.monthLabel, {color: theme.ink}]}>{label}</Text>
        <TouchableOpacity onPress={onNext} style={styles.navBtn} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={[styles.arrow, {color: theme.ink}]}>{'\u25B6'}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom row: income / expense totals */}
      <View style={styles.totalsRow}>
        <View style={styles.totalCol}>
          <Text style={[styles.totalLabel, {color: theme.mute1}]}>수입</Text>
          <Text style={[styles.totalValue, {color: theme.mute1}]}>
            +{formatAmount(monthIncome)}
          </Text>
        </View>
        <View style={[styles.totalDivider, {backgroundColor: theme.ink}]} />
        <View style={styles.totalCol}>
          <Text style={[styles.totalLabel, {color: theme.mute1}]}>지출</Text>
          <Text style={[styles.totalValue, {color: theme.ink}]}>
            {'\u2212'}{formatAmount(monthExpense)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  arrow: {
    fontSize: 14,
    fontWeight: '600',
  },
  monthLabel: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.7,
    fontVariant: ['tabular-nums'],
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  totalCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.34,
    fontVariant: ['tabular-nums'],
  },
  totalDivider: {
    width: 1,
    height: '60%',
  },
});
