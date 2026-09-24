type WorkStatus = 'ok' | 'warn';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Card = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const IconPlaceholder = styled.View`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background-color: ${({ theme }) => theme.colors.border};
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const HeaderTextContainer = styled.View`
  flex: 1;
  margin-right: 8px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

export const QuickData = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const DataColumn = styled.View`
  flex: 1;
`;

export const DataLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 4px;
`;

export const DataValue = styled.Text<{ $isLate?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  font-weight: 600;
  color: ${({ $isLate, theme }) =>
    $isLate ? theme.colors.status.error.base : theme.colors.text.primary};
`;

export const WeatherIcon = styled.View`\r?\n  justify-content: center;\r?\n  align-items: center;\r?\n  height: 22px;\r?\n`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const RdoStatusBox = styled.View<{ $status: WorkStatus }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ $status, theme }) =>
    $status === 'ok'
      ? theme.colors.status.success.bg
      : theme.colors.status.warning.bg};
`;

export const RdoStatusText = styled.Text<{ $status: WorkStatus }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  font-weight: 600;
  color: ${({ $status, theme }) =>
    $status === 'ok'
      ? theme.colors.status.success.text
      : theme.colors.status.warning.text};
`;

export const ActionButton = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
`;

export const ActionButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: 13px;
  font-weight: 700;
`;

export const ArrowPlaceholder = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.border};
  justify-content: center;
  align-items: center;
`;

export const ArrowText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 700;
`;
