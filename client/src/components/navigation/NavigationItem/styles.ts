import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Tab = styled(TouchableOpacity)`
  flex: 1;
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  min-width: ${({ theme }) => theme.touchTarget.minWidth}px;
  align-items: center;
  justify-content: center;
`;

export const TabLabel = styled.Text<{ $isActive: boolean }>`
  font-family: ${({ theme, $isActive }) => ($isActive ? theme.fonts.bold : theme.fonts.regular)};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.tintText : theme.colors.text.secondary)};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const IconWrapper = styled.View<{ $isActive?: boolean }>`
  position: relative;
  padding: ${({ theme }) => theme.spacing.xxs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.tag.masterBg : 'transparent'};
`;

export const Badge = styled.View`
  position: absolute;
  top: -${({ theme }) => theme.spacing.xs}px;
  right: -${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.status.error.base};
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  min-width: 18px;
  min-height: 18px;
  align-items: center;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.xs}px;
  border: 1px solid ${({ theme }) => theme.colors.surface};
`;

export const BadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;
