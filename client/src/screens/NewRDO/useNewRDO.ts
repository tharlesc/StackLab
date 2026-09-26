import { useState, useCallback } from 'react';
import { MOCK_ACTIVE_WORKS } from '@/mocks';
import type { ActiveWork } from '@/types';

export const useNewRDO = () => {
  const [works] = useState<ActiveWork[]>(MOCK_ACTIVE_WORKS);
  const [selectedWork, setSelectedWork] = useState<ActiveWork | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectWork = useCallback((work: ActiveWork) => {
    setSelectedWork(work);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleConfirmStart = useCallback(() => {
    if (selectedWork) {
      console.log('Iniciar RDO confirmado para a obra:', selectedWork.id);
    }
    setIsDialogOpen(false);
  }, [selectedWork]);

  return {
    works,
    selectedWork,
    isDialogOpen,
    handleSelectWork,
    handleCloseDialog,
    handleConfirmStart,
  };
};

export default useNewRDO;
