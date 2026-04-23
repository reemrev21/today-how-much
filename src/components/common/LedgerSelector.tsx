import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { useSetAtom } from "jotai";
import { useTheme } from "../../styles/theme";
import { getAllLedgers } from "../../db/ledgerQueries";
import { getCurrentLedgerId, setCurrentLedgerId } from "../../store/settings";
import { dbVersionAtom } from "../../store/atoms";
import type { Ledger } from "../../types";

interface LedgerSelectorProps {
  onLedgerChange?: (ledger: Ledger) => void;
}

export function LedgerSelector({ onLedgerChange }: LedgerSelectorProps): React.JSX.Element {
  const theme = useTheme();
  const setDbVersion = useSetAtom(dbVersionAtom);
  const [modalVisible, setModalVisible] = useState(false);

  const ledgers = getAllLedgers();
  const currentId = getCurrentLedgerId();
  const currentLedger = ledgers.find(l => l.id === currentId) ?? ledgers[0];

  const handleOpen = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleSelect = useCallback(
    (ledger: Ledger) => {
      setCurrentLedgerId(ledger.id);
      setDbVersion(v => v + 1);
      setModalVisible(false);
      onLedgerChange?.(ledger);
    },
    [setDbVersion, onLedgerChange]
  );

  const handleClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <>
      {/* Brutal badge style */}
      <TouchableOpacity style={[styles.badge, { borderColor: theme.ink }]} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={[styles.badgeText, { color: theme.ink }]}>{(currentLedger?.name ?? "").toUpperCase()}</Text>
        <Text style={[styles.chevron, { color: theme.ink }]}>{"\u25BE"}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleClose}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
          <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
            <View style={[styles.sheet, { backgroundColor: theme.ink }]}>
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: theme.card }]}>{"\uC7A5\uBD80 \uC120\uD0DD"}</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.closeBtn, { color: theme.card }]}>{"\u2715"}</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={ledgers}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.ledgerItem,
                      { borderBottomColor: theme.rule, backgroundColor: theme.card },
                      item.id === currentLedger?.id && { backgroundColor: theme.ink, borderBottomColor: theme.ink }
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.ledgerName, { color: item.id === currentLedger?.id ? theme.card : theme.ink }]}
                    >
                      {item.name}
                    </Text>
                    {item.id === currentLedger?.id && (
                      <Text style={[styles.check, { color: theme.card }]}>{"\u2713"}</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderRadius: 0,
    gap: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1
  },
  chevron: {
    fontSize: 10
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 24
  },
  safeArea: { flex: 0 },
  sheet: {
    overflow: "hidden",
    maxHeight: 300
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sheetTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: "700"
  },
  ledgerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  ledgerName: {
    fontSize: 15,
    fontWeight: "600"
  },
  check: {
    fontSize: 16,
    fontWeight: "700"
  }
});
