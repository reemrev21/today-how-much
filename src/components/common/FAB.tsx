import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../styles/theme";

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.fab, { backgroundColor: theme.ink, borderColor: theme.ink }]}
      activeOpacity={0.8}
    >
      <Text style={[styles.plus, { color: theme.card }]}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  plus: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "300"
  }
});
