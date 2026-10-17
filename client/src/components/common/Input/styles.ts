import styled from 'styled-components/native';
import { TextInput } from 'react-native';

export const Field = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const InputWrapper = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const InputLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StyledInput = styled(TextInput)<{
  $focused?: boolean;
  $hasError?: boolean;
  $disabled?: boolean;
}>`
  background-color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.surfaceVariant : theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.text.secondary : theme.colors.text.primary};
  border-width: ${({ $focused, $hasError }) => ($focused || $hasError ? 1.5 : 1)}px;
  border-color: ${({ theme, $focused, $hasError }) => {
    if ($hasError) return theme.colors.status.error.base;
    if ($focused) return theme.colors.secondary;
    return theme.colors.border;
  }};
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
`;

export const HelperText = styled.Text<{ $isError?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme, $isError }) =>
    $isError ? theme.colors.status.error.text : theme.colors.text.secondary};
`;
