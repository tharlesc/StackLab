import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DonutChart } from '../ui/DonutChart';
import { theme } from '../../constants/theme';
import type { ChartData, IndicatorItem } from '../../types';

interface WeeklySummaryCardProps {
  title: string;
  subtitle: string;
  successText: string;
  chartData: ChartData[];
  chartTotal: number;
  indicators: IndicatorItem[];
}

export const WeeklySummaryCard = ({
  title,
  subtitle,
  successText,
  chartData,
  chartTotal,
  indicators,
}: WeeklySummaryCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{successText}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <DonutChart data={chartData} total={chartTotal} />

        <View style={styles.indicatorsList}>
          {indicators.map((indicator) => (
            <View key={indicator.id} style={styles.indicatorRow}>
              <View style={styles.indicatorLabelBox}>
                <View style={[styles.indicatorDot, { backgroundColor: indicator.color }]} />
                <Text style={styles.indicatorLabel}>{indicator.label}</Text>
              </View>
              <Text style={styles.indicatorValue}>{indicator.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: theme.colors.status.success.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.status.success.border,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.status.success.text,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indicatorsList: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
    gap: 8,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  indicatorLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  indicatorLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  indicatorValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
});
