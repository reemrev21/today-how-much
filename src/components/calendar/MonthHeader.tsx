import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../../styles/theme';

interface MonthHeaderProps {
  yearMonth: string; // "YYYY-MM"
  onPrev: () => void;
  onNext: () => void;
}

export function MonthHeader({yearMonth, onPrev, onNext}: MonthHeaderProps): React.JSX.Element {
  const theme = useTheme();
  const [year, month] = yearMonth.split('-');
  const label = `${year}년 ${parseInt(month, 10)}월`;

  return (
    <View style={[styles.container, {backgroundColor: theme.background, borderBottomColor: theme.border}]}>
      <TouchableOpacity onPress={onPrev} style={styles.btn} hitSlop={styles.hitSlop}>
        <Text style={[styles.arrow, {color: theme.primary}]}>◀</Text>
      </TouchableOpacity>
      <Text style={[styles.label, {color: theme.text}]}>{label}</Text>
      <TouchableOpacity onPress={onNext} style={styles.btn} hitSlop={styles.hitSlop}>
        <Text style={[styles.arrow, {color: theme.primary}]}>▶</Text>
      </TouchableOpacity>
    </View>
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
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
  arrow: {fontSize: 16, fontWeight: '600'},
  label: {fontSize: 18, fontWeight: '700'},
});
