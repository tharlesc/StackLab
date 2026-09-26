import React from 'react';
import { Container, LeftContent, Title, RightContent } from './styles';

export interface ActionItemProps {
  title: string;
  onPress?: () => void;
  isLast?: boolean;
  variant?: 'default' | 'danger';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const ActionItem = ({
  title,
  onPress,
  isLast = false,
  variant = 'default',
  leftIcon,
  rightIcon,
}: ActionItemProps) => {
  return (
    <Container
      activeOpacity={0.7}
      onPress={onPress}
      $isLast={isLast}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <LeftContent>
        {leftIcon}
        <Title $variant={variant}>{title}</Title>
      </LeftContent>
      {rightIcon && <RightContent>{rightIcon}</RightContent>}
    </Container>
  );
};
