import React from 'react';
import { ActionContainer, ActionButton, ActionLabel } from './styles';

export interface PrimaryActionItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const PrimaryActionItem = ({
  icon,
  label,
  onPress,
  accessibilityLabel,
}: PrimaryActionItemProps) => {
  return (
    <ActionContainer>
      <ActionButton activeOpacity={0.8} onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel || label}>
        {icon}
      </ActionButton>
      <ActionLabel>{label}</ActionLabel>
    </ActionContainer>
  );
};
