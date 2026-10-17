import React from 'react';
import { strings } from '@/constants/strings';
import { ActionButton, NotificationDot, Badge, BadgeText } from './styles';

export interface HeaderActionProps {
  icon: React.ReactNode;
  onPress: () => void;
  hasNotification?: boolean;
  badgeCount?: number;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export const HeaderAction = ({
  icon,
  onPress,
  hasNotification = false,
  badgeCount = 0,
  accessibilityLabel,
  disabled = false,
}: HeaderActionProps) => {
  const badgeLabel = badgeCount > 0 ? strings.accessibility.pendingBadge(badgeCount) : undefined;
  const computedLabel =
    accessibilityLabel && badgeLabel
      ? `${accessibilityLabel}, ${badgeLabel}`
      : accessibilityLabel ?? badgeLabel;

  return (
    <ActionButton
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={computedLabel}
      disabled={disabled}
    >
      {icon}
      {hasNotification && <NotificationDot />}
      {badgeCount > 0 && (
        <Badge accessibilityLabel={badgeLabel}>
          <BadgeText>{badgeCount > 99 ? '99+' : badgeCount}</BadgeText>
        </Badge>
      )}
    </ActionButton>
  );
};
