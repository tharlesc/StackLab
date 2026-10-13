import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const Section = styled.View`
  margin-top: 1px;
`;

export const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SeeAllText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.secondary};
  min-height: 44px;
  line-height: 44px;
`;

export const ConnectivityBanner = styled.View<{ $isOnline: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme, $isOnline }) =>
    $isOnline ? theme.colors.status.success.bg : theme.colors.status.warning.bg};
  border-width: 1px;
  border-color: ${({ theme, $isOnline }) =>
    $isOnline ? theme.colors.status.success.border : theme.colors.status.warning.border};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const ConnectivityText = styled.Text<{ $isOnline: boolean }>`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 12px;
  color: ${({ theme, $isOnline }) =>
    $isOnline ? theme.colors.status.success.text : theme.colors.status.warning.text};
`;

export const QuickActionsRow = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SearchResultsBox = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SearchResultItem = styled(TouchableOpacity)`
  padding: 8px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const SearchResultTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const SearchResultSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;
