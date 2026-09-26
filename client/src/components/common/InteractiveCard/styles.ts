import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.interactiveCard.background};
  border-radius: ${({ theme }) => theme.borderRadius.cardLarge}px;
  padding: 20px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.interactiveCard.border};
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: ${({ theme }) => `${theme.shadows.card.shadowOffset.width}px ${theme.shadows.card.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.card.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.card.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.card.elevation};
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 17px;
  color: ${({ theme }) => theme.colors.interactiveCard.title};
  margin-bottom: 8px;
`;

export const SupportingText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.interactiveCard.supportingText};
  margin-bottom: 16px;
`;

export const ActionsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

export const ActionButton = styled(TouchableOpacity)`
  min-height: 44px;
  justify-content: center;
  padding: 6px 4px;
`;

export const ActionText = styled.Text<{ $isPrimary?: boolean; $isDestructive?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  color: ${({ theme, $isDestructive, $isPrimary }) => {
    if ($isDestructive) return theme.colors.status.error.base;
    if ($isPrimary) return theme.colors.interactiveCard.actionPrimary;
    return theme.colors.interactiveCard.actionSecondary;
  }};
`;
