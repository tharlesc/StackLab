import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components/native';
import { useAuth } from '@/contexts/AuthContext';
import { useRDOs } from '@/contexts/RDOContext';
import { MOCK_ACTIVE_WORKS } from '@/mocks';
import { strings } from '@/constants/strings';
import { isOverdue, rdoMatchesQuery } from '@/utils/rdo';
import type { ChartData, IndicatorItem, ActiveWork, RDO } from '@/types';

export type DashboardTab = 'Obras' | 'Novo RDO' | 'Inbox' | 'Cadastros' | 'Fila' | 'Ajustes';

export const useDashboardHome = () => {
  const router = useRouter();
  const theme = useTheme();
  const { user, isMaster } = useAuth();
  const { rdos } = useRDOs();

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

  // Donut chart e indicadores calculados com tokens semânticos de gráfico e glossário único
  const chartData: ChartData[] = useMemo(
    () => [
      { value: approvedCount, color: theme.colors.chart.signed },
      { value: pendingRdos.length, color: theme.colors.chart.inReview },
      { value: overdueCount, color: theme.colors.chart.pending },
    ],
    [approvedCount, pendingRdos.length, overdueCount, theme.colors.chart],
  );

  const indicators: IndicatorItem[] = useMemo(
    () => [
      {
        id: '1',
        label: strings.status.plural.aprovado,
        value: approvedCount,
        color: theme.colors.chart.signed,
      },
      {
        id: '2',
        label: strings.status.plural.submetido,
        value: pendingRdos.length,
        color: theme.colors.chart.inReview,
      },
      {
        id: '3',
        label: strings.status.plural.atrasado,
        value: overdueCount,
        color: theme.colors.chart.pending,
      },
    ],
    [approvedCount, pendingRdos.length, overdueCount, theme.colors.chart],
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
    [router],
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
