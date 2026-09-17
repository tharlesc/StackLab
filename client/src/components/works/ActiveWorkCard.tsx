import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import type { ActiveWork } from '../../types';

export const ActiveWorkCard = ({
  name,
  subtitle,
  statusType,
  lastRdo,
  weather,
  team,
  rdoStatus,
  actionText,
}: Omit<ActiveWork, 'id'>) => {
  const isOk = statusType === '100% Em Dia';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.iconPlaceholder} />
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        <View style={[styles.badge, isOk ? styles.badgeOk : styles.badgeWarn]}>
          <View style={[styles.badgeDot, isOk ? styles.dotOk : styles.dotWarn]} />
          <Text style={[styles.badgeText, isOk ? styles.textOk : styles.textWarn]}>
            {statusType}
          </Text>
        </View>
      </View>

      {/* QUICK DATA */}
      <View style={styles.quickData}>
        <View style={styles.dataCol}>
          <Text style={styles.dataLabel}>ÚLTIMO RDO</Text>
          <Text style={[styles.dataValue, lastRdo === 'Ontem' && { color: theme.colors.status.error.base }]}>
            {lastRdo}
          </Text>
        </View>
        <View style={styles.dataCol}>
          <Text style={styles.dataLabel}>CLIMA CANTEIRO</Text>
          <Text style={styles.dataValue}>{weather}</Text>
        </View>
        <View style={styles.dataCol}>
          <Text style={styles.dataLabel}>EFETIVO</Text>
          <Text style={styles.dataValue}>{team}</Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={[styles.statusBox, isOk ? styles.statusBoxOk : styles.statusBoxWarn]}>
          <Text style={[styles.statusText, isOk ? styles.statusTextOk : styles.statusTextWarn]}>
            {rdoStatus}
          </Text>
        </View>
        {actionText ? (
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>{actionText}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.arrowPlaceholder}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.border,
    marginRight: theme.spacing.md,
  },
  headerText: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
  },
  badgeOk: { 
    backgroundColor: theme.colors.status.success.bg, 
    borderColor: theme.colors.status.success.border 
  },
  badgeWarn: { 
    backgroundColor: theme.colors.status.warning.bg, 
    borderColor: theme.colors.status.warning.border 
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  dotOk: { backgroundColor: theme.colors.status.success.base },
  dotWarn: { backgroundColor: theme.colors.status.warning.base },
  badgeText: { fontSize: 10, fontWeight: '700' },
  textOk: { color: theme.colors.status.success.text },
  textWarn: { color: theme.colors.status.warning.text },
  quickData: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  dataCol: {
    flex: 1,
  },
  dataLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  statusBoxOk: { backgroundColor: theme.colors.status.success.bg },
  statusBoxWarn: { backgroundColor: theme.colors.status.warning.bg },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusTextOk: { color: theme.colors.status.success.text },
  statusTextWarn: { color: theme.colors.status.warning.text },
  actionBtn: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.lg,
  },
  actionBtnText: {
    color: theme.colors.text.inverse,
    fontSize: 13,
    fontWeight: '700',
  },
  arrowPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '700',
  }
});
