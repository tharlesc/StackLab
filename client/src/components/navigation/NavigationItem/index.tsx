import React from 'react';
import {
  Tab,
  TabLabel,
  IconWrapper,
  Badge,
  BadgeText,
} from './styles';

export interface NavigationItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onPress: () => void;
  badgeCount?: number;
  accessibilityLabel?: string;
}

export const NavigationItem = ({
  icon,
  label,
  active = false,
  onPress,
  badgeCount = 0,
  accessibilityLabel,
}: NavigationItemProps) => {
  return (
    <Tab onPress={onPress} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={accessibilityLabel || label}>
      <IconWrapper>
        {icon}
        {badgeCount > 0 && (
          <Badge>
            <BadgeText>{badgeCount > 99 ? '99+' : badgeCount}</BadgeText>
          </Badge>
        )}
      </IconWrapper>
      <TabLabel $isActive={active}>{label}</TabLabel>
    </Tab>
  );
};
