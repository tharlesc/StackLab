import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const NotificationCard = styled(TouchableOpacity)<{ $isUnread?: boolean }>`
  background-color: ${({ theme, $isUnread }) =>
    $isUnread ? theme.colors.surface : theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  flex-direction: row;
  align-items: flex-start;
  border-width: 1px;
  border-color: ${({ theme, $isUnread }) =>
    $isUnread ? theme.colors.unreadBorder : theme.colors.border};
  min-height: 72px;
`;

export const IconContainer = styled.View<{ $variant: 'info' | 'success' | 'warning' | 'error' }>`
  width: ${({ theme }) => theme.spacing.xxxl}px;
  height: ${({ theme }) => theme.spacing.xxxl}px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
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
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const NotificationTitle = styled.Text<{ $isUnread?: boolean }>`
  font-family: ${({ theme, $isUnread }) => ($isUnread ? theme.fonts.bold : theme.fonts.semiBold)};
  font-size: ${({ theme }) => theme.typography.callout.fontSize}px;
  line-height: ${({ theme }) => theme.typography.callout.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const TimeText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const NotificationMessage = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const UnreadDot = styled.View`
  width: ${({ theme }) => theme.spacing.sm}px;
  height: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background-color: ${({ theme }) => theme.colors.secondary};
  margin-top: ${({ theme }) => theme.spacing.xsm}px;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;
