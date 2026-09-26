import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Bell, UserRound, Menu, Plus, RefreshCcw, Settings as SettingsIcon } from 'lucide-react-native';

import { useDashboardHome } from './useDashboardHome';
import { Section, SectionHeader, SeeAllText, AvatarBadge } from './styles';

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

import { NewRDOView } from '@/screens/NewRDO/NewRDOView';
import { SyncQueueView } from '@/screens/SyncQueue/SyncQueueView';
import { SettingsView } from '@/screens/Settings/SettingsView';

export const DashboardHomeView = () => {
  const theme = useTheme();
  const {
    user,
    activeTimeFilter,
    setActiveTimeFilter,
    activeTab,
    setActiveTab,
    chartData,
    indicators,
    activeWorks,
    navigateToNotifications,
    navigateToProfile,
  } = useDashboardHome();

  const renderContent = () => {
    switch (activeTab) {
      case 'Novo RDO':
        return <NewRDOView />;
      case 'Fila':
        return <SyncQueueView />;
      case 'Ajustes':
        return <SettingsView />;
      case 'Obras':
      default:
        return (
          <>
            <Header
              title="RDO"
              subtitle="Visão Geral"
              rightContent={
                <>
                  <HeaderAction
                    icon={<Bell color={theme.colors.text.primary} size={22} />}
                    onPress={navigateToNotifications}
                    hasNotification={true}
                    badgeCount={2}
                    accessibilityLabel="Notificações pendentes"
                  />
                  <HeaderAction
                    icon={
                      <AvatarBadge>
                        <UserRound color={theme.colors.text.inverse} size={18} />
                      </AvatarBadge>
                    }
                    onPress={navigateToProfile}
                    accessibilityLabel="Abrir meu perfil"
                  />
                </>
              }
            />

            <ScrollContent showsVerticalScrollIndicator={false}>
              <EngineerProfileCard
                name={user?.name || 'Engenheiro'}
                crea={user?.crea || 'CREA Ativo'}
                activeTimeFilter={activeTimeFilter}
                onTimeFilterChange={setActiveTimeFilter}
              />

              <WeeklySummaryCard
                title="Resumo da Semana"
                subtitle="Últimos 7 dias"
                chartData={chartData}
                chartTotal={30}
                indicators={indicators}
              />

              <Section>
                <SectionHeader>
                  <SectionTitle>Obras Ativas</SectionTitle>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver todas as ${activeWorks.length} obras`}
                  >
                    <SeeAllText>Ver todas ({activeWorks.length})</SeeAllText>
                  </TouchableOpacity>
                </SectionHeader>

                {activeWorks.map((work) => (
                  <ActiveWorkCard key={work.id} {...work} />
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
          accessibilityLabel="Aba de Obras e Dashboard"
        />
        <PrimaryActionItem
          icon={<Plus color={theme.colors.text.inverse} size={26} strokeWidth={2.5} />}
          label="Novo RDO"
          onPress={() => setActiveTab('Novo RDO')}
          accessibilityLabel="Criar novo Relatório Diário de Obra"
        />
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
          accessibilityLabel="Fila de sincronização offline com 2 itens pendentes"
        />
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
          accessibilityLabel="Ajustes e configurações do aplicativo"
        />
      </BottomNavigation>
    </Screen>
  );
};

export default DashboardHomeView;
