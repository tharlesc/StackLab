import { lightTheme, darkTheme } from './theme';
import { strings } from './strings';

/**
 * 🧱 Namespace R — Centralizador de Recursos do StackLab
 * Inspirado nas diretrizes do Android e do freeCodeCamp (Khoa Pham / Daniel Rosa)
 */
export const R = {
  theme: {
    light: lightTheme,
    dark: darkTheme,
  },
  colors: lightTheme.colors,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  touchTarget: lightTheme.touchTarget,
  shadows: lightTheme.shadows,
  fonts: lightTheme.fonts,
  strings,
  images: {
    logo: require('@/assets/images/logo.png'),
    logoSymbol: require('@/assets/images/logo-symbol.png'),
  },
} as const;

export default R;
