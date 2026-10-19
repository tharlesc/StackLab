import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { Card } from '@/components/common/Card';

export const ControlsHeader = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px
    ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ListHeaderWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.mdl}px;
`;

export const AdminCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xsm}px;
`;

export const HeaderMainInfo = styled.View`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const CardActionsRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const UserFooterRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const ProfileToggleRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const ItemTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ItemSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
`;

export const MatrixWorkList = styled.View`
  margin-top: ${({ theme }) => theme.spacing.smd}px;
  padding-top: ${({ theme }) => theme.spacing.sm}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  gap: ${({ theme }) => theme.spacing.xsm}px;
`;

export const MatrixWorkItem = styled(TouchableOpacity)<{ $assigned?: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
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
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
  color: ${({ theme, $assigned }) =>
    $assigned ? theme.colors.tintText : theme.colors.text.primary};
`;
