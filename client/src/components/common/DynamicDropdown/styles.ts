import styled from 'styled-components/native';
import { TextInput, TouchableOpacity } from 'react-native';

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

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const SelectTrigger = styled(TouchableOpacity)<{
  $isOpen?: boolean;
  $hasError?: boolean;
  $disabled?: boolean;
}>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.surfaceVariant : theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  border-width: ${({ $isOpen, $hasError }) => ($isOpen || $hasError ? 1.5 : 1)}px;
  border-color: ${({ theme, $isOpen, $hasError }) => {
    if ($hasError) return theme.colors.status.error.base;
    if ($isOpen) return theme.colors.secondary;
    return theme.colors.border;
  }};
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
`;

export const SelectText = styled.Text<{ $hasValue: boolean }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: ${({ theme, $hasValue }) =>
    $hasValue ? theme.colors.text.primary : theme.colors.text.secondary};
  flex: 1;
`;

export const ManualInput = styled(TextInput)<{
  $hasError?: boolean;
  $disabled?: boolean;
}>`
  flex: 1;
  background-color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.surfaceVariant : theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.text.secondary : theme.colors.text.primary};
  border-width: ${({ $hasError }) => ($hasError ? 1.5 : 1)}px;
  border-color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.status.error.base : theme.colors.secondary};
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
`;

export const ActionButton = styled(TouchableOpacity)<{ $active?: boolean }>`
  width: ${({ theme }) => theme.touchTarget.minHeight}px;
  height: ${({ theme }) => theme.touchTarget.minHeight}px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.secondary : theme.colors.surfaceVariant};
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.secondary : theme.colors.border};
`;

export const DropdownList = styled.View`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  max-height: 220px;
  overflow: hidden;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

export const SearchInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const SearchInput = styled(TextInput)`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 4px;
`;

export const OptionItem = styled(TouchableOpacity)<{ $selected?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.surfaceVariant : 'transparent'};
  border-bottom-width: 0.5px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const OptionText = styled.Text<{ $selected?: boolean }>`
  font-family: ${({ theme, $selected }) =>
    $selected ? theme.fonts.semiBold : theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.secondary : theme.colors.text.primary};
`;

export const EmptyOptions = styled.Text`
  padding: ${({ theme }) => theme.spacing.md}px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

export const HelperText = styled.Text<{ $isError?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme, $isError }) =>
    $isError ? theme.colors.status.error.text : theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

