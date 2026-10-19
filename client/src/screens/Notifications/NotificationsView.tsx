import React from 'react';
import { useTheme } from 'styled-components/native';
import {
  ChevronLeft,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
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
import type { AppNotification, NotificationVariant } from '@/types';

export const NotificationsView = () => {
  const theme = useTheme();
  const { notifications, unreadCount, markAllAsRead, handlePressNotification, goBack } =
    useNotifications();

  const getIcon = (variant: NotificationVariant) => {
    switch (variant) {
      case 'success':
        return (
          <CheckCircle2
            color={theme.colors.status.success.base}
            size={theme.icon.size.md}
            strokeWidth={theme.icon.strokeWidth}
          />
        );
      case 'warning':
        return (
          <AlertTriangle
            color={theme.colors.status.warning.base}
            size={theme.icon.size.md}
            strokeWidth={theme.icon.strokeWidth}
          />
        );
      case 'error':
        return (
          <AlertCircle
            color={theme.colors.status.error.base}
            size={theme.icon.size.md}
            strokeWidth={theme.icon.strokeWidth}
          />
        );
      case 'info':
      default:
        return (
          <Info
            color={theme.colors.status.info.base}
            size={theme.icon.size.md}
            strokeWidth={theme.icon.strokeWidth}
          />
        );
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <NotificationCard
      $isUnread={item.isUnread}
      activeOpacity={0.7}
      onPress={() => handlePressNotification(item)}
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
        leftContent={
          <HeaderAction
            icon={
              <ChevronLeft
                color={theme.colors.text.secondary}
                size={theme.icon.size.lg}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={goBack}
            accessibilityLabel={strings.accessibility.backButton}
          />
        }
        rightContent={
          unreadCount > 0 ? (
            <HeaderAction
              icon={
                <CheckCheck
                  color={theme.colors.tintText}
                  size={theme.icon.size.lg}
                  strokeWidth={theme.icon.strokeWidth}
                />
              }
              onPress={markAllAsRead}
              accessibilityLabel={strings.notifications.markAllRead}
            />
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={
            <Bell
              color={theme.colors.text.secondary}
              size={theme.icon.size.empty}
              strokeWidth={theme.icon.strokeWidth}
            />
          }
          message={strings.notifications.emptyMessage}
        />
      ) : (
        <ListContent<AppNotification>
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
};

export default NotificationsView;
