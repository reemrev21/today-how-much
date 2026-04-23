import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, PanResponder } from "react-native";
import dayjs from "dayjs";
import { useTheme } from "../../styles/theme";
import { getCalendarDays } from "../../utils/date";
import { DayCell } from "./DayCell";
import type { DaySummary } from "../../types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarGridProps {
  yearMonth: string;
  selectedDate: string | null;
  summaries: DaySummary[];
  onDayPress: (date: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const SWIPE_THRESHOLD = 50;

export function CalendarGrid({
  yearMonth,
  selectedDate,
  summaries,
  onDayPress,
  onPrev,
  onNext
}: CalendarGridProps): React.JSX.Element {
  const theme = useTheme();
  const today = dayjs().format("YYYY-MM-DD");

  /* eslint-disable react-hooks/refs -- PanResponder must be created once; ref keeps callbacks stable */
  const callbacksRef = useRef({ onPrev, onNext });
  useEffect(() => {
    callbacksRef.current = { onPrev, onNext };
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > SWIPE_THRESHOLD) {
          callbacksRef.current.onPrev?.();
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          callbacksRef.current.onNext?.();
        }
      }
    })
  ).current;
  /* eslint-enable react-hooks/refs */

  const days = useMemo(() => getCalendarDays(yearMonth), [yearMonth]);

  const summaryMap = useMemo(() => {
    const map: Record<string, DaySummary> = {};
    for (const s of summaries) {
      map[s.date] = s;
    }
    return map;
  }, [summaries]);

  const rows = useMemo(() => {
    const result: string[][] = [];
    for (let r = 0; r < 6; r++) {
      result.push(days.slice(r * 7, r * 7 + 7));
    }
    return result;
  }, [days]);

  return (
    // eslint-disable-next-line react-hooks/refs
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Weekday header — black background */}
      <View style={[styles.weekdayBar, { backgroundColor: theme.ink }]}>
        {WEEKDAYS.map((wd, idx) => (
          <View key={wd} style={styles.weekdayCell}>
            <Text style={[styles.weekdayText, { color: idx === 0 || idx === 6 ? theme.card : theme.mute2 }]}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Grid — ink background creates 1px gap lines */}
      <View style={[styles.grid, { backgroundColor: theme.ink }]}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.gridRow}>
            {row.map(date => {
              const d = dayjs(date);
              const isCurrentMonth = d.format("YYYY-MM") === yearMonth;
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  weekdayBar: {
    flexDirection: "row",
    paddingVertical: 8
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center"
  },
  weekdayText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  grid: {
    flex: 1,
    gap: 1,
    padding: 1
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
    gap: 1
  }
});
