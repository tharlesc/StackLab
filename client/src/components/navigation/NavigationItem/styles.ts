import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Tab = styled(TouchableOpacity)`
  width: 25%;
  min-height: 48px;
  min-width: 48px;
  align-items: center;
  justify-content: center;
`;

export const TabLabel = styled.Text<{ $isActive: boolean }>`
  font-family: ${({ theme, $isActive }) => ($isActive ? theme.fonts.bold : theme.fonts.regular)};
  font-size: 11px;
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.secondary : theme.colors.text.secondary)};
  margin-top: 4px;
`;

export const IconWrapper = styled.View`
  position: relative;
`;

export const Badge = styled.View`
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: ${({ theme }) => theme.colors.status.error.base};
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 1px solid ${({ theme }) => theme.colors.surface};
`;

export const BadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-size: 9px;
  font-family: ${({ theme }) => theme.fonts.bold};
`;
