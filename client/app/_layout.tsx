import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../src/constants/theme';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
