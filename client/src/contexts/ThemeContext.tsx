import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { lightTheme, darkTheme, ThemeType } from '@/constants/theme';

export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = '@stacklab:theme_mode';

interface AppThemeContextData {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const AppThemeContext = createContext<AppThemeContextData>({} as AppThemeContextData);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (mounted && (saved === 'system' || saved === 'light' || saved === 'dark')) {
          setThemeModeState(saved);
        }
      })
      .catch(() => {
        // Fallback silencioso para 'system'
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {
      // Ignora erro de persistência offline
    });
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const setDarkMode = useCallback(
    (dark: boolean) => {
      setThemeMode(dark ? 'dark' : 'light');
    },
    [setThemeMode],
  );

  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  const currentTheme: ThemeType = isDark ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ isDark, themeMode, setThemeMode, toggleTheme, setDarkMode }),
    [isDark, themeMode, setThemeMode, toggleTheme, setDarkMode],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={currentTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
};
