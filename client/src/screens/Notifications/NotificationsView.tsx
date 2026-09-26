import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  ChevronLeft,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck,
} from 'lucide-react-native';

import { useNotifications } from './useNotifications';
import {
  NotificationCard,
  IconContainer,
  ContentContainer,
  TitleRow,
  NotificationTitle,
  TimeText,
  NotificationMessage,
  UnreadDot,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Screen, ListContent } from '@/components/common/Layout';
import { EmptyState } from '@/components/common/EmptyState';
import { strings } from '@/constants/strings';
import type { AppNotification, NotificationVariant } from '@/mocks';

export const NotificationsView = () => {
  const theme = useTheme();
  const { notifications, unreadCount, markAllAsRead, goBack } = useNotifications();

  const getIcon = (variant: NotificationVariant) => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 color={theme.colors.status.success.base} size={20} />;
      case 'warning':
        return <AlertTriangle color={theme.colors.status.warning.base} size={20} />;
      case 'error':
        return <Clock color={theme.colors.status.error.base} size={20} />;
      case 'info':
      default:
        return <Info color={theme.colors.status.info.base} size={20} />;
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <NotificationCard
      $isUnread={item.isUnread}
      activeOpacity={0.7}
      onPress={() => {}}
      accessibilityRole="button"
      accessibilityLabel={`Notificação: ${item.title}. ${item.message}. Recebida ${item.time}.${item.isUnread ? ' Não lida.' : ''}`}
    >
      <IconContainer $variant={item.variant}>{getIcon(item.variant)}</IconContainer>
      <ContentContainer>
        <TitleRow>
          <NotificationTitle $isUnread={item.isUnread}>{item.title}</NotificationTitle>
          <TimeText>{item.time}</TimeText>
        </TitleRow>
        <NotificationMessage numberOfLines={2}>{item.message}</NotificationMessage>
      </ContentContainer>
      {item.isUnread && <UnreadDot />}
    </NotificationCard>
  );

  return (
    <Screen>
      <Header
        title={strings.notifications.title}
        subtitle={
          unreadCount > 0
            ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}`
            : 'Todas lidas'
        }
        leftContent={
          <HeaderAction
            icon={<ChevronLeft color={theme.colors.text.secondary} size={24} />}
            onPress={goBack}
            accessibilityLabel={strings.accessibility.backButton}
          />
        }
        rightContent={
          unreadCount > 0 ? (
            <HeaderAction
              icon={<CheckCheck color={theme.colors.secondary} size={22} />}
              onPress={markAllAsRead}
              accessibilityLabel={strings.notifications.markAllRead}
            />
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell color={theme.colors.text.secondary} size={64} />}
          message={strings.notifications.emptyMessage}
        />
      ) : (
        <ListContent
          data={notifications}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem as any}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
};

export default NotificationsView;
