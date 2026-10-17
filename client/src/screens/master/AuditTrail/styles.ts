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
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const LogTimestamp = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const LogActor = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.tintText};
  margin-bottom: ${({ theme }) => theme.spacing.xsm}px;
`;

export const LogJustification = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const DiffRow = styled.View`
  margin-top: ${({ theme }) => theme.spacing.xsm}px;
  padding: ${({ theme }) => theme.spacing.xsm}px;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const DiffText = styled.Text<{ $type: 'old' | 'new' }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme, $type }) =>
    $type === 'old' ? theme.colors.status.error.text : theme.colors.status.success.text};
`;
