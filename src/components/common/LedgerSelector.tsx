import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useTheme} from '../../styles/theme';
import {getAllLedgers} from '../../db/ledgerQueries';
import {getCurrentLedgerId, setCurrentLedgerId} from '../../store/settings';
import type {Ledger} from '../../types';

interface LedgerSelectorProps {
  onLedgerChange?: (ledger: Ledger) => void;
}

export function LedgerSelector({onLedgerChange}: LedgerSelectorProps): React.JSX.Element {
  const theme = useTheme();
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
      setModalVisible(false);
      onLedgerChange?.(ledger);
    },
    [onLedgerChange],
  );

  const handleClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <>
      <TouchableOpacity
        style={[styles.selector, {backgroundColor: theme.primaryLight, borderColor: theme.primary}]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorText, {color: theme.primary}]}>
          {currentLedger?.name ?? '가계부'}
        </Text>
        <Text style={[styles.chevron, {color: theme.primary}]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
          <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
            <View style={[styles.sheet, {backgroundColor: theme.card, borderColor: theme.border}]}>
              <Text style={[styles.sheetTitle, {color: theme.text, borderBottomColor: theme.border}]}>
                가계부 선택
              </Text>
              <FlatList
                data={ledgers}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.ledgerItem,
                      {borderBottomColor: theme.border},
                      item.id === currentLedger?.id && {backgroundColor: theme.primaryLight},
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.ledgerName,
                        {color: item.id === currentLedger?.id ? theme.primary : theme.text},
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.id === currentLedger?.id && (
                      <Text style={[styles.check, {color: theme.primary}]}>✓</Text>
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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  chevron: {
    fontSize: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  safeArea: {flex: 0},
  sheet: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 300,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ledgerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ledgerName: {
    fontSize: 15,
    fontWeight: '500',
  },
  check: {
    fontSize: 16,
    fontWeight: '700',
  },
});
