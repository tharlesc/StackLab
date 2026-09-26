import styled from 'styled-components/native';
import { TouchableCard } from '@/components/common/Card';

export const WorkSelectCard = styled(TouchableCard)`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  min-height: 72px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const WorkIconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? 'rgba(249, 115, 22, 0.15)' : theme.colors.primary + '15'};
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const WorkInfo = styled.View`
  flex: 1;
`;

export const WorkName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

export const WorkSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;
