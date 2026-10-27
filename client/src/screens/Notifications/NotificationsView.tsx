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
  ChevronRight,
} from 'lucide-react-native';

import { useNotifications, NotificationFilter } from './useNotifications';
import {
  ControlsHeader,
  StatusBarRow,
  StatusCounterText,
  MarkAllButton,
  MarkAllButtonText,
  NotificationCard,
  UnreadBar,
  IconContainer,
  ContentContainer,
  TitleRow,
  NotificationTitle,
  TimeText,
  NotificationMessage,
  ActionIndicator,
  ActionText,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Screen, ListContent } from '@/components/common/Layout';
import { SegmentedControl, SegmentOption } from '@/components/common/SegmentedControl';
import { EmptyState } from '@/components/common/EmptyState';
import { strings } from '@/constants/strings';
import type { AppNotification, NotificationVariant } from '@/types';

const FILTER_OPTIONS: readonly SegmentOption<NotificationFilter>[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'nao_lidas', label: 'Não lidas' },
  { value: 'rdos', label: 'RDOs' },
];

export const NotificationsView = () => {
  const theme = useTheme();
  const {
    notifications,
    rawCount,
    unreadCount,
    filter,
    setFilter,
    markAllAsRead,
    handlePressNotification,
    goBack,
  } = useNotifications();

  const getVariantIcon = (variant: NotificationVariant) => {
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

  const renderItem = ({ item }: { item: AppNotification }) => {
    const hasAction = Boolean(item.rdoId);

    return (
      <NotificationCard
        $isUnread={item.isUnread}
        activeOpacity={0.75}
        onPress={() => handlePressNotification(item)}
        accessibilityRole="button"
        accessibilityLabel={`Notificação: ${item.title}. ${item.message}. Recebida ${item.time}.${
          item.isUnread ? ' Não lida.' : ''
        }${hasAction ? ' Toque para abrir RDO.' : ''}`}
      >
        {item.isUnread && <UnreadBar />}

        <IconContainer $variant={item.variant}>{getVariantIcon(item.variant)}</IconContainer>

        <ContentContainer>
          <TitleRow>
            <NotificationTitle $isUnread={item.isUnread} numberOfLines={1}>
              {item.title}
            </NotificationTitle>
            <TimeText>{item.time}</TimeText>
          </TitleRow>

          <NotificationMessage numberOfLines={3}>{item.message}</NotificationMessage>

          {hasAction && (
            <ActionIndicator>
              <ActionText>Ver RDO</ActionText>
              <ChevronRight
                color={theme.colors.tintText}
                size={theme.icon.size.sm}
                strokeWidth={theme.icon.strokeWidth}
              />
            </ActionIndicator>
          )}
        </ContentContainer>
      </NotificationCard>
    );
  };

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

      {rawCount > 0 && (
        <ControlsHeader>
          <SegmentedControl options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

          <StatusBarRow>
            <StatusCounterText>
              {unreadCount > 0
                ? `${unreadCount} ${unreadCount === 1 ? 'não lida' : 'não lidas'}`
                : 'Tudo em dia'}
            </StatusCounterText>

            {unreadCount > 0 && (
              <MarkAllButton
                onPress={markAllAsRead}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={strings.notifications.markAllRead}
              >
                <MarkAllButtonText>{strings.notifications.markAllRead}</MarkAllButtonText>
              </MarkAllButton>
            )}
          </StatusBarRow>
        </ControlsHeader>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={
            <Bell
              color={theme.colors.text.secondary}
              size={theme.icon.size.empty}
              strokeWidth={theme.icon.strokeWidth}
            />
          }
          message={
            filter === 'nao_lidas'
              ? 'Nenhuma notificação não lida no momento.'
              : filter === 'rdos'
                ? 'Nenhuma notificação de RDO encontrada.'
                : strings.notifications.emptyMessage
          }
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
