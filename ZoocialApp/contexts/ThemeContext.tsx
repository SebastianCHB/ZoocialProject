import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme';

export const light = {
  bg: '#f7f9fc',
  card: '#ffffff',
  text: '#1a1a2e',
  subtext: '#6b7280',
  border: '#e5e7eb',
  primary: '#0c5cb3',
  accent: '#f69622',
  input: '#f3f4f6',
  inputBorder: '#d1d5db',
  danger: '#e63946',
  success: '#2a9d8f',
  header: '#ffffff',
  tabBar: '#ffffff',
  placeholder: '#9ca3af',
  tag: '#eef4fc',
  tagText: '#0c5cb3',
  shadow: 'rgba(0,0,0,0.06)',
};

export const dark = {
  bg: '#0f1117',
  card: '#1e2130',
  text: '#f1f5f9',
  subtext: '#94a3b8',
  border: '#2d3148',
  primary: '#4d8ef0',
  accent: '#f69622',
  input: '#252839',
  inputBorder: '#3b4160',
  danger: '#e63946',
  success: '#2a9d8f',
  header: '#1e2130',
  tabBar: '#1e2130',
  placeholder: '#64748b',
  tag: '#1e2a40',
  tagText: '#4d8ef0',
  shadow: 'rgba(0,0,0,0.3)',
};

export type Theme = typeof light;

type ThemeCtx = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: light,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (saved !== null) setIsDark(saved === 'dark');
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  const theme = isDark ? dark : light;
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
