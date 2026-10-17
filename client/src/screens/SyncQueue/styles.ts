import styled from 'styled-components/native';
import { Card } from '@/components/common/Card';

export const QueueCard = styled(Card)`
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.colors.status.warning.base};
  flex-direction: row;
  align-items: center;
  min-height: 80px;
`;

export const InfoContainer = styled.View`
  flex: 1;
`;

export const TitleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const ItemTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ItemSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.smd}px;
`;

export const StatusRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const HeaderCardWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;
