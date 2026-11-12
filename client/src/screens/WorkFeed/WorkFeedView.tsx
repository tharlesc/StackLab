import React, { useState, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Alert, Text } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Calendar,
  User as UserIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Building2,
  X,
  Clock,
  Sun,
  Users,
  MapPin,
  Edit3,
  BarChart3,
  CheckCircle2,
  CloudRain,
  UserPlus,
  KeyRound,
} from 'lucide-react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useRDOs } from '@/contexts/RDOContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { Screen, ScrollContent } from '@/components/common/Layout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/common/Dialog';
import { Input } from '@/components/common/Input';
import { formatDate } from '@/utils/date';
import { calcHeadcount, calcManHours } from '@/utils/rdo';
import type { RDO, StatusVariant, Work, User } from '@/types';

import { WorkCalendar } from './WorkCalendar';
import {
  ObraOverviewCard,
  ObraTopRow,
  ObraIconBox,
  ObraTopDivider,
  ObraTitleColumn,
  ObraTitle,
  ObraStatusRow,
  ObraStatusDot,
  ObraStatusText,
  ObraChevronBox,
  ObraCardDivider,
  ObraInfoColumnsRow,
  ObraInfoCol,
  ObraInfoColDivider,
  ObraInfoColTexts,
  ObraInfoColLabel,
  ObraInfoColValue,
  ObraActionsGroup,
  ObraPrimaryActionButton,
  ObraPrimaryActionText,
  MasterActionsStack,
  MasterActionButton,
  MasterActionText,
  ObraSecondaryButtonsRow,
  ObraSecondaryActionButton,
  ObraSecondaryActionText,
  EditObraButton,
  EditObraButtonText,
  CreateClientButton,
  CreateClientButtonText,
  ActionButtonRow,
  ObraDashboardCard,
  DashboardHeaderRow,
  DashboardHeaderLeft,
  DashboardTitle,
  DashboardSubtitle,
  ApprovalProgressContainer,
  ApprovalHeaderRow,
  ApprovalRateTitle,
  ApprovalRateBadge,
  ProgressBarTrack,
  ProgressBarFill,
  MetricGrid,
  MetricCard,
  MetricIconRow,
  MetricValue,
  MetricLabel,
  MetricCaption,
  StatusBreakdownRow,
  StatusBreakdownItem,
  StatusBreakdownCount,
  StatusBreakdownLabel,
  ListHeaderRow,
  ListTitle,
  FilterPill,
  FilterPillText,
  RdoFeedCard,
  RdoCardHeader,
  RdoNumberText,
  RdoDateAuthorRow,
  RdoMetaItem,
  RdoMetaText,
  RdoHighlightsRow,
  HighlightPill,
  HighlightText,
  CardLinkRow,
  CardLinkText,
} from './styles';

const STATUS_VARIANTS: Record<string, StatusVariant> = {
  aprovado: 'success',
  submetido: 'warning',
  devolvido: 'error',
  rascunho: 'info',
};

const STATUS_LABELS: Record<string, string> = {
  aprovado: 'Aprovado (OK)',
  submetido: 'Em Análise',
  devolvido: 'Devolvido',
  rascunho: 'Rascunho',
};

export const WorkFeedView = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; workId?: string }>();
  const { user, isMaster, isClient } = useAuth();
  const { works: rdoWorks, rdos } = useRDOs();
  const { works: adminWorks, users: adminUsers, updateWork, addUser, resetUserPassword } = useAdmin();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);

  // Estados para edição das informações da obra (Master)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Estados para criação e reset de Usuário Cliente (Master)
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientRandomSuffix, setClientRandomSuffix] = useState('');
  const [createdClientData, setCreatedClientData] = useState<User | null>(null);

  // Encontra a obra ativa ou cadastrada
  const currentWork: Work = useMemo(() => {
    const targetId = params.id || params.workId;
    if (targetId) {
      const foundInAdmin = adminWorks.find((w) => w.id === targetId);
      if (foundInAdmin) return foundInAdmin;
      const foundInRdo = rdoWorks.find((w) => w.id === targetId);
      if (foundInRdo) {
        return {
          id: foundInRdo.id,
          name: foundInRdo.name,
          subtitle: foundInRdo.subtitle || 'Fase de Obras',
          client: 'Cliente Geral',
          address: foundInRdo.subtitle || 'Endereço não cadastrado',
          active: true,
        };
      }
    }
    const fallbackAdmin = adminWorks[0];
    if (fallbackAdmin) return fallbackAdmin;
    const fallbackRdo = rdoWorks[0];
    return {
      id: fallbackRdo?.id || 'default',
      name: fallbackRdo?.name || 'Obra Principal',
      subtitle: fallbackRdo?.subtitle || 'Visão Geral',
      client: 'Cliente Geral',
      address: 'Endereço da Obra',
      active: true,
    };
  }, [params.id, params.workId, adminWorks, rdoWorks]);

  // Encontra usuário cliente já existente vinculado a esta obra
  const existingClientUser = useMemo(() => {
    return (adminUsers || []).find(
      (u) =>
        (u.profile === 'client' || (u.role && u.role.toLowerCase().includes('cliente'))) &&
        u.assignedWorkIds?.includes(currentWork.id),
    );
  }, [adminUsers, currentWork.id]);

  // RDOs específicos desta obra:
  // Regra: O Master NUNCA visualiza rascunhos de operadores (apenas submetidos, aprovados ou devolvidos)
  // Regra: O Cliente só visualiza RDOs automaticamente após o Master aprovar e assinar (status === 'aprovado')
  const obraRdos = useMemo(() => {
    let list = rdos.filter(
      (r) => r.workId === currentWork.id || r.workName === currentWork.name,
    );
    if (isClient) {
      list = list.filter((r) => r.status === 'aprovado');
    } else if (isMaster) {
      list = list.filter((r) => r.status && r.status !== 'rascunho');
    }
    return list;
  }, [rdos, currentWork, isMaster, isClient]);

  // RDOs ordenados cronologicamente do mais recente para o mais antigo
  const sortedRdos = useMemo(() => {
    let list = obraRdos;
    if (selectedDate) {
      list = list.filter((r) => r.date && r.date.split('T')[0] === selectedDate);
    }
    return [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [obraRdos, selectedDate]);

  // Métricas do Dashboard Exclusivo da Obra
  const totalRdos = obraRdos.length;
  const approvedCount = useMemo(
    () => obraRdos.filter((r) => r.status === 'aprovado').length,
    [obraRdos],
  );
  const pendingCount = useMemo(
    () => obraRdos.filter((r) => r.status === 'submetido').length,
    [obraRdos],
  );
  const returnedCount = useMemo(
    () => obraRdos.filter((r) => r.status === 'devolvido').length,
    [obraRdos],
  );
  const approvalRate = useMemo(
    () => (totalRdos > 0 ? Math.round((approvedCount / totalRdos) * 100) : 100),
    [totalRdos, approvedCount],
  );

  const totalManHours = useMemo(
    () => obraRdos.reduce((sum, r) => sum + calcManHours(r.labor || []), 0),
    [obraRdos],
  );

  const totalWorkers = useMemo(
    () => obraRdos.reduce((sum, r) => sum + calcHeadcount(r.labor || []), 0),
    [obraRdos],
  );

  const rainStoppageHours = useMemo(
    () =>
      obraRdos.reduce((sum, r) => {
        const rdoRain = (r.weather || []).reduce(
          (wSum, w) => wSum + (w.stoppageHours || 0),
          0,
        );
        return sum + rdoRain;
      }, 0),
    [obraRdos],
  );

  const totalActivities = useMemo(
    () => obraRdos.reduce((sum, r) => sum + (r.activities?.length || 0), 0),
    [obraRdos],
  );

  const [isConfirmStartDialogOpen, setIsConfirmStartDialogOpen] = useState(false);

  // Validação de acesso à obra (curadoria para operadores)
  const hasAccessToWork = useMemo(() => {
    if (isMaster) return true;
    if (!user) return false;
    // Se o usuário não tiver atribuições definidas ou se tiver, verifica inclusão
    return (
      !user.assignedWorkIds ||
      user.assignedWorkIds.length === 0 ||
      user.assignedWorkIds.includes(currentWork.id)
    );
  }, [isMaster, user, currentWork.id]);

  const handleCreateNewRDO = useCallback(() => {
    setIsConfirmStartDialogOpen(true);
  }, []);

  const handleConfirmStartRDO = useCallback(() => {
    setIsConfirmStartDialogOpen(false);
    router.push({
      pathname: '/new-rdo',
      params: { workId: currentWork.id, autoStart: 'true' },
    });
  }, [router, currentWork.id]);

  const handleOpenRdoDetail = useCallback(
    (item: RDO) => {
      if (item.status === 'rascunho' && !isMaster) {
        router.push({
          pathname: '/new-rdo',
          params: { workId: item.workId },
        });
        return;
      }
      router.push({
        pathname: '/rdo-review',
        params: { id: item.id, workId: item.workId },
      });
    },
    [router, isMaster],
  );

  // Abertura do diálogo de edição
  const handleOpenEditDialog = useCallback(() => {
    setEditName(currentWork.name);
    setEditSubtitle(currentWork.subtitle || '');
    setEditClient(currentWork.client || '');
    setEditAddress(currentWork.address || '');
    setIsEditDialogOpen(true);
  }, [currentWork]);

  // Confirmação da edição das informações
  const handleConfirmEdit = useCallback(async () => {
    if (!editName.trim()) {
      Alert.alert('Atenção', 'Informe o nome da obra.');
      return;
    }
    try {
      await updateWork(currentWork.id, {
        name: editName.trim(),
        subtitle: editSubtitle.trim() || 'Fase de Obras',
        client: editClient.trim() || 'Cliente Geral',
        address: editAddress.trim() || 'Endereço em cadastramento',
      });
      setIsEditDialogOpen(false);
      Alert.alert('Sucesso', 'Informações da obra atualizadas com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar as informações da obra.');
    }
  }, [editName, editSubtitle, editClient, editAddress, currentWork.id, updateWork]);

  const handleOpenCreateClientDialog = useCallback(() => {
    if (existingClientUser) {
      Alert.alert('Atenção', 'Esta obra já possui um usuário cliente cadastrado.');
      return;
    }
    setClientFirstName('');
    setClientLastName('');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    setClientRandomSuffix(randomSuffix);
    setIsCreateClientDialogOpen(true);
  }, [existingClientUser]);

  const handleOpenResetPasswordDialog = useCallback(() => {
    setIsResetPasswordDialogOpen(true);
  }, []);

  const handleConfirmResetPassword = useCallback(async () => {
    if (!existingClientUser) return;
    setIsResetPasswordDialogOpen(false);
    try {
      const newPassword = await resetUserPassword(existingClientUser.id);
      setCreatedClientData({
        ...existingClientUser,
        tempPassword: newPassword,
        isFirstAccess: true,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível resetar a senha do cliente.');
    }
  }, [existingClientUser, resetUserPassword]);

  const generatedClientLogin = useMemo(() => {
    const f = clientFirstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const l = clientLastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const suffix = (clientRandomSuffix || 'obra').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!f && !l) return `cliente@${suffix}.com`;
    return `${f || 'cliente'}.${l || 'acesso'}@${suffix}.com`;
  }, [clientFirstName, clientLastName, clientRandomSuffix]);

  const handleConfirmCreateClient = useCallback(async () => {
    if (existingClientUser) {
      Alert.alert('Atenção', 'Esta obra já possui um usuário cliente cadastrado.');
      return;
    }
    if (!clientFirstName.trim() || !clientLastName.trim()) {
      Alert.alert('Atenção', 'Informe o nome e o sobrenome do cliente.');
      return;
    }

    try {
      const fullName = `${clientFirstName.trim()} ${clientLastName.trim()}`;
      const newUser = await addUser({
        name: fullName,
        email: generatedClientLogin,
        role: 'Cliente / Contratante',
        profile: 'client',
        assignedWorkIds: [currentWork.id],
      });

      setIsCreateClientDialogOpen(false);
      setCreatedClientData(newUser);
    } catch (err: any) {
      Alert.alert('Erro ao Cadastrar Cliente', err?.message || 'Não foi possível cadastrar o usuário cliente.');
    }
  }, [existingClientUser, clientFirstName, clientLastName, generatedClientLogin, currentWork.id, addUser]);

  return (
    <Screen>
      <Header
        title="Feed da Obra"
        subtitle={currentWork.name}
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
            accessibilityLabel="Voltar para a página anterior"
          />
        }
        rightContent={
          // Regra: O Master NÃO tem botão de criar RDO
          !isMaster ? (
            <HeaderAction
              icon={
                <Plus
                  color={theme.colors.text.primary}
                  size={theme.icon.size.lg}
                  strokeWidth={theme.icon.strokeWidth}
                />
              }
              onPress={handleCreateNewRDO}
              accessibilityLabel="Criar novo RDO para esta obra"
            />
          ) : (
            <HeaderAction
              icon={
                <Edit3
                  color={theme.colors.text.primary}
                  size={theme.icon.size.md}
                  strokeWidth={theme.icon.strokeWidth}
                />
              }
              onPress={handleOpenEditDialog}
              accessibilityLabel="Editar informações da obra"
            />
          )
        }
      />

      <ScrollContent showsVerticalScrollIndicator={false}>
        {/* 1. Visão Geral da Obra com Fundo e Dimensões Iguais ao Card Hero da Tela Inicial */}
        <ObraOverviewCard>
          {/* Top Row: Ícone do Edifício | Divisor Vertical | Nome da Obra + Status | Chevron */}
          <ObraTopRow>
            <ObraIconBox>
              <Building2 size={22} color="#FB923C" />
            </ObraIconBox>

            <ObraTopDivider />

            <ObraTitleColumn>
              <ObraTitle numberOfLines={1}>{currentWork.name}</ObraTitle>
              <ObraStatusRow>
                <ObraStatusDot $active={currentWork.active !== false} />
                <ObraStatusText $active={currentWork.active !== false}>
                  {currentWork.active !== false ? 'Ativa no Sistema' : 'Inativa no Sistema'}
                </ObraStatusText>
              </ObraStatusRow>
            </ObraTitleColumn>

            <ObraChevronBox
              as={TouchableOpacity}
              activeOpacity={0.7}
              onPress={isMaster ? handleOpenEditDialog : undefined}
              accessibilityRole="button"
              accessibilityLabel="Opções da obra"
            >
              <ChevronRight size={20} color={theme.colors.hero.textSecondary} />
            </ObraChevronBox>
          </ObraTopRow>

          <ObraCardDivider />

          {/* Middle Row: Duas Colunas com Pin Azul (Cliente | Localização) */}
          <ObraInfoColumnsRow>
            <ObraInfoCol>
              <MapPin size={18} color="#60A5FA" />
              <ObraInfoColTexts>
                <ObraInfoColLabel>Cliente</ObraInfoColLabel>
                <ObraInfoColValue numberOfLines={1}>
                  {currentWork.client || 'Cliente Geral'}
                </ObraInfoColValue>
              </ObraInfoColTexts>
            </ObraInfoCol>

            <ObraInfoColDivider />

            <ObraInfoCol>
              <MapPin size={18} color="#60A5FA" />
              <ObraInfoColTexts>
                <ObraInfoColLabel>Localização</ObraInfoColLabel>
                <ObraInfoColValue numberOfLines={1}>
                  {currentWork.address || 'Localização não informada'}
                </ObraInfoColValue>
              </ObraInfoColTexts>
            </ObraInfoCol>
          </ObraInfoColumnsRow>

          {/* Cluster de Botões da Obra com design-taste integrado */}
          {isMaster ? (
            <ObraActionsGroup>
              <MasterActionsStack>
                <MasterActionButton
                  onPress={handleOpenEditDialog}
                  accessibilityLabel="Editar informações cadastrais da obra"
                >
                  <Edit3 size={16} color="#ffffff" />
                  <MasterActionText>Editar Informações da Obra</MasterActionText>
                </MasterActionButton>

                {existingClientUser ? (
                  <MasterActionButton
                    $variant="amber"
                    onPress={handleOpenResetPasswordDialog}
                    accessibilityLabel={`Resetar senha do cliente ${existingClientUser.name}`}
                  >
                    <KeyRound size={16} color="#FBBF24" />
                    <MasterActionText $variant="amber">
                      Resetar Senha do Cliente ({existingClientUser.name.split(' ')[0]})
                    </MasterActionText>
                  </MasterActionButton>
                ) : (
                  <MasterActionButton
                    $variant="blue"
                    onPress={handleOpenCreateClientDialog}
                    accessibilityLabel="Criar Usuário Cliente"
                  >
                    <UserPlus size={16} color="#60A5FA" />
                    <MasterActionText $variant="blue">Criar Usuário Cliente</MasterActionText>
                  </MasterActionButton>
                )}
              </MasterActionsStack>
            </ObraActionsGroup>
          ) : !isClient ? (
            <ObraActionsGroup>
              <ObraPrimaryActionButton
                onPress={handleCreateNewRDO}
                accessibilityLabel="Novo RDO para esta obra"
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                <ObraPrimaryActionText>Novo RDO para esta Obra</ObraPrimaryActionText>
              </ObraPrimaryActionButton>
            </ObraActionsGroup>
          ) : null}
        </ObraOverviewCard>

        {/* 2. Dashboard da Obra — minimizado por padrão */}
        <ObraDashboardCard>
          <DashboardHeaderRow
            onPress={() => setIsDashboardExpanded((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={
              isDashboardExpanded
                ? 'Minimizar dashboard da obra'
                : 'Expandir dashboard da obra completo'
            }
          >
            <DashboardHeaderLeft>
              <BarChart3 size={18} color="#F97316" />
              <DashboardTitle>Dashboard da Obra</DashboardTitle>
            </DashboardHeaderLeft>
            {isDashboardExpanded ? (
              <ChevronUp size={20} color={theme.colors.text.secondary} />
            ) : (
              <ChevronDown size={20} color={theme.colors.text.secondary} />
            )}
          </DashboardHeaderRow>
          <DashboardSubtitle>
            Métricas de campo e produtividade consolidadas
          </DashboardSubtitle>

          {/* Se expandido: exibe a Taxa de Homologação e os 4 cartões de métricas */}
          {isDashboardExpanded && (
            <>
              {/* Barra de Homologação */}
              <ApprovalProgressContainer>
                <ApprovalHeaderRow>
                  <ApprovalRateTitle>Taxa de Homologação</ApprovalRateTitle>
                  <ApprovalRateBadge>
                    {approvalRate}% ({approvedCount}/{totalRdos} OK)
                  </ApprovalRateBadge>
                </ApprovalHeaderRow>
                <ProgressBarTrack>
                  <ProgressBarFill
                    $percent={approvalRate}
                    $color={approvalRate >= 70 ? '#10B981' : '#F59E0B'}
                  />
                </ProgressBarTrack>
              </ApprovalProgressContainer>

              {/* Grid de 4 Indicadores Principais */}
              <MetricGrid>
                <MetricCard>
                  <MetricIconRow>
                    <Clock size={16} color={theme.colors.tint} />
                    <MetricCaption>Acumulado</MetricCaption>
                  </MetricIconRow>
                  <MetricValue>{totalManHours.toLocaleString('pt-BR')} Hh</MetricValue>
                  <MetricLabel>Homem-Hora Total</MetricLabel>
                </MetricCard>

                <MetricCard>
                  <MetricIconRow>
                    <Users size={16} color="#8B5CF6" />
                    <MetricCaption>Em Campo</MetricCaption>
                  </MetricIconRow>
                  <MetricValue>{totalWorkers.toLocaleString('pt-BR')}</MetricValue>
                  <MetricLabel>Efetivo Total</MetricLabel>
                </MetricCard>

                <MetricCard>
                  <MetricIconRow>
                    <CloudRain size={16} color="#F59E0B" />
                    <MetricCaption>Clima</MetricCaption>
                  </MetricIconRow>
                  <MetricValue>{rainStoppageHours}h</MetricValue>
                  <MetricLabel>Paralisação Chuva</MetricLabel>
                </MetricCard>

                <MetricCard>
                  <MetricIconRow>
                    <CheckCircle2 size={16} color="#10B981" />
                    <MetricCaption>Frentes</MetricCaption>
                  </MetricIconRow>
                  <MetricValue>{totalActivities}</MetricValue>
                  <MetricLabel>Atividades Registradas</MetricLabel>
                </MetricCard>
              </MetricGrid>
            </>
          )}

          {/* Resumo por Status — visível tanto minimizado quanto expandido */}
          <StatusBreakdownRow>
            <StatusBreakdownItem>
              <StatusBreakdownCount>{totalRdos}</StatusBreakdownCount>
              <StatusBreakdownLabel>TOTAL RDOS</StatusBreakdownLabel>
            </StatusBreakdownItem>

            <StatusBreakdownItem>
              <StatusBreakdownCount $color="#10B981">
                {approvedCount}
              </StatusBreakdownCount>
              <StatusBreakdownLabel>APROVADOS</StatusBreakdownLabel>
            </StatusBreakdownItem>

            <StatusBreakdownItem>
              <StatusBreakdownCount $color="#F59E0B">
                {pendingCount}
              </StatusBreakdownCount>
              <StatusBreakdownLabel>EM ANÁLISE</StatusBreakdownLabel>
            </StatusBreakdownItem>

            <StatusBreakdownItem>
              <StatusBreakdownCount $color="#EF4444">
                {returnedCount}
              </StatusBreakdownCount>
              <StatusBreakdownLabel>DEVOLVIDOS</StatusBreakdownLabel>
            </StatusBreakdownItem>
          </StatusBreakdownRow>
        </ObraDashboardCard>

        {/* 3. Calendário da Obra (Com Verdes/Checks nos dias OK) */}
        <WorkCalendar
          rdos={obraRdos}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* 4. Seção da Lista de RDOs (Recentes aos Antigos) */}
        <ListHeaderRow>
          <ListTitle>Diários de Obra ({sortedRdos.length})</ListTitle>

          {selectedDate && (
            <TouchableOpacity
              onPress={() => setSelectedDate(null)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Limpar filtro de data"
            >
              <FilterPill>
                <Calendar size={12} color={theme.colors.tintText} />
                <FilterPillText>{formatDate(selectedDate)}</FilterPillText>
                <X size={12} color={theme.colors.tintText} />
              </FilterPill>
            </TouchableOpacity>
          )}
        </ListHeaderRow>

        {sortedRdos.length === 0 ? (
          <EmptyState
            icon={<Building2 size={40} color={theme.colors.text.secondary} />}
            title={selectedDate ? 'Nenhum RDO nesta data' : 'Nenhum diário registrado'}
            message={
              selectedDate
                ? `Não há relatórios emitidos na data ${formatDate(
                    selectedDate,
                  )}. Toque no filtro para ver todos.`
                : 'Esta obra ainda não possui relatórios diários salvos no Supabase.'
            }
          />
        ) : (
          sortedRdos.map((item: RDO) => {
            const variant = STATUS_VARIANTS[item.status] || 'info';
            const statusLabel = STATUS_LABELS[item.status] || item.status.toUpperCase();
            const headcount = calcHeadcount(item.labor || []);
            const weatherCond = item.weather?.[0]?.condition || 'Clima registrado';

            return (
              <RdoFeedCard
                key={item.id}
                activeOpacity={0.75}
                onPress={() => handleOpenRdoDetail(item)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir RDO número ${item.number}, status ${statusLabel}`}
              >
                <RdoCardHeader>
                  <RdoNumberText>
                    RDO #{item.number} {item.version > 1 ? `(v${item.version})` : ''}
                  </RdoNumberText>
                  <StatusBadge label={statusLabel} variant={variant} />
                </RdoCardHeader>

                <RdoDateAuthorRow>
                  <RdoMetaItem>
                    <Calendar size={13} color={theme.colors.text.secondary} />
                    <RdoMetaText>{formatDate(item.date)}</RdoMetaText>
                  </RdoMetaItem>

                  <RdoMetaItem>
                    <UserIcon size={13} color={theme.colors.text.secondary} />
                    <RdoMetaText numberOfLines={1}>{item.authorName}</RdoMetaText>
                  </RdoMetaItem>
                </RdoDateAuthorRow>

                <RdoHighlightsRow>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    <HighlightPill>
                      <Sun size={12} color={theme.colors.text.secondary} />
                      <HighlightText>{weatherCond}</HighlightText>
                    </HighlightPill>

                    <HighlightPill>
                      <Users size={12} color={theme.colors.text.secondary} />
                      <HighlightText>{headcount} operários</HighlightText>
                    </HighlightPill>
                  </View>

                  <CardLinkRow>
                    <CardLinkText>Ver RDO</CardLinkText>
                    <ChevronRight size={14} color={theme.colors.tintText} />
                  </CardLinkRow>
                </RdoHighlightsRow>
              </RdoFeedCard>
            );
          })
        )}
      </ScrollContent>

      {/* Diálogo para Edição de Informações da Obra (Exclusivo Master) */}
      <Dialog
        visible={isEditDialogOpen}
        title="Editar Informações da Obra"
        description="Atualize os dados cadastrais da obra selecionada:"
        primaryAction={{ label: 'Salvar Alterações', onPress: handleConfirmEdit }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setIsEditDialogOpen(false),
        }}
        onClose={() => setIsEditDialogOpen(false)}
      >
        <Input
          placeholder="Nome da Obra"
          value={editName}
          onChangeText={setEditName}
          accessibilityLabel="Nome da Obra"
        />
        <Input
          placeholder="Cliente / Contratante"
          value={editClient}
          onChangeText={setEditClient}
          accessibilityLabel="Cliente ou Contratante"
        />
        <Input
          placeholder="Endereço / Localização"
          value={editAddress}
          onChangeText={setEditAddress}
          accessibilityLabel="Endereço ou Localização"
        />
        <Input
          placeholder="Subtítulo / Descrição da Fase"
          value={editSubtitle}
          onChangeText={setEditSubtitle}
          accessibilityLabel="Subtítulo ou Descrição"
        />
      </Dialog>
      {/* Diálogo para Criação de Usuário Cliente (Exclusivo Master) */}
      <Dialog
        visible={isCreateClientDialogOpen}
        title="Criar Usuário Cliente"
        description="Cadastre o acesso de acompanhamento do cliente para esta obra:"
        primaryAction={{ label: 'Criar Acesso', onPress: handleConfirmCreateClient }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setIsCreateClientDialogOpen(false),
        }}
        onClose={() => setIsCreateClientDialogOpen(false)}
      >
        <Input
          placeholder="Nome do Cliente (ex: Carlos)"
          value={clientFirstName}
          onChangeText={setClientFirstName}
          accessibilityLabel="Nome do Cliente"
        />
        <Input
          placeholder="Sobrenome (ex: Mendes)"
          value={clientLastName}
          onChangeText={setClientLastName}
          accessibilityLabel="Sobrenome do Cliente"
        />

        <View
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme.colors.surfaceVariant,
            marginTop: 6,
          }}
        >
          <Text style={{ fontSize: 11, color: theme.colors.text.secondary }}>
            Login sugerido do cliente:
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              color: theme.colors.tintText,
              marginTop: 2,
            }}
          >
            {generatedClientLogin}
          </Text>
        </View>
      </Dialog>

      {/* Diálogo de Confirmação para Reset de Senha do Cliente */}
      <Dialog
        visible={isResetPasswordDialogOpen}
        title="Resetar Senha do Cliente"
        description={`Deseja gerar uma nova senha aleatória de 6 dígitos para ${existingClientUser?.name || 'o cliente'}? Ao entrar novamente, ele será solicitado a cadastrar uma nova senha definitiva.`}
        primaryAction={{
          label: 'Gerar Nova Senha',
          onPress: handleConfirmResetPassword,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setIsResetPasswordDialogOpen(false),
        }}
        onClose={() => setIsResetPasswordDialogOpen(false)}
      />

      {/* Diálogo de Sucesso com as Credenciais Provisórias do Cliente */}
      <Dialog
        visible={!!createdClientData}
        title="Credenciais de Acesso do Cliente"
        description="Acesso vinculado a esta obra. Forneça os dados de acesso abaixo ao cliente:"
        primaryAction={{
          label: 'Concluir',
          onPress: () => setCreatedClientData(null),
        }}
        onClose={() => setCreatedClientData(null)}
      >
        {createdClientData && (
          <View style={{ gap: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 13, color: theme.colors.text.primary }}>
              <Text style={{ fontWeight: 'bold' }}>Cliente: </Text>
              {createdClientData.name}
            </Text>
            <Text style={{ fontSize: 13, color: theme.colors.text.primary }}>
              <Text style={{ fontWeight: 'bold' }}>Login de Acesso: </Text>
              {createdClientData.email}
            </Text>
            <Text style={{ fontSize: 13, color: theme.colors.text.primary }}>
              <Text style={{ fontWeight: 'bold' }}>Obra Vinculada: </Text>
              {currentWork.name}
            </Text>

            <View
              style={{
                marginTop: 8,
                padding: 10,
                borderRadius: 10,
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                borderWidth: 1,
                borderColor: 'rgba(245, 158, 11, 0.35)',
              }}
            >
              <Text style={{ fontSize: 11, color: '#D97706', fontWeight: 'bold' }}>
                Senha Temporária de 1º Acesso:
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  letterSpacing: 2,
                  color: '#B45309',
                  marginTop: 4,
                }}
              >
                {createdClientData.tempPassword}
              </Text>
              <Text style={{ fontSize: 10, color: '#92400E', marginTop: 4 }}>
                Ao efetuar o primeiro acesso, o cliente será solicitado a definir sua senha definitiva.
              </Text>
            </View>
          </View>
        )}
      </Dialog>

      {/* Dialog de Confirmação para Iniciar Preenchimento do RDO */}
      <Dialog
        visible={isConfirmStartDialogOpen}
        title="Iniciar Diário de Obra"
        description={`Deseja iniciar o preenchimento do RDO para a obra "${currentWork.name}"? As informações de clima, data e equipe serão pré-carregadas automaticamente.`}
        primaryAction={{
          label: 'Iniciar Preenchimento',
          onPress: handleConfirmStartRDO,
        }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setIsConfirmStartDialogOpen(false),
        }}
        onClose={() => setIsConfirmStartDialogOpen(false)}
      />

      {/* Dialog de Curadoria: Acesso Não Permitido */}
      <Dialog
        visible={!hasAccessToWork && !isMaster}
        title="Acesso Não Permitido"
        description="Você não possui vínculo ativo com esta obra. As permissões de acesso foram atualizadas pelo gestor Master."
        primaryAction={{
          label: 'Voltar para Minhas Obras',
          onPress: () => router.back(),
        }}
        onClose={() => router.back()}
      />
    </Screen>
  );
};

export default WorkFeedView;
