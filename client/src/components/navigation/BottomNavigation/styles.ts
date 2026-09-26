import styled from 'styled-components/native';
import { Platform } from 'react-native';

export const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  padding-bottom: ${Platform.OS === 'ios' ? 24 : 16}px;
  padding-top: 12px;
  elevation: ${({ theme }) => theme.shadows.card.elevation};
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: ${({ theme }) => `${theme.shadows.card.shadowOffset.width}px ${theme.shadows.card.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.card.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.card.shadowRadius}px;
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;
