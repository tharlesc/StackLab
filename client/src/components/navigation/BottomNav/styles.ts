import styled from 'styled-components/native';
import { TouchableOpacity, Platform } from 'react-native';

export const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  padding-bottom: ${Platform.OS === 'ios' ? 24 : 12}px;
  padding-top: 8px;
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-end;
  height: 56px;
`;

export const Tab = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const TabLabel = styled.Text<{ $isActive: boolean }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 10px;
  font-weight: ${({ $isActive }) => ($isActive ? '700' : '600')};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.text.secondary};
`;

export const ActionContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  top: -12px;
`;

export const ActionButton = styled(TouchableOpacity)`
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  shadow-color: ${({ theme }) => theme.colors.secondary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 6px;
  elevation: 4;
`;

export const ActionLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const IconWrapper = styled.View`
  position: relative;
`;

export const QueueBadge = styled.View`
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: #9d4300;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  border-width: 1.5px;
  border-color: ${({ theme }) => theme.colors.surface};
`;

export const QueueBadgeText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: 9px;
  font-weight: 800;
`;
