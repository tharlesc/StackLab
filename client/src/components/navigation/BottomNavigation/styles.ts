import styled from 'styled-components/native';

export const Container = styled.View<{ $bottomInset: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme, $bottomInset }) => Math.max($bottomInset, theme.spacing.md)}px;
  padding-top: ${({ theme }) => theme.spacing.md}px;
  elevation: ${({ theme }) => theme.shadows.card.elevation};
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: ${({ theme }) =>
    `${theme.shadows.card.shadowOffset.width}px ${theme.shadows.card.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.card.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.card.shadowRadius}px;
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;
