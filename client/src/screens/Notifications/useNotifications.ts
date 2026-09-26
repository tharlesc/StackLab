import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { MOCK_NOTIFICATIONS, type AppNotification } from '@/mocks';

export const useNotifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  }, []);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    goBack,
  };
};

export default useNotifications;
