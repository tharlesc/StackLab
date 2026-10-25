import React, { useEffect, useState } from 'react';
import { Animated, Platform } from 'react-native';
import { useTheme } from 'styled-components/native';
import { strings } from '@/constants/strings';
import {
  Tab,
  IconSlot,
  IconContainer,
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

const HIT_SLOP = { top: 24, bottom: 10, left: 12, right: 12 };

export const NavigationItem = ({
  icon,
  activeIcon,
  label,
  active = false,
  onPress,
  badgeCount = 0,
  accessibilityLabel,
}: NavigationItemProps) => {
  const theme = useTheme();
  const [animatedValue] = useState(() => new Animated.Value(active ? 1 : 0));

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: active ? 1 : 0,
      friction: 6,
      tension: 65,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [active, animatedValue]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const baseLabel = accessibilityLabel || label;
  const badgeLabel = badgeCount > 0 ? strings.accessibility.pendingBadge(badgeCount) : undefined;
  const fullAccessibilityLabel = badgeLabel ? `${baseLabel}, ${badgeLabel}` : baseLabel;

  const targetIcon = active && activeIcon ? activeIcon : icon;
  const renderedIcon = React.isValidElement<{ color?: string; style?: any }>(targetIcon)
    ? React.cloneElement(targetIcon, {
        color: active ? theme.colors.text.inverse : theme.colors.text.secondary,
      })
    : targetIcon;

  return (
    <Tab
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={HIT_SLOP}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={fullAccessibilityLabel}
    >
      <IconSlot>
        <IconContainer
          $isActive={active}
          style={{ transform: [{ translateY }, { scale }] }}
        >
          <IconWrapper>
            {renderedIcon}
            {badgeCount > 0 && (
              <Badge accessibilityLabel={badgeLabel}>
                <BadgeText>{badgeCount > 99 ? '99+' : badgeCount}</BadgeText>
              </Badge>
            )}
          </IconWrapper>
        </IconContainer>
      </IconSlot>
      <TabLabel $isActive={active}>{label}</TabLabel>
    </Tab>
  );
};
