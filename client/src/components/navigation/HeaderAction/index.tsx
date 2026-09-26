import React from 'react';
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
  return (
    <ActionButton
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
    >
      {icon}
      {hasNotification && <NotificationDot />}
      {badgeCount > 0 && (
        <Badge>
          <BadgeText>{badgeCount > 99 ? '99+' : badgeCount}</BadgeText>
        </Badge>
      )}
    </ActionButton>
  );
};
