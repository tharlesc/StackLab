import { lightTheme, darkTheme, type ThemeType } from '@/constants/theme';

export interface RGB {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseColor(color: string): RGB {
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0]! + hex[0]!, 16),
        g: parseInt(hex[1]! + hex[1]!, 16),
        b: parseInt(hex[2]! + hex[2]!, 16),
        a: 1,
      };
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }

  const rgbaMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgbaMatch) {
    return {
      r: Number(rgbaMatch[1]),
      g: Number(rgbaMatch[2]),
      b: Number(rgbaMatch[3]),
      a: rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1,
    };
  }

  throw new Error(`Unsupported color format: ${color}`);
}

export function blendOver(fg: RGB, bg: RGB): RGB {
  const alpha = fg.a;
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
    a: 1,
  };
}

export function relativeLuminance(rgb: RGB): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(foreground: string, background: string, baseSurface = '#FFFFFF'): number {
  const baseRgb = parseColor(baseSurface);
  const bgRaw = parseColor(background);
  const bgRgb = bgRaw.a < 1 ? blendOver(bgRaw, baseRgb) : bgRaw;

  const fgRaw = parseColor(foreground);
  const fgRgb = fgRaw.a < 1 ? blendOver(fgRaw, bgRgb) : fgRaw;

  const l1 = relativeLuminance(fgRgb);
  const l2 = relativeLuminance(bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export interface ContrastCheckItem {
  theme: 'light' | 'dark';
  name: string;
  foreground: string;
  background: string;
  baseSurface?: string;
  minRatio: number;
  actualRatio: number;
  passed: boolean;
}

export function evaluateThemeContrast(theme: ThemeType): ContrastCheckItem[] {
  const { colors } = theme;
  const surface = colors.surface;
  const pairs: {
    name: string;
    fg: string;
    bg: string;
    base?: string;
    min: number;
  }[] = [
    // Text on primary surfaces (WCAG AA >= 4.5:1)
    { name: 'text.primary on background', fg: colors.text.primary, bg: colors.background, min: 4.5 },
    { name: 'text.primary on surface', fg: colors.text.primary, bg: colors.surface, min: 4.5 },
    { name: 'text.primary on surfaceVariant', fg: colors.text.primary, bg: colors.surfaceVariant, min: 4.5 },
    { name: 'text.secondary on background', fg: colors.text.secondary, bg: colors.background, min: 4.5 },
    { name: 'text.secondary on surface', fg: colors.text.secondary, bg: colors.surface, min: 4.5 },
    { name: 'text.secondary on surfaceVariant', fg: colors.text.secondary, bg: colors.surfaceVariant, min: 4.5 },
    { name: 'text.tertiary on background', fg: colors.text.tertiary, bg: colors.background, min: 4.5 },
    { name: 'text.tertiary on surface', fg: colors.text.tertiary, bg: colors.surface, min: 4.5 },
    { name: 'text.tertiary on surfaceVariant', fg: colors.text.tertiary, bg: colors.surfaceVariant, min: 4.5 },

    // Tint text (orange used as text: active tab, Comentar, Dialog actions, Total)
    { name: 'tintText on background', fg: colors.tintText, bg: colors.background, min: 4.5 },
    { name: 'tintText on surface', fg: colors.tintText, bg: colors.surface, min: 4.5 },
    { name: 'tintText on surfaceVariant', fg: colors.tintText, bg: colors.surfaceVariant, min: 4.5 },
    { name: 'Chip accent (tintText on tag.masterBg)', fg: colors.tintText, bg: colors.tag.masterBg, base: surface, min: 4.5 },

    // Fills with labels (WCAG AA >= 4.5:1)
    { name: 'onSecondary (navy) on secondary (#F97316)', fg: colors.onSecondary, bg: colors.secondary, min: 4.5 },
    { name: 'text.inverse on buttonPrimaryBg', fg: colors.text.inverse, bg: colors.buttonPrimaryBg, min: 4.5 },
    { name: 'text.inverse on avatarBg', fg: colors.text.inverse, bg: colors.avatarBg, min: 4.5 },
    { name: 'text.inverse on status.error.base (btn danger / badge)', fg: colors.text.inverse, bg: colors.status.error.base, min: 4.5 },
    { name: 'chip.text on chip.background', fg: colors.chip.text, bg: colors.chip.background, min: 4.5 },

    // Status badges & feedback text (WCAG AA >= 4.5:1)
    { name: 'status.success.text on status.success.bg', fg: colors.status.success.text, bg: colors.status.success.bg, base: surface, min: 4.5 },
    { name: 'status.warning.text on status.warning.bg', fg: colors.status.warning.text, bg: colors.status.warning.bg, base: surface, min: 4.5 },
    { name: 'status.warning.text on surfaceVariant', fg: colors.status.warning.text, bg: colors.surfaceVariant, min: 4.5 },
    { name: 'status.error.text on status.error.bg', fg: colors.status.error.text, bg: colors.status.error.bg, base: surface, min: 4.5 },
    { name: 'status.error.text on surface', fg: colors.status.error.text, bg: colors.surface, min: 4.5 },
    { name: 'status.error.text on background', fg: colors.status.error.text, bg: colors.background, min: 4.5 },
    { name: 'status.info.text on status.info.bg', fg: colors.status.info.text, bg: colors.status.info.bg, base: surface, min: 4.5 },

    // Hero card text (WCAG AA >= 4.5:1)
    { name: 'hero.text on hero.background', fg: colors.hero.text, bg: colors.hero.background, min: 4.5 },
    { name: 'hero.textSecondary on hero.background', fg: colors.hero.textSecondary, bg: colors.hero.background, min: 4.5 },
    { name: 'hero.accent on tag.masterBg over hero.background', fg: colors.hero.accent, bg: colors.tag.masterBg, base: colors.hero.background, min: 4.5 },

    // Non-text UI components (WCAG AA >= 3.0:1)
    { name: 'buttonPrimaryBg vs surface', fg: colors.buttonPrimaryBg, bg: colors.surface, min: 3.0 },
    { name: 'buttonPrimaryBg vs background', fg: colors.buttonPrimaryBg, bg: colors.background, min: 3.0 },
    { name: 'avatarBg vs surface', fg: colors.avatarBg, bg: colors.surface, min: 3.0 },
    { name: 'toggle.trackInactive vs surface', fg: colors.toggle.trackInactive, bg: colors.surface, min: 3.0 },
    { name: 'toggle.trackInactive vs toggle.thumb', fg: colors.toggle.trackInactive, bg: colors.toggle.thumb, min: 3.0 },
    { name: 'toggle.trackActive vs surface', fg: colors.toggle.trackActive, bg: colors.surface, min: 3.0 },
  ];

  return pairs.map((p) => {
    const actualRatio = getContrastRatio(p.fg, p.bg, p.base ?? surface);
    return {
      theme: theme.name,
      name: p.name,
      foreground: p.fg,
      background: p.bg,
      baseSurface: p.base,
      minRatio: p.min,
      actualRatio,
      passed: actualRatio >= p.min,
    };
  });
}

export function runContrastAudit(): { results: ContrastCheckItem[]; failures: ContrastCheckItem[] } {
  const results = [
    ...evaluateThemeContrast(lightTheme),
    ...evaluateThemeContrast(darkTheme),
  ];
  const failures = results.filter((r) => !r.passed);
  return { results, failures };
}
