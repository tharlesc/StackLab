import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShieldCheckIcon } from '../../assets/svg';
import { theme } from '../../constants/theme';

interface EngineerProfileCardProps {
  name: string;
  greeting?: string;
  crea: string;
  hasNotifications?: boolean;
  onNotificationPress?: () => void;
  activeTimeFilter: string;
  onTimeFilterChange: (filter: string) => void;
  timeFilters?: string[];
  lastSync?: string;
}

export const EngineerProfileCard = ({
  name,
  greeting = 'Olá, Engenheiro',
  crea,
  hasNotifications = false,
  onNotificationPress,
  activeTimeFilter,
  onTimeFilterChange,
  timeFilters = ['Hoje', '7 dias', '15 dias', '1 mês'],
  lastSync = '100% Sincronizado - 09:41',
}: EngineerProfileCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.infoContainer}>
          <Text style={styles.greeting}>{greeting}</Text>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.masterTag}>
              <Text style={styles.masterTagText}>MASTER</Text>
            </View>
          </View>

          <View style={styles.creaRow}>
            <ShieldCheckIcon stroke={theme.colors.status.success.base} />
            <Text style={styles.creaText}>{crea}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.notificationBtn} 
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
          {hasNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.syncText}>Última Sincronização: {lastSync}</Text>
        <View style={styles.timeFilterContainer}>
          {timeFilters.map((filter) => {
            const isActive = activeTimeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.timeFilterBtn, isActive && styles.timeFilterBtnActive]}
                onPress={() => onTimeFilterChange(filter)}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeFilterText, isActive && styles.timeFilterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  infoContainer: {
    flex: 1,
  },
  greeting: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: '700',
  },
  masterTag: {
    backgroundColor: theme.colors.tag.masterBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  masterTagText: {
    color: theme.colors.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  creaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creaText: {
    color: theme.colors.text.inverseSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.tag.notificationBg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 16,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.status.error.base,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.tag.notificationBg,
    paddingTop: theme.spacing.md,
  },
  syncText: {
    color: theme.colors.text.secondary,
    fontSize: 11,
    fontWeight: '500',
  },
  timeFilterContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.tag.timeFilterBg,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
  },
  timeFilterBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  timeFilterBtnActive: {
    backgroundColor: theme.colors.secondary,
  },
  timeFilterText: {
    color: theme.colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  timeFilterTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: '700',
  },
});
