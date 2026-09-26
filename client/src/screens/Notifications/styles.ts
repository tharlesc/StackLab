import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const NotificationCard = styled(TouchableOpacity)<{ $isUnread?: boolean }>`
  background-color: ${({ theme, $isUnread }) => ($isUnread ? theme.colors.surface : theme.colors.background)};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  flex-direction: row;
  align-items: flex-start;
  border-width: 1px;
  border-color: ${({ theme, $isUnread }) => ($isUnread ? theme.colors.primary + '20' : theme.colors.border)};
  min-height: 72px;
`;

export const IconContainer = styled.View<{ $variant: 'info' | 'success' | 'warning' | 'error' }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'success':
        return theme.colors.status.success.bg;
      case 'warning':
        return theme.colors.status.warning.bg;
      case 'error':
        return theme.colors.status.error.bg;
      case 'info':
      default:
        return theme.colors.status.info.bg;
    }
  }};
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const ContentContainer = styled.View`
  flex: 1;
`;

export const TitleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

export const NotificationTitle = styled.Text<{ $isUnread?: boolean }>`
  font-family: ${({ theme, $isUnread }) => ($isUnread ? theme.fonts.bold : theme.fonts.semiBold)};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
  margin-right: 8px;
`;

export const TimeText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const NotificationMessage = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 18px;
`;

export const UnreadDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.secondary};
  margin-top: 6px;
  margin-left: 8px;
`;
