import styled from 'styled-components/native';
import { TouchableCard } from '@/components/common/Card';
import type { RDODisplayStatus } from '@/types';

export const ControlsHeader = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px
    ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const InboxCard = styled(TouchableCard)<{
  $isOverdue?: boolean;
  $displayStatus?: RDODisplayStatus;
}>`
  border-left-width: 4px;
  border-left-color: ${({ theme, $isOverdue, $displayStatus }) => {
    if ($isOverdue || $displayStatus === 'atrasado') {
      return theme.colors.status.error.base;
    }
    if ($displayStatus === 'submetido') {
      return theme.colors.status.success.base;
    }
    if ($displayStatus === 'devolvido') {
      return theme.colors.status.warning.base;
    }
    return theme.colors.status.warning.base;
  }};
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  flex-direction: column;
  align-items: stretch;
`;

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xsm}px;
`;

export const CardTitleContainer = styled.View`
  flex: 1;
`;

export const RdoNumber = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const WorkName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: ${({ theme }) => theme.typography.callout.fontSize}px;
  line-height: ${({ theme }) => theme.typography.callout.lineHeight}px;
  color: ${({ theme }) => theme.colors.tintText};
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
`;

export const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const MetaItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const MetaText = styled.Text<{ $highlight?: boolean }>`
  font-family: ${({ theme, $highlight }) => ($highlight ? theme.fonts.bold : theme.fonts.regular)};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.status.error.text : theme.colors.text.secondary};
`;

export const CardFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.smd}px;
`;

export const AuthorText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ReviewIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => theme.spacing.xsm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
`;

export const ReviewButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.onSecondary};
`;
