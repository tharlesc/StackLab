import React, { useState, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
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
import type { RDO, StatusVariant, Work } from '@/types';

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
  EditObraButton,
  EditObraButtonText,
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
  const params = useLocalSearchParams<{ id?: string }>();
  const { user, isMaster } = useAuth();
  const { works: rdoWorks, rdos } = useRDOs();
  const { works: adminWorks, updateWork } = useAdmin();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);

  // Estados para edição das informações da obra (Master)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Encontra a obra ativa ou cadastrada
  const currentWork: Work = useMemo(() => {
    const id = params.id;
    if (id) {
      const foundInAdmin = adminWorks.find((w) => w.id === id);
      if (foundInAdmin) return foundInAdmin;
      const foundInRdo = rdoWorks.find((w) => w.id === id);
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
  }, [params.id, adminWorks, rdoWorks]);

  // RDOs específicos desta obra:
  // Regra: O Master NUNCA visualiza rascunhos de operadores (apenas submetidos, aprovados ou devolvidos)
  const obraRdos = useMemo(() => {
    let list = rdos.filter(
      (r) => r.workId === currentWork.id || r.workName === currentWork.name,
    );
    if (isMaster) {
      list = list.filter((r) => r.status && r.status !== 'rascunho');
    }
    return list;
  }, [rdos, currentWork, isMaster]);

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

  const handleCreateNewRDO = useCallback(() => {
    router.push({
      pathname: '/new-rdo',
      params: { workId: currentWork.id },
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
        params: { id: item.id },
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

          {/* Bottom Button: Editar Informações da Obra (Master) ou Novo RDO (Operador) */}
          {isMaster ? (
            <EditObraButton
              onPress={handleOpenEditDialog}
              accessibilityRole="button"
              accessibilityLabel="Editar informações da obra"
            >
              <Edit3 size={16} color="#FB923C" />
              <EditObraButtonText>Editar Informações da Obra</EditObraButtonText>
            </EditObraButton>
          ) : (
            <EditObraButton
              onPress={handleCreateNewRDO}
              accessibilityRole="button"
              accessibilityLabel="Novo RDO para esta obra"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Plus size={16} color={theme.colors.text.inverse} />
              <EditObraButtonText style={{ color: theme.colors.text.inverse }}>
                Novo RDO para esta Obra
              </EditObraButtonText>
            </EditObraButton>
          )}
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
    </Screen>
  );
};

export default WorkFeedView;
