import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import type { MetricItem } from '../../types';

interface MetricsGridProps {
  metrics: MetricItem[];
}

export const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  return (
    <View style={styles.container}>
      {metrics.map((metric) => (
        <TouchableOpacity key={metric.id} style={styles.card} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.status[metric.variant].bg }]}>
            <Text style={styles.iconText}>{metric.icon}</Text>
          </View>
          <Text style={styles.title}>{metric.title}</Text>
          <Text style={[styles.value, metric.variant === 'info' && { color: theme.colors.status.info.base }]}>
            {metric.value}
          </Text>
          <Text style={styles.subtitle}>{metric.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconText: {
    fontSize: 16,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.secondary,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginTop: 8,
    fontWeight: '500',
  },
});
