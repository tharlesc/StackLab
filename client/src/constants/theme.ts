export const theme = {
  colors: {
    primary: '#0B2240', // Deep Navy
    secondary: '#F97316', // Safety Orange
    background: '#F3F4F6', // Field Canvas
    surface: '#FFFFFF', // Pure White
    text: {
      primary: '#0B2240',
      secondary: '#64748B', // Neutral Slate
      inverse: '#FFFFFF',
      inverseSecondary: '#94A3B8',
    },
    border: '#E2E8F0',
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
      },
    },
    tag: {
      masterBg: 'rgba(249, 115, 22, 0.2)',
      timeFilterBg: 'rgba(255,255,255,0.05)',
      notificationBg: 'rgba(255,255,255,0.1)',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
  },
  fonts: {
    regular: 'OpenSans_400Regular',
    semiBold: 'OpenSans_600SemiBold',
    bold: 'OpenSans_700Bold',
  },
} as const;
