import styled from 'styled-components/native';
import { TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const Backdrop = styled.Pressable`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.dialog.backdrop};
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

export const DialogContainer = styled.Pressable`
  width: 100%;
  max-width: ${Math.min(width - 32, 400)}px;
  background-color: ${({ theme }) => theme.colors.dialog.background};
  border-radius: ${({ theme }) => theme.borderRadius.dialog}px;
  padding: 20px 20px 16px 20px;
  shadow-color: ${({ theme }) => theme.shadows.dialog.shadowColor};
  shadow-offset: ${({ theme }) => `${theme.shadows.dialog.shadowOffset.width}px ${theme.shadows.dialog.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.dialog.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.dialog.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.dialog.elevation};
`;

export const DialogTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 22px;
  line-height: 28px;
  color: ${({ theme }) => theme.colors.dialog.title};
  margin-bottom: 12px;
`;

export const BodyScrollView = styled.ScrollView`
  flex-shrink: 1;
`;

export const DialogDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.dialog.supportingText};
  margin-bottom: 16px;
`;

export const ContentContainer = styled.View`
  margin-bottom: 8px;
`;

export const ActionsContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

export const DialogActionButton = styled(TouchableOpacity)<{ $isPrimary?: boolean; $isDestructive?: boolean }>`
  min-height: 42px;
  min-width: 64px;
  padding: 8px 14px;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
`;

export const DialogActionText = styled.Text<{ $isPrimary?: boolean; $isDestructive?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  color: ${({ theme, $isDestructive, $isPrimary }) => {
    if ($isDestructive) return theme.colors.status.error.base;
    if ($isPrimary) return theme.colors.dialog.actionPrimary;
    return theme.colors.dialog.actionSecondary;
  }};
`;
