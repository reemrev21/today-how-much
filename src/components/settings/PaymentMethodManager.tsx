import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useTheme } from "../../styles/theme";
import { getPaymentMethods, setPaymentMethods } from "../../store/settings";

export function PaymentMethodManager(): React.JSX.Element {
  const theme = useTheme();
  const [methods, setMethodsState] = useState<string[]>(() => getPaymentMethods());
  const [newMethod, setNewMethod] = useState("");

  const handleAdd = useCallback(() => {
    const trimmed = newMethod.trim();
    if (!trimmed) {
      return;
    }
    if (methods.includes(trimmed)) {
      Alert.alert("중복", "이미 존재하는 결제수단입니다.");
      return;
    }
    const updated = [...methods, trimmed];
    setPaymentMethods(updated);
    setMethodsState(updated);
    setNewMethod("");
  }, [newMethod, methods]);

  const handleDelete = useCallback(
    (method: string) => {
      Alert.alert("결제수단 삭제", `"${method}" 결제수단을 삭제하시겠습니까?`, [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            const updated = methods.filter(m => m !== method);
            setPaymentMethods(updated);
            setMethodsState(updated);
          }
        }
      ]);
    },
    [methods]
  );

  return (
    <View>
      {methods.map(method => (
        <View key={method} style={[styles.item, { borderBottomColor: theme.border }]}>
          <Text style={[styles.itemText, { color: theme.text }]}>{method}</Text>
          <TouchableOpacity onPress={() => handleDelete(method)} activeOpacity={0.7}>
            <Text style={[styles.deleteBtn, { color: theme.expense }]}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Add new */}
      <View style={styles.addRow}>
        <TextInput
          style={[styles.addInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
          placeholder="새 결제수단"
          placeholderTextColor={theme.textSecondary}
          value={newMethod}
          onChangeText={setNewMethod}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={handleAdd}
          activeOpacity={0.7}
        >
          <Text style={[styles.addBtnText, { color: "#fff" }]}>추가</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  itemText: { fontSize: 14 },
  deleteBtn: { fontSize: 13, fontWeight: "600" },
  addRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  addInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14
  },
  addBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  addBtnText: { fontSize: 14, fontWeight: "600" }
});
