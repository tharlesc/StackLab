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

  const handlePressNotification = useCallback(
    (notification: AppNotification) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isUnread: false } : n))
      );
      if (notification.rdoId) {
        router.push({
          pathname: '/rdo-review',
          params: { id: notification.rdoId },
        });
      }
    },
    [router]
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    handlePressNotification,
    goBack,
  };
};

export default useNotifications;
