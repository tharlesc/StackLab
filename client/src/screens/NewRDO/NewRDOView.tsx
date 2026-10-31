import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Trash2,
  Plus,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Users,
  HardHat,
  Briefcase,
  Layers,
  FileSpreadsheet,
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
  FormRow,
  FormCol,
  FieldLabel,
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
  PhotoCard,
  PhotoPreviewBox,
  WatermarkBanner,
  WatermarkTitle,
  WatermarkDataText,
  BottomActionBar,
  ActionButtonWrapper,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { ScrollContent } from '@/components/common/Layout';
import { Dialog } from '@/components/common/Dialog';
import { Chip } from '@/components/common/Chip';
import { InteractiveCard } from '@/components/common/InteractiveCard';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { strings } from '@/constants/strings';
import type { Shift, OccurrenceType } from '@/types';

export const NewRDOView = () => {
  const theme = useTheme();
  const {
    works,
    selectedWork,
    activeDraft,
    currentStep,
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
    updateDate,
    updateWeatherShift,
    addLaborEntry,
    removeLaborEntry,
    addEquipmentEntry,
    removeEquipmentEntry,
    addActivityEntry,
    removeActivityEntry,
    addMaterialEntry,
    removeMaterialEntry,
    addOccurrenceEntry,
    removeOccurrenceEntry,
    handleCapturePhoto,
    removePhotoEntry,
    handleSubmit,
    handleFinishSuccess,
    setIsValidationDialogOpen,
  } = useNewRDO();

  // Estados locais para os formulários de adição de itens
  // Mão de Obra
  const [laborRole, setLaborRole] = useState('Pedreiro');
  const [laborQty, setLaborQty] = useState('2');
  const [laborHours, setLaborHours] = useState('8');
  const [laborContractor, setLaborContractor] = useState<'proprio' | 'terceirizado'>('proprio');

  // Equipamento
  const [equipName, setEquipName] = useState('Betoneira 400L');
  const [equipQty, setEquipQty] = useState('1');
  const [equipActiveHours, setEquipActiveHours] = useState('8');
  const [equipIdleHours, setEquipIdleHours] = useState('0');
  const [equipJustification, setEquipJustification] = useState('');
  const [equipRented, setEquipRented] = useState<'proprio' | 'locado'>('proprio');

  // Atividade
  const [actDesc, setActDesc] = useState('');
  const [actLocation, setActLocation] = useState('1º Pavimento');
  const [actUnit, setActUnit] = useState('m²');
  const [actQty, setActQty] = useState('10');
  const [actProgress, setActProgress] = useState('25');

  // Material
  const [matName, setMatName] = useState('');
  const [matSupplier, setMatSupplier] = useState('');
  const [matInvoice, setMatInvoice] = useState('');
  const [matQty, setMatQty] = useState('');
  const [matUnit, setMatUnit] = useState('un');

  // Ocorrência / DDS
  const [occType, setOccType] = useState<OccurrenceType>('dds');
  const [occDesc, setOccDesc] = useState('');

  // --------------------------------------------------------------------------
  // RENDER: Seleção de Obra (se não houver rascunho ativo)
  // --------------------------------------------------------------------------
  if (!activeDraft) {
    return (
      <>
        <Header title={strings.newRDO.title} />

        <ScrollContent showsVerticalScrollIndicator={false}>
          {existingDraftWork && existingDraftData && (
            <InteractiveCard
              title="Rascunho Local Disponível"
              supportingText={`Você possui 1 diário em rascunho salvo offline aguardando preenchimento para "${existingDraftWork.name}".`}
              actions={[
                { label: 'Descartar', onPress: handleDiscardExistingDraft, destructive: true },
                { label: 'Continuar', onPress: handleContinueExistingDraft, primary: true },
              ]}
            />
          )}

          <StepTitle style={{ marginBottom: theme.spacing.sm, marginTop: theme.spacing.xs }}>
            Selecione a Obra:
          </StepTitle>

          {works.map((work) => (
            <WorkSelectCard
              key={work.id}
              activeOpacity={0.7}
              onPress={() => handleSelectWork(work)}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar obra: ${work.name}, ${work.subtitle}`}
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
          ))}
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
  // RENDER: Assistente de 7 Passos do RDO (Wizard Ativo)
  // --------------------------------------------------------------------------
  return (
    <WizardContainer>
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
            accessibilityLabel="Voltar e salvar rascunho"
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

      {/* Barra de Progresso / Abas dos Passos */}
      <StepProgressBar>
        <StepScrollList horizontal showsHorizontalScrollIndicator={false}>
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <StepTab
                key={step.id}
                $active={isActive}
                $completed={isCompleted}
                onPress={() => goToStep(step.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={step.title}
              >
                <StepCircle $active={isActive} $completed={isCompleted}>
                  <StepCircleText $active={isActive}>{step.id + 1}</StepCircleText>
                </StepCircle>
                <StepTabText $active={isActive}>{step.label}</StepTabText>
              </StepTab>
            );
          })}
        </StepScrollList>
      </StepProgressBar>

      {/* Conteúdo Dinâmico do Passo Atual */}
      <ScrollContent showsVerticalScrollIndicator={false}>
        {savedFeedback && (
          <InteractiveCard
            title="Rascunho Salvo"
            supportingText={savedFeedback}
            actions={[]}
          />
        )}

        {/* ================================================================== */}
        {/* PASSO 0: IDENTIFICAÇÃO E CLIMA POR TURNO                          */}
        {/* ================================================================== */}
        {currentStep === 0 && (
          <StepCard>
            <StepHeader>
              <StepTitle>1. Identificação & Clima</StepTitle>
              <StepSubtitle>Defina a data do diário e as condições climáticas de cada turno.</StepSubtitle>
            </StepHeader>

            <Input
              accessibilityLabel="Data do Registro"
              label="Data do Registro (DD/MM/AAAA ou AAAA-MM-DD)"
              value={activeDraft.date}
              onChangeText={updateDate}
              placeholder="Ex: 2026-10-31"
            />

            <FieldLabel style={{ marginTop: theme.spacing.md }}>Condições do Tempo por Turno:</FieldLabel>

            {(['manha', 'tarde', 'noite'] as Shift[]).map((shift) => {
              const weatherEntry = activeDraft.weather.find((w) => w.shift === shift) || {
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
                      { cond: 'Ensolarado', icon: <Sun size={14} color={weatherEntry.condition === 'Ensolarado' ? '#fff' : '#0B2240'} /> },
                      { cond: 'Nublado', icon: <Cloud size={14} color={weatherEntry.condition === 'Nublado' ? '#fff' : '#0B2240'} /> },
                      { cond: 'Chuvoso', icon: <CloudRain size={14} color={weatherEntry.condition === 'Chuvoso' ? '#fff' : '#0B2240'} /> },
                      { cond: 'Instável', icon: <CloudLightning size={14} color={weatherEntry.condition === 'Instável' ? '#fff' : '#0B2240'} /> },
                    ].map(({ cond, icon }) => (
                      <ConditionChip
                        key={cond}
                        $selected={weatherEntry.condition === cond}
                        onPress={() => updateWeatherShift(shift, { condition: cond })}
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
                    <SegmentedControl
                      options={[
                        { label: 'Sim', value: 'sim' },
                        { label: 'Não', value: 'nao' },
                      ]}
                      value={weatherEntry.practical ? 'sim' : 'nao'}
                      onChange={(val) => updateWeatherShift(shift, { practical: val === 'sim' })}
                    />
                  </ToggleRow>

                  {isRain && (
                    <View style={{ marginTop: theme.spacing.sm }}>
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

            <FieldLabel>Adicionar Equipe / Função:</FieldLabel>
            <FormRow>
              <FormCol flex={2}>
                <Input
                  accessibilityLabel="Cargo ou função"
                  label="Função / Cargo"
                  value={laborRole}
                  onChangeText={setLaborRole}
                  placeholder="Ex: Pedreiro, Carpinteiro"
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Quantidade de trabalhadores"
                  label="Qtd."
                  value={laborQty}
                  keyboardType="numeric"
                  onChangeText={setLaborQty}
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Jornada em horas"
                  label="Horas"
                  value={laborHours}
                  keyboardType="numeric"
                  onChangeText={setLaborHours}
                />
              </FormCol>
            </FormRow>

            <FieldLabel>Vínculo:</FieldLabel>
            <SegmentedControl
              options={[
                { label: 'Próprio', value: 'proprio' },
                { label: 'Terceirizado', value: 'terceirizado' },
              ]}
              value={laborContractor}
              onChange={setLaborContractor}
            />

            <Button
              title="Adicionar à Lista de Efetivo"
              variant="outline"
              size="small"
              onPress={() => {
                if (!laborRole.trim()) return;
                addLaborEntry({
                  role: laborRole.trim(),
                  quantity: parseInt(laborQty, 10) || 1,
                  hours: parseFloat(laborHours) || 8,
                  isContractor: laborContractor === 'terceirizado',
                });
                setLaborRole('');
              }}
              style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}
            />

            <FieldLabel>Colaboradores Cadastrados ({activeDraft.labor.length}):</FieldLabel>
            {activeDraft.labor.length === 0 ? (
              <StepSubtitle>Nenhum colaborador adicionado ainda. É obrigatório ao menos 1.</StepSubtitle>
            ) : (
              activeDraft.labor.map((l, idx) => (
                <AddedItemCard key={idx}>
                  <AddedItemInfo>
                    <AddedItemTitle>
                      {l.role} ({l.isContractor ? 'Terceirizado' : 'Próprio'})
                    </AddedItemTitle>
                    <AddedItemSubtitle>
                      {l.quantity} profissionais • Jornada: {l.hours}h ({l.quantity * l.hours} Hh total)
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

            <FieldLabel>Adicionar Equipamento:</FieldLabel>
            <FormRow>
              <FormCol flex={2}>
                <Input
                  accessibilityLabel="Nome do equipamento"
                  label="Nome da Máquina"
                  value={equipName}
                  onChangeText={setEquipName}
                  placeholder="Ex: Retroescavadeira, Betoneira"
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Quantidade de máquinas"
                  label="Qtd."
                  value={equipQty}
                  keyboardType="numeric"
                  onChangeText={setEquipQty}
                />
              </FormCol>
            </FormRow>

            <FormRow>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Horas ativas"
                  label="Horas Produtivas"
                  value={equipActiveHours}
                  keyboardType="numeric"
                  onChangeText={setEquipActiveHours}
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Horas ociosas"
                  label="Horas Ociosas"
                  value={equipIdleHours}
                  keyboardType="numeric"
                  onChangeText={setEquipIdleHours}
                />
              </FormCol>
            </FormRow>

            {parseFloat(equipIdleHours) > 0 && (
              <Input
                accessibilityLabel="Justificativa da ociosidade"
                label="Justificativa da Inatividade (Obrigatória):"
                value={equipJustification}
                onChangeText={setEquipJustification}
                placeholder="Ex: Aguardando liberação de caçamba (mín. 5 chars)"
              />
            )}

            <FieldLabel style={{ marginTop: theme.spacing.xs }}>Vínculo da Máquina:</FieldLabel>
            <SegmentedControl
              options={[
                { label: 'Próprio', value: 'proprio' },
                { label: 'Locado', value: 'locado' },
              ]}
              value={equipRented}
              onChange={setEquipRented}
            />

            <Button
              title="Adicionar à Lista de Equipamentos"
              variant="outline"
              size="small"
              onPress={() => {
                if (!equipName.trim()) return;
                const idle = parseFloat(equipIdleHours) || 0;
                addEquipmentEntry({
                  name: equipName.trim(),
                  quantity: parseInt(equipQty, 10) || 1,
                  activeHours: parseFloat(equipActiveHours) || 0,
                  idleHours: idle,
                  idleJustification: idle > 0 ? equipJustification.trim() : undefined,
                  isRented: equipRented === 'locado',
                });
                setEquipName('');
                setEquipJustification('');
              }}
              style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}
            />

            <FieldLabel>Equipamentos no Canteiro ({activeDraft.equipment.length}):</FieldLabel>
            {activeDraft.equipment.length === 0 ? (
              <StepSubtitle>Nenhum equipamento adicionado para hoje.</StepSubtitle>
            ) : (
              activeDraft.equipment.map((e, idx) => (
                <AddedItemCard key={idx}>
                  <AddedItemInfo>
                    <AddedItemTitle>
                      {e.name} ({e.isRented ? 'Locado' : 'Próprio'}) • Qtd: {e.quantity ?? 1}
                    </AddedItemTitle>
                    <AddedItemSubtitle>
                      Produtivas: {e.activeHours}h | Ociosas: {e.idleHours}h
                      {e.idleJustification ? `\nMotivo: ${e.idleJustification}` : ''}
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

            <FieldLabel>Adicionar Frente de Serviço:</FieldLabel>
            <Input
              accessibilityLabel="Descrição da atividade executada"
              label="Descrição da Atividade (mín. 3 caracteres)"
              value={actDesc}
              onChangeText={setActDesc}
              placeholder="Ex: Concretagem dos pilares do 2º pavimento"
            />

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
                  accessibilityLabel="Quantidade executada"
                  label="Quantidade"
                  value={actQty}
                  keyboardType="numeric"
                  onChangeText={setActQty}
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Avanço físico em porcentagem"
                  label="Avanço (%)"
                  value={actProgress}
                  keyboardType="numeric"
                  onChangeText={setActProgress}
                />
              </FormCol>
            </FormRow>

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
                });
                setActDesc('');
              }}
              style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg }}
            />

            <FieldLabel>Atividades Registradas ({activeDraft.activities.length}):</FieldLabel>
            {activeDraft.activities.length === 0 ? (
              <StepSubtitle>Nenhuma atividade cadastrada. É obrigatório ao menos 1.</StepSubtitle>
            ) : (
              activeDraft.activities.map((a, idx) => (
                <AddedItemCard key={idx}>
                  <AddedItemInfo>
                    <AddedItemTitle>{a.description}</AddedItemTitle>
                    <AddedItemSubtitle>
                      Local: {a.location} • Quantidade: {a.quantity} {a.unit} • Avanço: {a.progress ?? 0}%
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
        {/* PASSO 4: MATERIAIS RECEBIDOS (INSUMOS)                             */}
        {/* ================================================================== */}
        {currentStep === 4 && (
          <StepCard>
            <StepHeader>
              <StepTitle>5. Materiais Recebidos</StepTitle>
              <StepSubtitle>Insumos e notas fiscais entregues no canteiro hoje.</StepSubtitle>
            </StepHeader>

            <FieldLabel>Registrar Entrega de Material:</FieldLabel>
            <Input
              accessibilityLabel="Nome do material recebido"
              label="Nome do Insumo / Material"
              value={matName}
              onChangeText={setMatName}
              placeholder="Ex: Cimento CP-II 50kg, Aço CA-50 10mm"
            />

            <FormRow>
              <FormCol flex={2}>
                <Input
                  accessibilityLabel="Fornecedor do material"
                  label="Fornecedor"
                  value={matSupplier}
                  onChangeText={setMatSupplier}
                  placeholder="Ex: Votoran, Gerdau"
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Número da nota fiscal"
                  label="Nota Fiscal"
                  value={matInvoice}
                  onChangeText={setMatInvoice}
                  placeholder="Ex: NF-10928"
                />
              </FormCol>
            </FormRow>

            <FormRow>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Quantidade recebida"
                  label="Quantidade"
                  value={matQty}
                  keyboardType="numeric"
                  onChangeText={setMatQty}
                  placeholder="Ex: 50"
                />
              </FormCol>
              <FormCol flex={1}>
                <Input
                  accessibilityLabel="Unidade do insumo"
                  label="Unidade"
                  value={matUnit}
                  onChangeText={setMatUnit}
                  placeholder="sacos, barras, m³"
                />
              </FormCol>
            </FormRow>

            <Button
              title="Adicionar à Lista de Materiais"
              variant="outline"
              size="small"
              onPress={() => {
                if (!matName.trim() || !matSupplier.trim() || !matInvoice.trim()) return;
                addMaterialEntry({
                  name: matName.trim(),
                  supplier: matSupplier.trim(),
                  invoice: matInvoice.trim(),
                  quantity: parseFloat(matQty) || undefined,
                  unit: matUnit.trim() || undefined,
                });
                setMatName('');
                setMatInvoice('');
              }}
              style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg }}
            />

            <FieldLabel>Insumos Recebidos ({activeDraft.materials.length}):</FieldLabel>
            {activeDraft.materials.length === 0 ? (
              <StepSubtitle>Nenhum material registrado para hoje (opcional).</StepSubtitle>
            ) : (
              activeDraft.materials.map((m, idx) => (
                <AddedItemCard key={idx}>
                  <AddedItemInfo>
                    <AddedItemTitle>{m.name}</AddedItemTitle>
                    <AddedItemSubtitle>
                      Fornecedor: {m.supplier} • {m.invoice}
                      {m.quantity ? ` • Qtd: ${m.quantity} ${m.unit ?? ''}` : ''}
                    </AddedItemSubtitle>
                  </AddedItemInfo>
                  <RemoveButton onPress={() => removeMaterialEntry(idx)}>
                    <Trash2 size={18} color={theme.colors.status.error.base} />
                  </RemoveButton>
                </AddedItemCard>
              ))
            )}
          </StepCard>
        )}

        {/* ================================================================== */}
        {/* PASSO 5: OCORRÊNCIAS & DDS                                         */}
        {/* ================================================================== */}
        {currentStep === 5 && (
          <StepCard>
            <StepHeader>
              <StepTitle>6. Ocorrências & DDS</StepTitle>
              <StepSubtitle>Fatos relevantes, diálogos diários de segurança e paralisações.</StepSubtitle>
            </StepHeader>

            <FieldLabel>Tipo de Registro:</FieldLabel>
            <SegmentedControl
              options={[
                { label: 'DDS', value: 'dds' },
                { label: 'Acidente', value: 'acidente' },
                { label: 'Paralisação', value: 'paralisacao' },
                { label: 'Interferência', value: 'interferencia' },
                { label: 'Pendência', value: 'pendencia' },
              ]}
              value={occType}
              onChange={setOccType}
            />

            <View style={{ marginTop: theme.spacing.sm }}>
              <Input
                accessibilityLabel="Detalhamento da ocorrência ou tema do DDS"
                label="Detalhamento do Fato / Tema do DDS:"
                value={occDesc}
                onChangeText={setOccDesc}
                multiline
                numberOfLines={3}
                placeholder="Ex: Diálogo sobre uso correto de cinto de segurança tipo paraquedista."
              />
            </View>

            <Button
              title="Adicionar à Lista de Ocorrências"
              variant="outline"
              size="small"
              onPress={() => {
                if (!occDesc.trim() || occDesc.trim().length < 5) return;
                addOccurrenceEntry({
                  type: occType,
                  description: occDesc.trim(),
                });
                setOccDesc('');
              }}
              style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg }}
            />

            <FieldLabel>Ocorrências Cadastradas ({activeDraft.occurrences.length}):</FieldLabel>
            {activeDraft.occurrences.length === 0 ? (
              <StepSubtitle>Nenhum fato relevante adicionado hoje (opcional).</StepSubtitle>
            ) : (
              activeDraft.occurrences.map((o, idx) => (
                <AddedItemCard key={idx}>
                  <AddedItemInfo>
                    <AddedItemTitle>[{o.type.toUpperCase()}]</AddedItemTitle>
                    <AddedItemSubtitle>{o.description}</AddedItemSubtitle>
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
        {/* PASSO 6: FOTOS NA OBRA COM MARCA D'ÁGUA DE SEGURANÇA               */}
        {/* ================================================================== */}
        {currentStep === 6 && (
          <StepCard>
            <StepHeader>
              <StepTitle>7. Fotos na Obra</StepTitle>
              <StepSubtitle>
                Captura com gravação automática de marca d&apos;água de segurança (GPS, Obra e Data).
              </StepSubtitle>
            </StepHeader>

            <Button
              title="Tirar Foto na Obra (com Marca d'Água)"
              variant="primary"
              onPress={() => handleCapturePhoto('Registro fotográfico do canteiro')}
              style={{ marginBottom: theme.spacing.lg }}
            />

            <FieldLabel>Fotos Anexadas ({activeDraft.photos.length}):</FieldLabel>
            {activeDraft.photos.length === 0 ? (
              <StepSubtitle>Nenhuma foto capturada ainda.</StepSubtitle>
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
      </ScrollContent>

      {/* Barra de Ações Inferior (Fixa) */}
      <BottomActionBar>
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

        <ActionButtonWrapper flex={1}>
          <Button
            title="Salvar Rascunho"
            variant="outline"
            size="small"
            onPress={handleSaveDraft}
            accessibilityLabel="Salvar rascunho"
          />
        </ActionButtonWrapper>

        {currentStep < STEPS.length - 1 ? (
          <ActionButtonWrapper flex={1.5}>
            <Button
              title="Próximo Passo"
              variant="primary"
              size="small"
              onPress={handleNextStep}
              accessibilityLabel="Avançar para o próximo passo"
            />
          </ActionButtonWrapper>
        ) : (
          <ActionButtonWrapper flex={1.5}>
            <Button
              title={isSubmitting ? 'Submetendo...' : 'Finalizar e Submeter'}
              variant="primary"
              size="small"
              disabled={isSubmitting}
              onPress={handleSubmit}
              accessibilityLabel="Finalizar e submeter o relatório diário de obra"
            />
          </ActionButtonWrapper>
        )}
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
