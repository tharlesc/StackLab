import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRDOs } from '@/contexts/RDOContext';
import { useAdmin } from '@/contexts/AdminContext';
import { MOCK_ACTIVE_WORKS } from '@/mocks';
import { isOverdue, rdoMatchesQuery } from '@/utils/rdo';
import type { ChartData, IndicatorItem, ActiveWork, RDO } from '@/types';

export type DashboardTab = 'Obras' | 'Novo RDO' | 'Inbox' | 'Cadastros' | 'Fila' | 'Ajustes';

export const useDashboardHome = () => {
  const router = useRouter();
  const { user, isMaster } = useAuth();
  const { rdos } = useRDOs();
  const { works } = useAdmin();

  const [activeTimeFilter, setActiveTimeFilter] = useState('7 dias');
  const [activeTab, setActiveTab] = useState<DashboardTab>('Obras');
  const [globalSearch, setGlobalSearch] = useState('');

  // 1. Filtragem de obras por perfil:
  // - Usuário comum: apenas obras às quais está alocado (assignedWorkIds)
  // - Master: visão global de todas as obras
  const userWorks: ActiveWork[] = useMemo(() => {
    if (!user) return [];
    if (isMaster) return MOCK_ACTIVE_WORKS;
    return MOCK_ACTIVE_WORKS.filter((w) => user.assignedWorkIds?.includes(w.id));
  }, [user, isMaster]);

  // 2. Métricas do Master:
  const pendingRdos = useMemo(() => rdos.filter((r) => r.status === 'submetido'), [rdos]);
  const overdueCount = useMemo(() => pendingRdos.filter((r) => isOverdue(r)).length, [pendingRdos]);
  const approvedCount = useMemo(() => rdos.filter((r) => r.status === 'aprovado').length, [rdos]);
  const returnedCount = useMemo(() => rdos.filter((r) => r.status === 'devolvido').length, [rdos]);

  // Donut chart e indicadores calculados em tempo real a partir dos RDOs
  const chartData: ChartData[] = useMemo(
    () => [
      { value: approvedCount, color: '#10B981' },
      { value: pendingRdos.length, color: '#F59E0B' },
      { value: overdueCount, color: '#EF4444' },
    ],
    [approvedCount, pendingRdos.length, overdueCount]
  );

  const indicators: IndicatorItem[] = useMemo(
    () => [
      { id: '1', label: 'Homologados', value: approvedCount, color: '#10B981' },
      { id: '2', label: 'Em Análise', value: pendingRdos.length, color: '#F59E0B' },
      { id: '3', label: 'Em Atraso (>24h)', value: overdueCount, color: '#EF4444' },
    ],
    [approvedCount, pendingRdos.length, overdueCount]
  );

  // 3. Busca Global do Master (pesquisa em todos os relatórios)
  const searchResults: RDO[] = useMemo(() => {
    if (!globalSearch.trim()) return [];
    return rdos.filter((r) => rdoMatchesQuery(r, globalSearch));
  }, [rdos, globalSearch]);

  const navigateToNotifications = useCallback(() => {
    router.push('/notifications');
  }, [router]);

  const navigateToProfile = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const navigateToInbox = useCallback(() => {
    setActiveTab('Inbox');
  }, []);

  const navigateToAdmin = useCallback(() => {
    setActiveTab('Cadastros');
  }, []);

  const navigateToReview = useCallback(
    (rdoId: string) => {
      router.push({
        pathname: '/rdo-review',
        params: { id: rdoId },
      });
    },
    [router]
  );

  return {
    user,
    isMaster,
    activeTimeFilter,
    setActiveTimeFilter,
    activeTab,
    setActiveTab,
    globalSearch,
    setGlobalSearch,
    searchResults,
    chartData,
    indicators,
    activeWorks: userWorks,
    pendingCount: pendingRdos.length,
    overdueCount,
    returnedCount,
    navigateToNotifications,
    navigateToProfile,
    navigateToInbox,
    navigateToAdmin,
    navigateToReview,
  };
};

export default useDashboardHome;
