import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

export const Body = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const IndicatorsList = styled.View`
  flex: 1;
  margin-left: 20px;
  justify-content: center;
  gap: 8px;
`;

export const IndicatorRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
`;

export const IndicatorLabelBox = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const IndicatorDot = styled.View<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: 8px;
  background-color: ${({ $color }) => $color};
`;

export const IndicatorLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const IndicatorValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;
