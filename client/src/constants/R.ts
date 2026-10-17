import { strings } from '@/constants/strings';

/**
 * 🧱 Namespace R — Centralizador de Recursos Estáticos do StackLab
 * Mantém apenas strings e imagens estáticas. Tokens de tema (cores, espaçamentos,
 * tipografia) devem ser consumidos via ThemeContext / useTheme() para respeitar o Modo Escuro.
 */
export const R = {
  strings,
  images: {
    logo: require('@/assets/images/logo.png'),
    logoSymbol: require('@/assets/images/logo-symbol.png'),
  },
} as const;

export default R;
