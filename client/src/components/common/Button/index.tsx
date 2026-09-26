import React from 'react';
import { ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { ButtonContainer, ButtonText, ButtonVariant, ButtonSize } from './styles';
import { useTheme } from 'styled-components/native';

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

  return (
    <ButtonContainer
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : theme.colors.text.inverse} />
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
