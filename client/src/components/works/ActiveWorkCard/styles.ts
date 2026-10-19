import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { TouchableCard } from '@/components/common/Card';

type WorkStatus = 'ok' | 'warn';

export const Card = styled(TouchableCard)`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  flex-direction: column;
  align-items: stretch;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const IconPlaceholder = styled.View`
  width: ${({ theme }) => theme.spacing.xxxl}px;
  height: ${({ theme }) => theme.spacing.xxxl}px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background-color: ${({ theme }) => theme.colors.border};
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const HeaderTextContainer = styled.View`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
`;

export const QuickData = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const DataColumn = styled.View`
  flex: 1;
`;

export const DataLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const DataValue = styled.Text<{ $isLate?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
  color: ${({ $isLate, theme }) =>
    $isLate ? theme.colors.status.error.text : theme.colors.text.primary};
`;

export const WeatherIconBox = styled.View`
  justify-content: center;
  align-items: flex-start;
  min-height: ${({ theme }) => theme.spacing.xl}px;
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const RdoStatusBox = styled.View<{ $status: WorkStatus }>`
  align-self: center;
  padding: ${({ theme }) => theme.spacing.xsm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsm}px;
  background-color: ${({ $status, theme }) =>
    $status === 'ok'
      ? theme.colors.status.success.bg
      : theme.colors.status.warning.bg};
`;

export const RdoStatusText = styled.Text<{ $status: WorkStatus }>`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  color: ${({ $status, theme }) =>
    $status === 'ok'
      ? theme.colors.status.success.text
      : theme.colors.status.warning.text};
`;

export const ActionButton = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.secondary};
  min-height: ${({ theme }) => theme.touchTarget.minHeight}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  justify-content: center;
  align-items: center;
`;

export const ActionButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.onSecondary};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  line-height: ${({ theme }) => theme.typography.footnote.lineHeight}px;
`;

export const ArrowPlaceholder = styled.View`
  width: ${({ theme }) => theme.spacing.xxl}px;
  height: ${({ theme }) => theme.spacing.xxl}px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background-color: ${({ theme }) => theme.colors.border};
  justify-content: center;
  align-items: center;
`;
