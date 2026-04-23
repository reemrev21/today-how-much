import { useColorScheme } from "react-native";
import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { themeModeAtom } from "../store/atoms";

// Brutalist monochrome tokens
const light = {
  // Core
  ink: "#0A0A0A",
  paper: "#FAFAFA",
  card: "#FFFFFF",
  mute1: "#737373",
  mute2: "#A3A3A3",
  mute3: "#525252",
  rule: "#E5E5E5",
  hair: "#262626",

  // Semantic aliases (backward compat)
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#0A0A0A",
  textSecondary: "#737373",
  border: "#E5E5E5",
  income: "#737373", // mute1 — income is subdued
  expense: "#0A0A0A", // ink — expense is bold
  primary: "#0A0A0A",
  primaryLight: "#E5E5E5",
  tabBar: "#FFFFFF",
  tabBarBorder: "#0A0A0A",
  fab: "#0A0A0A",
  fabText: "#FFFFFF"
};

const dark = {
  // Core
  ink: "#F5F5F5",
  paper: "#0A0A0A",
  card: "#1A1A1A",
  mute1: "#A3A3A3",
  mute2: "#737373",
  mute3: "#D4D4D4",
  rule: "#333333",
  hair: "#D4D4D4",

  // Semantic aliases
  background: "#0A0A0A",
  surface: "#1A1A1A",
  text: "#F5F5F5",
  textSecondary: "#A3A3A3",
  border: "#333333",
  income: "#A3A3A3",
  expense: "#F5F5F5",
  primary: "#F5F5F5",
  primaryLight: "#333333",
  tabBar: "#1A1A1A",
  tabBarBorder: "#F5F5F5",
  fab: "#F5F5F5",
  fabText: "#0A0A0A"
};

export type Theme = typeof light;

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const themeMode = useAtomValue(themeModeAtom);
  return useMemo(() => {
    if (themeMode === "light") return light;
    if (themeMode === "dark") return dark;
    return systemScheme === "dark" ? dark : light;
  }, [themeMode, systemScheme]);
}
