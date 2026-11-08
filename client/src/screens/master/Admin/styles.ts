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

export const AdminCard = styled(TouchableOpacity).attrs({
  activeOpacity: 0.85,
  accessibilityRole: 'button',
})`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: ${({ theme }) =>
    `${theme.shadows.card.shadowOffset.width}px ${theme.shadows.card.shadowOffset.height}px`};
  shadow-opacity: ${({ theme }) => theme.shadows.card.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.card.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.card.elevation};
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

export const OnlineBanner = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

export const OnlineBannerText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const UserSyncMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
`;

export const OnlineDot = styled.View<{ $online?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ $online }) => ($online ? '#10B981' : '#94A3B8')};
`;

export const OnlineLabel = styled.Text<{ $online?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 11px;
  color: ${({ $online }) => ($online ? '#10B981' : '#94A3B8')};
`;

export const SyncTimeText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const TempPasswordCard = styled.View`
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: rgba(245, 158, 11, 0.12);
  border-width: 1px;
  border-color: rgba(245, 158, 11, 0.35);
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const TempPasswordTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: #D97706;
`;

export const TempPasswordCode = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  letter-spacing: 1.5px;
  color: #B45309;
`;

export const CreaSectionBox = styled.View`
  margin-top: 6px;
  margin-bottom: 6px;
  gap: 6px;
`;

export const CreaFieldRow = styled.View`
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;

export const StateSelectorScroll = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin-top: 4px;
  margin-bottom: 6px;
`;

export const StateChipButton = styled(TouchableOpacity)<{ $selected?: boolean }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.surfaceVariant};
  border-width: 1px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};
  margin-right: 6px;
`;

export const StateChipText = styled.Text<{ $selected?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 12px;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.text.inverse : theme.colors.text.primary};
`;
