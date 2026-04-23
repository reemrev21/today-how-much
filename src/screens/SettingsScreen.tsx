import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Platform } from "react-native";
import { useAtom } from "jotai";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import DocumentPicker from "react-native-document-picker";

import { useTheme } from "../styles/theme";
import { dbVersionAtom } from "../store/atoms";
import { getCurrentLedgerId, setCurrentLedgerId, getThemeMode, setThemeMode } from "../store/settings";
import { getAllLedgers, createLedger, deleteLedger } from "../db/ledgerQueries";
import { getTransactionsForExport, createTransaction } from "../db/transactionQueries";
import { getRecurringRules, createRecurringRule } from "../db/recurringQueries";
import { buildExportCsv, parseCsv, buildTemplateCsv } from "../utils/csv";

import { CategoryManager } from "../components/settings/CategoryManager";
import { PaymentMethodManager } from "../components/settings/PaymentMethodManager";
import type { ThemeMode, Ledger } from "../types";

export function SettingsScreen(): React.JSX.Element {
  const theme = useTheme();
  const [, setDbVersion] = useAtom(dbVersionAtom);

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getThemeMode());
  const [ledgers, setLedgers] = useState<Ledger[]>(() => getAllLedgers());
  const [currentLedgerId, setCurrentLedgerIdState] = useState<string | undefined>(() => getCurrentLedgerId());

  const bump = useCallback(() => setDbVersion(v => v + 1), [setDbVersion]);

  // --- Ledger management ---
  const handleAddLedger = useCallback(() => {
    Alert.prompt(
      "장부 추가",
      "새 장부 이름을 입력하세요",
      [
        { text: "취소", style: "cancel" },
        {
          text: "추가",
          onPress: (name?: string) => {
            const trimmed = name?.trim();
            if (!trimmed) {
              return;
            }
            const ledger = createLedger(trimmed);
            const updated = getAllLedgers();
            setLedgers(updated);
            if (!currentLedgerId) {
              setCurrentLedgerId(ledger.id);
              setCurrentLedgerIdState(ledger.id);
            }
            bump();
          }
        }
      ],
      "plain-text"
    );
  }, [currentLedgerId, bump]);

  const handleDeleteLedger = useCallback(
    (ledger: Ledger) => {
      if (ledgers.length <= 1) {
        Alert.alert("삭제 불가", "장부는 최소 1개 이상 있어야 합니다.");
        return;
      }
      Alert.alert("장부 삭제", `"${ledger.name}" 장부와 모든 거래를 삭제하시겠습니까?`, [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            deleteLedger(ledger.id);
            const updated = getAllLedgers();
            setLedgers(updated);
            if (currentLedgerId === ledger.id && updated.length > 0) {
              setCurrentLedgerId(updated[0].id);
              setCurrentLedgerIdState(updated[0].id);
            }
            bump();
          }
        }
      ]);
    },
    [ledgers, currentLedgerId, bump]
  );

  const handleSelectLedger = useCallback(
    (ledger: Ledger) => {
      setCurrentLedgerId(ledger.id);
      setCurrentLedgerIdState(ledger.id);
      bump();
    },
    [bump]
  );

  // --- Theme ---
  const handleTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    setThemeModeState(mode);
  }, []);

  // --- CSV Export ---
  const handleExport = useCallback(async () => {
    const ledgerId = getCurrentLedgerId();
    if (!ledgerId) {
      Alert.alert("오류", "장부를 먼저 선택하세요.");
      return;
    }
    try {
      const transactions = getTransactionsForExport(ledgerId);
      const rules = getRecurringRules(ledgerId);
      const csv = buildExportCsv(transactions, rules);
      const fileName = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, csv, "utf8");
      await Share.open({
        url: Platform.OS === "android" ? `file://${filePath}` : filePath,
        type: "text/csv",
        filename: fileName
      });
    } catch (err: unknown) {
      if (!Share.isCancel?.(err)) {
        Alert.alert("오류", "CSV 내보내기에 실패했습니다.");
      }
    }
  }, []);

  // --- CSV Import ---
  const handleImport = useCallback(async () => {
    const ledgerId = getCurrentLedgerId();
    if (!ledgerId) {
      Alert.alert("오류", "장부를 먼저 선택하세요.");
      return;
    }
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.csv, DocumentPicker.types.plainText],
        copyTo: "cachesDirectory"
      });
      const filePath = result.fileCopyUri ?? result.uri;
      const content = await RNFS.readFile(
        Platform.OS === "android" ? filePath : decodeURIComponent(filePath.replace("file://", "")),
        "utf8"
      );
      const { transactions: rows, recurringRules: rrRows } = parseCsv(content);
      if (rows.length === 0 && rrRows.length === 0) {
        Alert.alert("오류", "가져올 데이터가 없습니다.");
        return;
      }
      const parts: string[] = [];
      if (rows.length > 0) {
        parts.push(`거래 ${rows.length}건`);
      }
      if (rrRows.length > 0) {
        parts.push(`반복거래 ${rrRows.length}건`);
      }
      Alert.alert("CSV 가져오기", `${parts.join(", ")}을 가져오시겠습니까?`, [
        { text: "취소", style: "cancel" },
        {
          text: "가져오기",
          onPress: () => {
            for (const row of rows) {
              createTransaction({
                ledger_id: ledgerId,
                type: row.type,
                amount: row.amount,
                category: row.category,
                payment_method: row.payment_method,
                memo: row.memo,
                date: row.date
              });
            }
            for (const rr of rrRows) {
              createRecurringRule({
                ledger_id: ledgerId,
                type: rr.type,
                amount: rr.amount,
                category: rr.category,
                payment_method: rr.payment_method,
                memo: rr.memo,
                day_of_month: rr.day_of_month
              });
            }
            bump();
            Alert.alert("완료", `${parts.join(", ")}을 가져왔습니다.`);
          }
        }
      ]);
    } catch (err: unknown) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert("오류", "CSV 가져오기에 실패했습니다.");
      }
    }
  }, [bump]);

  // --- CSV Template ---
  const handleTemplate = useCallback(async () => {
    try {
      const csv = buildTemplateCsv();
      const fileName = "import_template.csv";
      const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, csv, "utf8");
      await Share.open({
        url: Platform.OS === "android" ? `file://${filePath}` : filePath,
        type: "text/csv",
        filename: fileName
      });
    } catch (err: unknown) {
      if (!Share.isCancel?.(err)) {
        Alert.alert("오류", "템플릿 내보내기에 실패했습니다.");
      }
    }
  }, []);

  const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
    { label: "시스템", value: "system" },
    { label: "라이트", value: "light" },
    { label: "다크", value: "dark" }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <View style={[styles.titleRow, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- 장부 관리 --- */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>장부 관리</Text>
          {ledgers.map(ledger => (
            <View key={ledger.id} style={[styles.ledgerItem, { borderBottomColor: theme.border }]}>
              <TouchableOpacity
                style={styles.ledgerLeft}
                onPress={() => handleSelectLedger(ledger)}
                activeOpacity={0.7}
              >
                {ledger.id === currentLedgerId && <Text style={[styles.checkMark, { color: theme.primary }]}>✓ </Text>}
                <Text
                  style={[styles.ledgerName, { color: ledger.id === currentLedgerId ? theme.primary : theme.text }]}
                >
                  {ledger.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteLedger(ledger)} activeOpacity={0.7}>
                <Text style={[styles.deleteBtn, { color: theme.expense }]}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addLedgerBtn, { borderColor: theme.primary }]}
            onPress={handleAddLedger}
            activeOpacity={0.7}
          >
            <Text style={[styles.addLedgerText, { color: theme.primary }]}>+ 장부 추가</Text>
          </TouchableOpacity>
        </View>

        {/* --- 테마 --- */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>테마</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.themeBtn,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                  themeMode === opt.value && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => handleTheme(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.themeBtnText, { color: themeMode === opt.value ? "#fff" : theme.text }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- 카테고리 관리 --- */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>카테고리 관리</Text>
          <CategoryManager />
        </View>

        {/* --- 결제수단 관리 --- */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>결제수단 관리</Text>
          <PaymentMethodManager />
        </View>

        {/* --- 데이터 --- */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>데이터</Text>
          <TouchableOpacity
            style={[styles.dataBtn, { backgroundColor: theme.primary }]}
            onPress={handleExport}
            activeOpacity={0.7}
          >
            <Text style={styles.dataBtnText}>CSV 내보내기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dataBtn, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.primary }]}
            onPress={handleImport}
            activeOpacity={0.7}
          >
            <Text style={[styles.dataBtnText, { color: theme.primary }]}>CSV 가져오기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dataBtn, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
            onPress={handleTemplate}
            activeOpacity={0.7}
          >
            <Text style={[styles.dataBtnText, { color: theme.textSecondary }]}>가져오기 템플릿 다운로드</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  title: { fontSize: 22, fontWeight: "700" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  ledgerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  ledgerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  checkMark: { fontSize: 14, fontWeight: "700" },
  ledgerName: { fontSize: 14 },
  deleteBtn: { fontSize: 13, fontWeight: "600" },
  addLedgerBtn: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center"
  },
  addLedgerText: { fontSize: 14, fontWeight: "600" },
  themeRow: { flexDirection: "row", gap: 8 },
  themeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center"
  },
  themeBtnText: { fontSize: 13, fontWeight: "600" },
  dataBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10
  },
  dataBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" }
});
