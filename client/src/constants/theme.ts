export const lightTheme = {
  name: 'light' as const,
  colors: {
    // Brand Identity
    primary: '#0B2240', // Deep Navy
    secondary: '#F97316', // Safety Orange / Primary Accent
    tint: '#F97316', // Interactive Tint Color (Apple HIG)

    // Surfaces & Backgrounds
    background: '#F3F4F6', // Field Canvas
    surface: '#FFFFFF', // Pure White
    surfaceVariant: '#EEF2F6', // Elevated Surface / Card Background
    systemBackground: '#F3F4F6',
    secondarySystemBackground: '#FFFFFF',
    tertiarySystemBackground: '#E5E7EB',

    // Typography & Labels (Apple HIG)
    text: {
      primary: '#0B2240',
      secondary: '#64748B', // Neutral Slate
      inverse: '#FFFFFF',
      inverseSecondary: '#94A3B8',
    },
    label: '#0B2240',
    secondaryLabel: '#64748B',
    tertiaryLabel: '#94A3B8',

    // Separators & Borders
    border: '#E2E8F0',
    separator: '#E2E8F0',

    // Dialog & Modal Tokens (Material 3 / Modern Dialog)
    dialog: {
      background: '#FFFFFF',
      backdrop: 'rgba(0, 0, 0, 0.55)',
      title: '#0B2240',
      supportingText: '#64748B',
      actionPrimary: '#F97316',
      actionSecondary: '#475569',
    },

    // Interactive Card Tokens
    interactiveCard: {
      background: '#FFFFFF',
      border: '#E2E8F0',
      title: '#0B2240',
      supportingText: '#64748B',
      actionPrimary: '#F97316',
      actionSecondary: '#475569',
    },

    // Chip / Supporting Text Badge
    chip: {
      background: '#1E293B',
      text: '#F8FAFC',
    },

    // Modern Toggle / Switch
    toggle: {
      trackActive: '#0B2240',
      trackInactive: '#CBD5E1',
      thumb: '#FFFFFF',
    },

    // Status Colors (Universal feedback)
    status: {
      success: {
        base: '#10B981',
        bg: '#ECFDF5',
        text: '#047857',
        border: '#A7F3D0',
      },
      warning: {
        base: '#F59E0B',
        bg: '#FFFBEB',
        text: '#B45309',
        border: '#FDE68A',
      },
      error: {
        base: '#EF4444',
        bg: '#FEF2F2',
        text: '#B91C1C',
        border: '#FECACA',
      },
      info: {
        base: '#3B82F6',
        bg: '#EFF6FF',
        text: '#1D4ED8',
        border: '#BFDBFE',
      },
    },

    // Badges and Tags
    tag: {
      masterBg: 'rgba(249, 115, 22, 0.2)',
      timeFilterBg: 'rgba(255, 255, 255, 0.05)',
      notificationBg: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // Border Radius
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    xxl: 16,
    cardLarge: 20,
    dialog: 28, // Modern Dialog Corner Radius (28px)
    full: 9999,
  },

  // Apple HIG Touch Targets (Accessibility: minimum 44x44 points)
  touchTarget: {
    min: 44,
    comfortable: 48,
  },

  // Shadows
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    dialog: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },
    floating: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  // Typography Tokens
  fonts: {
    regular: 'Inter_400Regular',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
};

export const darkTheme = {
  ...lightTheme,
  name: 'dark' as const,
  colors: {
    ...lightTheme.colors,
    primary: '#0B2240',
    secondary: '#F97316',
    tint: '#FB923C',

    // OLED pure black + iOS Elevated Secondary Backgrounds
    background: '#000000', // iOS OLED Black
    surface: '#1C1C1E', // iOS Elevated Secondary Background
    surfaceVariant: '#2C2C2E',
    systemBackground: '#000000',
    secondarySystemBackground: '#1C1C1E',
    tertiarySystemBackground: '#2C2C2E',

    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      inverse: '#F8FAFC',
      inverseSecondary: '#94A3B8',
    },
    label: '#F8FAFC',
    secondaryLabel: '#94A3B8',
    tertiaryLabel: '#64748B',

    border: '#38383A',
    separator: '#38383A',

    dialog: {
      background: '#1C1C1E',
      backdrop: 'rgba(0, 0, 0, 0.75)',
      title: '#F8FAFC',
      supportingText: '#94A3B8',
      actionPrimary: '#F97316',
      actionSecondary: '#E2E8F0',
    },

    interactiveCard: {
      background: '#1C1C1E',
      border: '#38383A',
      title: '#F8FAFC',
      supportingText: '#94A3B8',
      actionPrimary: '#F97316',
      actionSecondary: '#E2E8F0',
    },

    chip: {
      background: '#2C2C2E',
      text: '#F8FAFC',
    },

    toggle: {
      trackActive: '#F97316',
      trackInactive: '#38383A',
      thumb: '#FFFFFF',
    },

    status: {
      success: {
        base: '#10B981',
        bg: 'rgba(16, 185, 129, 0.15)',
        text: '#34D399',
        border: 'rgba(16, 185, 129, 0.3)',
      },
      warning: {
        base: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.15)',
        text: '#FBBF24',
        border: 'rgba(245, 158, 11, 0.3)',
      },
      error: {
        base: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        text: '#F87171',
        border: 'rgba(239, 68, 68, 0.3)',
      },
      info: {
        base: '#3B82F6',
        bg: 'rgba(59, 130, 246, 0.15)',
        text: '#60A5FA',
        border: 'rgba(59, 130, 246, 0.3)',
      },
    },

    tag: {
      masterBg: 'rgba(251, 146, 60, 0.2)',
      timeFilterBg: 'rgba(255, 255, 255, 0.1)',
      notificationBg: 'rgba(255, 255, 255, 0.15)',
    },
  },

  shadows: {
    card: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    dialog: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 12,
    },
    floating: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export type ThemeType = Omit<typeof lightTheme, 'name'> & {
  name: 'light' | 'dark';
};
