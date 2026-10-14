import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { Card } from '@/components/common/Card';

export const ControlsHeader = styled.View`
  padding: 16px 16px 12px 16px;
  gap: 12px;
`;

export const AdminCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
`;

export const ItemTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ItemSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

export const MatrixWorkList = styled.View`
  margin-top: 10px;
  padding-top: 8px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  gap: 6px;
`;

export const MatrixWorkItem = styled(TouchableOpacity)<{ $assigned?: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme, $assigned }) =>
    $assigned ? theme.colors.tag.masterBg : theme.colors.surfaceVariant};
  border-width: 1px;
  border-color: ${({ theme, $assigned }) =>
    $assigned ? theme.colors.secondary : 'transparent'};
`;

export const MatrixWorkName = styled.Text<{ $assigned?: boolean }>`
  font-family: ${({ theme, $assigned }) =>
    $assigned ? theme.fonts.bold : theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme, $assigned }) =>
    $assigned ? theme.colors.secondary : theme.colors.text.primary};
`;
