import React, {useState, useCallback, useEffect, useRef, useMemo} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import {BottomSheetTextInput, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useAtomValue} from 'jotai';
import {useTheme} from '../../styles/theme';
import {formatAmountInput} from '../../utils/format';
import {getCategories, getPaymentMethods, getCurrentLedgerId} from '../../store/settings';
import {dbVersionAtom} from '../../store/atoms';
import type {Transaction, TransactionType} from '../../types';

const INCOME_CATEGORIES = ['월급', '부수입', '용돈', '기타수입'];
const EXPENSE_CATEGORIES = ['식비', '교통비', '주거비', '통신비', '의료비', '문화생활', '쇼핑', '교육', '경조사', '기타지출'];

interface TransactionFormProps {
  ledgerId?: string;
  initialDate?: string;
  editTransaction?: Transaction;
  onSave: (params: Omit<Transaction, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function filterCategories(all: string[], type: TransactionType): string[] {
  const defaults = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const filtered = all.filter(c => defaults.includes(c));
  // Include any custom categories not in defaults list
  const custom = all.filter(c => !INCOME_CATEGORIES.includes(c) && !EXPENSE_CATEGORIES.includes(c));
  return filtered.length > 0 ? [...filtered, ...custom] : all;
}

export function TransactionForm({
  ledgerId: ledgerIdProp,
  initialDate,
  editTransaction,
  onSave,
  onCancel,
  onDelete,
}: TransactionFormProps): React.JSX.Element {
  const theme = useTheme();
  const ledgerId = ledgerIdProp ?? getCurrentLedgerId() ?? '';
  const dbVersion = useAtomValue(dbVersionAtom);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allCategories = useMemo(() => getCategories(), [dbVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allPaymentMethods = useMemo(() => getPaymentMethods(), [dbVersion]);

  const [type, setType] = useState<TransactionType>(editTransaction?.type ?? 'expense');
  const [amountText, setAmountText] = useState(
    editTransaction ? formatAmountInput(String(editTransaction.amount)) : '',
  );
  const [date, setDate] = useState(
    editTransaction?.date ?? initialDate ?? todayString(),
  );
  const [category, setCategory] = useState(editTransaction?.category ?? '');
  const [paymentMethod, setPaymentMethod] = useState(
    editTransaction?.payment_method ?? allPaymentMethods[0] ?? '',
  );
  const [memo, setMemo] = useState(editTransaction?.memo ?? '');

  // Track previous editTransaction.id to detect actual changes
  const prevEditIdRef = useRef<string | undefined>(editTransaction?.id);
  const prevInitialDateRef = useRef<string | undefined>(initialDate);

  useEffect(() => {
    const prevId = prevEditIdRef.current;
    const prevDate = prevInitialDateRef.current;
    const currId = editTransaction?.id;

    prevEditIdRef.current = currId;
    prevInitialDateRef.current = initialDate;

    // Same edit transaction — skip
    if (currId && currId === prevId) {return;}

    if (editTransaction) {
      setType(editTransaction.type);
      setAmountText(formatAmountInput(String(editTransaction.amount)));
      setDate(editTransaction.date);
      setCategory(editTransaction.category);
      setPaymentMethod(editTransaction.payment_method);
      setMemo(editTransaction.memo ?? '');
    } else if (prevId !== undefined || prevDate !== initialDate) {
      // Only reset when transitioning from edit→add or initialDate actually changed
      const methods = getPaymentMethods();
      setType('expense');
      setAmountText('');
      setDate(initialDate ?? todayString());
      setCategory('');
      setPaymentMethod(methods[0] ?? '');
      setMemo('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTransaction?.id, initialDate]);

  const categories = filterCategories(allCategories, type);

  const handleTypeChange = useCallback(
    (newType: TransactionType) => {
      setType(newType);
      setCategory(''); // reset category when type changes
    },
    [],
  );

  const handleSave = useCallback(() => {
    Keyboard.dismiss();
    const amount = parseInt(amountText.replace(/,/g, ''), 10);
    if (!amountText || isNaN(amount) || amount <= 0) {
      Alert.alert('오류', '금액을 올바르게 입력해 주세요.');
      return;
    }
    if (!category) {
      Alert.alert('오류', '카테고리를 선택해 주세요.');
      return;
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('오류', '날짜를 YYYY-MM-DD 형식으로 입력해 주세요.');
      return;
    }
    onSave({
      ledger_id: ledgerId,
      type,
      amount,
      category,
      payment_method: paymentMethod,
      memo: memo.trim() || null,
      date,
    });
  }, [amountText, category, date, ledgerId, memo, onSave, paymentMethod, type]);

  const handleDelete = useCallback(() => {
    if (!editTransaction || !onDelete) {return;}
    Alert.alert('거래 삭제', '이 거래를 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => onDelete(editTransaction.id),
      },
    ]);
  }, [editTransaction, onDelete]);

  const amountColor = theme.primary;

  return (
    <BottomSheetScrollView
      style={[styles.scroll, {backgroundColor: theme.surface}]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <Text style={[styles.title, {color: theme.text}]}>
        {editTransaction ? '거래 수정' : '거래 추가'}
      </Text>

      {/* Income / Expense toggle */}
      <View style={[styles.toggleRow, {backgroundColor: theme.background, borderColor: theme.border}]}>
        <Pressable
          style={[
            styles.toggleBtn,
            type === 'expense' && {backgroundColor: theme.primary},
          ]}
          onPress={() => handleTypeChange('expense')}
        >
          <Text style={[styles.toggleText, type === 'expense' ? styles.toggleActive : {color: theme.textSecondary}]}>
            지출
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleBtn,
            type === 'income' && {backgroundColor: theme.primary},
          ]}
          onPress={() => handleTypeChange('income')}
        >
          <Text style={[styles.toggleText, type === 'income' ? styles.toggleActive : {color: theme.textSecondary}]}>
            수입
          </Text>
        </Pressable>
      </View>

      {/* Amount */}
      <View style={styles.section}>
        <Text style={[styles.label, {color: theme.textSecondary}]}>금액</Text>
        <BottomSheetTextInput
          style={[styles.amountInput, {color: amountColor, borderColor: theme.border, backgroundColor: theme.background}]}
          value={amountText}
          onChangeText={t => setAmountText(formatAmountInput(t))}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      {/* Date */}
      <View style={styles.section}>
        <Text style={[styles.label, {color: theme.textSecondary}]}>날짜</Text>
        <BottomSheetTextInput
          style={[styles.input, {color: theme.text, borderColor: theme.border, backgroundColor: theme.background}]}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
      </View>

      {/* Category chips */}
      <View style={styles.section}>
        <Text style={[styles.label, {color: theme.textSecondary}]}>카테고리</Text>
        <View style={styles.chips}>
          {categories.map(c => {
            const selected = c === category;
            return (
              <Pressable
                key={c}
                style={[
                  styles.chip,
                  {borderColor: selected ? amountColor : theme.border},
                  selected && {backgroundColor: amountColor},
                ]}
                onPress={() => setCategory(c)}
      
              >
                <Text style={[styles.chipText, {color: selected ? '#fff' : theme.text}]}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Payment method chips */}
      <View style={styles.section}>
        <Text style={[styles.label, {color: theme.textSecondary}]}>결제 수단</Text>
        <View style={styles.chips}>
          {allPaymentMethods.map(m => {
            const selected = m === paymentMethod;
            return (
              <Pressable
                key={m}
                style={[
                  styles.chip,
                  {borderColor: selected ? theme.primary : theme.border},
                  selected && {backgroundColor: theme.primary},
                ]}
                onPress={() => setPaymentMethod(m)}
      
              >
                <Text style={[styles.chipText, {color: selected ? '#fff' : theme.text}]}>
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Memo */}
      <View style={styles.section}>
        <Text style={[styles.label, {color: theme.textSecondary}]}>메모</Text>
        <BottomSheetTextInput
          style={[styles.memoInput, {color: theme.text, borderColor: theme.border, backgroundColor: theme.background}]}
          value={memo}
          onChangeText={setMemo}
          placeholder="메모 (선택사항)"
          placeholderTextColor={theme.textSecondary}
          multiline
          textAlignVertical="top"
          returnKeyType="done"
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Pressable
          style={[styles.cancelBtn, {borderColor: theme.border}]}
          onPress={onCancel}

        >
          <Text style={[styles.cancelText, {color: theme.textSecondary}]}>취소</Text>
        </Pressable>
        <Pressable
          style={[styles.saveBtn, {backgroundColor: amountColor}]}
          onPress={handleSave}

        >
          <Text style={styles.saveText}>{editTransaction ? '수정' : '저장'}</Text>
        </Pressable>
      </View>

      {/* Delete button (edit mode only) */}
      {editTransaction && onDelete && (
        <Pressable
          style={styles.deleteBtn}
          onPress={handleDelete}

        >
          <Text style={styles.deleteBtnText}>거래 삭제</Text>
        </Pressable>
      )}
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {paddingHorizontal: 20, paddingBottom: 32},
  title: {fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 20, textAlign: 'center'},
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 0,
  },
  toggleText: {fontSize: 15, fontWeight: '600'},
  toggleActive: {color: '#fff'},
  section: {marginBottom: 20},
  label: {fontSize: 13, fontWeight: '500', marginBottom: 8},
  amountInput: {
    fontSize: 28,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: 'right',
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {fontSize: 13, fontWeight: '500'},
  memoInput: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 72,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelText: {fontSize: 16, fontWeight: '600'},
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  saveText: {fontSize: 16, fontWeight: '700', color: '#fff'},
  deleteBtn: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D32F2F',
  },
});
