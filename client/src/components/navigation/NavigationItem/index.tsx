import React from 'react';
import { strings } from '@/constants/strings';
import {
  Tab,
  TabLabel,
  IconWrapper,
  Badge,
  BadgeText,
} from './styles';

export interface NavigationItemProps {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  active?: boolean;
  onPress: () => void;
  badgeCount?: number;
  accessibilityLabel?: string;
}

export const NavigationItem = ({
  icon,
  activeIcon,
  label,
  active = false,
  onPress,
  badgeCount = 0,
  accessibilityLabel,
}: NavigationItemProps) => {
  const baseLabel = accessibilityLabel || label;
  const badgeLabel = badgeCount > 0 ? strings.accessibility.pendingBadge(badgeCount) : undefined;
  const fullAccessibilityLabel = badgeLabel ? `${baseLabel}, ${badgeLabel}` : baseLabel;

  return (
    <Tab
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={fullAccessibilityLabel}
    >
      <IconWrapper>
        {active && activeIcon ? activeIcon : icon}
        {badgeCount > 0 && (
          <Badge accessibilityLabel={badgeLabel}>
            <BadgeText>{badgeCount > 99 ? '99+' : badgeCount}</BadgeText>
          </Badge>
        )}
      </IconWrapper>
      <TabLabel $isActive={active}>{label}</TabLabel>
    </Tab>
  );
};
