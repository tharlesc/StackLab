import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRDOs } from '@/contexts/RDOContext';
import { useAdmin } from '@/contexts/AdminContext';
import { calcHeadcount, calcManHours } from '@/utils/rdo';
import { isRdoAvailableToClient } from '@/services/modules/rdoWorkflow';
import { matchesQuery } from '@/utils';
import type { RDO, Work } from '@/types';

export type ClientTab = 'Inicio' | 'RDOs' | 'Ajustes';

export const useClientDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { works: rdoWorks, rdos } = useRDOs();
  const adminCtx = useAdmin();
  const adminWorks = adminCtx?.works || [];

  const [activeTab, setActiveTab] = useState<ClientTab>('Inicio');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Identifica a obra atribuída ao cliente
  const assignedWork: Work = useMemo(() => {
    const assignedId = user?.assignedWorkIds?.[0];
    if (assignedId) {
      const foundInAdmin = adminWorks.find((w) => w.id === assignedId);
      if (foundInAdmin) return foundInAdmin;
      const foundInRdo = (rdoWorks || []).find((w) => w.id === assignedId);
      if (foundInRdo) {
        return {
          id: foundInRdo.id,
          name: foundInRdo.name,
          subtitle: foundInRdo.subtitle || 'Acompanhamento do Contratante',
          client: user.name,
          address: foundInRdo.subtitle || 'Localização em cadastramento',
          active: true,
        };
      }
    }
    const fallback = adminWorks[0] || rdoWorks[0];
    return {
      id: fallback?.id || 'w-default',
      name: fallback?.name || 'Obra Contratada',
      subtitle: fallback?.subtitle || 'Acompanhamento de Engenharia',
      client: user?.name || 'Cliente Geral',
      address: fallback?.address || 'Localização não informada',
      active: true,
    };
  }, [user, adminWorks, rdoWorks]);

  // RDOs da obra vinculada ao cliente: disponibilizados automaticamente após aprovação e assinatura do Master
  const workRdos = useMemo(() => {
    return rdos.filter(
      (r) =>
        (r.workId === assignedWork.id || r.workName === assignedWork.name) &&
        isRdoAvailableToClient(r),
    );
  }, [rdos, assignedWork]);

  // RDOs filtrados por data e pesquisa
  const filteredRdos = useMemo(() => {
    let list = workRdos;
    if (selectedDate) {
      list = list.filter((r) => r.date && r.date.split('T')[0] === selectedDate);
    }
    if (searchQuery.trim()) {
      list = list.filter((r) =>
        matchesQuery(searchQuery, r.number, r.date, r.authorName, r.workName),
      );
    }
    return [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [workRdos, selectedDate, searchQuery]);

  // Métricas do Dashboard da Obra (RDOs homologados e disponibilizados ao cliente)
  const totalRdos = workRdos.length;
  const approvedCount = workRdos.length;
  const pendingCount = 0;
  const returnedCount = 0;
  const approvalRate = 100;

  const totalManHours = useMemo(
    () => workRdos.reduce((sum, r) => sum + calcManHours(r.labor || []), 0),
    [workRdos],
  );

  const totalWorkers = useMemo(
    () => workRdos.reduce((sum, r) => sum + calcHeadcount(r.labor || []), 0),
    [workRdos],
  );

  const rainStoppageHours = useMemo(
    () =>
      workRdos.reduce((sum, r) => {
        const rainH = (r.weather || []).reduce(
          (wSum, w) => wSum + (w.stoppageHours || 0),
          0,
        );
        return sum + rainH;
      }, 0),
    [workRdos],
  );

  const totalActivities = useMemo(
    () => workRdos.reduce((sum, r) => sum + (r.activities?.length || 0), 0),
    [workRdos],
  );

  const navigateToReview = useCallback(
    (rdoId: string, workId?: string) => {
      router.push({
        pathname: '/rdo-review',
        params: { id: rdoId, ...(workId ? { workId } : (assignedWork?.id ? { workId: assignedWork.id } : {})) },
      });
    },
    [router, assignedWork?.id],
  );

  return {
    user,
    assignedWork,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    workRdos,
    filteredRdos,
    totalRdos,
    approvedCount,
    pendingCount,
    returnedCount,
    approvalRate,
    totalManHours,
    totalWorkers,
    rainStoppageHours,
    totalActivities,
    navigateToReview,
  };
};

export default useClientDashboard;
