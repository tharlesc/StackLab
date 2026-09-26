import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';

export const useSettings = () => {
  const { isDark, toggleTheme } = useAppTheme();
  const [syncOnlyWifi, setSyncOnlyWifi] = useState(true);

  const toggleSyncWifi = useCallback(() => {
    setSyncOnlyWifi((prev) => !prev);
  }, []);

  const openTerms = useCallback(() => {
    Alert.alert('Termos de Uso', 'StackLab RDO Mobile — Versão 1.2.0.\nTodos os direitos reservados.');
  }, []);

  const openHelp = useCallback(() => {
    Alert.alert('Central de Ajuda', 'Entre em contato com o suporte através de suporte@stacklab.com');
  }, []);

  return {
    isDark,
    toggleTheme,
    syncOnlyWifi,
    toggleSyncWifi,
    openTerms,
    openHelp,
  };
};

export default useSettings;
