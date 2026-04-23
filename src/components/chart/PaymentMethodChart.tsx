import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../styles/theme";
import { formatAmount } from "../../utils/format";
import type { PaymentMethodSummary } from "../../types";

interface PaymentMethodChartProps {
  data: PaymentMethodSummary[];
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps): React.JSX.Element {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>결제수단 데이터가 없습니다</Text>
      </View>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <View style={styles.container}>
      {data.map(item => {
        const percentage = item.total / maxTotal;
        return (
          <View key={item.payment_method} style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
              {item.payment_method}
            </Text>
            <View style={styles.barContainer}>
              <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.barFill,
                    { backgroundColor: theme.primary, width: `${Math.round(percentage * 100)}%` }
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.amount, { color: theme.textSecondary }]}>{formatAmount(item.total)}원</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8
  },
  label: {
    width: 60,
    fontSize: 13,
    fontWeight: "500"
  },
  barContainer: { flex: 1 },
  barTrack: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    borderRadius: 5
  },
  amount: {
    fontSize: 12,
    width: 80,
    textAlign: "right"
  },
  emptyContainer: {
    height: 80,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: { fontSize: 14 }
});
