import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, useWindowDimensions, LayoutChangeEvent, ActivityIndicator, Text } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Trash2,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Edit3,
} from 'lucide-react-native';

import { useNewRDO, STEPS } from '@/hooks';
import {
  WorkSelectCard,
  WorkIconContainer,
  WorkInfo,
  WorkName,
  WorkChipsRow,
  WizardContainer,
  StepProgressBar,
  StepScrollList,
  StepTab,
  StepCircle,
  StepCircleText,
  StepTabText,
  StepCard,
  StepHeader,
  StepTitle,
  StepSubtitle,
  FormGroup,
  FormRow,
  FormCol,
  FieldLabel,
  SectionDivider,
  AddedItemsHeader,
  AddedItemsTitle,
  AddItemButtonWrapper,
  KpiBanner,
  KpiItem,
  KpiValue,
  KpiLabel,
  AddedItemCard,
  AddedItemInfo,
  AddedItemTitle,
  AddedItemSubtitle,
  RemoveButton,
  ShiftBlock,
  ShiftHeader,
  ShiftTitle,
  ConditionButtonsRow,
  ConditionChip,
  ConditionChipText,
  ToggleRow,
  ToggleLabel,
  ToggleControlWrapper,
  PhotoCard,
  PhotoPreviewBox,
  WatermarkBanner,
  WatermarkTitle,
  WatermarkDataText,
  BottomActionBar,
  StepValidationHint,
  StepValidationHintText,
  ActionButtonsRow,
  ActionButtonWrapper,
  ReviewSectionCard,
  ReviewSectionHeader,
  ReviewSectionTitle,
  ReviewEditButton,
  ReviewEditText,
  ReviewInfoRow,
  ReviewLabel,
  ReviewValue,
  ReviewEmptyText,
  ReviewItemBox,
  ReviewItemHeader,
  ReviewItemTitle,
  ReviewItemSubtitle,
  ReviewBadge,
  ReviewBadgeText,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { ScrollContent } from '@/components/common/Layout';
import { Dialog } from '@/components/common/Dialog';
import { Chip } from '@/components/common/Chip';
import { InteractiveCard } from '@/components/common/InteractiveCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { DynamicDropdown } from '@/components/common/DynamicDropdown';
import { QuantityStepper } from '@/components/common/QuantityStepper';
import { TimeIntervalAccordion } from '@/components/common/TimeIntervalAccordion';
import { strings } from '@/constants/strings';
import type { Shift, OccurrenceType, ActivityStatus } from '@/types';

interface NewRDOViewProps {
  onWizardActiveChange?: (isActive: boolean) => void;
}

const DEFAULT_LABOR_ROLES = [
  'Ajudante',
  'Almoxarife',
  'Apontador',
  'Armador',
  'Azulejista',
  'Bombeiro Hidráulico',
  'Carpinteiro',
  'Motorista',
  'Operador de Máquinas',
  'Pedreiro',
  'Pintor',
  'Serralheiro',
  'Servente',
  'Soldador',
];

const DEFAULT_EQUIPMENT_NAMES = [
  'Betoneira',
  'Retroescavadeira',
  'Caminhão Basculante',
  'Grua',
  'Gerador',
  'Compactador de Solo',
  'Furadeira',
  'Serra Circular',
];

const ACTIVITY_STATUS_OPTIONS: ActivityStatus[] = [
  'Iniciado',
  'Em andamento',
  'Concluído',
  'Paralisado',
];

const OCCURRENCE_TYPE_OPTIONS = [
  'DDS',
  'Acidente',
  'Paralisação',
  'Interferência',
  'Pendência',
];

const mapLabelToOccType = (label: string): OccurrenceType => {
  const norm = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (norm === 'dds') return 'dds';
  if (norm.includes('acidente')) return 'acidente';
  if (norm.includes('paralisacao')) return 'paralisacao';
  if (norm.includes('interferencia')) return 'interferencia';
  if (norm.includes('pendencia')) return 'pendencia';
  return 'outro';
};

const calculateHoursFromInterval = (start: string, end: string): number | null => {
  if (!start || !end || !start.includes(':') || !end.includes(':')) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null;
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const diffMin = endMin >= startMin ? endMin - startMin : 24 * 60 - startMin + endMin;
  return Math.round((diffMin / 60) * 10) / 10;
};

export const NewRDOView = ({ onWizardActiveChange }: NewRDOViewProps = {}) => {
  const theme = useTheme();
  const router = useRouter();
  const {
    works,
    selectedWork,
    activeDraft,
    currentStep,
    isInitializing,
    isStartDialogOpen,
    isValidationDialogOpen,
    validationErrors,
    isSuccessDialogOpen,
    isSubmitting,
    savedFeedback,
    existingDraftWork,
    existingDraftData,
    headcount,
    manHours,
    handleSelectWork,
    handleCloseStartDialog,
    handleConfirmStart,
    handleContinueExistingDraft,
    handleDiscardExistingDraft,
    handleSaveDraft,
    handleExitWizard,
    handleNextStep,
    handlePrevStep,
    goToStep,
    canAdvance,
    stepError,
    canJumpToStep,
    updateDate,
    updateWeatherShift,
    addLaborEntry,
    removeLaborEntry,
    addEquipmentEntry,
    removeEquipmentEntry,
    addActivityEntry,
    removeActivityEntry,
    addOccurrenceEntry,
    removeOccurrenceEntry,
    handleCapturePhoto,
    removePhotoEntry,
    handleSubmit,
    handleFinishSuccess,
    setIsValidationDialogOpen,
  } = useNewRDO();

  useEffect(() => {
    onWizardActiveChange?.(Boolean(activeDraft));
    return () => {
      onWizardActiveChange?.(false);
    };
  }, [activeDraft, onWizardActiveChange]);

  // Rolagem automática e medição de posições dos passos da barra superior
  const { width: screenWidth } = useWindowDimensions();
  const stepScrollRef = useRef<any>(null);
  const stepLayouts = useRef<{ [key: number]: { x: number; width: number } }>({});

  const scrollToActiveStep = useCallback(
    (stepIndex: number) => {
      const layout = stepLayouts.current[stepIndex];
      if (layout && stepScrollRef.current) {
        const targetX = Math.max(0, layout.x - (screenWidth - layout.width) / 2);
        stepScrollRef.current.scrollTo({ x: targetX, animated: true });
      } else if (stepScrollRef.current) {
        const approxX = Math.max(0, stepIndex * 115 - screenWidth / 2 + 50);
        stepScrollRef.current.scrollTo({ x: approxX, animated: true });
      }
    },
    [screenWidth],
  );

  useEffect(() => {
    scrollToActiveStep(currentStep);
  }, [currentStep, scrollToActiveStep]);

  // Estados locais para os formulários de adição de itens
  // Mão de Obra
  const [laborRole, setLaborRole] = useState('Pedreiro');
  const [laborName, setLaborName] = useState('');
  const [laborQty, setLaborQty] = useState(2);
  const [laborHours, setLaborHours] = useState('8');
  const [laborHoraInicio, setLaborHoraInicio] = useState('');
  const [laborHoraFim, setLaborHoraFim] = useState('');
  const [laborContractor, setLaborContractor] = useState<'proprio' | 'terceirizado'>('proprio');

  // Equipamento
  const [equipName, setEquipName] = useState('Betoneira');
  const [equipBrand, setEquipBrand] = useState('');
  const [equipCode, setEquipCode] = useState('');
  const [equipQty, setEquipQty] = useState(1);
  const [equipActiveHours, setEquipActiveHours] = useState('8');
  const [equipIdleHours, setEquipIdleHours] = useState('0');
  const [equipJustification, setEquipJustification] = useState('');
  const [equipHoraInicio, setEquipHoraInicio] = useState('');
  const [equipHoraFim, setEquipHoraFim] = useState('');
  const [equipObservations, setEquipObservations] = useState('');
  const [equipRented, setEquipRented] = useState<'proprio' | 'locado'>('proprio');

  // Atividade
  const [actDesc, setActDesc] = useState('');
  const [actLocation, setActLocation] = useState('1º Pavimento');
  const [actUnit, setActUnit] = useState('m²');
  const [actQty, setActQty] = useState('10');
  const [actProgress, setActProgress] = useState('25');
  const [actStatus, setActStatus] = useState<ActivityStatus>('Em andamento');

  // Ocorrência / DDS
  const [occTypeLabel, setOccTypeLabel] = useState('DDS');
  const [occHoraInicio, setOccHoraInicio] = useState('');
  const [occHoraFim, setOccHoraFim] = useState('');
  const [occDesc, setOccDesc] = useState('');

  // --------------------------------------------------------------------------
  // RENDER: Carregamento do Rascunho (evita piscar a tela antiga de seleção)
  // --------------------------------------------------------------------------
  if (isInitializing) {
    return (
      <WizardContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Header
          title="Diário de Obra"
          leftContent={
            <HeaderAction
              icon={
                <ChevronLeft
                  color={theme.colors.text.secondary}
                  size={theme.icon.size.lg}
                  strokeWidth={theme.icon.strokeWidth}
                />
              }
              onPress={() => router.back()}
              accessibilityLabel="Voltar ao início"
            />
          }
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              fontFamily: theme.fonts.medium,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Iniciando preenchimento do diário de obra...
          </Text>
        </View>
      </WizardContainer>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Seleção de Obra (se não houver rascunho ativo)
  // --------------------------------------------------------------------------
  if (!activeDraft) {
    return (
      <>
        <Header title={strings.newRDO.title} />

        <ScrollContent showsVerticalScrollIndicator={false}>
          {existingDraftWork && existingDraftData && (
            <View style={{ marginBottom: theme.spacing.lg }}>
              <InteractiveCard
                title="Rascunho Local Disponível"
                supportingText={`Você possui 1 diário em rascunho salvo offline aguardando preenchimento para "${existingDraftWork.name}".`}
                actions={[
                  { label: 'Descartar', onPress: handleDiscardExistingDraft, destructive: true },
                  { label: 'Continuar', onPress: handleContinueExistingDraft, primary: true },
                ]}
              />
            </View>
          )}

          <StepTitle style={{ marginBottom: theme.spacing.sm, marginTop: theme.spacing.xs }}>
            Selecione a Obra:
          </StepTitle>

          {works.length === 0 ? (
            <EmptyState
              icon={<Building2 size={40} color={theme.colors.text.secondary} />}
              title="Nenhuma obra disponível"
              message="Não há obras cadastradas no momento. Cadastre uma obra no painel de administração."
            />
          ) : (
            works.map((work) => (
              <WorkSelectCard
                key={work.id}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/work-feed',
                    params: { id: work.id, workId: work.id },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Acessar feed da obra: ${work.name}, ${work.subtitle}`}
              >
                <WorkIconContainer>
                  <Building2
                    color={theme.name === 'dark' ? theme.colors.tintText : theme.colors.primary}
                    size={theme.icon.size.lg}
                    strokeWidth={theme.icon.strokeWidth}
                  />
                </WorkIconContainer>
                <WorkInfo>
                  <WorkName>{work.name}</WorkName>
                  <WorkChipsRow>
                    <Chip label={work.subtitle} variant="dark" />
                    <Chip label="Em Andamento" variant="surface" />
                  </WorkChipsRow>
                </WorkInfo>
                <ChevronRight
                  color={theme.colors.text.secondary}
                  size={theme.icon.size.md}
                  strokeWidth={theme.icon.strokeWidth}
                />
              </WorkSelectCard>
            ))
          )}
        </ScrollContent>

        <Dialog
          visible={isStartDialogOpen}
          title="Iniciar Diário de Obra"
          description={
            selectedWork
              ? `Deseja iniciar o preenchimento do RDO para a obra "${selectedWork.name}"? As informações de clima, data e equipe serão pré-carregadas automaticamente.`
              : ''
          }
          primaryAction={{
            label: strings.newRDO.startAction,
            onPress: handleConfirmStart,
          }}
          secondaryAction={{
            label: strings.common.cancel,
            onPress: handleCloseStartDialog,
          }}
          onClose={handleCloseStartDialog}
        />
      </>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Assistente do RDO (Wizard ativo com passos 0 a 6)
  // --------------------------------------------------------------------------
  return (
    <WizardContainer>
      {/* Top Header com Ações do Rascunho */}
      <Header
        title={`RDO: ${activeDraft.workName}`}
        leftContent={
          <HeaderAction
            icon={
              <ChevronLeft
                color={theme.colors.text.secondary}
                size={theme.icon.size.lg}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={handleExitWizard}
            accessibilityLabel="Voltar ao início e salvar rascunho"
          />
        }
        rightContent={
          <HeaderAction
            icon={
              <Save
                color={savedFeedback ? theme.colors.status.success.base : theme.colors.text.primary}
                size={theme.icon.size.md}
                strokeWidth={theme.icon.strokeWidth}
              />
            }
            onPress={handleSaveDraft}
            accessibilityLabel="Salvar rascunho no dispositivo"
          />
        }
      />

      {savedFeedback && (
        <View
          style={{
            backgroundColor: theme.colors.status.success.bg,
            paddingVertical: 8,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} color={theme.colors.status.success.text} />
          <FieldLabel style={{ color: theme.colors.status.success.text, margin: 0 }}>
            {savedFeedback}
          </FieldLabel>
        </View>
      )}

      {/* Barra de Progresso Superior com Rolagem Horizontal Suave */}
      <StepProgressBar>
        <StepScrollList
          ref={stepScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.md, alignItems: 'center' }}
        >
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isAccessible = canJumpToStep(step.id);
            return (
              <StepTab
                key={step.id}
                $active={isActive}
                $completed={isCompleted}
                $disabled={!isAccessible}
                disabled={!isAccessible}
                onPress={() => goToStep(step.id)}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive, disabled: !isAccessible }}
                accessibilityLabel={`Passo ${step.id + 1}: ${step.label}${
                  !isAccessible ? ' (bloqueado até preencher etapa anterior)' : ''
                }`}
                onLayout={(e: LayoutChangeEvent) => {
                  const { x, width } = e.nativeEvent.layout;
                  stepLayouts.current[step.id] = { x, width };
                }}
              >
                <StepCircle $active={isActive} $completed={isCompleted}>
                  {isCompleted ? (
                    <CheckCircle2 size={14} color={theme.colors.text.inverse} />
                  ) : (
                    <StepCircleText $active={isActive}>{step.id + 1}</StepCircleText>
                  )}
                </StepCircle>
                <StepTabText $active={isActive} $completed={isCompleted} numberOfLines={1}>
                  {step.label}
                </StepTabText>
              </StepTab>
            );
          })}
        </StepScrollList>
      </StepProgressBar>

      {/* Conteúdo com rolagem do Passo Ativo */}
      <ScrollContent showsVerticalScrollIndicator={false}>
        {/* ================================================================== */}
        {/* PASSO 0: IDENTIFICAÇÃO E CLIMA POR TURNO                           */}
        {/* ================================================================== */}
        {currentStep === 0 && (
          <StepCard>
            <StepHeader>
              <StepTitle>1. Identificação & Clima</StepTitle>
              <StepSubtitle>Defina a data do diário e as condições climáticas de cada turno.</StepSubtitle>
            </StepHeader>

            <FormGroup>
              <FieldLabel $noMarginTop>Data do Relatório:</FieldLabel>
              <Input
                accessibilityLabel="Data do diário de obra"
                value={activeDraft.date}
                onChangeText={updateDate}
                placeholder="DD/MM/AAAA"
              />
            </FormGroup>

            <FieldLabel>Condições do Clima por Turno:</FieldLabel>

            {(['manha', 'tarde', 'noite'] as Shift[]).map((shift) => {
              const weatherEntry =
                activeDraft.weather.find((w) => w.shift === shift) || {
                  shift,
                  condition: 'Ensolarado',
                  practical: true,
                };

              const isRain = /chuva|chuvoso/i.test(weatherEntry.condition);

              return (
                <ShiftBlock key={shift}>
                  <ShiftHeader>
                    <ShiftTitle>
                      {shift === 'manha' ? '☀️ Turno Manhã' : shift === 'tarde' ? '🌤️ Turno Tarde' : '🌙 Turno Noite'}
                    </ShiftTitle>
                    <Chip
                      label={weatherEntry.practical ? 'Praticável' : 'Impraticável'}
                      variant={weatherEntry.practical ? 'surface' : 'dark'}
                    />
                  </ShiftHeader>

                  <ConditionButtonsRow>
                    {[
                      {
                        cond: 'Ensolarado',
                        icon: (
                          <Sun
                            size={14}
                            color={
                              weatherEntry.condition === 'Ensolarado'
                                ? theme.name === 'dark'
                                  ? theme.colors.onSecondary
                                  : theme.colors.text.inverse
                                : theme.colors.text.primary
                            }
                          />
                        ),
                      },
                      {
                        cond: 'Nublado',
                        icon: (
                          <Cloud
                            size={14}
                            color={
                              weatherEntry.condition === 'Nublado'
                                ? theme.name === 'dark'
                                  ? theme.colors.onSecondary
                                  : theme.colors.text.inverse
                                : theme.colors.text.primary
                            }
                          />
                        ),
                      },
                      {
                        cond: 'Chuvoso',
                        icon: (
                          <CloudRain
                            size={14}
                            color={
                              weatherEntry.condition === 'Chuvoso'
                                ? theme.name === 'dark'
                                  ? theme.colors.onSecondary
                                  : theme.colors.text.inverse
                                : theme.colors.text.primary
                            }
                          />
                        ),
                      },
                      {
                        cond: 'Instável',
                        icon: (
                          <CloudLightning
                            size={14}
                            color={
                              weatherEntry.condition === 'Instável'
                                ? theme.name === 'dark'
                                  ? theme.colors.onSecondary
                                  : theme.colors.text.inverse
                                : theme.colors.text.primary
                            }
                          />
                        ),
                      },
                    ].map(({ cond, icon }) => (
                      <ConditionChip
                        key={cond}
                        $selected={weatherEntry.condition === cond}
                        onPress={() => updateWeatherShift(shift, { condition: cond })}
                        activeOpacity={0.7}
                      >
                        {icon}
                        <ConditionChipText $selected={weatherEntry.condition === cond}>
                          {cond}
                        </ConditionChipText>
                      </ConditionChip>
                    ))}
                  </ConditionButtonsRow>

                  <ToggleRow>
                    <ToggleLabel>Canteiro Praticável no Turno?</ToggleLabel>
                    <ToggleControlWrapper>
                      <SegmentedControl
                        options={[
                          { label: 'Sim', value: 'sim' },
                          { label: 'Não', value: 'nao' },
                        ]}
                        value={weatherEntry.practical ? 'sim' : 'nao'}
                        onChange={(val) => updateWeatherShift(shift, { practical: val === 'sim' })}
                      />
                    </ToggleControlWrapper>
                  </ToggleRow>

                  {isRain && (
                    <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.md }}>
                      <Input
                        accessibilityLabel={`Horas paradas por chuva no turno ${shift}`}
                        label="Horas Paradas por Chuva:"
                        value={String(weatherEntry.stoppageHours ?? 0)}
                        keyboardType="numeric"
                        onChangeText={(txt) =>
                          updateWeatherShift(shift, { stoppageHours: parseFloat(txt) || 0 })
                        }
                      />
                      {(weatherEntry.stoppageHours ?? 0) > 0 && (
                        <Input
                          accessibilityLabel={`Impacto da chuva no turno ${shift}`}
                          label="Justificativa do Impacto da Chuva:"
                          placeholder="Ex: Solo encharcado paralisou terraplenagem"
                          value={weatherEntry.impact ?? ''}
                          onChangeText={(txt) => updateWeatherShift(shift, { impact: txt })}
                        />
                      )}
                    </View>
                  )}
                </ShiftBlock>
              );
            })}
          </StepCard>
        )}

        {/* ================================================================== */}
        {/* PASSO 1: MÃO DE OBRA (EFETIVO & Hh)                                */}
        {/* ================================================================== */}
        {currentStep === 1 && (
          <StepCard>
            <StepHeader>
              <StepTitle>2. Efetivo & Mão de Obra</StepTitle>
              <StepSubtitle>Informe a equipe em campo, jornada e vínculo trabalhista.</StepSubtitle>
            </StepHeader>

            <KpiBanner>
              <KpiItem>
                <KpiValue>{headcount}</KpiValue>
                <KpiLabel>Total Operários</KpiLabel>
              </KpiItem>
              <KpiItem>
                <KpiValue>{manHours} h</KpiValue>
                <KpiLabel>Homem-Hora (Hh)</KpiLabel>
              </KpiItem>
            </KpiBanner>

            <FieldLabel $noMarginTop>Adicionar Colaborador à Equipe:</FieldLabel>

            {/* Dropdown Dinâmico com Inserção Manual para Função/Cargo */}
            <FormGroup>
              <DynamicDropdown
                label="Função / Cargo"
                placeholder="Selecione a função..."
                manualPlaceholder="Digite o cargo..."
                options={DEFAULT_LABOR_ROLES}
                value={laborRole}
                onChange={setLaborRole}
                accessibilityLabel="Função ou cargo do colaborador"
              />
            </FormGroup>

            {/* Campo Opcional de Nome */}
            <FormGroup>
              <Input
                accessibilityLabel="Nome do colaborador (opcional)"
                label="Nome (opcional)"
                value={laborName}
                onChangeText={setLaborName}
                placeholder="Ex: João da Silva"
              />
            </FormGroup>

            {/* Stepper de Quantidade */}
            <FormGroup>
              <QuantityStepper
                label="Quantidade de Trabalhadores"
                value={laborQty}
                onChange={setLaborQty}
                min={1}
                accessibilityLabel="Quantidade de trabalhadores"
              />
            </FormGroup>

            {/* Accordion Expansível para Horários */}
            <FormGroup>
              <TimeIntervalAccordion
                title="Registrar horário (opcional)"
                horaInicio={laborHoraInicio}
                horaFim={laborHoraFim}
                onChangeHoraInicio={(val) => {
                  setLaborHoraInicio(val);
                  const diff = calculateHoursFromInterval(val, laborHoraFim);
                  if (diff !== null) setLaborHours(String(diff));
                }}
                onChangeHoraFim={(val) => {
                  setLaborHoraFim(val);
                  const diff = calculateHoursFromInterval(laborHoraInicio, val);
                  if (diff !== null) setLaborHours(String(diff));
                }}
              >
                <View style={{ marginTop: theme.spacing.md }}>
                  <Input
                    accessibilityLabel="Jornada diária em horas calculada"
                    label="Jornada Diária (Horas/trabalhador)"
                    value={laborHours}
                    keyboardType="numeric"
                    onChangeText={setLaborHours}
                    placeholder="8"
                  />
                </View>
              </TimeIntervalAccordion>
            </FormGroup>

            <FormGroup>
              <FieldLabel $noMarginTop>Vínculo:</FieldLabel>
              <SegmentedControl
                options={[
                  { label: 'Próprio', value: 'proprio' },
                  { label: 'Terceirizado', value: 'terceirizado' },
                ]}
                value={laborContractor}
                onChange={setLaborContractor}
              />
            </FormGroup>

            <AddItemButtonWrapper>
              <Button
                title="Adicionar à Lista de Efetivo"
                variant="outline"
                size="small"
                onPress={() => {
                  if (!laborRole.trim()) return;
                  const hoursVal = parseFloat(laborHours) || 8;
                  addLaborEntry({
                    role: laborRole.trim(),
                    name: laborName.trim() || undefined,
                    quantity: laborQty || 1,
                    hours: hoursVal,
                    isContractor: laborContractor === 'terceirizado',
                    horaInicio: laborHoraInicio || undefined,
                    horaFim: laborHoraFim || undefined,
                  });
                  setLaborName('');
                }}
              />
            </AddItemButtonWrapper>

            <SectionDivider />

            <AddedItemsHeader>
              <AddedItemsTitle>Colaboradores Cadastrados ({activeDraft.labor.length})</AddedItemsTitle>
            </AddedItemsHeader>
            {activeDraft.labor.length === 0 ? (
              <StepSubtitle style={{ color: theme.colors.status.warning.text }}>
                ⚠️ Nenhum colaborador adicionado ainda. É obrigatório ao menos 1 para avançar.
              </StepSubtitle>
            ) : (
              activeDraft.labor.map((l, idx) => (
                <AddedItemCard key={idx}>
                  <AddedItemInfo>
                    <AddedItemTitle>
                      {l.name ? `${l.name} · ` : ''}{l.role} ({l.isContractor ? 'Terceirizado' : 'Próprio'})
                    </AddedItemTitle>
                    <AddedItemSubtitle>
                      {l.quantity} profissionais • Jornada: {l.hours}h ({l.quantity * l.hours} Hh total)
                      {l.horaInicio && l.horaFim ? ` • Horário: ${l.horaInicio} às ${l.horaFim}` : ''}
                    </AddedItemSubtitle>
                  </AddedItemInfo>
                  <RemoveButton onPress={() => removeLaborEntry(idx)}>
                    <Trash2 size={18} color={theme.colors.status.error.base} />
                  </RemoveButton>
                </AddedItemCard>
              ))
            )}
          </StepCard>
        )}

        {/* ================================================================== */}
        {/* PASSO 2: EQUIPAMENTOS E MAQUINÁRIO                                */}
        {/* ================================================================== */}
        {currentStep === 2 && (
          <StepCard>
            <StepHeader>
              <StepTitle>3. Equipamentos & Maquinário</StepTitle>
              <StepSubtitle>Controle de horas ativas e ociosas dos equipamentos presentes.</StepSubtitle>
            </StepHeader>

            <FieldLabel $noMarginTop>Adicionar Equipamento:</FieldLabel>

            {/* Dropdown Dinâmico com Inserção Manual para Nome da Máquina */}
            <FormGroup>
              <DynamicDropdown
                label="Nome da Máquina"
                placeholder="Selecione o equipamento..."
                manualPlaceholder="Digite o nome da máquina..."
                options={DEFAULT_EQUIPMENT_NAMES}
                value={equipName}
                onChange={setEquipName}
                accessibilityLabel="Nome do equipamento ou máquina"
              />
            </FormGroup>

            {/* Marca e Código lado a lado */}
            <FormRow>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Marca da máquina (opcional)"
                  label="Marca (opcional)"
                  value={equipBrand}
                  onChangeText={setEquipBrand}
                  placeholder="Ex: Caterpillar, Valtra"
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Código da máquina (opcional)"
                  label="Código (opcional)"
                  value={equipCode}
                  onChangeText={setEquipCode}
                  placeholder="Ex: EQ-042"
                />
              </FormCol>
            </FormRow>

            {/* Stepper de Quantidade */}
            <FormGroup>
              <QuantityStepper
                label="Quantidade de Máquinas"
                value={equipQty}
                onChange={setEquipQty}
                min={1}
                accessibilityLabel="Quantidade de máquinas"
              />
            </FormGroup>

            {/* Accordion Expansível para Horários Produtivas/Ociosas */}
            <FormGroup>
              <TimeIntervalAccordion
                title="Registrar horário (opcional)"
                horaInicio={equipHoraInicio}
                horaFim={equipHoraFim}
                onChangeHoraInicio={(val) => {
                  setEquipHoraInicio(val);
                  const diff = calculateHoursFromInterval(val, equipHoraFim);
                  if (diff !== null) setEquipActiveHours(String(diff));
                }}
                onChangeHoraFim={(val) => {
                  setEquipHoraFim(val);
                  const diff = calculateHoursFromInterval(equipHoraInicio, val);
                  if (diff !== null) setEquipActiveHours(String(diff));
                }}
              >
                <FormRow style={{ marginTop: theme.spacing.md }}>
                  <FormCol flex={1}>
                    <Input
                      accessibilityLabel="Horas ativas produtivas"
                      label="Horas Produtivas"
                      value={equipActiveHours}
                      keyboardType="numeric"
                      onChangeText={setEquipActiveHours}
                    />
                  </FormCol>
                  <FormCol flex={1}>
                    <Input
                      accessibilityLabel="Horas inativas ociosas"
                      label="Horas Ociosas"
                      value={equipIdleHours}
                      keyboardType="numeric"
                      onChangeText={setEquipIdleHours}
                    />
                  </FormCol>
                </FormRow>

                {parseFloat(equipIdleHours) > 0 && (
                  <View style={{ marginTop: theme.spacing.sm }}>
                    <Input
                      accessibilityLabel="Justificativa da inatividade"
                      label="Justificativa da Ociosidade (Obrigatória):"
                      value={equipJustification}
                      onChangeText={setEquipJustification}
                      placeholder="Ex: Aguardando liberação de caçamba (mín. 5 chars)"
                    />
                  </View>
                )}
              </TimeIntervalAccordion>
            </FormGroup>

            {/* TextArea Observações Opcionais com Limite de 200 caracteres */}
            <FormGroup>
              <Input
                accessibilityLabel="Observações do equipamento"
                label={`Observações (opcional) (${equipObservations.length}/200)`}
                value={equipObservations}
                onChangeText={(txt) => setEquipObservations(txt.slice(0, 200))}
                multiline
                numberOfLines={3}
                placeholder="Ex: Manutenção preventiva agendada para sexta-feira."
                maxLength={200}
              />
            </FormGroup>

            <FormGroup>
              <FieldLabel $noMarginTop>Vínculo da Máquina:</FieldLabel>
              <SegmentedControl
                options={[
                  { label: 'Próprio', value: 'proprio' },
                  { label: 'Locado', value: 'locado' },
                ]}
                value={equipRented}
                onChange={setEquipRented}
              />
            </FormGroup>

            <AddItemButtonWrapper>
              <Button
                title="Adicionar à Lista de Equipamentos"
                variant="outline"
                size="small"
                onPress={() => {
                  if (!equipName.trim()) return;
                  const idle = parseFloat(equipIdleHours) || 0;
                  addEquipmentEntry({
                    name: equipName.trim(),
                    brand: equipBrand.trim() || undefined,
                    code: equipCode.trim() || undefined,
                    quantity: equipQty || 1,
                    activeHours: parseFloat(equipActiveHours) || 0,
                    idleHours: idle,
                    idleJustification: idle > 0 ? equipJustification.trim() : undefined,
                    horaInicio: equipHoraInicio || undefined,
                    horaFim: equipHoraFim || undefined,
                    observations: equipObservations.trim() || undefined,
                    isRented: equipRented === 'locado',
                  });
                  setEquipBrand('');
                  setEquipCode('');
                  setEquipObservations('');
                  setEquipJustification('');
                }}
              />
            </AddItemButtonWrapper>

            <SectionDivider />

            <AddedItemsHeader>
              <AddedItemsTitle>Equipamentos no Canteiro ({activeDraft.equipment.length})</AddedItemsTitle>
            </AddedItemsHeader>
            {activeDraft.equipment.length === 0 ? (
              <StepSubtitle>Nenhum equipamento adicionado para hoje (opcional).</StepSubtitle>
            ) : (
              activeDraft.equipment.map((e, idx) => (
                <AddedItemCard key={idx}>
                  <AddedItemInfo>
                    <AddedItemTitle>
                      {e.name} {e.brand ? `• ${e.brand}` : ''} {e.code ? `[${e.code}]` : ''} ({e.isRented ? 'Locado' : 'Próprio'}) • Qtd: {e.quantity ?? 1}
                    </AddedItemTitle>
                    <AddedItemSubtitle>
                      Produtivas: {e.activeHours}h | Ociosas: {e.idleHours}h
                      {e.horaInicio && e.horaFim ? ` • Horário: ${e.horaInicio} às ${e.horaFim}` : ''}
                      {e.idleJustification ? `\nMotivo ociosidade: ${e.idleJustification}` : ''}
                      {e.observations ? `\nObs: ${e.observations}` : ''}
                    </AddedItemSubtitle>
                  </AddedItemInfo>
                  <RemoveButton onPress={() => removeEquipmentEntry(idx)}>
                    <Trash2 size={18} color={theme.colors.status.error.base} />
                  </RemoveButton>
                </AddedItemCard>
              ))
            )}
          </StepCard>
        )}

        {/* ================================================================== */}
        {/* PASSO 3: ATIVIDADES EXECUTADAS                                     */}
        {/* ================================================================== */}
        {currentStep === 3 && (
          <StepCard>
            <StepHeader>
              <StepTitle>4. Atividades Executadas</StepTitle>
              <StepSubtitle>Detalhamento das frentes de serviço e avanço físico do dia.</StepSubtitle>
            </StepHeader>

            <FieldLabel $noMarginTop>Adicionar Frente de Serviço:</FieldLabel>

            {/* Descrição em TextArea aberto */}
            <FormGroup>
              <Input
                accessibilityLabel="Descrição da atividade executada"
                label="Descrição da Atividade (mín. 3 caracteres)"
                value={actDesc}
                onChangeText={setActDesc}
                multiline
                numberOfLines={3}
                placeholder="Ex: Concretagem dos pilares do 2º pavimento e montagem de fôrmas."
              />
            </FormGroup>

            {/* Dropdown de Status da Atividade */}
            <FormGroup>
              <DynamicDropdown
                label="Status da Atividade"
                options={ACTIVITY_STATUS_OPTIONS}
                value={actStatus}
                onChange={(val) => setActStatus(val as ActivityStatus)}
                accessibilityLabel="Status da atividade executada"
              />
            </FormGroup>

            <FormRow>
              <FormCol flex={2}>
                <Input
                  accessibilityLabel="Localização ou pavimento"
                  label="Local / Pavimento"
                  value={actLocation}
                  onChangeText={setActLocation}
                  placeholder="Ex: 2º Pavimento"
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Unidade de medida"
                  label="Unidade"
                  value={actUnit}
                  onChangeText={setActUnit}
                  placeholder="m², m³, un"
                />
              </FormCol>
            </FormRow>

            <FormRow>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Quantidade executada (opcional)"
                  label="Quantidade (opcional)"
                  value={actQty}
                  keyboardType="numeric"
                  onChangeText={setActQty}
                  placeholder="Ex: 10"
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Avanço físico em porcentagem (opcional)"
                  label="Avanço (%) (opcional)"
                  value={actProgress}
                  keyboardType="numeric"
                  onChangeText={setActProgress}
                  placeholder="Ex: 25"
                />
              </FormCol>
            </FormRow>

            <AddItemButtonWrapper>
              <Button
                title="Adicionar à Lista de Atividades"
                variant="outline"
                size="small"
                onPress={() => {
                  if (!actDesc.trim() || actDesc.trim().length < 3) return;
                  addActivityEntry({
                    description: actDesc.trim(),
                    location: actLocation.trim() || 'Canteiro Geral',
                    unit: actUnit.trim() || 'un',
                    quantity: parseFloat(actQty) || 1,
                    progress: parseFloat(actProgress) || 0,
                    status: actStatus,
                  });
                  setActDesc('');
                }}
              />
            </AddItemButtonWrapper>

            <SectionDivider />

            <AddedItemsHeader>
              <AddedItemsTitle>Atividades Registradas ({activeDraft.activities.length})</AddedItemsTitle>
            </AddedItemsHeader>
            {activeDraft.activities.length === 0 ? (
              <StepSubtitle style={{ color: theme.colors.status.warning.text }}>
                ⚠️ Nenhuma atividade cadastrada ainda. É obrigatório ao menos 1 para avançar.
              </StepSubtitle>
            ) : (
              activeDraft.activities.map((a, idx) => (
                <AddedItemCard key={idx}>
                  <AddedItemInfo>
                    <AddedItemTitle>{a.description}</AddedItemTitle>
                    <AddedItemSubtitle>
                      Status: {a.status ?? 'Em andamento'} • Local: {a.location} • Quantidade: {a.quantity} {a.unit} • Avanço: {a.progress ?? 0}%
                    </AddedItemSubtitle>
                  </AddedItemInfo>
                  <RemoveButton onPress={() => removeActivityEntry(idx)}>
                    <Trash2 size={18} color={theme.colors.status.error.base} />
                  </RemoveButton>
                </AddedItemCard>
              ))
            )}
          </StepCard>
        )}

        {/* ================================================================== */}
        {/* PASSO 4: OCORRÊNCIAS & DDS (Pula de Atividades diretamente p/ Fatos)*/}
        {/* ================================================================== */}
        {currentStep === 4 && (
          <StepCard>
            <StepHeader>
              <StepTitle>5. Ocorrências & DDS</StepTitle>
              <StepSubtitle>Fatos relevantes, diálogos diários de segurança e paralisações.</StepSubtitle>
            </StepHeader>

            <FieldLabel $noMarginTop>Tipo de Registro:</FieldLabel>

            {/* Dropdown Dinâmico para Tipo de Registro sem cortar palavras */}
            <FormGroup>
              <DynamicDropdown
                options={OCCURRENCE_TYPE_OPTIONS}
                value={occTypeLabel}
                onChange={setOccTypeLabel}
                accessibilityLabel="Tipo de ocorrência ou registro"
              />
            </FormGroup>

            {/* Accordion Expansível para Horários */}
            <FormGroup>
              <TimeIntervalAccordion
                title="Registrar horário (opcional)"
                horaInicio={occHoraInicio}
                horaFim={occHoraFim}
                onChangeHoraInicio={setOccHoraInicio}
                onChangeHoraFim={setOccHoraFim}
              />
            </FormGroup>

            {/* Detalhamento como TextArea Limpo */}
            <FormGroup>
              <Input
                accessibilityLabel="Detalhamento da ocorrência ou tema do DDS"
                label="Detalhamento do Fato / Tema do DDS:"
                value={occDesc}
                onChangeText={setOccDesc}
                multiline
                numberOfLines={4}
                placeholder="Ex: Diálogo diário sobre segurança nas escavações e uso de EPIs adequados."
              />
            </FormGroup>

            {/* Botão Adicionar à Lista de Ocorrências */}
            <AddItemButtonWrapper>
              <Button
                title="Adicionar à Lista de Ocorrências"
                variant="outline"
                size="small"
                onPress={() => {
                  if (!occDesc.trim() || occDesc.trim().length < 5) return;
                  addOccurrenceEntry({
                    type: mapLabelToOccType(occTypeLabel),
                    description: occDesc.trim(),
                    horaInicio: occHoraInicio || undefined,
                    horaFim: occHoraFim || undefined,
                  });
                  setOccDesc('');
                  setOccHoraInicio('');
                  setOccHoraFim('');
                }}
              />
            </AddItemButtonWrapper>

            <SectionDivider />

            <AddedItemsHeader>
              <AddedItemsTitle>Ocorrências Cadastradas ({activeDraft.occurrences.length})</AddedItemsTitle>
            </AddedItemsHeader>
            {activeDraft.occurrences.length === 0 ? (
              <StepSubtitle>Nenhum fato relevante adicionado hoje (opcional).</StepSubtitle>
            ) : (
              activeDraft.occurrences.map((o, idx) => (
                <AddedItemCard key={idx}>
                  <AddedItemInfo>
                    <AddedItemTitle>[{o.type.toUpperCase()}]</AddedItemTitle>
                    <AddedItemSubtitle>
                      {o.description}
                      {o.horaInicio && o.horaFim ? `\nHorário: ${o.horaInicio} às ${o.horaFim}` : ''}
                    </AddedItemSubtitle>
                  </AddedItemInfo>
                  <RemoveButton onPress={() => removeOccurrenceEntry(idx)}>
                    <Trash2 size={18} color={theme.colors.status.error.base} />
                  </RemoveButton>
                </AddedItemCard>
              ))
            )}
          </StepCard>
        )}

        {/* ================================================================== */}
        {/* PASSO 5: FOTOS NA OBRA COM MARCA D'ÁGUA DE SEGURANÇA               */}
        {/* ================================================================== */}
        {currentStep === 5 && (
          <StepCard>
            <StepHeader>
              <StepTitle>6. Fotos na Obra</StepTitle>
              <StepSubtitle>
                Captura com gravação automática de marca d&apos;água de segurança (GPS, Obra e Data).
              </StepSubtitle>
            </StepHeader>

            <AddItemButtonWrapper>
              <Button
                title="Tirar Foto na Obra (com Marca d'Água)"
                variant="primary"
                onPress={() => handleCapturePhoto('Registro fotográfico do canteiro')}
              />
            </AddItemButtonWrapper>

            <SectionDivider />

            <AddedItemsHeader>
              <AddedItemsTitle>Fotos Anexadas ({activeDraft.photos.length})</AddedItemsTitle>
            </AddedItemsHeader>
            {activeDraft.photos.length === 0 ? (
              <StepSubtitle>Nenhuma foto capturada ainda (opcional).</StepSubtitle>
            ) : (
              activeDraft.photos.map((p, idx) => (
                <PhotoCard key={p.id || idx}>
                  <PhotoPreviewBox>
                    <Camera size={48} color="#94A3B8" />
                    {/* Marca d'água de segurança estampada */}
                    <WatermarkBanner>
                      <WatermarkTitle>🔒 StackLab Security Watermark</WatermarkTitle>
                      <WatermarkDataText>
                        Obra: {activeDraft.workName} • {p.takenAt.slice(0, 10)} {p.takenAt.slice(11, 16)}
                        {'\n'}GPS: {p.metadata?.latitude ?? -2.5307}, {p.metadata?.longitude ?? -44.3068} (±{p.metadata?.accuracy ?? 3.8}m) • Autor: {p.author}
                      </WatermarkDataText>
                    </WatermarkBanner>
                  </PhotoPreviewBox>

                  <FormRow>
                    <FormCol flex={3}>
                      <AddedItemSubtitle>Legenda: {p.caption}</AddedItemSubtitle>
                    </FormCol>
                    <FormCol flex={1} style={{ alignItems: 'flex-end' }}>
                      <RemoveButton onPress={() => removePhotoEntry(idx)}>
                        <Trash2 size={18} color={theme.colors.status.error.base} />
                      </RemoveButton>
                    </FormCol>
                  </FormRow>
                </PhotoCard>
              ))
            )}
          </StepCard>
        )}

        {/* ================================================================== */}
        {/* PASSO 6: REVISÃO & PRÉVIA CONSOLIDADA (READ-ONLY)                  */}
        {/* ================================================================== */}
        {currentStep === 6 && (
          <StepCard>
            <StepHeader>
              <StepTitle>7. Revisão & Prévia Consolidada</StepTitle>
              <StepSubtitle>
                Confira o consolidado de todas as informações antes de finalizar o envio.
              </StepSubtitle>
            </StepHeader>

            {/* 1. Clima */}
            <ReviewSectionCard>
              <ReviewSectionHeader>
                <ReviewSectionTitle>1. Identificação & Clima</ReviewSectionTitle>
                <ReviewEditButton onPress={() => goToStep(0)} accessibilityLabel="Editar clima">
                  <Edit3 size={12} color={theme.colors.primary} />
                  <ReviewEditText>Editar</ReviewEditText>
                </ReviewEditButton>
              </ReviewSectionHeader>
              <ReviewInfoRow>
                <ReviewLabel>Data do Registro:</ReviewLabel>
                <ReviewValue>{activeDraft.date}</ReviewValue>
              </ReviewInfoRow>
              <ReviewInfoRow>
                <ReviewLabel>Obra Vinculada:</ReviewLabel>
                <ReviewValue>{activeDraft.workName}</ReviewValue>
              </ReviewInfoRow>
              <ReviewInfoRow>
                <ReviewLabel>Responsável:</ReviewLabel>
                <ReviewValue>{activeDraft.authorName}</ReviewValue>
              </ReviewInfoRow>

              {activeDraft.weather.map((w) => {
                const shiftName = w.shift === 'manha' ? 'Manhã' : w.shift === 'tarde' ? 'Tarde' : 'Noite';
                return (
                  <ReviewItemBox key={w.shift}>
                    <ReviewItemHeader>
                      <ReviewItemTitle>Turno {shiftName}</ReviewItemTitle>
                      <ReviewBadge $variant={w.practical ? 'primary' : 'secondary'}>
                        <ReviewBadgeText $variant={w.practical ? 'primary' : 'secondary'}>
                          {w.practical ? 'Praticável' : 'Impraticável'}
                        </ReviewBadgeText>
                      </ReviewBadge>
                    </ReviewItemHeader>
                    <ReviewItemSubtitle>Condição: {w.condition}</ReviewItemSubtitle>
                    {(w.stoppageHours ?? 0) > 0 && (
                      <ReviewItemSubtitle>
                        Paralisação por Chuva: {w.stoppageHours}h {w.impact ? `(${w.impact})` : ''}
                      </ReviewItemSubtitle>
                    )}
                  </ReviewItemBox>
                );
              })}
            </ReviewSectionCard>

            {/* 2. Mão de Obra */}
            <ReviewSectionCard>
              <ReviewSectionHeader>
                <ReviewSectionTitle>2. Mão de Obra & Efetivo ({activeDraft.labor.length})</ReviewSectionTitle>
                <ReviewEditButton onPress={() => goToStep(1)} accessibilityLabel="Editar efetivo">
                  <Edit3 size={12} color={theme.colors.primary} />
                  <ReviewEditText>Editar</ReviewEditText>
                </ReviewEditButton>
              </ReviewSectionHeader>
              <ReviewInfoRow>
                <ReviewLabel>Total de Operários:</ReviewLabel>
                <ReviewValue>{headcount} profissionais</ReviewValue>
              </ReviewInfoRow>
              <ReviewInfoRow>
                <ReviewLabel>Total Homem-Hora (Hh):</ReviewLabel>
                <ReviewValue>{manHours} horas</ReviewValue>
              </ReviewInfoRow>
              {activeDraft.labor.length === 0 ? (
                <ReviewEmptyText>Nenhum colaborador adicionado ao diário.</ReviewEmptyText>
              ) : (
                activeDraft.labor.map((l, idx) => (
                  <ReviewItemBox key={idx}>
                    <ReviewItemHeader>
                      <ReviewItemTitle>
                        {l.name ? `${l.name} · ` : ''}{l.role}
                      </ReviewItemTitle>
                      <ReviewBadge $variant={l.isContractor ? 'secondary' : 'primary'}>
                        <ReviewBadgeText $variant={l.isContractor ? 'secondary' : 'primary'}>
                          {l.isContractor ? 'Terceirizado' : 'Próprio'}
                        </ReviewBadgeText>
                      </ReviewBadge>
                    </ReviewItemHeader>
                    <ReviewItemSubtitle>
                      Quantidade: {l.quantity} • Jornada: {l.hours}h ({l.quantity * l.hours} Hh)
                      {l.horaInicio && l.horaFim ? ` • Horário: ${l.horaInicio} às ${l.horaFim}` : ''}
                    </ReviewItemSubtitle>
                  </ReviewItemBox>
                ))
              )}
            </ReviewSectionCard>

            {/* 3. Equipamentos */}
            <ReviewSectionCard>
              <ReviewSectionHeader>
                <ReviewSectionTitle>3. Equipamentos Presentes ({activeDraft.equipment.length})</ReviewSectionTitle>
                <ReviewEditButton onPress={() => goToStep(2)} accessibilityLabel="Editar equipamentos">
                  <Edit3 size={12} color={theme.colors.primary} />
                  <ReviewEditText>Editar</ReviewEditText>
                </ReviewEditButton>
              </ReviewSectionHeader>
              {activeDraft.equipment.length === 0 ? (
                <ReviewEmptyText>Nenhum equipamento registrado no dia.</ReviewEmptyText>
              ) : (
                activeDraft.equipment.map((e, idx) => (
                  <ReviewItemBox key={idx}>
                    <ReviewItemHeader>
                      <ReviewItemTitle>
                        {e.name} {e.brand ? `• ${e.brand}` : ''} {e.code ? `[${e.code}]` : ''}
                      </ReviewItemTitle>
                      <ReviewBadge $variant={e.isRented ? 'secondary' : 'primary'}>
                        <ReviewBadgeText $variant={e.isRented ? 'secondary' : 'primary'}>
                          {e.isRented ? 'Locado' : 'Próprio'}
                        </ReviewBadgeText>
                      </ReviewBadge>
                    </ReviewItemHeader>
                    <ReviewItemSubtitle>
                      Qtd: {e.quantity ?? 1} • Horas Produtivas: {e.activeHours}h | Ociosas: {e.idleHours}h
                      {e.horaInicio && e.horaFim ? ` • Horário: ${e.horaInicio} às ${e.horaFim}` : ''}
                      {e.idleJustification ? `\nMotivo da Inatividade: ${e.idleJustification}` : ''}
                      {e.observations ? `\nObservações: ${e.observations}` : ''}
                    </ReviewItemSubtitle>
                  </ReviewItemBox>
                ))
              )}
            </ReviewSectionCard>

            {/* 4. Atividades */}
            <ReviewSectionCard>
              <ReviewSectionHeader>
                <ReviewSectionTitle>4. Atividades Executadas ({activeDraft.activities.length})</ReviewSectionTitle>
                <ReviewEditButton onPress={() => goToStep(3)} accessibilityLabel="Editar atividades">
                  <Edit3 size={12} color={theme.colors.primary} />
                  <ReviewEditText>Editar</ReviewEditText>
                </ReviewEditButton>
              </ReviewSectionHeader>
              {activeDraft.activities.length === 0 ? (
                <ReviewEmptyText>Nenhuma atividade registrada.</ReviewEmptyText>
              ) : (
                activeDraft.activities.map((act, idx) => (
                  <ReviewItemBox key={idx}>
                    <ReviewItemHeader>
                      <ReviewItemTitle>{act.description}</ReviewItemTitle>
                      <ReviewBadge $variant="primary">
                        <ReviewBadgeText>{act.status ?? 'Em andamento'}</ReviewBadgeText>
                      </ReviewBadge>
                    </ReviewItemHeader>
                    <ReviewItemSubtitle>
                      Local: {act.location} • Produção: {act.quantity} {act.unit} • Avanço: {act.progress ?? 0}%
                    </ReviewItemSubtitle>
                  </ReviewItemBox>
                ))
              )}
            </ReviewSectionCard>

            {/* 5. Ocorrências & DDS */}
            <ReviewSectionCard>
              <ReviewSectionHeader>
                <ReviewSectionTitle>5. Ocorrências & DDS ({activeDraft.occurrences.length})</ReviewSectionTitle>
                <ReviewEditButton onPress={() => goToStep(4)} accessibilityLabel="Editar ocorrências">
                  <Edit3 size={12} color={theme.colors.primary} />
                  <ReviewEditText>Editar</ReviewEditText>
                </ReviewEditButton>
              </ReviewSectionHeader>
              {activeDraft.occurrences.length === 0 ? (
                <ReviewEmptyText>Nenhum fato relevante anotado.</ReviewEmptyText>
              ) : (
                activeDraft.occurrences.map((o, idx) => (
                  <ReviewItemBox key={idx}>
                    <ReviewItemHeader>
                      <ReviewItemTitle>[{o.type.toUpperCase()}]</ReviewItemTitle>
                      <ReviewBadge $variant={o.type === 'acidente' ? 'error' : 'neutral'}>
                        <ReviewBadgeText $variant={o.type === 'acidente' ? 'error' : 'neutral'}>
                          {o.type}
                        </ReviewBadgeText>
                      </ReviewBadge>
                    </ReviewItemHeader>
                    <ReviewItemSubtitle>
                      {o.description}
                      {o.horaInicio && o.horaFim ? ` • Horário: ${o.horaInicio} às ${o.horaFim}` : ''}
                    </ReviewItemSubtitle>
                  </ReviewItemBox>
                ))
              )}
            </ReviewSectionCard>

            {/* 6. Fotos */}
            <ReviewSectionCard>
              <ReviewSectionHeader>
                <ReviewSectionTitle>6. Fotos na Obra ({activeDraft.photos.length})</ReviewSectionTitle>
                <ReviewEditButton onPress={() => goToStep(5)} accessibilityLabel="Editar fotos">
                  <Edit3 size={12} color={theme.colors.primary} />
                  <ReviewEditText>Editar</ReviewEditText>
                </ReviewEditButton>
              </ReviewSectionHeader>
              {activeDraft.photos.length === 0 ? (
                <ReviewEmptyText>Nenhuma foto anexada ao diário.</ReviewEmptyText>
              ) : (
                activeDraft.photos.map((p, idx) => (
                  <ReviewItemBox key={p.id || idx}>
                    <ReviewItemHeader>
                      <ReviewItemTitle>{p.caption || `Foto #${idx + 1}`}</ReviewItemTitle>
                      <ReviewBadge $variant="neutral">
                        <ReviewBadgeText $variant="neutral">Registrada</ReviewBadgeText>
                      </ReviewBadge>
                    </ReviewItemHeader>
                    <ReviewItemSubtitle>
                      Horário: {p.takenAt}
                    </ReviewItemSubtitle>
                  </ReviewItemBox>
                ))
              )}
            </ReviewSectionCard>
          </StepCard>
        )}
      </ScrollContent>

      {/* Navegação Inferior (Sticky Footer) com Validação de Etapa */}
      <BottomActionBar>
        {!canAdvance && stepError && (
          <StepValidationHint>
            <AlertTriangle size={16} color={theme.colors.status.warning.text} />
            <StepValidationHintText>{stepError}</StepValidationHintText>
          </StepValidationHint>
        )}

        <ActionButtonsRow>
          {currentStep > 0 && (
            <ActionButtonWrapper flex={1}>
              <Button
                title="Voltar"
                variant="outline"
                size="small"
                onPress={handlePrevStep}
                accessibilityLabel="Voltar ao passo anterior"
              />
            </ActionButtonWrapper>
          )}

          <ActionButtonWrapper flex={currentStep === 0 ? 1 : 1.5}>
            {currentStep < STEPS.length - 2 ? (
              <Button
                title="Próximo"
                variant="primary"
                size="small"
                disabled={!canAdvance}
                onPress={() => handleNextStep()}
                accessibilityLabel="Avançar para o próximo passo"
              />
            ) : currentStep === STEPS.length - 2 ? (
              <Button
                title="Revisar/Ver Prévia"
                variant="primary"
                size="small"
                disabled={!canAdvance}
                onPress={() => handleNextStep()}
                accessibilityLabel="Avançar para a tela de revisão e prévia"
              />
            ) : (
              <Button
                title={isSubmitting ? 'Submetendo...' : 'Concluir/Salvar'}
                variant="primary"
                size="small"
                disabled={isSubmitting || !canAdvance}
                onPress={handleSubmit}
                accessibilityLabel="Finalizar e submeter o relatório diário de obra"
              />
            )}
          </ActionButtonWrapper>
        </ActionButtonsRow>
      </BottomActionBar>

      {/* Dialog de Erros de Validação de Pré-Submissão */}
      <Dialog
        visible={isValidationDialogOpen}
        title="Pendências no Diário"
        description={`Para submeter o RDO, corrija os seguintes itens obrigatórios:\n\n• ${validationErrors.join(
          '\n• ',
        )}`}
        primaryAction={{
          label: 'Revisar Diário',
          onPress: () => setIsValidationDialogOpen(false),
        }}
        onClose={() => setIsValidationDialogOpen(false)}
      />

      {/* Dialog de Confirmação de Sucesso */}
      <Dialog
        visible={isSuccessDialogOpen}
        title="RDO Submetido com Sucesso!"
        description={`O Relatório Diário de Obra foi enviado e registrado formalmente. O gestor master já pode realizar a validação e homologação na caixa de entrada.`}
        primaryAction={{
          label: 'Ir para o Início',
          onPress: handleFinishSuccess,
        }}
        onClose={handleFinishSuccess}
      />
    </WizardContainer>
  );
};

export default NewRDOView;
