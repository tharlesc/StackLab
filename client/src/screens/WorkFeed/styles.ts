import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

export const FeedHeaderContainer = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const ObraOverviewCard = styled.View`
  background-color: ${({ theme }) => theme.colors.hero.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

/* Top Row: Icone Edifício | Título + Status Ativa | Chevron */
export const ObraTopRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const ObraIconBox = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.08);
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.15);
  align-items: center;
  justify-content: center;
`;

export const ObraTopDivider = styled.View`
  width: 1px;
  height: 38px;
  background-color: ${({ theme }) => theme.colors.hero.divider};
  margin-left: 14px;
  margin-right: 14px;
`;

export const ObraTitleColumn = styled.View`
  flex: 1;
  justify-content: center;
`;

export const ObraTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 18px;
  line-height: 22px;
  color: ${({ theme }) => theme.colors.hero.text};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ObraStatusRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
`;

export const ObraStatusDot = styled.View<{ $active?: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 3.5px;
  background-color: ${({ $active = true }) => ($active ? '#10B981' : '#EF4444')};
`;

export const ObraStatusText = styled.Text<{ $active?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 12px;
  color: ${({ $active = true }) => ($active ? '#10B981' : '#EF4444')};
`;

export const ObraChevronBox = styled.View`
  padding: 4px;
  align-items: center;
  justify-content: center;
`;

export const ObraCardDivider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.hero.divider};
  margin-top: 14px;
  margin-bottom: 14px;
`;

/* Seção do Meio: Duas Colunas (Cliente | Localização) */
export const ObraInfoColumnsRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const ObraInfoCol = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const ObraInfoColDivider = styled.View`
  width: 1px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.hero.divider};
  margin-left: 12px;
  margin-right: 12px;
`;

export const ObraInfoColTexts = styled.View`
  flex: 1;
`;

export const ObraInfoColLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.hero.textSecondary};
  margin-bottom: 1px;
`;

export const ObraInfoColValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.hero.text};
`;

/* Botão Inferior de Ação: Editar Informações da Obra */
export const EditObraButton = styled(TouchableOpacity).attrs({
  activeOpacity: 0.8,
  accessibilityRole: 'button',
})`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px ${({ theme }) => theme.spacing.md}px;
  border-radius: 14px;
  background-color: rgba(255, 255, 255, 0.08);
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.15);
  margin-top: 14px;
  gap: 8px;
`;

export const EditObraButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 13px;
  color: #FFFFFF;
`;

/* Compatibilidade retroativa */
export const ObraTitleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

export const ObraSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.typography.footnote.fontSize}px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ObraMetaContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  gap: 6px;
`;

export const ObraMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const ObraMetaLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ObraMetaValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
`;

/* Dashboard Exclusivo da Obra */
export const ObraDashboardCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.mdl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const DashboardHeaderRow = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7,
})`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
`;

export const DashboardHeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const DashboardTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  line-height: 22px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const DashboardSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const ApprovalProgressContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const ApprovalHeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const ApprovalRateTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ApprovalRateBadge = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 13px;
  color: #10B981;
`;

export const ProgressBarTrack = styled.View`
  height: 8px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

export const ProgressBarFill = styled.View<{ $percent: number; $color?: string }>`
  height: 100%;
  width: ${({ $percent }) => Math.min(Math.max($percent, 0), 100)}%;
  border-radius: 4px;
  background-color: ${({ $color }) => $color || '#10B981'};
`;

export const MetricGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const MetricCard = styled.View`
  flex-basis: 48%;
  flex-grow: 1;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const MetricIconRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

export const MetricValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 18px;
  line-height: 22px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const MetricLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 11px;
  line-height: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  margin-top: 2px;
`;

export const MetricCaption = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

export const StatusBreakdownRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

export const StatusBreakdownItem = styled.View`
  align-items: center;
  flex: 1;
`;

export const StatusBreakdownCount = styled.Text<{ $color?: string }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 18px;
  line-height: 22px;
  color: ${({ $color, theme }) => $color || theme.colors.text.primary};
`;

export const StatusBreakdownLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  margin-top: 3px;
  letter-spacing: 0.5px;
`;

export const KpiRow = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  justify-content: space-around;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const KpiItem = styled.View`
  align-items: center;
`;

export const KpiNumber = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 18px;
  line-height: 22px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const KpiLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  line-height: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  margin-top: 2px;
`;

export const KpiDivider = styled.View`
  width: 1px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.border};
`;

export const ActionButtonRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

/* Calendário Compacto com Sinalização Sutil */
export const CalendarCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: 12px 14px 10px 14px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const CalendarHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const MonthTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: capitalize;
`;

export const MonthNavRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const MonthNavButton = styled(TouchableOpacity)`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  align-items: center;
  justify-content: center;
`;

export const WeekdaysRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 4px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  margin-bottom: 4px;
`;

export const WeekdayText = styled.Text`
  width: 14.28%;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const DaysGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const DayCell = styled(TouchableOpacity)<{
  $isSelected?: boolean;
  $hasApproved?: boolean;
  $hasSubmitted?: boolean;
  $hasReturned?: boolean;
  $isToday?: boolean;
}>`
  width: 14.28%;
  height: 32px;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 8px;
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : 'transparent'};
  border-width: ${({ $isSelected, $isToday }) => ($isSelected || $isToday ? '1px' : '0px')};
  border-color: ${({ $isSelected, $isToday, theme }) =>
    $isSelected ? theme.colors.tint : $isToday ? theme.colors.border : 'transparent'};
`;

export const DayNumber = styled.Text<{
  $isSelected?: boolean;
  $hasApproved?: boolean;
  $hasSubmitted?: boolean;
  $hasReturned?: boolean;
  $isToday?: boolean;
}>`
  font-family: ${({ $isToday, $isSelected, $hasApproved, theme }) =>
    $isToday || $isSelected || $hasApproved ? theme.fonts.bold : theme.fonts.regular};
  font-size: 12px;
  line-height: 16px;
  color: ${({ $isSelected, $hasApproved, $hasSubmitted, $hasReturned, theme }) => {
    if ($isSelected) return theme.colors.text.inverse;
    if ($hasApproved) return '#10B981';
    if ($hasSubmitted) return '#D97706';
    if ($hasReturned) return '#EF4444';
    return theme.colors.text.primary;
  }};
`;

export const DayIndicatorDot = styled.View<{ $color?: string }>`
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background-color: ${({ $color }) => $color || '#10B981'};
  margin-top: 1px;
`;

export const CheckBadge = styled.View`
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background-color: #10B981;
  margin-top: 1px;
`;

export const CalendarLegendRow = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  padding-top: 6px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

export const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

export const LegendDot = styled.View<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ $color }) => $color};
`;

export const LegendText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/* Lista de RDOs */
export const ListHeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const ListTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 18px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const FilterPill = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  gap: 6px;
`;

export const FilterPillText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.tintText};
`;

export const RdoFeedCard = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const RdoCardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const RdoNumberText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 15px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const RdoDateAuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const RdoMetaItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const RdoMetaText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const RdoHighlightsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: ${({ theme }) => theme.spacing.xs}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  align-items: center;
  justify-content: space-between;
`;

export const HighlightPill = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const HighlightText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const CardLinkRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const CardLinkText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.tintText};
`;
