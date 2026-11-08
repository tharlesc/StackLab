import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  CloudRain,
  Home,
  FileText,
  Settings,
  Calendar,
  ChevronRight,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react-native';

import { useClientDashboard } from '@/hooks/useClientDashboard';
import {
  ClientHeroCard,
  ClientTopRow,
  ClientInfoCol,
  ClientGreeting,
  ClientName,
  ClientStatusBadge,
  ClientStatusText,
  ClientCardDivider,
  ClientWorkRow,
  ClientWorkInfo,
  ClientWorkLabel,
  ClientWorkName,
  SearchSection,
} from './styles';

import {
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
  RdoFeedCard,
  RdoCardHeader,
  RdoNumberText,
  RdoDateAuthorRow,
  RdoMetaItem,
  RdoMetaText,
  CardLinkRow,
  CardLinkText,
} from '@/screens/WorkFeed/styles';

import { WorkCalendar } from '@/screens/WorkFeed/WorkCalendar';
import { Header } from '@/components/navigation/Header';
import { Screen, ScrollContent, ListContent } from '@/components/common/Layout';
import { SearchBar } from '@/components/common/SearchBar';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { NavigationItem } from '@/components/navigation/NavigationItem';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ProfileView } from '@/screens/Profile/ProfileView';
import type { RDO, StatusVariant } from '@/types';

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

export const ClientDashboardView = () => {
  const theme = useTheme();
  const {
    user,
    assignedWork,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    workRdos,
    filteredRdos,
    totalRdos,
    approvedCount,
    pendingCount,
    returnedCount,
    approvalRate,
    totalManHours,
    totalWorkers,
    rainStoppageHours,
    totalActivities,
    navigateToReview,
  } = useClientDashboard();

  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);

  // Status de conexão do cliente (true por padrão para o usuário logado)
  const isOnline = user?.isOnline !== false;

  const renderContent = () => {
    if (activeTab === 'Ajustes') {
      return <ProfileView isTab />;
    }

    if (activeTab === 'RDOs') {
      return (
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg }}>
          <Header
            title="Diários de Obra"
            subtitle={`${assignedWork.name} • ${workRdos.length} registros`}
          />
          <SearchSection>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por número, data ou responsável..."
            />
          </SearchSection>
          <ListContent<RDO>
            data={filteredRdos}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon={<FileText size={48} color={theme.colors.text.secondary} />}
                message="Nenhum diário de obra localizado com os filtros aplicados."
              />
            }
            renderItem={({ item }) => {
              const variant = STATUS_VARIANTS[item.status] || 'neutral';
              const label = STATUS_LABELS[item.status] || item.status;
              return (
                <RdoFeedCard
                  onPress={() => navigateToReview(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`RDO número ${item.number}, status ${label}`}
                >
                  <RdoCardHeader>
                    <RdoNumberText>
                      RDO #{item.number} (v{item.version})
                    </RdoNumberText>
                    <StatusBadge label={label} variant={variant} />
                  </RdoCardHeader>
                  <RdoDateAuthorRow>
                    <RdoMetaItem>
                      <Calendar size={13} color={theme.colors.text.secondary} />
                      <RdoMetaText>{item.date}</RdoMetaText>
                    </RdoMetaItem>
                    <RdoMetaItem>
                      <UserIcon size={13} color={theme.colors.text.secondary} />
                      <RdoMetaText>{item.authorName}</RdoMetaText>
                    </RdoMetaItem>
                  </RdoDateAuthorRow>
                  <CardLinkRow>
                    <CardLinkText>Visualizar Homologação Completa</CardLinkText>
                    <ChevronRight size={14} color={theme.colors.tintText} />
                  </CardLinkRow>
                </RdoFeedCard>
              );
            }}
          />
        </View>
      );
    }

    // Aba Início (Dashboard da Obra do Cliente)
    return (
      <ScrollContent showsVerticalScrollIndicator={false}>
        {/* 1. Card Azul Padrão do Cliente com Nome, Obra (no lugar do CREA) e Status Online/Offline */}
        <ClientHeroCard>
          <ClientTopRow>
            <ClientInfoCol>
              <ClientGreeting>Acompanhamento do Contratante</ClientGreeting>
              <ClientName numberOfLines={1}>{user?.name || 'Cliente'}</ClientName>
            </ClientInfoCol>

            {/* Ícone de check se online, senão ícone vermelho */}
            <ClientStatusBadge $online={isOnline}>
              {isOnline ? (
                <>
                  <CheckCircle2 size={15} color="#10B981" />
                  <ClientStatusText $online>Online</ClientStatusText>
                </>
              ) : (
                <>
                  <AlertCircle size={15} color="#EF4444" />
                  <ClientStatusText $online={false}>Offline</ClientStatusText>
                </>
              )}
            </ClientStatusBadge>
          </ClientTopRow>

          <ClientCardDivider />

          {/* Onde no engenheiro é o CREA, no cliente é o Nome da Obra */}
          <ClientWorkRow>
            <Building2 size={20} color="#FB923C" />
            <ClientWorkInfo>
              <ClientWorkLabel>Empreendimento Vinculado</ClientWorkLabel>
              <ClientWorkName numberOfLines={1}>{assignedWork.name}</ClientWorkName>
            </ClientWorkInfo>
          </ClientWorkRow>
        </ClientHeroCard>

        {/* 2. Campo de Pesquisa Rápida */}
        <SearchSection>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar nos diários da obra..."
          />
        </SearchSection>

        {/* 3. Dashboard da Obra com Métricas Consolidadas */}
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

          {isDashboardExpanded && (
            <>
              {/* Taxa de Homologação */}
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

              {/* Grid 2x2 de Indicadores */}
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

          {/* Resumo por Status */}
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

        {/* 4. Calendário da Obra com dias marcados */}
        <WorkCalendar
          rdos={workRdos}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* 5. Lista de Diários de Obra */}
        <ListHeaderRow>
          <ListTitle>Diários de Obra ({filteredRdos.length})</ListTitle>
        </ListHeaderRow>

        {filteredRdos.length === 0 ? (
          <EmptyState
            icon={<FileText size={48} color={theme.colors.text.secondary} />}
            message={
              selectedDate
                ? `Nenhum relatório homologado nesta data (${selectedDate}).`
                : 'Nenhum relatório disponível para esta obra.'
            }
          />
        ) : (
          filteredRdos.map((item) => {
            const variant = STATUS_VARIANTS[item.status] || 'neutral';
            const label = STATUS_LABELS[item.status] || item.status;
            return (
              <RdoFeedCard
                key={item.id}
                onPress={() => navigateToReview(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`RDO número ${item.number}, status ${label}`}
              >
                <RdoCardHeader>
                  <RdoNumberText>
                    RDO #{item.number} (v{item.version})
                  </RdoNumberText>
                  <StatusBadge label={label} variant={variant} />
                </RdoCardHeader>

                <RdoDateAuthorRow>
                  <RdoMetaItem>
                    <Calendar size={13} color={theme.colors.text.secondary} />
                    <RdoMetaText>{item.date}</RdoMetaText>
                  </RdoMetaItem>
                  <RdoMetaItem>
                    <UserIcon size={13} color={theme.colors.text.secondary} />
                    <RdoMetaText>{item.authorName}</RdoMetaText>
                  </RdoMetaItem>
                </RdoDateAuthorRow>

                <CardLinkRow>
                  <CardLinkText>Visualizar Homologação Completa</CardLinkText>
                  <ChevronRight size={14} color={theme.colors.tintText} />
                </CardLinkRow>
              </RdoFeedCard>
            );
          })
        )}
      </ScrollContent>
    );
  };

  return (
    <Screen>
      {renderContent()}

      {/* NavBottom do Cliente com 3 opções: "Inicio", "RDO's", "Ajustes" */}
      <BottomNavigation>
        <NavigationItem
          icon={<Home color={theme.colors.text.secondary} size={22} strokeWidth={1.8} />}
          activeIcon={<Home color={theme.colors.text.inverse} size={22} strokeWidth={2.5} />}
          label="Início"
          active={activeTab === 'Inicio'}
          onPress={() => setActiveTab('Inicio')}
          accessibilityLabel="Início - Dashboard da Obra"
        />

        <NavigationItem
          icon={<FileText color={theme.colors.text.secondary} size={22} strokeWidth={1.8} />}
          activeIcon={<FileText color={theme.colors.text.inverse} size={22} strokeWidth={2.5} />}
          label="RDO's"
          active={activeTab === 'RDOs'}
          onPress={() => setActiveTab('RDOs')}
          accessibilityLabel="RDOs da Obra"
        />

        <NavigationItem
          icon={<Settings color={theme.colors.text.secondary} size={22} strokeWidth={1.8} />}
          activeIcon={<Settings color={theme.colors.text.inverse} size={22} strokeWidth={2.5} />}
          label="Ajustes"
          active={activeTab === 'Ajustes'}
          onPress={() => setActiveTab('Ajustes')}
          accessibilityLabel="Ajustes e Perfil do Cliente"
        />
      </BottomNavigation>
    </Screen>
  );
};

export default ClientDashboardView;
