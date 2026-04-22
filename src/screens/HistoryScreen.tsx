import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../styles/theme';

export function HistoryScreen(): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <Text style={[styles.text, {color: theme.text}]}>HistoryScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  text: {fontSize: 18},
});
