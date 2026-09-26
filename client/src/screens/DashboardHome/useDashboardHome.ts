import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_CHART_DATA, MOCK_INDICATORS, MOCK_ACTIVE_WORKS } from '@/mocks';

export type DashboardTab = 'Obras' | 'Novo RDO' | 'Fila' | 'Ajustes';

export const useDashboardHome = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTimeFilter, setActiveTimeFilter] = useState('7 dias');
  const [activeTab, setActiveTab] = useState<DashboardTab>('Obras');

  const navigateToNotifications = useCallback(() => {
    router.push('/notifications');
  }, [router]);

  const navigateToProfile = useCallback(() => {
    router.push('/profile');
  }, [router]);

  return {
    user,
    activeTimeFilter,
    setActiveTimeFilter,
    activeTab,
    setActiveTab,
    chartData: MOCK_CHART_DATA,
    indicators: MOCK_INDICATORS,
    activeWorks: MOCK_ACTIVE_WORKS,
    navigateToNotifications,
    navigateToProfile,
  };
};

export default useDashboardHome;
