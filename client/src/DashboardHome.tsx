import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import type { ChartData, IndicatorItem, MetricItem, ActiveWork } from './types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EngineerProfileCard } from './components/dashboard/EngineerProfileCard';
import { WeeklySummaryCard } from './components/dashboard/WeeklySummaryCard';
import { ActiveWorkCard } from './components/works/ActiveWorkCard';
import { BottomNav } from './components/navigation/BottomNav';
import { theme } from './constants/theme';

// --- MOCK DATA ---
const chartDataMock: ChartData[] = [
  { value: 24, color: theme.colors.status.success.base },
  { value: 4, color: theme.colors.status.warning.base },
  { value: 2, color: theme.colors.status.error.base }
];

const indicatorsMock: IndicatorItem[] = [
  { id: '1', label: 'Assinados', value: 24, color: theme.colors.status.success.base },
  { id: '2', label: 'Em Análise', value: 4, color: theme.colors.status.warning.base },
  { id: '3', label: 'Pendentes', value: 2, color: theme.colors.status.error.base },
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

export const DashboardHome = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState('7 dias');
  const [activeTab, setActiveTab] = useState('Obras');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER GERAL */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Obras</Text>
            <Text style={styles.subtitle}>Visão Geral</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
            <TouchableOpacity style={styles.avatar} activeOpacity={0.8}>
              <Text style={styles.avatarText}>TH</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PROFILE CARD */}
        <EngineerProfileCard
          name="Davi Hudson"
          crea="CREA-MA 123456789-0"
          hasNotifications={true}
          activeTimeFilter={activeTimeFilter}
          onTimeFilterChange={setActiveTimeFilter}
        />

        {/* WEEKLY SUMMARY */}
        <WeeklySummaryCard
          title="Resumo da Semana"
          subtitle="Últimos 7 dias"
          successText="94% Concluído"
          chartData={chartDataMock}
          chartTotal={30}
          indicators={indicatorsMock}
        />

        {/* METRICS GRID */}
        {/* <MetricsGrid metrics={metricsMock} /> */}

        {/* ACTIVE WORKS LIST */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Obras Ativas</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>Ver todas ({activeWorksMock.length})</Text>
            </TouchableOpacity>
          </View>

          {activeWorksMock.map((work) => (
            <ActiveWorkCard key={work.id} {...work} />
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
};

export default DashboardHome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Space for BottomNav
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.status.success.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.status.success.border,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.status.success.base,
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.status.success.text,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
});
