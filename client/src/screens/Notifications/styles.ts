import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const ControlsHeader = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px
    ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const StatusBarRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${({ theme }) => theme.spacing.xxs}px;
`;

export const StatusCounterText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MarkAllButton = styled(TouchableOpacity)`
  min-height: 44px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  justify-content: center;
  align-items: center;
`;

export const MarkAllButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
  color: ${({ theme }) => theme.colors.tintText};
`;

export const NotificationCard = styled(TouchableOpacity)<{ $isUnread?: boolean }>`
  background-color: ${({ theme, $isUnread }) =>
    $isUnread ? theme.colors.surface : theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  flex-direction: row;
  align-items: flex-start;
  border-width: 1px;
  border-color: ${({ theme, $isUnread }) =>
    $isUnread ? theme.colors.unreadBorder : theme.colors.border};
  min-height: 76px;
  position: relative;
`;

export const UnreadBar = styled.View`
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 4px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

export const IconContainer = styled.View<{ $variant: 'info' | 'success' | 'warning' | 'error' }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.md}px;
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
  border-width: 1px;
  border-color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'success':
        return theme.colors.status.success.border;
      case 'warning':
        return theme.colors.status.warning.border;
      case 'error':
        return theme.colors.status.error.border;
      case 'info':
      default:
        return theme.colors.status.info.border;
    }
  }};
`;

export const ContentContainer = styled.View`
  flex: 1;
`;

export const TitleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.spacing.xxs}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const NotificationTitle = styled.Text<{ $isUnread?: boolean }>`
  font-family: ${({ theme, $isUnread }) => ($isUnread ? theme.fonts.bold : theme.fonts.semiBold)};
  font-size: ${({ theme }) => theme.typography.callout.fontSize}px;
  line-height: ${({ theme }) => theme.typography.callout.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
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

export const ActionIndicator = styled.View`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const ActionText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.tintText};
`;
