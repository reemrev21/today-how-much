import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import dayjs from 'dayjs';
import {useTheme} from '../../styles/theme';
import {getCalendarDays} from '../../utils/date';
import {DayCell} from './DayCell';
import type {DaySummary} from '../../types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
  yearMonth: string; // "YYYY-MM"
  selectedDate: string | null;
  summaries: DaySummary[];
  onDayPress: (date: string) => void;
}

export function CalendarGrid({
  yearMonth,
  selectedDate,
  summaries,
  onDayPress,
}: CalendarGridProps): React.JSX.Element {
  const theme = useTheme();
  const today = dayjs().format('YYYY-MM-DD');

  const days = useMemo(() => getCalendarDays(yearMonth), [yearMonth]);

  const summaryMap = useMemo(() => {
    const map: Record<string, DaySummary> = {};
    for (const s of summaries) {
      map[s.date] = s;
    }
    return map;
  }, [summaries]);

  // Split 42 days into 6 rows of 7
  const rows = useMemo(() => {
    const result: string[][] = [];
    for (let r = 0; r < 6; r++) {
      result.push(days.slice(r * 7, r * 7 + 7));
    }
    return result;
  }, [days]);

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Weekday headers */}
      <View style={styles.headerRow}>
        {WEEKDAYS.map((wd, idx) => (
          <View key={wd} style={styles.headerCell}>
            <Text
              style={[
                styles.headerText,
                {color: idx === 0 ? theme.expense : idx === 6 ? theme.primary : theme.textSecondary},
              ]}
            >
              {wd}
            </Text>
          </View>
        ))}
      </View>

      {/* Day rows */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={[styles.row, {borderTopColor: theme.border}]}>
          {row.map((date, colIdx) => {
            const d = dayjs(date);
            const isCurrentMonth = d.format('YYYY-MM') === yearMonth;
            return (
              <DayCell
                key={date}
                date={date}
                dayNumber={d.date()}
                isCurrentMonth={isCurrentMonth}
                isToday={date === today}
                isSelected={date === selectedDate}
                summary={summaryMap[date]}
                onPress={onDayPress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 2,
  },
});
