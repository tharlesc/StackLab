import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  Bell,
  Menu,
  Plus,
  RefreshCcw,
  Settings as SettingsIcon,
  Inbox as InboxIcon,
  Building,
} from 'lucide-react-native';

import { useDashboardHome } from './useDashboardHome';
import {
  Section,
  SectionHeader,
  SeeAllText,
  SearchResultsBox,
  SearchResultItem,
  SearchResultTitle,
  SearchResultSubtitle,
} from './styles';

import { Header } from '@/components/navigation/Header';
import { HeaderAction } from '@/components/navigation/HeaderAction';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { NavigationItem } from '@/components/navigation/NavigationItem';
import { PrimaryActionItem } from '@/components/navigation/PrimaryActionItem';
import { EngineerProfileCard } from '@/components/dashboard/EngineerProfileCard';
import { WeeklySummaryCard } from '@/components/dashboard/WeeklySummaryCard';
import { ActiveWorkCard } from '@/components/works/ActiveWorkCard';
import { Screen, ScrollContent } from '@/components/common/Layout';
import { SectionTitle } from '@/components/common/Typography';
import { SearchBar } from '@/components/common/SearchBar';
import { InteractiveCard } from '@/components/common/InteractiveCard';
import { Avatar } from '@/components/common/Avatar';

import { NewRDOView } from '@/screens/NewRDO/NewRDOView';
import { SyncQueueView } from '@/screens/SyncQueue/SyncQueueView';
import { SettingsView } from '@/screens/Settings/SettingsView';
import { InboxView } from '@/screens/master/Inbox/InboxView';
import { AdminView } from '@/screens/master/Admin/AdminView';

export const DashboardHomeView = () => {
  const theme = useTheme();
  const {
    user,
    isMaster,
    activeTimeFilter,
    setActiveTimeFilter,
    activeTab,
    setActiveTab,
    globalSearch,
    setGlobalSearch,
    searchResults,
    chartData,
    indicators,
    activeWorks,
    pendingCount,
    overdueCount,
    returnedCount,
    navigateToNotifications,
    navigateToProfile,
    navigateToInbox,
    navigateToAdmin,
    navigateToReview,
  } = useDashboardHome();

  const renderContent = () => {
    switch (activeTab) {
      case 'Novo RDO':
        return <NewRDOView />;
      case 'Inbox':
        return <InboxView isTab />;
      case 'Cadastros':
        return <AdminView isTab />;
      case 'Fila':
        return <SyncQueueView />;
      case 'Ajustes':
        return <SettingsView />;
      case 'Obras':
      default:
        return (
          <>
            <Header
              title="RDO Mobile"
              subtitle={isMaster ? 'Painel Executivo • Gestão Global' : 'Operação de Campo'}
              rightContent={
                <>
                  <HeaderAction
                    icon={<Bell color={theme.colors.text.primary} size={22} />}
                    onPress={navigateToNotifications}
                    hasNotification={isMaster ? pendingCount > 0 : returnedCount > 0}
                    badgeCount={isMaster ? pendingCount : returnedCount}
                    accessibilityLabel="Notificações"
                  />
                  <TouchableOpacity
                    onPress={navigateToProfile}
                    accessibilityRole="button"
                    accessibilityLabel="Abrir perfil"
                  >
                    <Avatar name={user?.name} size={36} />
                  </TouchableOpacity>
                </>
              }
            />

            <ScrollContent showsVerticalScrollIndicator={false}>
              {/* Perfil & Hero Card (com indicador de conectividade integrado) */}
              <EngineerProfileCard
                name={user?.name || 'Profissional'}
                crea={user?.crea}
                isMaster={isMaster}
                isOnline={true}
                activeTimeFilter={activeTimeFilter}
                onTimeFilterChange={setActiveTimeFilter}
              />

              {/* Recurso Master: Busca Global em Todos os Relatórios da Organização */}
              {isMaster && (
                <View style={{ marginBottom: 14 }}>
                  <SearchBar
                    value={globalSearch}
                    onChangeText={setGlobalSearch}
                    placeholder="Buscar por obra, número ou autor..."
                  />

                  {globalSearch.trim().length > 0 && (
                    <SearchResultsBox>
                      <SectionTitle style={{ marginTop: 0 }}>
                        Resultados ({searchResults.length})
                      </SectionTitle>
                      {searchResults.length === 0 ? (
                        <SearchResultSubtitle>Nenhum relatório encontrado.</SearchResultSubtitle>
                      ) : (
                        searchResults.slice(0, 5).map((r) => (
                          <SearchResultItem
                            key={r.id}
                            onPress={() => navigateToReview(r.id)}
                            activeOpacity={0.7}
                          >
                            <SearchResultTitle>RDO #{r.number} — {r.workName}</SearchResultTitle>
                            <SearchResultSubtitle>
                              Por {r.authorName} em {r.date} • Status: {r.status}
                            </SearchResultSubtitle>
                          </SearchResultItem>
                        ))
                      )}
                    </SearchResultsBox>
                  )}
                </View>
              )}

              {/* 1º (Movido para cima conforme feedback amarelo):
                  Dashboard Gerencial / Resumo Semanal */}
              <WeeklySummaryCard
                title={isMaster ? 'Métricas Globais da Construtora' : 'Resumo da Semana'}
                subtitle={isMaster ? 'Todos os RDOs homologados e pendentes' : 'Últimos 7 dias'}
                chartData={chartData}
                chartTotal={chartData.reduce((acc, curr) => acc + curr.value, 0)}
                indicators={indicators}
              />

              {/* 2º (Movido para baixo conforme feedback amarelo):
                  Card de Caixa de Validação do Master apontando para Inbox */}
              {isMaster && (
                <View style={{ marginTop: 8 }}>
                  <InteractiveCard
                    title={`Caixa de Validação (${pendingCount} RDOs pendentes)`}
                    supportingText={
                      overdueCount > 0
                        ? `⚠️ ${overdueCount} relatório(s) com mais de 24 horas sem análise (Status Atrasado). Priorize a homologação.`
                        : 'Todos os diários enviados pelo campo estão dentro do prazo de SLA.'
                    }
                    actions={[
                      { label: 'Administração', onPress: navigateToAdmin, secondary: true },
                      { label: 'Abrir Inbox', onPress: navigateToInbox, primary: true },
                    ]}
                  />
                </View>
              )}

              {/* Lista de Obras (Designadas para Operacional vs Todas para Master) */}
              <Section style={{ marginTop: isMaster ? 0 : 8 }}>
                <SectionHeader>
                  <SectionTitle>
                    {isMaster ? 'Visão Global de Obras' : 'Minhas Obras Designadas'}
                  </SectionTitle>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver todas as ${activeWorks.length} obras`}
                  >
                    <SeeAllText>Total ({activeWorks.length})</SeeAllText>
                  </TouchableOpacity>
                </SectionHeader>

                {activeWorks.map((work) => (
                  <ActiveWorkCard
                    key={work.id}
                    {...work}
                    onPress={() => {
                      if (isMaster) {
                        navigateToInbox();
                      } else {
                        setActiveTab('Novo RDO');
                      }
                    }}
                    onActionPress={() => {
                      if (isMaster) {
                        navigateToInbox();
                      } else {
                        setActiveTab('Novo RDO');
                      }
                    }}
                  />
                ))}
              </Section>
            </ScrollContent>
          </>
        );
    }
  };

  return (
    <Screen>
      {renderContent()}

      <BottomNavigation>
        <NavigationItem
          icon={
            <Menu
              color={activeTab === 'Obras' ? theme.colors.secondary : theme.colors.text.secondary}
              size={24}
              style={{ marginBottom: 4 }}
            />
          }
          label="Obras"
          active={activeTab === 'Obras'}
          onPress={() => setActiveTab('Obras')}
          accessibilityLabel="Aba de Obras"
        />

        {isMaster ? (
          <PrimaryActionItem
            icon={<InboxIcon color={theme.colors.text.inverse} size={24} />}
            label="Inbox"
            onPress={() => setActiveTab('Inbox')}
            accessibilityLabel={`Inbox de Validação com ${pendingCount} pendentes`}
          />
        ) : (
          <PrimaryActionItem
            icon={<Plus color={theme.colors.text.inverse} size={26} strokeWidth={2.5} />}
            label="Novo RDO"
            onPress={() => setActiveTab('Novo RDO')}
            accessibilityLabel="Criar novo RDO"
          />
        )}

        {isMaster ? (
          <NavigationItem
            icon={
              <Building
                color={activeTab === 'Cadastros' ? theme.colors.secondary : theme.colors.text.secondary}
                size={22}
                style={{ marginBottom: 4 }}
              />
            }
            label="Cadastros"
            active={activeTab === 'Cadastros'}
            onPress={() => setActiveTab('Cadastros')}
            accessibilityLabel="Módulo de Administração e Cadastros"
          />
        ) : (
          <NavigationItem
            icon={
              <RefreshCcw
                color={activeTab === 'Fila' ? theme.colors.secondary : theme.colors.text.secondary}
                size={22}
                style={{ marginBottom: 4 }}
              />
            }
            label="Fila"
            active={activeTab === 'Fila'}
            onPress={() => setActiveTab('Fila')}
            badgeCount={2}
            accessibilityLabel="Fila de sincronização offline"
          />
        )}

        <NavigationItem
          icon={
            <SettingsIcon
              color={activeTab === 'Ajustes' ? theme.colors.secondary : theme.colors.text.secondary}
              size={24}
              style={{ marginBottom: 4 }}
            />
          }
          label="Ajustes"
          active={activeTab === 'Ajustes'}
          onPress={() => setActiveTab('Ajustes')}
          accessibilityLabel="Ajustes"
        />
      </BottomNavigation>
    </Screen>
  );
};

export default DashboardHomeView;
