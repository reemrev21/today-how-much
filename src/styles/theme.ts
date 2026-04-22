import {useColorScheme} from 'react-native';
import {useMemo} from 'react';
import {getThemeMode} from '../store/settings';

const light = {
  background: '#FFFFFF', surface: '#F5F5F5', card: '#FFFFFF',
  text: '#1A1A1A', textSecondary: '#888888', border: '#E0E0E0',
  income: '#2E7D32', expense: '#D32F2F',
  primary: '#5C6BC0', primaryLight: '#E8EAF6',
  tabBar: '#FFFFFF', tabBarBorder: '#E0E0E0',
  fab: '#5C6BC0', fabText: '#FFFFFF',
};

const dark = {
  background: '#1A1A2E', surface: '#252545', card: '#2A2A4A',
  text: '#E0E0E0', textSecondary: '#888888', border: '#3A3A5A',
  income: '#51CF66', expense: '#FF6B6B',
  primary: '#7C6EF0', primaryLight: '#3A3A6A',
  tabBar: '#1E1E3A', tabBarBorder: '#2A2A4A',
  fab: '#7C6EF0', fabText: '#FFFFFF',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const themeMode = getThemeMode();
  return useMemo(() => {
    if (themeMode === 'light') return light;
    if (themeMode === 'dark') return dark;
    return systemScheme === 'dark' ? dark : light;
  }, [themeMode, systemScheme]);
}
