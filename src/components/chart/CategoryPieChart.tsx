import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PieChart} from 'react-native-gifted-charts';
import {useTheme} from '../../styles/theme';
import {formatAmount} from '../../utils/format';
import type {CategorySummary} from '../../types';

const COLORS = [
  '#5C6BC0', '#E91E63', '#FF9800', '#4CAF50', '#00BCD4',
  '#9C27B0', '#F44336', '#FFEB3B', '#8BC34A', '#3F51B5',
];

interface CategoryPieChartProps {
  data: CategorySummary[];
}

export function CategoryPieChart({data}: CategoryPieChartProps): React.JSX.Element {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
          지출 데이터가 없습니다
        </Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);

  const pieData = data.map((item, index) => ({
    value: item.total,
    color: COLORS[index % COLORS.length],
    text: item.category,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <PieChart
          donut
          data={pieData}
          radius={90}
          innerRadius={55}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={[styles.centerAmount, {color: theme.text}]}>
                {formatAmount(total)}
              </Text>
              <Text style={[styles.centerUnit, {color: theme.textSecondary}]}>원</Text>
            </View>
          )}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={item.category} style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: COLORS[index % COLORS.length]}]} />
            <Text style={[styles.legendCategory, {color: theme.text}]} numberOfLines={1}>
              {item.category}
            </Text>
            <Text style={[styles.legendAmount, {color: theme.textSecondary}]}>
              {formatAmount(item.total)}원
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {alignItems: 'center'},
  chartWrapper: {marginBottom: 16},
  centerLabel: {alignItems: 'center'},
  centerAmount: {fontSize: 15, fontWeight: '700'},
  centerUnit: {fontSize: 11},
  legend: {width: '100%', paddingHorizontal: 4},
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendCategory: {flex: 1, fontSize: 13},
  legendAmount: {fontSize: 13},
  emptyContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {fontSize: 14},
});
