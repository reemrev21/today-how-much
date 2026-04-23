import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useAtom, useAtomValue} from 'jotai';
import dayjs from 'dayjs';

import {useTheme} from '../styles/theme';
import {selectedMonthAtom, statsPeriodAtom, dbVersionAtom} from '../store/atoms';
import {getCurrentLedgerId} from '../store/settings';
import {
  getCategorySummary,
  getPaymentMethodSummary,
  getMonthlyTrend,
} from '../db/transactionQueries';

import {CategoryPieChart} from '../components/chart/CategoryPieChart';
import {MonthlyTrendChart} from '../components/chart/MonthlyTrendChart';
import {PaymentMethodChart} from '../components/chart/PaymentMethodChart';

export function StatsScreen(): React.JSX.Element {
  const theme = useTheme();

  const selectedMonth = useAtomValue(selectedMonthAtom);
  const [period, setPeriod] = useAtom(statsPeriodAtom);
  const dbVersion = useAtomValue(dbVersionAtom);

  const ledgerId = getCurrentLedgerId() ?? '';
  const currentYear = selectedMonth.slice(0, 4);

  const categorySummary = useMemo(() => {
    if (!ledgerId) {return [];}
    return getCategorySummary(ledgerId, period === 'monthly' ? selectedMonth : currentYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, selectedMonth, currentYear, period, dbVersion]);

  const paymentSummary = useMemo(() => {
    if (!ledgerId) {return [];}
    return getPaymentMethodSummary(ledgerId, period === 'monthly' ? selectedMonth : currentYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, selectedMonth, currentYear, period, dbVersion]);

  const monthlyTrend = useMemo(() => {
    if (!ledgerId) {return [];}
    // Always show yearly trend for MonthlyTrendChart
    return getMonthlyTrend(ledgerId, currentYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, currentYear, dbVersion]);

  const periodLabel = period === 'monthly'
    ? dayjs(`${selectedMonth}-01`).format('YYYY년 M월')
    : `${currentYear}년`;

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Title */}
      <View style={[styles.titleRow, {borderBottomColor: theme.border}]}>
        <Text style={[styles.title, {color: theme.text}]}>통계</Text>
      </View>

      {/* Period toggle */}
      <View style={[styles.toggleRow, {borderBottomColor: theme.border}]}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            {borderColor: theme.border, backgroundColor: theme.card},
            period === 'monthly' && {backgroundColor: theme.primary, borderColor: theme.primary},
          ]}
          onPress={() => setPeriod('monthly')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, {color: period === 'monthly' ? '#fff' : theme.textSecondary}]}>
            월별
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            {borderColor: theme.border, backgroundColor: theme.card},
            period === 'yearly' && {backgroundColor: theme.primary, borderColor: theme.primary},
          ]}
          onPress={() => setPeriod('yearly')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, {color: period === 'yearly' ? '#fff' : theme.textSecondary}]}>
            연별
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Period label */}
        <Text style={[styles.periodLabel, {color: theme.textSecondary}]}>{periodLabel}</Text>

        {/* Category pie chart */}
        <View style={[styles.section, {backgroundColor: theme.card, borderColor: theme.border}]}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>카테고리별 지출</Text>
          <CategoryPieChart data={categorySummary} />
        </View>

        {/* Monthly trend chart */}
        <View style={[styles.section, {backgroundColor: theme.card, borderColor: theme.border}]}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>월별 추이 ({currentYear}년)</Text>
          <MonthlyTrendChart data={monthlyTrend} />
        </View>

        {/* Payment method chart */}
        <View style={[styles.section, {backgroundColor: theme.card, borderColor: theme.border}]}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>결제수단별</Text>
          <PaymentMethodChart data={paymentSummary} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  titleRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {fontSize: 22, fontWeight: '700'},
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleText: {fontSize: 13, fontWeight: '600'},
  scrollContent: {padding: 16, paddingBottom: 32},
  periodLabel: {fontSize: 13, marginBottom: 12, textAlign: 'center'},
  section: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {fontSize: 16, fontWeight: '700', marginBottom: 16},
});
