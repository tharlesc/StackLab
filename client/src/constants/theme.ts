export const lightTheme = {
  name: 'light' as const,
  colors: {
    // Brand Identity
    primary: '#0B2240', // Deep Navy
    secondary: '#F97316', // Safety Orange / Primary Accent (fill)
    onSecondary: '#0B2240', // Navy label over #F97316 (contrast 5.69:1)
    tint: '#F97316', // Interactive Tint Color (Apple HIG)
    tintText: '#C2410C', // Accessible Orange for text/links on light surfaces (>= 4.71:1)

    // Role Tokens (Dark mode safe)
    buttonPrimaryBg: '#0B2240',
    avatarBg: '#0B2240',
    workIconBg: 'rgba(11, 34, 64, 0.08)',
    unreadBorder: 'rgba(11, 34, 64, 0.18)',

    // Surfaces & Backgrounds
    background: '#F3F4F6', // Field Canvas
    surface: '#FFFFFF', // Pure White
    surfaceVariant: '#EEF2F6', // Elevated Surface / Card Background
    backdrop: 'rgba(0, 0, 0, 0.55)',

    // Typography & Labels (Semantic single layer)
    text: {
      primary: '#0B2240',
      secondary: '#5B6B80', // Contrast 4.95:1 on #F3F4F6, 5.44:1 on #FFFFFF
      tertiary: '#526071', // Contrast 5.42:1 on #EEF2F6, 6.29:1 on #FFFFFF
      inverse: '#FFFFFF',
      inverseSecondary: '#CBD5E1',
    },

    // Borders
    border: '#E2E8F0',

    // Chip / Supporting Text Badge
    chip: {
      background: '#1E293B',
      text: '#F8FAFC',
    },

    // Modern Toggle / Switch
    toggle: {
      trackActive: '#0B2240',
      trackInactive: '#64748B', // Contrast 4.76:1 vs card #FFFFFF (WCAG 3:1 min)
      thumb: '#FFFFFF',
    },

    // Chart & KPI Colors
    chart: {
      completed: '#10B981',
      signed: '#10B981',
      pending: '#F59E0B',
      inReview: '#F59E0B',
      overdue: '#EF4444',
    },

    // Status Colors (Universal feedback)
    status: {
      success: {
        base: '#047857',
        bg: '#ECFDF5',
        text: '#047857',
        border: '#A7F3D0',
      },
      warning: {
        base: '#92400E',
        bg: '#FFFBEB',
        text: '#92400E',
        border: '#FDE68A',
      },
      error: {
        base: '#B91C1C', // Contrast 6.64:1 with white text
        bg: '#FEF2F2',
        text: '#B91C1C',
        border: '#FECACA',
      },
      info: {
        base: '#1D4ED8',
        bg: '#EFF6FF',
        text: '#1D4ED8',
        border: '#BFDBFE',
      },
    },

    // Badges and Tags
    tag: {
      masterBg: 'rgba(249, 115, 22, 0.12)',
      commonBg: 'rgba(255, 255, 255, 0.1)',
      commonBorder: 'rgba(255, 255, 255, 0.2)',
      timeFilterBg: 'rgba(255, 255, 255, 0.08)',
      notificationBg: '#FFF7ED',
    },

    // Hero Card (cartão escuro de destaque do Dashboard)
    hero: {
      background: '#0A1C38',
      text: '#FFFFFF',
      textSecondary: '#94A3B8',
      divider: 'rgba(255, 255, 255, 0.1)',
      tagBg: 'rgba(255, 255, 255, 0.1)',
      tagBorder: 'rgba(255, 255, 255, 0.2)',
      accent: '#FB923C',
      success: '#10B981',
    },
  },

  // Typography Scale (minimum 12px, explicit line-height)
  typography: {
    largeTitle: { fontSize: 28, lineHeight: 34 },
    title: { fontSize: 20, lineHeight: 26 },
    headline: { fontSize: 17, lineHeight: 22 },
    body: { fontSize: 16, lineHeight: 22 },
    callout: { fontSize: 14, lineHeight: 20 },
    footnote: { fontSize: 13, lineHeight: 18 },
    caption: { fontSize: 12, lineHeight: 16 },
  },

  // Spacing Scale
  spacing: {
    none: 0,
    xxs: 2,
    xs: 4,
    xsm: 6,
    sm: 8,
    smd: 10,
    md: 12,
    mdl: 14,
    lg: 16,
    lxl: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    scrollBottom: 110,
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
    dialog: 28,
    full: 9999,
  },

  // Apple HIG Touch Targets (Accessibility: minimum 44x44 points)
  touchTarget: {
    min: 44,
    minHeight: 44,
    minWidth: 44,
    comfortable: 48,
    hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  },

  // Standardized Iconography (ios-interface-icons)
  icon: {
    size: {
      sm: 16,
      md: 20,
      lg: 24,
      empty: 56,
    },
    strokeWidth: 2,
  },

  // Shadows
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    dialog: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  // Font Families
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_600SemiBold',
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
    onSecondary: '#0B2240',
    tint: '#FB923C',
    tintText: '#FB923C',

    // Role Tokens (Visible against #1C1C1E surface >= 3:1 and #F8FAFC text >= 4.5:1)
    buttonPrimaryBg: '#3B68B5',
    avatarBg: '#3B68B5',
    workIconBg: 'rgba(249, 115, 22, 0.15)',
    unreadBorder: 'rgba(251, 146, 60, 0.35)',

    // OLED pure black + iOS Elevated Secondary Backgrounds
    background: '#000000',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    backdrop: 'rgba(0, 0, 0, 0.75)',

    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      tertiary: '#8E9BAE',
      inverse: '#F8FAFC',
      inverseSecondary: '#94A3B8',
    },

    border: '#38383A',

    chip: {
      background: '#2C2C2E',
      text: '#F8FAFC',
    },

    toggle: {
      trackActive: '#F97316',
      trackInactive: '#64748B', // Contrast 3.57:1 vs #1C1C1E surface and 4.76:1 vs #FFFFFF thumb
      thumb: '#FFFFFF',
    },

    chart: {
      completed: '#10B981',
      signed: '#10B981',
      pending: '#F59E0B',
      inReview: '#F59E0B',
      overdue: '#EF4444',
    },

    status: {
      success: {
        base: '#047857',
        bg: 'rgba(16, 185, 129, 0.15)',
        text: '#34D399',
        border: 'rgba(16, 185, 129, 0.3)',
      },
      warning: {
        base: '#B45309',
        bg: 'rgba(245, 158, 11, 0.15)',
        text: '#FBBF24',
        border: 'rgba(245, 158, 11, 0.3)',
      },
      error: {
        base: '#DC2626', // Contrast 4.80:1 with #F8FAFC and 3.41:1 vs #1C1C1E
        bg: 'rgba(239, 68, 68, 0.15)',
        text: '#F87171',
        border: 'rgba(239, 68, 68, 0.3)',
      },
      info: {
        base: '#1D4ED8',
        bg: 'rgba(59, 130, 246, 0.15)',
        text: '#60A5FA',
        border: 'rgba(59, 130, 246, 0.3)',
      },
    },

    tag: {
      masterBg: 'rgba(251, 146, 60, 0.15)',
      commonBg: 'rgba(255, 255, 255, 0.1)',
      commonBorder: 'rgba(255, 255, 255, 0.2)',
      timeFilterBg: 'rgba(255, 255, 255, 0.1)',
      notificationBg: 'rgba(251, 146, 60, 0.12)',
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
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 12,
    },
    floating: {
      shadowColor: '#000000',
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
