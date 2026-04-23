import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useAtom, useAtomValue } from "jotai";

import { useTheme } from "../styles/theme";
import { historyFilterAtom, dbVersionAtom } from "../store/atoms";
import { getCurrentLedgerId } from "../store/settings";
import { getFilteredTransactions } from "../db/transactionQueries";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionItem } from "../components/transaction/TransactionItem";

import type { Transaction, TransactionType } from "../types";

const PAGE_SIZE = 50;

export function HistoryScreen(): React.JSX.Element {
  const theme = useTheme();

  const [filter, setFilter] = useAtom(historyFilterAtom);
  const dbVersion = useAtomValue(dbVersionAtom);
  const { remove } = useTransactions();

  const [searchText, setSearchText] = useState(filter.search ?? "");
  const [page, setPage] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  const ledgerId = getCurrentLedgerId() ?? "";

  // Derive transactions from db whenever filter/page/dbVersion changes
  const transactions = useMemo(() => {
    if (!ledgerId) {
      return [];
    }
    const activeFilter = {
      ...filter,
      search: searchText.trim() || undefined
    };
    return getFilteredTransactions(ledgerId, activeFilter, PAGE_SIZE * (page + 1), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, filter, searchText, page, dbVersion]);

  const handleSearchSubmit = useCallback(() => {
    setFilter(prev => ({ ...prev, search: searchText.trim() || undefined }));
    setPage(0);
    setAllLoaded(false);
  }, [searchText, setFilter]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (text === "") {
        setFilter(prev => ({ ...prev, search: undefined }));
        setPage(0);
        setAllLoaded(false);
      }
    },
    [setFilter]
  );

  const handleTypeFilter = useCallback(
    (type: TransactionType | undefined) => {
      setFilter(prev => ({ ...prev, type }));
      setPage(0);
      setAllLoaded(false);
    },
    [setFilter]
  );

  const handleLoadMore = useCallback(() => {
    if (allLoaded) {
      return;
    }
    const nextPage = page + 1;
    const activeFilter = {
      ...filter,
      search: searchText.trim() || undefined
    };
    const more = getFilteredTransactions(ledgerId, activeFilter, PAGE_SIZE, nextPage * PAGE_SIZE);
    if (more.length < PAGE_SIZE) {
      setAllLoaded(true);
    }
    if (more.length > 0) {
      setPage(nextPage);
    }
  }, [allLoaded, page, filter, searchText, ledgerId]);

  const handleDelete = useCallback(
    (transaction: Transaction) => {
      remove(transaction.id);
    },
    [remove]
  );

  const handlePress = useCallback((_transaction: Transaction) => {
    // No-op for now; edit can be added later
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem transaction={item} onPress={handlePress} onDelete={handleDelete} />
    ),
    [handlePress, handleDelete]
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const isIncomeActive = filter.type === "income";
  const isExpenseActive = filter.type === "expense";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <View style={[styles.titleRow, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>내역</Text>
      </View>

      {/* Search bar */}
      <View style={[styles.searchRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
          placeholder="메모 검색..."
          placeholderTextColor={theme.textSecondary}
          value={searchText}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter chips */}
      <View style={[styles.filterRow, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.chip,
            { borderColor: theme.border, backgroundColor: theme.card },
            isIncomeActive && { backgroundColor: theme.income, borderColor: theme.income }
          ]}
          onPress={() => handleTypeFilter(isIncomeActive ? undefined : "income")}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, { color: isIncomeActive ? "#fff" : theme.textSecondary }]}>수입</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            { borderColor: theme.border, backgroundColor: theme.card },
            isExpenseActive && { backgroundColor: theme.expense, borderColor: theme.expense }
          ]}
          onPress={() => handleTypeFilter(isExpenseActive ? undefined : "expense")}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, { color: isExpenseActive ? "#fff" : theme.textSecondary }]}>지출</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>거래 내역이 없습니다</Text>
        </View>
      ) : (
        <FlashList
          data={transactions}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          estimatedItemSize={72}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 15 },
  listContent: { paddingBottom: 16 }
});
