import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Backdrop = styled.Pressable`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backdrop};
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const DialogContainer = styled.Pressable`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.dialog}px;
  padding: ${({ theme }) => theme.spacing.lxl}px ${({ theme }) => theme.spacing.lxl}px
    ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lxl}px;
  shadow-color: ${({ theme }) => theme.shadows.dialog.shadowColor};
  shadow-offset: ${({ theme }) =>
    `${theme.shadows.dialog.shadowOffset.width}px ${theme.shadows.dialog.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.dialog.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.dialog.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.dialog.elevation};
`;

export const DialogTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const BodyScrollView = styled.ScrollView`
  flex-shrink: 1;
`;

export const DialogDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.callout.fontSize}px;
  line-height: ${({ theme }) => theme.typography.callout.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const ContentContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ActionsContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  padding-top: ${({ theme }) => theme.spacing.md}px;
`;

export const DialogActionButton = styled(TouchableOpacity)<{
  $isPrimary?: boolean;
  $isDestructive?: boolean;
}>`
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  min-width: ${({ theme }) => theme.touchTarget.minWidth}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.mdl}px;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
`;

export const DialogActionText = styled.Text<{ $isPrimary?: boolean; $isDestructive?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.callout.fontSize}px;
  line-height: ${({ theme }) => theme.typography.callout.lineHeight}px;
  color: ${({ theme, $isDestructive, $isPrimary }) => {
    if ($isDestructive) return theme.colors.status.error.text;
    if ($isPrimary) return theme.colors.tintText;
    return theme.colors.text.secondary;
  }};
`;
