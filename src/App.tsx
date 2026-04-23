import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Provider as JotaiProvider } from "jotai";
import dayjs from "dayjs";
import { runMigrations } from "./db/migrations";
import { getAllLedgers, createLedger } from "./db/ledgerQueries";
import { getCurrentLedgerId, setCurrentLedgerId, getLastRecurringCheck, setLastRecurringCheck } from "./store/settings";
import { processRecurringRules } from "./db/recurringQueries";
import { RootNavigator } from "./navigation/RootNavigator";

export default function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // 1. Run DB migrations
        runMigrations();

        // 2. Ensure at least one ledger exists
        const ledgers = getAllLedgers();
        let currentId = getCurrentLedgerId();
        if (ledgers.length === 0) {
          const defaultLedger = createLedger("개인");
          currentId = defaultLedger.id;
          setCurrentLedgerId(defaultLedger.id);
        } else if (!currentId || !ledgers.find(l => l.id === currentId)) {
          currentId = ledgers[0].id;
          setCurrentLedgerId(currentId);
        }

        // 3. Process recurring rules
        if (currentId) {
          const today = dayjs().format("YYYY-MM-DD");
          const lastCheck = getLastRecurringCheck() ?? dayjs().subtract(1, "day").format("YYYY-MM-DD");
          processRecurringRules(currentId, lastCheck, today);
          setLastRecurringCheck(today);
        }
      } catch (e) {
        console.error("App init error:", e);
      } finally {
        setReady(true);
      }
    }
    init();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <JotaiProvider>
          <BottomSheetModalProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </BottomSheetModalProvider>
        </JotaiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" }
});
