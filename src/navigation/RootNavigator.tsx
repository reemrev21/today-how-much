import React, {useCallback, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BottomSheet, {BottomSheetView, BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../styles/theme';
import {CalendarScreen} from '../screens/CalendarScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {StatsScreen} from '../screens/StatsScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {FAB} from '../components/common/FAB';
import {TransactionForm} from '../components/transaction/TransactionForm';
import {useTransactions} from '../hooks/useTransactions';
import type {Transaction} from '../types';

const Tab = createBottomTabNavigator();

const TAB_BAR_HEIGHT = 49;
const FAB_SIZE = 56;

export function RootNavigator(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const {add} = useTransactions();

  const handleFABPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleSave = useCallback(
    (params: Omit<Transaction, 'id' | 'created_at'>) => {
      add(params);
      bottomSheetRef.current?.close();
    },
    [add],
  );

  const handleCancel = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.tabBarBorder,
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingBottom: insets.bottom,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: {fontSize: 11},
        }}
      >
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarLabel: '달력',
            tabBarIcon: ({color}) => (
              <Text style={{fontSize: 20, color}}>📅</Text>
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarLabel: '내역',
            tabBarIcon: ({color}) => (
              <Text style={{fontSize: 20, color}}>📋</Text>
            ),
          }}
        />
        <Tab.Screen
          name="AddPlaceholder"
          component={EmptyScreen}
          options={{
            tabBarLabel: '',
            tabBarButton: () => <View style={{width: FAB_SIZE}} />,
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            tabBarLabel: '통계',
            tabBarIcon: ({color}) => (
              <Text style={{fontSize: 20, color}}>📊</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: '설정',
            tabBarIcon: ({color}) => (
              <Text style={{fontSize: 20, color}}>⚙️</Text>
            ),
          }}
        />
      </Tab.Navigator>

      {/* FAB overlay centered above tab bar */}
      <View
        style={[
          styles.fabContainer,
          {bottom: tabBarHeight - FAB_SIZE / 2},
        ]}
        pointerEvents="box-none"
      >
        <FAB onPress={handleFABPress} />
      </View>

      {/* Transaction Form BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['85%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{backgroundColor: theme.surface}}
        handleIndicatorStyle={{backgroundColor: theme.textSecondary}}
      >
        <BottomSheetView style={styles.sheetContent}>
          <TransactionForm onSave={handleSave} onCancel={handleCancel} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

function EmptyScreen(): React.JSX.Element {
  return <View style={{flex: 1}} />;
}

const styles = StyleSheet.create({
  root: {flex: 1},
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  sheetContent: {flex: 1},
});
