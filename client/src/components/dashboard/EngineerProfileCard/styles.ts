import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const InfoContainer = styled.View`
  flex: 1;
`;

export const Greeting = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const NameRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: 18px;
  font-weight: 700;
`;

export const MasterTag = styled.View`
  background-color: ${({ theme }) => theme.colors.tag.masterBg};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.secondary};
`;

export const MasterTagText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
`;

export const CreaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const CreaText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text.inverseSecondary};
  font-size: 11px;
  font-weight: 500;
`;

export const NotificationButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  background-color: ${({ theme }) => theme.colors.tag.notificationBg};
  justify-content: center;
  align-items: center;
`;

export const NotificationIcon = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
`;

export const NotificationDot = styled.View`
  position: absolute;
  top: 10px;
  right: 12px;
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.status.error.base};
`;

export const Footer = styled.View`
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.tag.notificationBg};
  padding-top: ${({ theme }) => theme.spacing.md}px;
`;

export const SyncText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 500;
`;

export const TimeFilterContainer = styled.View`
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.tag.timeFilterBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: 4px;
`;

export const TimeFilterButton = styled(TouchableOpacity)<{ $isActive: boolean }>`
  flex: 1;
  padding: 6px 0;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.secondary : 'transparent'};
`;

export const TimeFilterText = styled.Text<{ $isActive: boolean }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.text.inverse : theme.colors.text.secondary};
  font-size: 11px;
  font-weight: ${({ $isActive }) => ($isActive ? '700' : '600')};
`;
