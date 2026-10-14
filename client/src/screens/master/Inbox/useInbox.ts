import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useRDOs } from '@/contexts/RDOContext';
import { isOverdue, getDisplayStatus, sortByReviewPriority } from '@/utils/rdo';
import { matchesQuery, formatRelative } from '@/utils';
import type { RDO, RDODisplayStatus } from '@/types';

export type InboxFilter = 'todos' | 'atrasados' | 'submetidos' | 'devolvidos';

export const useInbox = () => {
  const router = useRouter();
  const { rdos } = useRDOs();
  const [filter, setFilter] = useState<InboxFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // RDOs relevantes para validação pelo Master (submetidos, devolvidos)
  const validationRdos = useMemo(() => {
    return rdos.filter((r) => r.status === 'submetido' || r.status === 'devolvido');
  }, [rdos]);

  const overdueCount = useMemo(() => {
    return validationRdos.filter((r) => isOverdue(r)).length;
  }, [validationRdos]);

  const filteredRdos = useMemo(() => {
    let result = validationRdos;

    if (filter === 'atrasados') {
      result = result.filter((r) => isOverdue(r));
    } else if (filter === 'submetidos') {
      result = result.filter((r) => r.status === 'submetido' && !isOverdue(r));
    } else if (filter === 'devolvidos') {
      result = result.filter((r) => r.status === 'devolvido');
    }

    if (searchQuery.trim()) {
      result = result.filter((r) =>
        matchesQuery(searchQuery, r.number, r.workName, r.authorName, r.date)
      );
    }

    return sortByReviewPriority(result);
  }, [validationRdos, filter, searchQuery]);

  const navigateToReview = useCallback(
    (rdoId: string) => {
      router.push({
        pathname: '/rdo-review',
        params: { id: rdoId },
      });
    },
    [router]
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filteredRdos,
    totalPending: validationRdos.length,
    overdueCount,
    navigateToReview,
    goBack,
  };
};

export default useInbox;
