import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const ClientHeroCard = styled.View`
  background-color: ${({ theme }) => theme.colors.hero.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const ClientTopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const ClientInfoCol = styled.View`
  flex: 1;
`;

export const ClientGreeting = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.hero.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

export const ClientName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 20px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.hero.text};
`;

export const ClientStatusBadge = styled.View<{ $online?: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  background-color: ${({ $online }) =>
    $online ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
  padding: 6px 10px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ $online }) =>
    $online ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
`;

export const ClientStatusText = styled.Text<{ $online?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 11px;
  color: ${({ $online }) => ($online ? '#10B981' : '#EF4444')};
`;

export const ClientCardDivider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.hero.divider};
  margin-top: 10px;
  margin-bottom: 12px;
`;

export const ClientWorkRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const ClientWorkInfo = styled.View`
  flex: 1;
`;

export const ClientWorkLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.hero.textSecondary};
`;

export const ClientWorkName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.hero.text};
  margin-top: 1px;
`;

export const SearchSection = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;
