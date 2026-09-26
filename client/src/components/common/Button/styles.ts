import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth?: boolean;
  disabled?: boolean;
}

const getBackgroundColor = (theme: any, variant: ButtonVariant) => {
  switch (variant) {
    case 'secondary':
      return theme.colors.secondary;
    case 'outline':
      return 'transparent';
    case 'danger':
      return theme.colors.status.error.base;
    case 'primary':
    default:
      return theme.colors.primary;
  }
};

const getBorderColor = (theme: any, variant: ButtonVariant) => {
  if (variant === 'outline') return theme.colors.border;
  return 'transparent';
};

const getPadding = (theme: any, size: ButtonSize) => {
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
  min-height: 44px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  border-width: ${({ $variant }) => ($variant === 'outline' ? '1px' : '0px')};
  border-color: ${({ theme, $variant }) => getBorderColor(theme, $variant)};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const ButtonText = styled.Text<{ $variant: ButtonVariant; $size: ButtonSize }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ $size }) => ($size === 'small' ? '12px' : $size === 'large' ? '18px' : '16px')};
  color: ${({ theme, $variant }) =>
    $variant === 'outline' ? theme.colors.text.primary : theme.colors.text.inverse};
  margin-left: 8px;
  margin-right: 8px;
`;
