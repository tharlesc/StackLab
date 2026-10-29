import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Container = styled.View`
  align-items: center;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const ControlsRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const NavButton = styled(TouchableOpacity)<{ $disabled: boolean }>`
  min-width: ${({ theme }) => theme.touchTarget.minWidth}px;
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  align-items: center;
  justify-content: center;
  opacity: ${({ $disabled }) => ($disabled ? 0.35 : 1)};
`;

export const PageButton = styled(TouchableOpacity)<{ $active: boolean }>`
  min-width: ${({ theme }) => theme.touchTarget.minWidth}px;
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  border-width: 1.5px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  align-items: center;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.xs}px;
`;

export const PageText = styled.Text<{ $active: boolean }>`
  font-family: ${({ theme, $active }) => ($active ? theme.fonts.bold : theme.fonts.medium)};
  font-size: ${({ theme }) => theme.typography.callout.fontSize}px;
  line-height: ${({ theme }) => theme.typography.callout.lineHeight}px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.primary};
`;

export const EllipsisBox = styled.View`
  min-width: 28px;
  height: ${({ theme }) => theme.touchTarget.minHeight}px;
  align-items: center;
  justify-content: center;
`;

export const EllipsisText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 2px;
`;

export const InfoText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  text-align: center;
`;
