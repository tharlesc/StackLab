import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Container = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const Label = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const StepperWrapper = styled.View<{ $hasError?: boolean; $disabled?: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.surfaceVariant : theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border-width: ${({ $hasError }) => ($hasError ? 1.5 : 1)}px;
  border-color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.status.error.base : theme.colors.border};
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  padding: 2px 4px;
  opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
`;

export const StepperButton = styled(TouchableOpacity)<{ $disabled?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme, $disabled }) =>
    $disabled ? 'transparent' : theme.colors.surfaceVariant};
  justify-content: center;
  align-items: center;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
`;

export const ValueDisplay = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const ValueText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const UnitText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const HelperText = styled.Text<{ $isError?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme, $isError }) =>
    $isError ? theme.colors.status.error.text : theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;
