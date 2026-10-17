import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ChipContainer, ChipText, ChipVariant } from './styles';
export type { ChipVariant } from './styles';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const Chip = ({
  label,
  variant = 'dark',
  icon,
  onPress,
  style,
  accessibilityLabel,
}: ChipProps) => {
  const theme = useTheme();
  return (
    <ChipContainer
      $variant={variant}
      $hasAction={!!onPress}
      onPress={onPress}
      disabled={!onPress}
      hitSlop={onPress ? theme.touchTarget.hitSlop : undefined}
      activeOpacity={0.7}
      style={style}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={accessibilityLabel || label}
    >
      {icon}
      <ChipText $variant={variant}>{label}</ChipText>
    </ChipContainer>
  );
};

export default Chip;
