import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { MOCK_NOTIFICATIONS, type AppNotification } from '@/mocks';

export type NotificationFilter = 'todas' | 'nao_lidas' | 'rdos';

export const useNotifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationFilter>('todas');

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.isUnread).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'nao_lidas':
        return notifications.filter((n) => n.isUnread);
      case 'rdos':
        return notifications.filter((n) => Boolean(n.rdoId));
      case 'todas':
      default:
        return notifications;
    }
  }, [notifications, filter]);

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
    notifications: filteredNotifications,
    rawCount: notifications.length,
    unreadCount,
    filter,
    setFilter,
    markAllAsRead,
    handlePressNotification,
    goBack,
  };
};

export default useNotifications;
