import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components/native';
import { useAuth } from '@/contexts/AuthContext';
import { useRDOs } from '@/contexts/RDOContext';
import { strings } from '@/constants/strings';
import { isOverdue, rdoMatchesQuery } from '@/utils/rdo';
import { isRdoInTimeFilter } from '@/utils/date';
import { getTotalPages, paginateItems } from '@/utils/pagination';
import type { ChartData, IndicatorItem, ActiveWork, RDO } from '@/types';

export const WORKS_PER_PAGE = 3;

export const TIME_FILTERS = ['Hoje', '7 Dias', '15 Dias', '1 Mês'] as const;
export type TimeFilter = (typeof TIME_FILTERS)[number] | '7 dias' | '15 dias' | '1 mês';

export type DashboardTab = 'Obras' | 'Novo RDO' | 'Inbox' | 'Cadastros' | 'Fila' | 'Ajustes' | 'Perfil';

export const useDashboardHome = () => {
  const router = useRouter();
  const theme = useTheme();
  const { user, isMaster, isClient } = useAuth();
  const { rdos, works } = useRDOs();

  const [activeTimeFilter, setActiveTimeFilter] = useState<string>('7 Dias');
  const [activeTab, setActiveTab] = useState<DashboardTab>('Obras');
  const [globalSearch, setGlobalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filtragem de obras por perfil:
  // - Usuário comum: apenas obras às quais está alocado (assignedWorkIds)
  // - Master: visão global de todas as obras
  const userWorks: ActiveWork[] = useMemo(() => {
    if (!user) return [];
    const sourceWorks = works || [];
    if (isMaster) return sourceWorks;
    return sourceWorks.filter((w) => user.assignedWorkIds?.includes(w.id));
  }, [user, isMaster, works]);

  // Paginação das obras (3 por página)
  const totalPages = useMemo(
    () => getTotalPages(userWorks.length, WORKS_PER_PAGE),
    [userWorks.length],
  );
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Redefine a página caso o usuário ou permissão mude (padrão React de ajuste de estado durante render)
  const userScopeKey = `${user?.id}-${isMaster}`;
  const [prevUserScope, setPrevUserScope] = useState(userScopeKey);
  if (prevUserScope !== userScopeKey) {
    setPrevUserScope(userScopeKey);
    setCurrentPage(1);
  }

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(Math.min(Math.max(1, page), totalPages));
    },
    [totalPages],
  );

  const paginatedWorks: ActiveWork[] = useMemo(
    () => paginateItems(userWorks, safeCurrentPage, WORKS_PER_PAGE),
    [userWorks, safeCurrentPage],
  );

  // 2. Métricas do Dashboard filtradas pelo período ativo ('Hoje', '7 Dias', '15 Dias', '1 Mês')
  const scopedPeriodRdos = useMemo(() => {
    const baseList = isMaster
      ? rdos
      : rdos.filter((r) => user?.assignedWorkIds?.includes(r.workId) || r.authorId === user?.id);
    return baseList.filter((r) => isRdoInTimeFilter(r, activeTimeFilter));
  }, [rdos, isMaster, user, activeTimeFilter]);

  const pendingRdos = useMemo(
    () => scopedPeriodRdos.filter((r) => r.status === 'submetido'),
    [scopedPeriodRdos],
  );
  const overdueCount = useMemo(
    () => pendingRdos.filter((r) => isOverdue(r)).length,
    [pendingRdos],
  );
  const approvedCount = useMemo(
    () => scopedPeriodRdos.filter((r) => r.status === 'aprovado').length,
    [scopedPeriodRdos],
  );
  const returnedCount = useMemo(
    () => scopedPeriodRdos.filter((r) => r.status === 'devolvido').length,
    [scopedPeriodRdos],
  );

  const timeFilterSubtitle = useMemo(() => {
    const norm = (activeTimeFilter || '').trim().toLowerCase();
    if (norm === 'hoje') {
      return isMaster ? 'Consolidado de Hoje' : 'Meus RDOs de Hoje';
    }
    if (norm.includes('7')) {
      return isMaster ? 'Consolidado dos últimos 7 dias' : strings.dashboard.last7Days;
    }
    if (norm.includes('15')) {
      return isMaster ? 'Consolidado dos últimos 15 dias' : 'Últimos 15 dias';
    }
    if (norm.includes('mês') || norm.includes('mes') || norm.includes('30')) {
      return isMaster ? 'Consolidado do último mês (30 dias)' : 'Último mês (30 dias)';
    }
    return `Período: ${activeTimeFilter}`;
  }, [activeTimeFilter, isMaster]);

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
    (rdoId: string, workId?: string) => {
      router.push({
        pathname: '/rdo-review',
        params: { id: rdoId, ...(workId ? { workId } : {}) },
      });
    },
    [router],
  );

  const navigateToWorkFeed = useCallback(
    (workId: string) => {
      router.push({
        pathname: '/work-feed',
        params: { id: workId },
      });
    },
    [router],
  );

  return {
    user,
    isMaster,
    isClient,
    activeTimeFilter,
    setActiveTimeFilter,
    timeFilterSubtitle,
    timeFilters: TIME_FILTERS,
    activeTab,
    setActiveTab,
    globalSearch,
    setGlobalSearch,
    searchResults,
    chartData,
    indicators,
    activeWorks: userWorks,
    paginatedWorks,
    currentPage: safeCurrentPage,
    totalPages,
    setCurrentPage: handlePageChange,
    pageSize: WORKS_PER_PAGE,
    pendingCount: pendingRdos.length,
    approvedCount,
    overdueCount,
    returnedCount,
    navigateToNotifications,
    navigateToProfile,
    navigateToInbox,
    navigateToAdmin,
    navigateToReview,
    navigateToWorkFeed,
  };
};

export default useDashboardHome;
