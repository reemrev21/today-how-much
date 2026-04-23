import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useAtomValue } from "jotai";
import { useTheme } from "../../styles/theme";
import { hideIncomeAtom } from "../../store/atoms";
import type { MonthlyTrend } from "../../types";

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps): React.JSX.Element {
  const theme = useTheme();
  const hideIncome = useAtomValue(hideIncomeAtom);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>추이 데이터가 없습니다</Text>
      </View>
    );
  }

  // Build bar data: paired [income, expense] per month, or expense-only when hiding income
  const barData: { value: number; label?: string; frontColor: string; spacing?: number }[] = [];
  data.forEach((item, index) => {
    const monthLabel = item.month.slice(5); // "MM"
    if (hideIncome) {
      barData.push({
        value: item.expense,
        label: monthLabel,
        frontColor: theme.expense,
        spacing: 16
      });
    } else {
      barData.push({
        value: item.income,
        label: index === 0 ? monthLabel : monthLabel,
        frontColor: theme.income,
        spacing: 2
      });
      barData.push({
        value: item.expense,
        frontColor: theme.expense,
        spacing: 16
      });
    }
  });

  const maxValue = Math.max(...data.flatMap(d => [hideIncome ? 0 : d.income, d.expense]), 1);

  return (
    <View style={styles.container}>
      <BarChart
        data={barData}
        barWidth={18}
        noOfSections={4}
        maxValue={maxValue}
        yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
        yAxisColor={theme.border}
        xAxisColor={theme.border}
        rulesColor={theme.border}
        backgroundColor={theme.card}
        isAnimated
        hideRules={false}
        labelsExtraHeight={8}
      />
      {/* Legend */}
      <View style={styles.legendRow}>
        {!hideIncome && (
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: theme.income }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>수입</Text>
          </View>
        )}
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: theme.expense }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>지출</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 24
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendBox: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontSize: 12 },
  emptyContainer: {
    height: 120,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: { fontSize: 14 }
});
