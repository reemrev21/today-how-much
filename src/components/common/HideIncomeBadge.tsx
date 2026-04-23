import React, { useCallback } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAtom } from "jotai";
import { useTheme } from "../../styles/theme";
import { hideIncomeAtom } from "../../store/atoms";
import { setHideIncome } from "../../store/settings";

export function HideIncomeBadge(): React.JSX.Element {
  const theme = useTheme();
  const [hideIncome, setHideIncomeAtom] = useAtom(hideIncomeAtom);

  const toggle = useCallback(() => {
    const next = !hideIncome;
    setHideIncome(next);
    setHideIncomeAtom(next);
  }, [hideIncome, setHideIncomeAtom]);

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        { borderColor: hideIncome ? theme.mute2 : theme.ink },
        hideIncome && { backgroundColor: theme.mute2 }
      ]}
      onPress={toggle}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          { color: hideIncome ? theme.card : theme.ink },
          hideIncome && styles.strike
        ]}
      >
        수입
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  text: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1
  },
  strike: {
    textDecorationLine: "line-through"
  }
});
