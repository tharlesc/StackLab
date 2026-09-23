import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { ChartData, IndicatorItem, MetricItem, ActiveWork } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EngineerProfileCard } from '../components/dashboard/EngineerProfileCard';
import { WeeklySummaryCard } from '../components/dashboard/WeeklySummaryCard';
import { ActiveWorkCard } from '../components/works/ActiveWorkCard';
import { BottomNav } from '../components/navigation/BottomNav';
import { useRouter } from 'expo-router';

// --- MOCK DATA ---
const chartDataMock: ChartData[] = [
  { value: 24, color: '#10B981' },
  { value: 4, color: '#F59E0B' },
  { value: 2, color: '#EF4444' },
];

const indicatorsMock: IndicatorItem[] = [
  { id: '1', label: 'Assinados', value: 24, color: '#10B981' },
  { id: '2', label: 'Em Análise', value: 4, color: '#F59E0B' },
  { id: '3', label: 'Pendentes', value: 2, color: '#EF4444' },
];

const metricsMock: MetricItem[] = [
  {
    id: 'm1',
    title: 'MEDIÇÕES',
    value: 12,
    subtitle: 'Aguardando',
    icon: '📊',
    variant: 'warning',
  },
  {
    id: 'm2',
    title: 'SYNC FILA',
    value: 5,
    subtitle: 'Uploads pendentes',
    icon: '☁️',
    variant: 'info',
  },
];

const activeWorksMock: ActiveWork[] = [
  {
    id: 'w1',
    name: 'Residencial Alphaville',
    subtitle: 'Torre B — Alvenaria e Estrutura',
    statusType: '100% Em Dia',
    lastRdo: 'Hoje',
    weather: 'Ensolarado',
    team: '24 Operários',
    rdoStatus: 'RDO #184 Validado',
    actionText: 'Novo RDO',
  },
  {
    id: 'w2',
    name: 'Hospital Geral Municipal',
    subtitle: 'Bloco Cirúrgico — Instalações Elétricas',
    statusType: 'Atenção',
    lastRdo: 'Ontem',
    weather: 'Chuva',
    team: 'Eng. Roberto',
    rdoStatus: 'RDO Pendente de Envio',
  },
];

// --- Styled Components ---

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 16,
    paddingBottom: 100,
  },
})``;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const PageTitle = styled.Text`
  font-size: 20px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PageSubtitle = styled.Text`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 1px;
`;

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const OnlineBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.status.success.bg};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.status.success.border};
`;

const OnlineDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.status.success.base};
  margin-right: 4px;
`;

const OnlineText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.status.success.text};
`;

const Avatar = styled(TouchableOpacity)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const AvatarText = styled.Text`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 700;
  font-size: 14px;
`;

const Section = styled.View`
  margin-top: 8px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SeeAllText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
`;

// --- Component ---

export const DashboardHome = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState('7 dias');
  const [activeTab, setActiveTab] = useState('Obras');
  const router = useRouter();

  return (
    <Screen>
      <ScrollContent>
        <Header>
          <View>
            <PageTitle>Obras</PageTitle>
            <PageSubtitle>Visão Geral</PageSubtitle>
          </View>
          <HeaderRight>
            <OnlineBadge>
              <OnlineDot />
              <OnlineText>Online</OnlineText>
            </OnlineBadge>
            <Avatar activeOpacity={0.8} onPress={() => router.push('/profile')}>
              <AvatarText>TH</AvatarText>
            </Avatar>
          </HeaderRight>
        </Header>

        <EngineerProfileCard
          name="Davi Hudson"
          crea="CREA-MA 123456789-0"
          hasNotifications={true}
          activeTimeFilter={activeTimeFilter}
          onTimeFilterChange={setActiveTimeFilter}
        />

        <WeeklySummaryCard
          title="Resumo da Semana"
          subtitle="Últimos 7 dias"
          chartData={chartDataMock}
          chartTotal={30}
          indicators={indicatorsMock}
        />

        {/* <MetricsGrid metrics={metricsMock} /> */}

        <Section>
          <SectionHeader>
            <SectionTitle>Obras Ativas</SectionTitle>
            <TouchableOpacity activeOpacity={0.7}>
              <SeeAllText>Ver todas ({activeWorksMock.length})</SeeAllText>
            </TouchableOpacity>
          </SectionHeader>

          {activeWorksMock.map((work) => (
            <ActiveWorkCard key={work.id} {...work} />
          ))}
        </Section>
      </ScrollContent>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </Screen>
  );
};

export default DashboardHome;
