import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
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
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background-color: ${({ theme }) => theme.colors.workIconBg};
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

export const WorkInfo = styled.View`
  flex: 1;
`;

export const WorkName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const WorkChipsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsm}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  flex-wrap: wrap;
`;

// ============================================================================
// Wizard & Multi-Step Styles
// ============================================================================

export const WizardContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const StepProgressBar = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm}px 0;
`;

export const StepScrollList = styled.ScrollView``;

export const StepTab = styled(TouchableOpacity)<{ $active: boolean; $completed: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'transparent'};
  margin-right: ${({ theme }) => theme.spacing.xs}px;
  flex-shrink: 0;
`;

export const StepCircle = styled.View<{ $active: boolean; $completed: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $active, $completed, theme }) =>
    $active
      ? theme.colors.secondary
      : $completed
      ? theme.colors.status.success.base
      : theme.colors.border};
  margin-right: ${({ theme }) => theme.spacing.xs}px;
`;

export const StepCircleText = styled.Text<{ $active: boolean }>`
  font-size: 11px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.text.inverse};
`;

export const StepTabText = styled.Text<{ $active: boolean; $completed?: boolean }>`
  font-family: ${({ $active, theme }) => ($active ? theme.fonts.bold : theme.fonts.medium)};
  font-size: 12px;
  color: ${({ $active, theme }) => ($active ? theme.colors.text.inverse : theme.colors.text.secondary)};
`;

export const StepCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const StepHeader = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const StepTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  line-height: 22px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const StepSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
`;

export const FormRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const FormCol = styled.View<{ flex?: number }>`
  flex: ${({ flex }) => flex ?? 1};
`;

export const FieldLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxs}px;
`;

// ============================================================================
// KPI / Resumos (Headcount & Hh)
// ============================================================================

export const KpiBanner = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  justify-content: space-around;
`;

export const KpiItem = styled.View`
  align-items: center;
`;

export const KpiValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const KpiLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

// ============================================================================
// Cards de Itens Adicionados (Efetivo, Equipamento, etc.)
// ============================================================================

export const AddedItemCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.colors.primary};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const AddedItemInfo = styled.View`
  flex: 1;
`;

export const AddedItemTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const AddedItemSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  line-height: 15px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

export const RemoveButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.xs}px;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

// ============================================================================
// Turnos Climáticos
// ============================================================================

export const ShiftBlock = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const ShiftHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const ShiftTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ConditionButtonsRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  flex-wrap: wrap;
`;

export const ConditionChip = styled.TouchableOpacity<{ $selected: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.surface};
  border-width: 1px;
  border-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.border};
`;

export const ConditionChipText = styled.Text<{ $selected: boolean }>`
  font-size: 11px;
  font-family: ${({ $selected, theme }) => ($selected ? theme.fonts.bold : theme.fonts.medium)};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.text.inverse : theme.colors.text.primary};
`;

export const ToggleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
  flex-wrap: wrap;
`;

export const ToggleLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
  min-width: 140px;
`;

export const ToggleControlWrapper = styled.View`
  min-width: 130px;
  flex-shrink: 0;
`;

// ============================================================================
// Fotos e Marca d'Água de Segurança
// ============================================================================

export const PhotoCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const PhotoPreviewBox = styled.View`
  height: 180px;
  background-color: #0F172A;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  overflow: hidden;
  position: relative;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const WatermarkBanner = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(11, 34, 64, 0.88);
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.secondary};
`;

export const WatermarkTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const WatermarkDataText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 9px;
  color: #F8FAFC;
  line-height: 12px;
  margin-top: 1px;
`;

// ============================================================================
// Barra Fixa Inferior de Ações
// ============================================================================

export const BottomActionBar = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  z-index: 10;
`;

export const ActionButtonWrapper = styled.View<{ flex?: number }>`
  flex: ${({ flex }) => flex ?? 1};
`;

// ============================================================================
// Passo de Revisão & Prévia Consolidada (Read-Only)
// ============================================================================

export const ReviewSectionCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.colors.primary};
`;

export const ReviewSectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const ReviewSectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
`;

export const ReviewEditButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const ReviewEditText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const ReviewInfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 4px;
  border-bottom-width: 1px;
  border-bottom-color: rgba(0, 0, 0, 0.04);
`;

export const ReviewLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  flex: 1;
`;

export const ReviewValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: right;
`;

export const ReviewEmptyText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-style: italic;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
`;

export const ReviewItemBox = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const ReviewItemHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const ReviewItemTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
`;

export const ReviewItemSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

export const ReviewBadge = styled.View<{ $variant?: 'primary' | 'secondary' | 'neutral' | 'error' }>`
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${({ theme, $variant }) =>
    $variant === 'secondary'
      ? theme.colors.secondary
      : $variant === 'neutral'
        ? theme.colors.border
        : $variant === 'error'
          ? theme.colors.status.error.base
          : theme.colors.primary};
`;

export const ReviewBadgeText = styled.Text<{ $variant?: 'primary' | 'secondary' | 'neutral' | 'error' }>`
  font-size: 10px;
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme, $variant }) =>
    $variant === 'neutral' ? theme.colors.text.primary : theme.colors.text.inverse};
`;
