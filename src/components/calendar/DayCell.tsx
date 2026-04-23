import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAtomValue } from "jotai";
import { useTheme } from "../../styles/theme";
import { hideIncomeAtom } from "../../store/atoms";
import { formatShort } from "../../utils/format";
import type { DaySummary } from "../../types";

interface DayCellProps {
  date: string;
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
  onPress
}: DayCellProps): React.JSX.Element {
  const theme = useTheme();
  const hideIncome = useAtomValue(hideIncomeAtom);

  // Non-current-month cells get muted background
  if (!isCurrentMonth) {
    return (
      <View style={[styles.cell, { backgroundColor: theme.rule }]}>
        <Text style={[styles.dayNum, { color: theme.mute2, opacity: 0.4 }]}>{String(dayNumber).padStart(2, "0")}</Text>
      </View>
    );
  }

  const isInverted = isToday || isSelected;
  const bgColor = isInverted ? theme.ink : theme.card;
  const dayColor = isInverted ? theme.card : theme.mute3;
  const expenseColor = isInverted ? theme.card : theme.ink;
  const incomeColor = isInverted ? theme.mute2 : theme.mute2;

  return (
    <TouchableOpacity
      style={[styles.cell, { backgroundColor: bgColor }]}
      onPress={() => onPress(date)}
      activeOpacity={0.7}
    >
      {/* Top: date + NOW tag */}
      <View style={styles.topRow}>
        <Text style={[styles.dayNum, { color: dayColor }]}>{String(dayNumber).padStart(2, "0")}</Text>
        {isToday && (
          <View style={[styles.nowBadge, { backgroundColor: isInverted ? theme.card : theme.ink }]}>
            <Text style={[styles.nowText, { color: isInverted ? theme.ink : theme.card }]}>NOW</Text>
          </View>
        )}
      </View>

      {/* Bottom: amounts pushed down */}
      <View style={styles.bottomArea}>
        {summary && summary.income > 0 && !hideIncome && (
          <Text style={[styles.incomeText, { color: incomeColor }]} numberOfLines={1}>
            +{formatShort(summary.income)}
          </Text>
        )}
        {summary && summary.expense > 0 && (
          <Text style={[styles.expenseText, { color: expenseColor }]} numberOfLines={1}>
            {"\u2212"}
            {formatShort(summary.expense)}
          </Text>
        )}
      </View>

      {/* Selected (not today) inset border */}
      {isSelected && isToday && <View style={[styles.insetBorder, { borderColor: theme.card }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    minHeight: 70,
    padding: 4,
    paddingBottom: 3,
    justifyContent: "space-between"
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  dayNum: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: -0.24,
    fontVariant: ["tabular-nums"]
  },
  nowBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1
  },
  nowText: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.05
  },
  bottomArea: {
    marginTop: "auto",
    alignItems: "flex-end"
  },
  incomeText: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: -0.18,
    fontVariant: ["tabular-nums"]
  },
  expenseText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: -0.33,
    fontVariant: ["tabular-nums"]
  },
  insetBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2
  }
});
