import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, FlatList, Alert, StyleSheet, Animated, Keyboard } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useAtom } from 'jotai';
import BottomSheet, { BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useTheme, Theme } from '../styles/theme';
import { formatAmount, formatAmountInput } from '../utils/format';
import { dbVersionAtom } from '../store/atoms';
import { getCurrentLedgerId, getCategories, getPaymentMethods } from '../store/settings';
import { getRecurringRules, createRecurringRule, updateRecurringRule, deleteRecurringRule, reorderRecurringRules } from '../db/recurringQueries';
import type { RecurringRule, TransactionType } from '../types';

const INCOME_CATEGORIES = ['월급', '부수입', '용돈', '기타수입'];
const EXPENSE_CATEGORIES = ['식비', '교통비', '주거비', '통신비', '의료비', '문화생활', '쇼핑', '교육', '경조사', '기타지출'];

function getFilteredCategories(allCategories: string[], type: TransactionType): string[] {
  const defaults = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const matched = allCategories.filter(c => defaults.includes(c));
  const custom = allCategories.filter(c => !INCOME_CATEGORIES.includes(c) && !EXPENSE_CATEGORIES.includes(c));
  return [...matched, ...custom];
}

function RuleItem({
  item,
  theme,
  onEdit,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  item: RecurringRule;
  theme: Theme;
  onEdit: (rule: RecurringRule) => void;
  onDelete: (id: string) => void;
  onToggle: (rule: RecurringRule) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}): React.JSX.Element {
  const swipeRef = useRef<Swipeable>(null);
  const isIncome = item.type === 'income';
  const active = item.is_active;

  const handleDelete = useCallback(() => {
    Alert.alert('삭제', '이 고정거래를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel', onPress: () => swipeRef.current?.close() },
      { text: '삭제', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  }, [item.id, onDelete]);

  const renderRight = useCallback(
    (_p: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.5], extrapolate: 'clamp' });
      return (
        <Pressable style={styles.deleteAction} onPress={handleDelete}>
          <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>{'\u2715'}</Animated.Text>
        </Pressable>
      );
    },
    [handleDelete],
  );

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRight} overshootRight={false} friction={2}>
      <Pressable onPress={() => onEdit(item)}>
        <View style={[styles.item, { backgroundColor: theme.card, borderBottomColor: theme.rule, opacity: active ? 1 : 0.4 }]}>
          <View style={styles.moveBtns}>
            <Pressable onPress={() => onMoveUp(item.id)} hitSlop={4} disabled={isFirst}>
              <Text style={[styles.moveIcon, { color: isFirst ? theme.rule : theme.mute2 }]}>{'\u25B2'}</Text>
            </Pressable>
            <Pressable onPress={() => onMoveDown(item.id)} hitSlop={4} disabled={isLast}>
              <Text style={[styles.moveIcon, { color: isLast ? theme.rule : theme.mute2 }]}>{'\u25BC'}</Text>
            </Pressable>
          </View>
          <View style={styles.itemLeft}>
            <View style={styles.itemTopRow}>
              <Text style={[styles.itemCategory, { color: theme.ink }]}>{item.category}</Text>
              <View style={[styles.dayBadge, { borderColor: theme.mute2 }]}>
                <Text style={[styles.dayText, { color: theme.mute3 }]}>{item.day_of_month}일</Text>
              </View>
            </View>
            {item.memo ? <Text style={[styles.itemMemo, { color: theme.mute1 }]}>{item.memo}</Text> : null}
            <Text style={[styles.itemPayment, { color: theme.mute2 }]}>{item.payment_method}</Text>
          </View>
          <Text style={[styles.itemAmount, { color: isIncome ? theme.mute1 : theme.ink }]}>
            {isIncome ? '+' : '\u2212'}{formatAmount(item.amount)}
          </Text>
          <Pressable
            style={[styles.toggleBtn, { backgroundColor: active ? theme.ink : theme.mute2 }]}
            onPress={() => onToggle(item)}
            hitSlop={8}
          >
            <View style={[styles.toggleKnob, active ? styles.toggleKnobOn : styles.toggleKnobOff]} />
          </Pressable>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export function RecurringScreen(): React.JSX.Element {
  const theme = useTheme();
  const [dbVersion, setDbVersion] = useAtom(dbVersionAtom);
  const sheetRef = useRef<BottomSheet>(null);

  const ledgerId = getCurrentLedgerId() ?? '';
  const allCategories = getCategories();
  const allPaymentMethods = getPaymentMethods();

  const rules = React.useMemo(() => {
    if (!ledgerId) { return []; }
    return getRecurringRules(ledgerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, dbVersion]);

  const expenseTotal = React.useMemo(() => rules.filter(r => r.type === 'expense' && r.is_active).reduce((s, r) => s + r.amount, 0), [rules]);
  const incomeTotal = React.useMemo(() => rules.filter(r => r.type === 'income' && r.is_active).reduce((s, r) => s + r.amount, 0), [rules]);

  // Form state
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [payment, setPayment] = useState(allPaymentMethods[0] ?? '');
  const [memo, setMemo] = useState('');
  const [day, setDay] = useState('1');

  const formCategories = getFilteredCategories(allCategories, formType);

  const resetForm = useCallback(() => {
    setEditingRule(null);
    setFormType('expense');
    setAmount('');
    setCategory('');
    setPayment(getPaymentMethods()[0] ?? '');
    setMemo('');
    setDay('1');
  }, []);

  const handleAdd = useCallback(() => {
    resetForm();
    sheetRef.current?.expand();
  }, [resetForm]);

  const handleEdit = useCallback((rule: RecurringRule) => {
    setEditingRule(rule);
    setFormType(rule.type);
    setAmount(formatAmountInput(String(rule.amount)));
    setCategory(rule.category);
    setPayment(rule.payment_method);
    setMemo(rule.memo ?? '');
    setDay(String(rule.day_of_month));
    sheetRef.current?.expand();
  }, []);

  const handleFormTypeChange = useCallback((t: TransactionType) => {
    setFormType(t);
    setCategory('');
  }, []);

  const handleSave = useCallback(() => {
    const amt = parseInt(amount.replace(/,/g, ''), 10);
    if (!amount || isNaN(amt) || amt <= 0) {
      Alert.alert('오류', '금액을 올바르게 입력해 주세요.');
      return;
    }
    if (!category) {
      Alert.alert('오류', '카테고리를 선택해 주세요.');
      return;
    }
    const dayNum = parseInt(day, 10);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      Alert.alert('오류', '날짜를 1~31 사이로 입력해 주세요.');
      return;
    }
    if (editingRule) {
      updateRecurringRule(editingRule.id, {
        type: formType,
        amount: amt,
        category,
        payment_method: payment,
        memo: memo.trim() || null,
        day_of_month: dayNum,
        is_active: true,
      });
    } else {
      createRecurringRule({
        ledger_id: ledgerId,
        type: formType,
        amount: amt,
        category,
        payment_method: payment,
        memo: memo.trim() || null,
        day_of_month: dayNum,
      });
    }
    Keyboard.dismiss();
    setDbVersion(v => v + 1);
    sheetRef.current?.close();
    resetForm();
  }, [amount, category, day, editingRule, formType, ledgerId, memo, payment, resetForm, setDbVersion]);

  const handleDelete = useCallback((id: string) => {
    deleteRecurringRule(id);
    setDbVersion(v => v + 1);
  }, [setDbVersion]);

  const handleToggle = useCallback((rule: RecurringRule) => {
    updateRecurringRule(rule.id, {
      type: rule.type,
      amount: rule.amount,
      category: rule.category,
      payment_method: rule.payment_method,
      memo: rule.memo,
      day_of_month: rule.day_of_month,
      is_active: !rule.is_active,
    });
    setDbVersion(v => v + 1);
  }, [setDbVersion]);

  const handleMove = useCallback((id: string, direction: 'up' | 'down') => {
    const idx = rules.findIndex(r => r.id === id);
    if (idx < 0) { return; }
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= rules.length) { return; }
    const newOrder = rules.map(r => r.id);
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    reorderRecurringRules(newOrder);
    setDbVersion(v => v + 1);
  }, [rules, setDbVersion]);

  return (
    <View style={[styles.container, { backgroundColor: theme.paper }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.ink }]}>
        <Text style={[styles.headerTitle, { color: theme.ink }]}>고정거래</Text>
        <Pressable style={[styles.headerAddBtn, { backgroundColor: theme.ink }]} onPress={handleAdd}>
          <Text style={[styles.headerAddText, { color: theme.card }]}>+ 추가</Text>
        </Pressable>
      </View>

      {/* Total bar */}
      <View style={[styles.totalBar, { backgroundColor: theme.ink }]}>
        <View>
          <Text style={[styles.totalLabel, { color: theme.mute2 }]}>월 고정 합계</Text>
        </View>
        <View style={styles.totalRight}>
          {incomeTotal > 0 && (
            <Text style={[styles.totalIncome, { color: theme.mute2 }]}>
              +{formatAmount(incomeTotal)}
            </Text>
          )}
          <Text style={[styles.totalAmount, { color: theme.card }]}>
            {'\u2212'}{formatAmount(expenseTotal)}
          </Text>
        </View>
      </View>

      {/* List */}
      {rules.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.mute2 }]}>고정거래가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={rules}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <RuleItem
              item={item}
              theme={theme}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onMoveUp={(id) => handleMove(id, 'up')}
              onMoveDown={(id) => handleMove(id, 'down')}
              isFirst={index === 0}
              isLast={index === rules.length - 1}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Form BottomSheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['75%']}
        enablePanDownToClose
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.mute2 }}
      >
        <BottomSheetScrollView
          style={{ backgroundColor: theme.card }}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.formTitle, { color: theme.ink }]}>
            {editingRule ? '고정거래 수정' : '고정거래 추가'}
          </Text>

          {/* Type toggle */}
          <View style={[styles.typeToggle, { borderColor: theme.rule }]}>
            <Pressable
              style={[styles.typeBtn, formType === 'expense' && { backgroundColor: theme.ink }]}
              onPress={() => handleFormTypeChange('expense')}
            >
              <Text style={[styles.typeBtnText, { color: formType === 'expense' ? theme.card : theme.mute1 }]}>지출</Text>
            </Pressable>
            <Pressable
              style={[styles.typeBtn, formType === 'income' && { backgroundColor: theme.ink }]}
              onPress={() => handleFormTypeChange('income')}
            >
              <Text style={[styles.typeBtnText, { color: formType === 'income' ? theme.card : theme.mute1 }]}>수입</Text>
            </Pressable>
          </View>

          <Text style={[styles.formLabel, { color: theme.mute1 }]}>금액</Text>
          <BottomSheetTextInput
            style={[styles.formInput, { color: theme.ink, borderColor: theme.rule, backgroundColor: theme.paper }]}
            value={amount}
            onChangeText={t => setAmount(formatAmountInput(t))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.mute2}
          />

          <Text style={[styles.formLabel, { color: theme.mute1 }]}>매월 (일)</Text>
          <BottomSheetTextInput
            style={[styles.formInput, { color: theme.ink, borderColor: theme.rule, backgroundColor: theme.paper }]}
            value={day}
            onChangeText={setDay}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={theme.mute2}
            maxLength={2}
          />

          <Text style={[styles.formLabel, { color: theme.mute1 }]}>카테고리</Text>
          <View style={styles.chips}>
            {formCategories.map(c => (
              <Pressable
                key={c}
                style={[styles.chip, { borderColor: c === category ? theme.ink : theme.rule }, c === category && { backgroundColor: theme.ink }]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.chipText, { color: c === category ? theme.card : theme.ink }]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.formLabel, { color: theme.mute1 }]}>결제수단</Text>
          <View style={styles.chips}>
            {allPaymentMethods.map(m => (
              <Pressable
                key={m}
                style={[styles.chip, { borderColor: m === payment ? theme.ink : theme.rule }, m === payment && { backgroundColor: theme.ink }]}
                onPress={() => setPayment(m)}
              >
                <Text style={[styles.chipText, { color: m === payment ? theme.card : theme.ink }]}>{m}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.formLabel, { color: theme.mute1 }]}>메모</Text>
          <BottomSheetTextInput
            style={[styles.formInput, { color: theme.ink, borderColor: theme.rule, backgroundColor: theme.paper }]}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모 (선택사항)"
            placeholderTextColor={theme.mute2}
          />

          <Pressable style={[styles.saveBtn, { backgroundColor: theme.ink }]} onPress={handleSave}>
            <Text style={[styles.saveBtnText, { color: theme.card }]}>{editingRule ? '수정' : '저장'}</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.88 },
  headerAddBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  headerAddText: { fontSize: 13, fontWeight: '800' },

  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  totalLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8 },
  totalRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  totalIncome: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3, fontVariant: ['tabular-nums'] as any },
  totalAmount: { fontSize: 20, fontWeight: '900', letterSpacing: -1, fontVariant: ['tabular-nums'] as any },

  list: { flex: 1 },
  listContent: { paddingBottom: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  moveBtns: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, gap: 2 },
  moveIcon: { fontSize: 8, fontWeight: '700' },
  itemLeft: { flex: 1, marginRight: 12 },
  itemTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  itemCategory: { fontSize: 15, fontWeight: '700' },
  dayBadge: { paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  dayText: { fontSize: 10, fontWeight: '700' },
  itemMemo: { fontSize: 13, marginBottom: 2 },
  itemPayment: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  itemAmount: { fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] as any },

  toggleBtn: { width: 34, height: 20, borderRadius: 10, justifyContent: 'center', paddingHorizontal: 3, marginLeft: 12 },
  toggleKnob: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  toggleKnobOff: { alignSelf: 'flex-start' },

  deleteAction: { backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center', width: 72 },
  deleteText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },

  // Form
  formContent: { paddingHorizontal: 20, paddingBottom: 32 },
  formTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 8, marginBottom: 20 },
  typeToggle: { flexDirection: 'row', borderWidth: 1, marginBottom: 8 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  typeBtnText: { fontSize: 15, fontWeight: '700' },
  formLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  formInput: { fontSize: 16, fontWeight: '700', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontVariant: ['tabular-nums'] as any },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { marginTop: 24, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '800' },
});
