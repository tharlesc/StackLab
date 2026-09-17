import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BuildingIcon, PlusIcon, RefreshIcon, UserCogIcon } from '../../assets/svg';
import { theme } from '../../constants/theme';

export interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  queueCount?: number;
}

export const BottomNav = ({ activeTab = 'Obras', onTabChange = () => {}, queueCount = 2 }: BottomNavProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* TAB 1 - Obras */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabChange('Obras')}
          activeOpacity={0.7}
        >
          <BuildingIcon
            stroke={activeTab === 'Obras' ? theme.colors.primary : theme.colors.text.secondary}
            style={{ marginBottom: 4 }}
          />
          <Text style={[styles.label, activeTab === 'Obras' && styles.activeLabel]}>
            Obras
          </Text>
        </TouchableOpacity>

        {/* TAB 2 - Novo RDO (Destaque Central) */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() => onTabChange('Novo RDO')}
          >
            <PlusIcon stroke={theme.colors.text.inverse} />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Novo RDO</Text>
        </View>

        {/* TAB 3 - Fila */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabChange('Fila')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrapper}>
            <RefreshIcon
              stroke={activeTab === 'Fila' ? theme.colors.primary : theme.colors.text.secondary}
              style={{ marginBottom: 4 }}
            />
            {queueCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{queueCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.label, activeTab === 'Fila' && styles.activeLabel]}>
            Fila
          </Text>
        </TouchableOpacity>

        {/* TAB 4 - Ajustes */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabChange('Ajustes')}
          activeOpacity={0.7}
        >
          <UserCogIcon
            stroke={activeTab === 'Ajustes' ? theme.colors.primary : theme.colors.text.secondary}
            style={{ marginBottom: 4 }}
          />
          <Text style={[styles.label, activeTab === 'Ajustes' && styles.activeLabel]}>
            Ajustes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
    ...theme.shadows.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 56,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  activeLabel: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  actionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    position: 'relative',
    top: -12,
  },
  actionBtn: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#9d4300', // Hardcoded secondary dark from original design
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },
  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: 9,
    fontWeight: '800',
  }
});
