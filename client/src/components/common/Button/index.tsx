import React, { useState } from 'react';
import { ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ButtonContainer, ButtonText, ButtonVariant, ButtonSize } from './styles';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
  style,
}: ButtonProps) => {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  const indicatorColor =
    variant === 'outline'
      ? theme.colors.text.primary
      : variant === 'secondary'
        ? theme.colors.onSecondary
        : theme.colors.text.inverse;

  return (
    <ButtonContainer
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $pressed={pressed}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <>
          {icon}
          <ButtonText $variant={variant} $size={size}>
            {title}
          </ButtonText>
        </>
      )}
    </ButtonContainer>
  );
};
