import styled, { DefaultTheme } from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth?: boolean;
  $pressed?: boolean;
  disabled?: boolean;
}

const getBackgroundColor = (theme: DefaultTheme, variant: ButtonVariant) => {
  switch (variant) {
    case 'secondary':
      return theme.colors.secondary;
    case 'outline':
      return 'transparent';
    case 'danger':
      return theme.colors.status.error.base;
    case 'primary':
    default:
      return theme.colors.buttonPrimaryBg;
  }
};

const getBorderColor = (theme: DefaultTheme, variant: ButtonVariant) => {
  if (variant === 'outline') return theme.colors.border;
  return 'transparent';
};

const getPadding = (theme: DefaultTheme, size: ButtonSize) => {
  switch (size) {
    case 'small':
      return `${theme.spacing.sm}px ${theme.spacing.md}px`;
    case 'large':
      return `${theme.spacing.lg}px ${theme.spacing.xl}px`;
    case 'medium':
    default:
      return `${theme.spacing.md}px ${theme.spacing.lg}px`;
  }
};

export const ButtonContainer = styled(TouchableOpacity)<StyledButtonProps>`
  background-color: ${({ theme, $variant, disabled }) =>
    disabled ? theme.colors.border : getBackgroundColor(theme, $variant)};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme, $size }) => getPadding(theme, $size)};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  border-width: ${({ $variant }) => ($variant === 'outline' ? '1px' : '0px')};
  border-color: ${({ theme, $variant }) => getBorderColor(theme, $variant)};
  opacity: ${({ disabled, $pressed }) => (disabled ? 0.6 : $pressed ? 0.85 : 1)};
  transform: ${({ $pressed }) => ($pressed ? 'scale(0.99)' : 'scale(1)')};
`;

export const ButtonText = styled.Text<{ $variant: ButtonVariant; $size: ButtonSize }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme, $size }) =>
    $size === 'small'
      ? theme.typography.caption.fontSize
      : $size === 'large'
        ? theme.typography.headline.fontSize
        : theme.typography.body.fontSize}px;
  line-height: ${({ theme, $size }) =>
    $size === 'small'
      ? theme.typography.caption.lineHeight
      : $size === 'large'
        ? theme.typography.headline.lineHeight
        : theme.typography.body.lineHeight}px;
  color: ${({ theme, $variant }) => {
    if ($variant === 'outline') return theme.colors.text.primary;
    if ($variant === 'secondary') return theme.colors.onSecondary;
    return theme.colors.text.inverse;
  }};
  margin-left: ${({ theme }) => theme.spacing.sm}px;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;
