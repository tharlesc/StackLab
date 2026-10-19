import React from 'react';
import { useTheme } from 'styled-components/native';
import {
  Bell,
  HardHat,
  Plus,
  RefreshCcw,
  Settings as SettingsIcon,
  Inbox as InboxIcon,
  Building2,
} from 'lucide-react-native';

import { useDashboardHome } from './useDashboardHome';
import {
  Section,
  SectionHeader,
  SeeAllText,
  AvatarButton,
  SearchWrapper,
  SearchSectionHeader,
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
import { Avatar } from '@/components/common/Avatar';
import { RDO_STATUS_META, getDisplayStatus } from '@/utils/rdo';
import { strings } from '@/constants/strings';

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
    returnedCount,
    navigateToNotifications,
    navigateToProfile,
    navigateToInbox,
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
                    icon={
                      <Bell
                        color={theme.colors.text.primary}
                        size={theme.icon.size.lg}
                        strokeWidth={theme.icon.strokeWidth}
                      />
                    }
                    onPress={navigateToNotifications}
                    hasNotification={isMaster ? pendingCount > 0 : returnedCount > 0}
                    badgeCount={isMaster ? pendingCount : returnedCount}
                    accessibilityLabel={strings.accessibility.notificationsButton}
                  />
                  <AvatarButton
                    onPress={navigateToProfile}
                    hitSlop={theme.touchTarget.hitSlop}
                    accessibilityRole="button"
                    accessibilityLabel={strings.accessibility.profileButton}
                  >
                    <Avatar name={user?.name} size={36} />
                  </AvatarButton>
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
                <SearchWrapper>
                  <SearchBar
                    value={globalSearch}
                    onChangeText={setGlobalSearch}
                    placeholder={strings.dashboard.searchPlaceholder}
                  >
                    {globalSearch.trim().length > 0 && (
                      <>
                        <SearchSectionHeader>
                          {strings.dashboard.searchResultsTitle} ({searchResults.length})
                        </SearchSectionHeader>
                        {searchResults.length === 0 ? (
                          <SearchResultSubtitle>
                            {strings.dashboard.emptySearchMessage(globalSearch)}
                          </SearchResultSubtitle>
                        ) : (
                          searchResults.slice(0, 5).map((r, index) => {
                            const isLast = index === Math.min(searchResults.length, 5) - 1;
                            const statusLabel = RDO_STATUS_META[getDisplayStatus(r)].label;
                            return (
                              <SearchResultItem
                                key={r.id}
                                onPress={() => navigateToReview(r.id)}
                                activeOpacity={0.7}
                                $isLast={isLast}
                                accessibilityRole="button"
                                accessibilityLabel={`RDO ${r.number}, obra ${r.workName}, status ${statusLabel}`}
                              >
                                <SearchResultTitle>
                                  RDO #{r.number} — {r.workName}
                                </SearchResultTitle>
                                <SearchResultSubtitle>
                                  Por {r.authorName} em {r.date} • Status: {statusLabel}
                                </SearchResultSubtitle>
                              </SearchResultItem>
                            );
                          })
                        )}
                      </>
                    )}
                  </SearchBar>
                </SearchWrapper>
              )}

              {/* 2º Dashboard Gerencial / Resumo Semanal */}
              <WeeklySummaryCard
                title={isMaster ? 'Métricas Globais da Construtora' : strings.dashboard.weeklySummary}
                subtitle={isMaster ? 'Todos os RDOs aprovados e submetidos' : strings.dashboard.last7Days}
                chartData={chartData}
                chartTotal={chartData.reduce((acc, curr) => acc + curr.value, 0)}
                indicators={indicators}
              />

              {/* Lista de Obras (Designadas para Operacional vs Todas para Master) */}
              <Section>
                <SectionHeader>
                  <SectionTitle>
                    {isMaster ? 'Visão Global de Obras' : 'Minhas Obras Designadas'}
                  </SectionTitle>
                  <SeeAllText accessibilityRole="text">
                    {strings.dashboard.totalWorks(activeWorks.length)}
                  </SeeAllText>
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
            <HardHat
              color={theme.colors.text.secondary}
              size={theme.icon.size.lg}
              strokeWidth={1.75}
            />
          }
          activeIcon={
            <HardHat
              color={theme.colors.text.inverse}
              size={theme.icon.size.lg}
              strokeWidth={2.5}
            />
          }
          label={strings.navigation.works}
          active={activeTab === 'Obras'}
          onPress={() => setActiveTab('Obras')}
          accessibilityLabel={strings.navigation.works}
        />

        {isMaster ? (
          <PrimaryActionItem
            icon={
              <InboxIcon
                color={theme.colors.text.secondary}
                size={theme.icon.size.lg}
                strokeWidth={2.25}
              />
            }
            activeIcon={
              <InboxIcon
                color={theme.colors.text.inverse}
                size={theme.icon.size.lg}
                strokeWidth={2.25}
              />
            }
            label="Inbox"
            active={activeTab === 'Inbox'}
            onPress={() => setActiveTab('Inbox')}
            accessibilityLabel={`Inbox de Validação com ${pendingCount} pendentes`}
          />
        ) : (
          <PrimaryActionItem
            icon={
              <Plus
                color={theme.colors.text.secondary}
                size={26}
                strokeWidth={2.5}
              />
            }
            activeIcon={
              <Plus
                color={theme.colors.text.inverse}
                size={26}
                strokeWidth={2.5}
              />
            }
            label={strings.navigation.newRDO}
            active={activeTab === 'Novo RDO'}
            onPress={() => setActiveTab('Novo RDO')}
            accessibilityLabel={strings.accessibility.newRdoAction}
          />
        )}

        {isMaster ? (
          <NavigationItem
            icon={
              <Building2
                color={theme.colors.text.secondary}
                size={theme.icon.size.lg}
                strokeWidth={1.75}
              />
            }
            activeIcon={
              <Building2
                color={theme.colors.text.inverse}
                size={theme.icon.size.lg}
                strokeWidth={2.5}
              />
            }
            label="Cadastros"
            active={activeTab === 'Cadastros'}
            onPress={() => setActiveTab('Cadastros')}
            accessibilityLabel="Cadastros"
          />
        ) : (
          <NavigationItem
            icon={
              <RefreshCcw
                color={theme.colors.text.secondary}
                size={theme.icon.size.lg}
                strokeWidth={1.75}
              />
            }
            activeIcon={
              <RefreshCcw
                color={theme.colors.text.inverse}
                size={theme.icon.size.lg}
                strokeWidth={2.5}
              />
            }
            label={strings.navigation.queue}
            active={activeTab === 'Fila'}
            onPress={() => setActiveTab('Fila')}
            badgeCount={2}
            accessibilityLabel={strings.navigation.queue}
          />
        )}

        <NavigationItem
          icon={
            <SettingsIcon
              color={theme.colors.text.secondary}
              size={theme.icon.size.lg}
              strokeWidth={1.75}
            />
          }
          activeIcon={
            <SettingsIcon
              color={theme.colors.text.inverse}
              size={theme.icon.size.lg}
              strokeWidth={2.5}
            />
          }
          label={strings.navigation.settings}
          active={activeTab === 'Ajustes'}
          onPress={() => setActiveTab('Ajustes')}
          accessibilityLabel={strings.navigation.settings}
        />
      </BottomNavigation>
    </Screen>
  );
};

export default DashboardHomeView;
