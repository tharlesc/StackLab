import styled from 'styled-components/native';
import { Card } from '@/components/common/Card';

export const LogCard = styled(Card)`
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const LogHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

export const LogAction = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
`;

export const LogTimestamp = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const LogActor = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 6px;
`;

export const LogJustification = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  margin-top: 4px;
`;

export const DiffRow = styled.View`
  margin-top: 6px;
  padding: 6px;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  gap: 2px;
`;

export const DiffText = styled.Text<{ $type: 'old' | 'new' }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme, $type }) =>
    $type === 'old' ? theme.colors.status.error.text : theme.colors.status.success.text};
`;
