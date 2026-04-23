import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useTheme } from "../../styles/theme";
import { getCurrentLedgerId, getCategories, getPaymentMethods } from "../../store/settings";
import { getRecurringRules, createRecurringRule, deleteRecurringRule } from "../../db/recurringQueries";
import { formatAmount } from "../../utils/format";
import type { RecurringRule, TransactionType } from "../../types";

export function RecurringRuleManager(): React.JSX.Element {
  const theme = useTheme();
  const ledgerId = getCurrentLedgerId() ?? "";

  const [rules, setRules] = useState<RecurringRule[]>(() => (ledgerId ? getRecurringRules(ledgerId) : []));

  // Form state
  const [formType, setFormType] = useState<TransactionType>("expense");
  const [formDay, setFormDay] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formMemo, setFormMemo] = useState("");
  const [formPayment, setFormPayment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const categories = getCategories();
  const paymentMethods = getPaymentMethods();

  const refreshRules = useCallback(() => {
    if (ledgerId) {
      setRules(getRecurringRules(ledgerId));
    }
  }, [ledgerId]);

  const handleAdd = useCallback(() => {
    const day = parseInt(formDay, 10);
    const amount = parseInt(formAmount, 10);
    const category = formCategory.trim() || categories[0];
    const payment = formPayment.trim() || paymentMethods[0];

    if (!day || day < 1 || day > 31) {
      Alert.alert("오류", "날짜를 1~31 사이로 입력해주세요.");
      return;
    }
    if (!amount || amount <= 0) {
      Alert.alert("오류", "금액을 올바르게 입력해주세요.");
      return;
    }

    createRecurringRule({
      ledger_id: ledgerId,
      type: formType,
      amount,
      category,
      payment_method: payment,
      memo: formMemo.trim() || null,
      day_of_month: day
    });
    refreshRules();
    setFormDay("");
    setFormAmount("");
    setFormCategory("");
    setFormMemo("");
    setFormPayment("");
    setShowForm(false);
  }, [
    formType,
    formDay,
    formAmount,
    formCategory,
    formMemo,
    formPayment,
    ledgerId,
    categories,
    paymentMethods,
    refreshRules
  ]);

  const handleDelete = useCallback(
    (rule: RecurringRule) => {
      const label = `매월 ${rule.day_of_month}일 · ${rule.category}`;
      Alert.alert("반복 거래 삭제", `"${label}" 규칙을 삭제하시겠습니까?`, [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            deleteRecurringRule(rule.id);
            refreshRules();
          }
        }
      ]);
    },
    [refreshRules]
  );

  return (
    <View>
      {rules.length === 0 && (
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>등록된 반복 거래가 없습니다</Text>
      )}

      {rules.map(rule => (
        <View key={rule.id} style={[styles.item, { borderBottomColor: theme.border }]}>
          <View style={styles.itemLeft}>
            <Text style={[styles.itemTitle, { color: theme.text }]}>
              매월 {rule.day_of_month}일 · {rule.category}
            </Text>
            <Text style={[styles.itemSub, { color: theme.textSecondary }]}>
              {rule.type === "income" ? "+" : "-"}
              {formatAmount(rule.amount)}원{rule.memo ? ` · ${rule.memo}` : ""}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(rule)} activeOpacity={0.7}>
            <Text style={[styles.deleteBtn, { color: theme.expense }]}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Toggle form */}
      <TouchableOpacity
        style={[styles.toggleFormBtn, { borderColor: theme.primary }]}
        onPress={() => setShowForm(v => !v)}
        activeOpacity={0.7}
      >
        <Text style={[styles.toggleFormText, { color: theme.primary }]}>{showForm ? "취소" : "+ 반복 거래 추가"}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={[styles.form, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Type toggle */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                { borderColor: theme.border },
                formType === "income" && { backgroundColor: theme.income, borderColor: theme.income }
              ]}
              onPress={() => setFormType("income")}
              activeOpacity={0.7}
            >
              <Text style={{ color: formType === "income" ? "#fff" : theme.textSecondary, fontSize: 13 }}>수입</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                { borderColor: theme.border },
                formType === "expense" && { backgroundColor: theme.expense, borderColor: theme.expense }
              ]}
              onPress={() => setFormType("expense")}
              activeOpacity={0.7}
            >
              <Text style={{ color: formType === "expense" ? "#fff" : theme.textSecondary, fontSize: 13 }}>지출</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.formInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            placeholder="매월 몇일? (1~31)"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            value={formDay}
            onChangeText={setFormDay}
          />
          <TextInput
            style={[styles.formInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            placeholder="금액"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            value={formAmount}
            onChangeText={setFormAmount}
          />
          <TextInput
            style={[styles.formInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            placeholder={`카테고리 (기본: ${categories[0]})`}
            placeholderTextColor={theme.textSecondary}
            value={formCategory}
            onChangeText={setFormCategory}
          />
          <TextInput
            style={[styles.formInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            placeholder={`결제수단 (기본: ${paymentMethods[0]})`}
            placeholderTextColor={theme.textSecondary}
            value={formPayment}
            onChangeText={setFormPayment}
          />
          <TextInput
            style={[styles.formInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            placeholder="메모 (선택)"
            placeholderTextColor={theme.textSecondary}
            value={formMemo}
            onChangeText={setFormMemo}
          />

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={handleAdd}
            activeOpacity={0.7}
          >
            <Text style={styles.addBtnText}>추가</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: { fontSize: 14, marginBottom: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  itemLeft: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600" },
  itemSub: { fontSize: 12, marginTop: 2 },
  deleteBtn: { fontSize: 13, fontWeight: "600" },
  toggleFormBtn: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center"
  },
  toggleFormText: { fontSize: 14, fontWeight: "600" },
  form: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8
  },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center"
  },
  formInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14
  },
  addBtn: {
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4
  },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" }
});
