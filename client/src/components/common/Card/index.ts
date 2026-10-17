import styled, { css } from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

const baseCardStyles = css`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: ${({ theme }) =>
    `${theme.shadows.card.shadowOffset.width}px ${theme.shadows.card.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.card.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.card.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.card.elevation};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const Card = styled.View`
  ${baseCardStyles}
`;

export const TouchableCard = styled(TouchableOpacity).attrs({
  accessibilityRole: 'button',
})`
  ${baseCardStyles}
  flex-direction: row;
  align-items: center;
`;
