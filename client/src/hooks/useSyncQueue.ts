import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { MOCK_SYNC_QUEUE } from '@/mocks';
import type { SyncQueueItem } from '@/types';

export const useSyncQueue = () => {
  const [queue, setQueue] = useState<SyncQueueItem[]>(MOCK_SYNC_QUEUE);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = useCallback(() => {
    if (queue.length === 0) return;

    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert('Sincronização', 'Todos os relatórios foram sincronizados com sucesso!');
      setQueue([]);
    }, 1500);
  }, [queue.length]);

  return {
    queue,
    isSyncing,
    handleSyncAll,
  };
};

export default useSyncQueue;
