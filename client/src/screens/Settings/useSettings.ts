import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppTheme, ThemeMode } from '@/contexts/ThemeContext';
import { R } from '@/constants/R';

export const useSettings = () => {
  const { isDark, themeMode, setThemeMode, toggleTheme } = useAppTheme();
  const [syncOnlyWifi, setSyncOnlyWifi] = useState(true);

  const toggleSyncWifi = useCallback(() => {
    setSyncOnlyWifi((prev) => !prev);
  }, []);

  const handleThemeModeChange = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
    },
    [setThemeMode],
  );

  const openTerms = useCallback(() => {
    Alert.alert(
      R.strings.settings.terms,
      `${R.strings.common.appName} — ${R.strings.settings.appVersion}.\nTodos os direitos reservados.`,
    );
  }, []);

  const openHelp = useCallback(() => {
    Alert.alert(
      R.strings.settings.helpCenter,
      'Entre em contato com o suporte através de suporte@stacklab.com',
    );
  }, []);

  return {
    isDark,
    themeMode,
    handleThemeModeChange,
    toggleTheme,
    syncOnlyWifi,
    toggleSyncWifi,
    openTerms,
    openHelp,
  };
};

export default useSettings;
