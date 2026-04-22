import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Platform} from 'react-native';
import {useTheme} from '../../styles/theme';

interface FABProps {
  onPress: () => void;
}

export function FAB({onPress}: FABProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.fab, {backgroundColor: theme.fab}, Platform.select({
        ios: styles.shadowIos,
        android: styles.shadowAndroid,
      })]}
      activeOpacity={0.8}
    >
      <Text style={[styles.plus, {color: theme.fabText}]}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowIos: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  shadowAndroid: {
    elevation: 6,
  },
  plus: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
});
