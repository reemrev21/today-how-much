import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../styles/theme";
import { CalendarScreen } from "../screens/CalendarScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { RecurringScreen } from "../screens/RecurringScreen";
import { StatsScreen } from "../screens/StatsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

const TAB_BAR_HEIGHT = 52;

export function RootNavigator(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.paper },
          animation: "none",
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.ink,
            borderTopWidth: 2,
            height: tabBarHeight,
            paddingBottom: insets.bottom
          },
          tabBarActiveTintColor: theme.card,
          tabBarInactiveTintColor: theme.mute1,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 1,
            textTransform: "uppercase"
          },
          tabBarItemStyle: {
            borderRightWidth: 1,
            borderRightColor: theme.rule
          },
          tabBarActiveBackgroundColor: theme.ink
        }}
      >
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarLabel: "\uB2EC\uB825",
            tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>{"\u25A0"}</Text>
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarLabel: "\uB0B4\uC5ED",
            tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>{"\u2261"}</Text>
          }}
        />
        <Tab.Screen
          name="Recurring"
          component={RecurringScreen}
          options={{
            tabBarLabel: "\uBC18\uBCF5",
            tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>{"\u25C6"}</Text>
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            tabBarLabel: "\uD1B5\uACC4",
            tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>{"\u25B2"}</Text>
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: "\uC124\uC815",
            tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>{"\u25CE"}</Text>
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabIcon: {
    fontSize: 16,
    fontWeight: "800"
  }
});
