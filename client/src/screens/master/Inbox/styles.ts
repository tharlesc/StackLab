import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { TouchableCard } from '@/components/common/Card';

export const ControlsHeader = styled.View`
  padding: 16px 16px 12px 16px;
  gap: 12px;
`;

export const InboxCard = styled(TouchableCard)<{ $isOverdue?: boolean }>`
  border-left-width: 4px;
  border-left-color: ${({ theme, $isOverdue }) =>
    $isOverdue ? theme.colors.status.error.base : theme.colors.status.warning.base};
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: 12px;
  flex-direction: column;
  align-items: stretch;
`;

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
`;

export const CardTitleContainer = styled.View`
  flex: 1;
  margin-right: 8px;
`;

export const RdoNumber = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const WorkName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondary};
  margin-top: 2px;
`;

export const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  margin-bottom: 12px;
`;

export const MetaItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const MetaText = styled.Text<{ $highlight?: boolean }>`
  font-family: ${({ theme, $highlight }) => ($highlight ? theme.fonts.bold : theme.fonts.regular)};
  font-size: 12px;
  color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.status.error.base : theme.colors.text.secondary};
`;

export const CardFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  padding-top: 10px;
`;

export const AuthorText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ReviewButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
`;

export const ReviewButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.inverse};
`;

export const SlaWarningBanner = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  background-color: ${({ theme }) => theme.colors.status.error.bg};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: 4px 8px;
  margin-bottom: 8px;
`;

export const SlaWarningText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.status.error.text};
`;
