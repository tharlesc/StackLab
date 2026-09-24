import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { ChartData, IndicatorItem, MetricItem, ActiveWork } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EngineerProfileCard } from '../../components/dashboard/EngineerProfileCard';
import { WeeklySummaryCard } from '../../components/dashboard/WeeklySummaryCard';
import { ActiveWorkCard } from '../../components/works/ActiveWorkCard';
import { BottomNav } from '../../components/navigation/BottomNav';
import { useRouter } from 'expo-router';
import { Bell, UserRound, BarChart2, Cloud } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Screen, Header, PageTitle, PageSubtitle, HeaderRight, OnlineBadge, OnlineDot, OnlineText, Avatar, AvatarText, Section, SectionHeader, SectionTitle, SeeAllText, NotificationButton, NotificationDot } from './styles';

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
    icon: <BarChart2 color="#F59E0B" size={20} />,
    variant: 'warning',
  },
  {
    id: 'm2',
    title: 'SYNC FILA',
    value: 5,
    subtitle: 'Uploads pendentes',
    icon: <Cloud color="#3B82F6" size={20} />,
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





const ScrollContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 16,
    paddingBottom: 100,
  },
})``;





























export const DashboardHome = () => {
  const { user } = useAuth();
  const [activeTimeFilter, setActiveTimeFilter] = useState('7 dias');
  const [activeTab, setActiveTab] = useState('Obras');
  const router = useRouter();

  return (
    <Screen>
      <Header>
        <View>
          <PageTitle>Obras</PageTitle>
          <PageSubtitle>Vis�o Geral</PageSubtitle>
        </View>
        <HeaderRight>
          <NotificationButton activeOpacity={0.7}>
            <Bell color="#0B2240" size={22} />
            <NotificationDot />
          </NotificationButton>
          <Avatar activeOpacity={0.8} onPress={() => router.push('/profile')}>
            <UserRound color="#FFFFFF" size={24} />
          </Avatar>
        </HeaderRight>
      </Header>
      <ScrollContent>

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
