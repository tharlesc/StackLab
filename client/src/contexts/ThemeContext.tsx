import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { lightTheme, darkTheme, ThemeType } from '../constants/theme';

interface AppThemeContextData {
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const AppThemeContext = createContext<AppThemeContextData>({} as AppThemeContextData);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const currentTheme = isDark ? darkTheme : lightTheme;

  return (
    <AppThemeContext.Provider value={{ isDark, toggleTheme, setDarkMode: setIsDark }}>
      <ThemeProvider theme={currentTheme as any}>
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
