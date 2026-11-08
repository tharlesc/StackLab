import React, { useRef, useMemo } from 'react';
import { Animated, PanResponder } from 'react-native';
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
  Trash2,
} from 'lucide-react-native';

import { useNotifications, NotificationFilter } from '@/hooks';
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
  SwipeContainer,
  DeleteUnderlay,
  DeleteUnderlayText,
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

interface SwipeableNotificationItemProps {
  item: AppNotification;
  onPress: () => void;
  onDelete: (id: string) => void;
  getVariantIcon: (variant: NotificationVariant) => React.ReactNode;
}

const SwipeableNotificationItem = ({
  item,
  onPress,
  onDelete,
  getVariantIcon,
}: SwipeableNotificationItemProps) => {
  const theme = useTheme();
  const pan = useRef(new Animated.Value(0)).current;
  const hasAction = Boolean(item.rdoId);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            Math.abs(gestureState.dx) > 15 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
          );
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            pan.setValue(Math.max(-140, gestureState.dx));
          } else {
            pan.setValue(0);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -110) {
            // Deslize longo para a esquerda: apaga automaticamente com animação rápida
            Animated.timing(pan, {
              toValue: -400,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onDelete(item.id));
          } else if (gestureState.dx < -50) {
            // Deslize médio: mantém o botão "Apagar" revelado
            Animated.spring(pan, {
              toValue: -90,
              useNativeDriver: true,
              bounciness: 4,
            }).start();
          } else {
            // Retorna à posição original
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 4,
            }).start();
          }
        },
      }),
    [item.id, onDelete, pan],
  );

  const handleManualDelete = () => {
    Animated.timing(pan, {
      toValue: -400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onDelete(item.id));
  };

  return (
    <SwipeContainer>
      <DeleteUnderlay
        onPress={handleManualDelete}
        accessibilityRole="button"
        accessibilityLabel={`Apagar notificação: ${item.title}`}
      >
        <Trash2 size={20} color="#FFFFFF" strokeWidth={2.2} />
        <DeleteUnderlayText>Apagar</DeleteUnderlayText>
      </DeleteUnderlay>

      <Animated.View
        style={{ transform: [{ translateX: pan }] }}
        {...panResponder.panHandlers}
      >
        <NotificationCard
          $isUnread={item.isUnread}
          activeOpacity={0.8}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Notificação: ${item.title}. ${item.message}. Recebida ${item.time}.${
            item.isUnread ? ' Não lida.' : ''
          }${hasAction ? ' Toque para abrir RDO.' : ''} Deslize para a esquerda para apagar.`}
          style={{ marginBottom: 0 }}
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
      </Animated.View>
    </SwipeContainer>
  );
};

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
    deleteNotification,
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
    return (
      <SwipeableNotificationItem
        key={item.id}
        item={item}
        onPress={() => handlePressNotification(item)}
        onDelete={deleteNotification}
        getVariantIcon={getVariantIcon}
      />
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
