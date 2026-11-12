import type { RDO, Shift, WeatherEntry, Work } from '@/types';
import { calcHeadcount, calcManHours } from './rdo';
import { parseFlexibleDate } from './date';

const WEEKDAYS_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const formatRdoNumberPadded = (num: number): string => String(num ?? 1).padStart(3, '0');

const formatReportDateBr = (dateStr?: string): string => {
  if (!dateStr) return '—';
  const parsed = parseFlexibleDate(dateStr);
  if (!parsed) return dateStr;
  const d = String(parsed.getDate()).padStart(2, '0');
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const y = parsed.getFullYear();
  return `${d}/${m}/${y}`;
};

const formatReportDateWithWeekday = (dateStr?: string): string => {
  const parsed = parseFlexibleDate(dateStr);
  const formatted = formatReportDateBr(dateStr);
  if (!parsed) return formatted;
  const weekday = WEEKDAYS_PT[parsed.getDay()];
  return `${weekday} · ${formatted}`;
};

const formatReportTimestampBr = (isoOrDate?: string | Date): string => {
  const parsed = isoOrDate instanceof Date ? isoOrDate : parseFlexibleDate(isoOrDate);
  if (!parsed) return isoOrDate ? String(isoOrDate) : '—';
  const d = String(parsed.getDate()).padStart(2, '0');
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const y = parsed.getFullYear();
  const hh = String(parsed.getHours()).padStart(2, '0');
  const mm = String(parsed.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${y} ${hh}:${mm}`;
};

type RgbColor = [number, number, number];

// Paleta Oficial StackLab convertida para espaço RGB [0..1] do PDF 1.4
const COLORS = {
  navy: [11 / 255, 34 / 255, 64 / 255] as RgbColor, // #0B2240
  navyText: [20 / 255, 33 / 255, 61 / 255] as RgbColor, // #14213D
  orange: [249 / 255, 115 / 255, 22 / 255] as RgbColor, // #F97316
  orangeDark: [194 / 255, 65 / 255, 12 / 255] as RgbColor, // #C2410C
  orangeSoftBg: [255 / 255, 247 / 255, 237 / 255] as RgbColor, // #FFF7ED
  slate: [91 / 255, 107 / 255, 128 / 255] as RgbColor, // #5B6B80
  slateMuted: [136 / 255, 146 / 255, 166 / 255] as RgbColor, // #8892A6
  surfaceVariant: [238 / 255, 242 / 255, 246 / 255] as RgbColor, // #EEF2F6
  tableHeaderBg: [247 / 255, 249 / 255, 252 / 255] as RgbColor, // #F7F9FC
  border: [232 / 255, 236 / 255, 242 / 255] as RgbColor, // #E8ECF2
  borderStrong: [216 / 255, 224 / 255, 235 / 255] as RgbColor, // #D8E0EB
  rowDivider: [241 / 255, 244 / 255, 249 / 255] as RgbColor, // #F1F4F9
  white: [1, 1, 1] as RgbColor,

  // Status & Badges
  emeraldBg: [236 / 255, 253 / 255, 245 / 255] as RgbColor, // #ECFDF5
  emeraldText: [4 / 255, 120 / 255, 87 / 255] as RgbColor, // #047857
  emeraldDot: [16 / 255, 185 / 255, 129 / 255] as RgbColor, // #10B981

  amberBg: [255 / 255, 251 / 255, 235 / 255] as RgbColor, // #FFFBEB
  amberText: [146 / 255, 64 / 255, 14 / 255] as RgbColor, // #92400E
  amberDot: [245 / 255, 158 / 255, 11 / 255] as RgbColor, // #F59E0B

  redBg: [254 / 255, 242 / 255, 242 / 255] as RgbColor, // #FEF2F2
  redText: [185 / 255, 28 / 255, 28 / 255] as RgbColor, // #B91C1C
  redDot: [239 / 255, 68 / 255, 68 / 255] as RgbColor, // #EF4444

  blueBg: [239 / 255, 246 / 255, 255 / 255] as RgbColor, // #EFF6FF
  blueText: [29 / 255, 78 / 255, 216 / 255] as RgbColor, // #1D4ED8
  blueDot: [59 / 255, 130 / 255, 246 / 255] as RgbColor, // #3B82F6

  // Weather Cards
  morningBg: [254 / 255, 243 / 255, 199 / 255] as RgbColor, // #FEF3C7
  morningText: [180 / 255, 83 / 255, 9 / 255] as RgbColor, // #B45309
  afternoonBg: [255 / 255, 237 / 255, 213 / 255] as RgbColor, // #FFEDD5
  afternoonText: [194 / 255, 65 / 255, 12 / 255] as RgbColor, // #C2410C
  nightBg: [224 / 255, 234 / 255, 248 / 255] as RgbColor, // #E0EAF8
  nightText: [11 / 255, 34 / 255, 64 / 255] as RgbColor, // #0B2240
};

const fmtNum = (n: number): string => {
  const rounded = Math.round(n * 1000) / 1000;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(3).replace(/\.?0+$/, '');
};

const rgFill = ([r, g, b]: RgbColor): string => `${fmtNum(r)} ${fmtNum(g)} ${fmtNum(b)} rg`;
const rgStroke = ([r, g, b]: RgbColor): string => `${fmtNum(r)} ${fmtNum(g)} ${fmtNum(b)} RG`;

/**
 * Converte string UTF-8 para literal de string PDF codificado em WinAnsiEncoding.
 * Suporta todos os acentos do português (á, é, í, ó, ú, ã, õ, â, ê, ç, Á, É, etc.)
 * e símbolos tipográficos (·, •, —, –, “, ”).
 */
export const encodePdfWinAnsi = (input: unknown): string => {
  if (input === null || input === undefined) return '';
  const str = String(input);
  let out = '';

  const unicodeToWinAnsi: Record<number, number> = {
    0x20ac: 0x80, // €
    0x201a: 0x82, // ‚
    0x0192: 0x83, // ƒ
    0x201e: 0x84, // „
    0x2026: 0x85, // …
    0x2020: 0x86, // †
    0x2021: 0x87, // ‡
    0x02c6: 0x88, // ˆ
    0x2030: 0x89, // ‰
    0x0160: 0x8a, // Š
    0x2039: 0x8b, // ‹
    0x0152: 0x8c, // Œ
    0x017d: 0x8e, // Ž
    0x2018: 0x91, // ‘
    0x2019: 0x92, // ’
    0x201c: 0x93, // “
    0x201d: 0x94, // ”
    0x2022: 0x95, // •
    0x2013: 0x96, // –
    0x2014: 0x97, // —
    0x02dc: 0x98, // ˜
    0x2122: 0x99, // ™
    0x0161: 0x9a, // š
    0x203a: 0x9b, // ›
    0x0153: 0x9c, // œ
    0x017e: 0x9e, // ž
    0x0178: 0x9f, // Ÿ
  };

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code === 0x0a || code === 0x0d) {
      out += ' ';
      continue;
    }
    if (code === 0x28 || code === 0x29 || code === 0x5c) {
      // Escapa '(', ')', '\'
      out += '\\' + String.fromCharCode(code);
      continue;
    }
    if (code >= 0x20 && code <= 0x7e) {
      out += String.fromCharCode(code);
      continue;
    }
    if (unicodeToWinAnsi[code] !== undefined) {
      out += '\\' + unicodeToWinAnsi[code].toString(8).padStart(3, '0');
      continue;
    }
    if (code >= 0xa0 && code <= 0xff) {
      out += '\\' + code.toString(8).padStart(3, '0');
      continue;
    }
    out += '-';
  }

  return out;
};

/**
 * Estimativa precisa de largura em pontos para Helvetica / Helvetica-Bold
 */
const estimateTextWidth = (
  text: string,
  fontSize: number,
  font: 'F1' | 'F2' | 'F3' = 'F1',
  charSpacing = 0,
): number => {
  if (!text) return 0;
  let totalUnits = 0;
  const isBold = font === 'F2';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('ilI.,:;!| '.includes(ch)) {
      totalUnits += isBold ? 290 : 278;
    } else if ('fjt()[]/-'.includes(ch)) {
      totalUnits += isBold ? 340 : 310;
    } else if ('mwMW@#%&—'.includes(ch)) {
      totalUnits += isBold ? 860 : 810;
    } else if (ch >= 'A' && ch <= 'Z') {
      totalUnits += isBold ? 690 : 660;
    } else {
      totalUnits += isBold ? 575 : 535;
    }
  }

  const baseWidth = (totalUnits / 1000) * fontSize;
  const spacingWidth = text.length > 1 ? (text.length - 1) * charSpacing : 0;
  return baseWidth + spacingWidth;
};

const truncateToWidth = (
  text: string,
  maxWidth: number,
  fontSize: number,
  font: 'F1' | 'F2' | 'F3' = 'F1',
): string => {
  const clean = (text ?? '').toString().trim();
  if (!clean) return '—';
  if (estimateTextWidth(clean, fontSize, font) <= maxWidth) return clean;
  let sliced = clean;
  while (sliced.length > 1 && estimateTextWidth(sliced + '...', fontSize, font) > maxWidth) {
    sliced = sliced.slice(0, -1);
  }
  return sliced.trimEnd() + '...';
};

const wrapTextLines = (
  text: string,
  maxWidth: number,
  fontSize: number,
  font: 'F1' | 'F2' | 'F3' = 'F1',
  maxLines = 3,
): string[] => {
  const clean = (text ?? '').toString().trim();
  if (!clean) return ['—'];
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estimateTextWidth(candidate, fontSize, font) <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        if (lines.length >= maxLines) {
          lines[maxLines - 1] = truncateToWidth(
            `${lines[maxLines - 1]} ${word}`,
            maxWidth,
            fontSize,
            font,
          );
          return lines;
        }
        current = truncateToWidth(word, maxWidth, fontSize, font);
      } else {
        lines.push(truncateToWidth(word, maxWidth, fontSize, font));
        if (lines.length >= maxLines) return lines;
        current = '';
      }
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines.length > 0 ? lines : ['—'];
};

// Primitivas Vetoriais PDF 1.4
const pdfRoundedRectPath = (x: number, y: number, w: number, h: number, r: number): string => {
  const radius = Math.min(r, w / 2, h / 2);
  const k = 0.55228475 * radius;
  const x0 = x;
  const y0 = y;
  const x1 = x + w;
  const y1 = y + h;

  return [
    `n ${fmtNum(x0 + radius)} ${fmtNum(y1)} m`,
    `${fmtNum(x1 - radius)} ${fmtNum(y1)} l`,
    `${fmtNum(x1 - radius + k)} ${fmtNum(y1)} ${fmtNum(x1)} ${fmtNum(y1 - radius + k)} ${fmtNum(x1)} ${fmtNum(y1 - radius)} c`,
    `${fmtNum(x1)} ${fmtNum(y0 + radius)} l`,
    `${fmtNum(x1)} ${fmtNum(y0 + radius - k)} ${fmtNum(x1 - radius + k)} ${fmtNum(y0)} ${fmtNum(x1 - radius)} ${fmtNum(y0)} c`,
    `${fmtNum(x0 + radius)} ${fmtNum(y0)} l`,
    `${fmtNum(x0 + radius - k)} ${fmtNum(y0)} ${fmtNum(x0)} ${fmtNum(y0 + radius - k)} ${fmtNum(x0)} ${fmtNum(y0 + radius)} c`,
    `${fmtNum(x0)} ${fmtNum(y1 - radius)} l`,
    `${fmtNum(x0)} ${fmtNum(y1 - radius + k)} ${fmtNum(x0 + radius - k)} ${fmtNum(y1)} ${fmtNum(x0 + radius)} ${fmtNum(y1)} c h`,
  ].join(' ');
};

const pdfTopRoundedRectPath = (x: number, y: number, w: number, h: number, r: number): string => {
  const radius = Math.min(r, w / 2, h / 2);
  const k = 0.55228475 * radius;
  const x0 = x;
  const y0 = y;
  const x1 = x + w;
  const y1 = y + h;

  return [
    `n ${fmtNum(x0 + radius)} ${fmtNum(y1)} m`,
    `${fmtNum(x1 - radius)} ${fmtNum(y1)} l`,
    `${fmtNum(x1 - radius + k)} ${fmtNum(y1)} ${fmtNum(x1)} ${fmtNum(y1 - radius + k)} ${fmtNum(x1)} ${fmtNum(y1 - radius)} c`,
    `${fmtNum(x1)} ${fmtNum(y0)} l`,
    `${fmtNum(x0)} ${fmtNum(y0)} l`,
    `${fmtNum(x0)} ${fmtNum(y1 - radius)} l`,
    `${fmtNum(x0)} ${fmtNum(y1 - radius + k)} ${fmtNum(x0 + radius - k)} ${fmtNum(y1)} ${fmtNum(x0 + radius)} ${fmtNum(y1)} c h`,
  ].join(' ');
};

const pdfCirclePath = (cx: number, cy: number, r: number): string => {
  const k = 0.55228475 * r;
  return [
    `n ${fmtNum(cx + r)} ${fmtNum(cy)} m`,
    `${fmtNum(cx + r)} ${fmtNum(cy + k)} ${fmtNum(cx + k)} ${fmtNum(cy + r)} ${fmtNum(cx)} ${fmtNum(cy + r)} c`,
    `${fmtNum(cx - k)} ${fmtNum(cy + r)} ${fmtNum(cx - r)} ${fmtNum(cy + k)} ${fmtNum(cx - r)} ${fmtNum(cy)} c`,
    `${fmtNum(cx - r)} ${fmtNum(cy - k)} ${fmtNum(cx - k)} ${fmtNum(cy - r)} ${fmtNum(cx)} ${fmtNum(cy - r)} c`,
    `${fmtNum(cx + k)} ${fmtNum(cy - r)} ${fmtNum(cx + r)} ${fmtNum(cy - k)} ${fmtNum(cx + r)} ${fmtNum(cy)} c h`,
  ].join(' ');
};

const drawFilledRoundedRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: RgbColor,
  stroke?: RgbColor,
  lineWidth = 1,
): string => {
  const path = pdfRoundedRectPath(x, y, w, h, r);
  if (stroke) {
    return `${rgFill(fill)}\n${rgStroke(stroke)}\n${fmtNum(lineWidth)} w\n${path}\nB*`;
  }
  return `${rgFill(fill)}\n${path}\nf*`;
};

const drawStrokedRoundedRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  stroke: RgbColor,
  lineWidth = 1,
): string => {
  return `${rgStroke(stroke)}\n${fmtNum(lineWidth)} w\n${pdfRoundedRectPath(x, y, w, h, r)}\nS`;
};

const drawFilledCircle = (cx: number, cy: number, r: number, fill: RgbColor): string => {
  return `${rgFill(fill)}\n${pdfCirclePath(cx, cy, r)}\nf*`;
};

const drawLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: RgbColor,
  lineWidth = 0.5,
): string => {
  return `${rgStroke(stroke)}\n${fmtNum(lineWidth)} w\nn ${fmtNum(x1)} ${fmtNum(y1)} m ${fmtNum(x2)} ${fmtNum(y2)} l S`;
};

const drawText = (
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: RgbColor,
  font: 'F1' | 'F2' | 'F3' = 'F1',
  charSpacing = 0,
): string => {
  const encoded = encodePdfWinAnsi(text);
  const leading = fmtNum(fontSize * 1.2);
  const tc = fmtNum(charSpacing);
  return `${rgFill(color)}\nBT 1 0 0 1 0 0 Tm ${tc} Tc 1 0 0 1 ${fmtNum(x)} ${fmtNum(y)} Tm /${font} ${fmtNum(fontSize)} Tf ${leading} TL (${encoded}) Tj ET`;
};

const drawTextRight = (
  text: string,
  rightX: number,
  y: number,
  fontSize: number,
  color: RgbColor,
  font: 'F1' | 'F2' | 'F3' = 'F1',
  charSpacing = 0,
): string => {
  const w = estimateTextWidth(text, fontSize, font, charSpacing);
  return drawText(text, rightX - w, y, fontSize, color, font, charSpacing);
};

const drawSectionHeader = (
  title: string,
  y: number,
  summaryBold?: string,
  summaryMuted?: string,
): string => {
  const ops: string[] = [];
  // Ponto laranja StackLab à esquerda do título
  ops.push(drawFilledCircle(44, y + 3.2, 2.2, COLORS.orange));
  ops.push(drawText(title, 52, y, 9.5, COLORS.navy, 'F2', 0.8));

  if (summaryBold || summaryMuted) {
    const mutedText = summaryMuted ? ` · ${summaryMuted}` : '';
    const mutedW = mutedText ? estimateTextWidth(mutedText, 8, 'F1') : 0;
    const boldW = summaryBold ? estimateTextWidth(summaryBold, 8, 'F2') : 0;
    const startX = 555 - (boldW + mutedW);
    if (summaryBold) {
      ops.push(drawText(summaryBold, startX, y, 8, COLORS.navy, 'F2', 0));
    }
    if (mutedText) {
      ops.push(drawText(mutedText, startX + boldW, y, 8, COLORS.slateMuted, 'F1', 0));
    }
  }
  return ops.join('\n');
};

const drawBadgePill = (
  label: string,
  x: number,
  centerY: number,
  bg: RgbColor,
  textColor: RgbColor,
  dotColor?: RgbColor,
  fontSize = 7.5,
  height = 15,
): { ops: string; width: number } => {
  const textW = estimateTextWidth(label, fontSize, 'F2', 0.4);
  const dotSpace = dotColor ? 10 : 0;
  const padX = 7;
  const pillW = Math.max(28, textW + dotSpace + padX * 2);
  const pillY = centerY - height / 2;
  const ops: string[] = [];

  ops.push(drawFilledRoundedRect(x, pillY, pillW, height, height / 2, bg));
  if (dotColor) {
    ops.push(drawFilledCircle(x + padX + 2.5, centerY, 2.3, dotColor));
  }
  ops.push(
    drawText(
      label,
      x + padX + dotSpace,
      centerY - fontSize * 0.35,
      fontSize,
      textColor,
      'F2',
      0.4,
    ),
  );

  return { ops: ops.join('\n'), width: pillW };
};

/**
 * Desenha o logotipo vetorial oficial StackLab no cabeçalho do PDF
 */
const drawStackLabLogo = (x: number, y: number, compact = false): string => {
  const ops: string[] = [];
  const boxSize = compact ? 22 : 28;
  const radius = compact ? 5 : 6.5;

  // Ícone laranja arredondado StackLab
  ops.push(drawFilledRoundedRect(x, y, boxSize, boxSize, radius, COLORS.orange));

  // 3 barras horizontais brancas empilhadas dentro do ícone
  const barX = x + (compact ? 4.5 : 5.5);
  const barH = compact ? 2.1 : 2.5;
  const topY = y + (compact ? 15 : 19);
  const midY = y + (compact ? 10 : 12.8);
  const botY = y + (compact ? 5 : 6.6);

  ops.push(
    drawFilledRoundedRect(barX, topY, compact ? 11 : 14, barH, barH / 2, COLORS.white),
    drawFilledRoundedRect(barX, midY, compact ? 13 : 17, barH, barH / 2, COLORS.white),
    drawFilledRoundedRect(barX, botY, compact ? 8.5 : 11, barH, barH / 2, COLORS.white),
  );

  // Texto "Stack" (#0B2240) + "Lab" (#F97316)
  const textX = x + boxSize + (compact ? 7 : 8);
  const fontSize = compact ? 13.5 : 17;
  const textY = y + (compact ? 6 : 8);
  ops.push(drawText('Stack', textX, textY, fontSize, COLORS.navy, 'F2', -0.3));
  const stackW = estimateTextWidth('Stack', fontSize, 'F2', -0.3);
  ops.push(drawText('Lab', textX + stackW - 1, textY, fontSize, COLORS.orange, 'F2', -0.3));

  return ops.join('\n');
};

/**
 * Desenha o rodapé padrão em cada página (StackLab · RDO #001 · Obra | Gerado em ... | 1 / 2)
 */
const drawPageFooter = (
  rdo: RDO,
  generatedAt: string,
  pageNum: number,
  totalPages: number,
): string => {
  const ops: string[] = [];
  const paddedNum = formatRdoNumberPadded(rdo.number);
  const workTitle = truncateToWidth(rdo.workName || 'Obra', 220, 7.5, 'F1');

  ops.push(drawLine(40, 28, 555, 28, COLORS.border, 0.6));
  ops.push(drawText('StackLab', 40, 17.5, 7.5, COLORS.navy, 'F2', 0));
  const brandW = estimateTextWidth('StackLab', 7.5, 'F2', 0);
  ops.push(
    drawText(
      ` · RDO #${paddedNum} · ${workTitle}`,
      40 + brandW,
      17.5,
      7.5,
      COLORS.slateMuted,
      'F1',
      0,
    ),
  );

  // Badge de página (ex: "1 / 2")
  const badgeText = `${pageNum} / ${totalPages}`;
  const badgeW = 31;
  const badgeX = 555 - badgeW;
  ops.push(drawFilledRoundedRect(badgeX, 13.5, badgeW, 14, 7, COLORS.navy));
  ops.push(drawText(badgeText, badgeX + 6.5, 17.8, 7.5, COLORS.white, 'F2', 0));

  // Timestamp "Gerado em DD/MM/YYYY HH:mm"
  ops.push(drawTextRight(`Gerado em ${generatedAt}`, badgeX - 8, 17.5, 7.5, COLORS.slateMuted, 'F1'));

  return ops.join('\n');
};

/**
 * Desenha ícone vetorial de clima dentro do círculo do turno
 */
const drawWeatherVectorIcon = (
  cx: number,
  cy: number,
  shift: Shift,
  condition: string,
  color: RgbColor,
): string => {
  const ops: string[] = [];
  const cond = (condition || '').toLowerCase();

  // Círculo branco de fundo
  ops.push(drawFilledCircle(cx, cy, 12, COLORS.white));

  if (cond.includes('chuv')) {
    // Nuvem + gotas de chuva
    ops.push(
      `${rgStroke(color)}\n1.3 w`,
      `n ${fmtNum(cx - 5)} ${fmtNum(cy)} m ${fmtNum(cx + 5)} ${fmtNum(cy)} l S`,
      `${pdfCirclePath(cx - 2, cy + 2, 3.2)} S`,
      `${pdfCirclePath(cx + 2.2, cy + 1.5, 2.6)} S`,
      `n ${fmtNum(cx - 3.5)} ${fmtNum(cy - 2)} m ${fmtNum(cx - 4.5)} ${fmtNum(cy - 5.5)} l S`,
      `n ${fmtNum(cx)} ${fmtNum(cy - 2)} m ${fmtNum(cx - 1)} ${fmtNum(cy - 5.5)} l S`,
      `n ${fmtNum(cx + 3.5)} ${fmtNum(cy - 2)} m ${fmtNum(cx + 2.5)} ${fmtNum(cy - 5.5)} l S`,
    );
    return ops.join('\n');
  }

  if (shift === 'noite') {
    // Lua crescente
    ops.push(
      `${rgStroke(color)}\n1.4 w`,
      `${pdfCirclePath(cx, cy, 4.6)} S`,
      drawFilledCircle(cx + 2.2, cy + 1.6, 3.6, COLORS.white),
    );
    return ops.join('\n');
  }

  if (shift === 'tarde') {
    // Sol de fim de tarde no horizonte
    ops.push(
      `${rgStroke(color)}\n1.4 w`,
      `n ${fmtNum(cx - 6.5)} ${fmtNum(cy - 2.5)} m ${fmtNum(cx + 6.5)} ${fmtNum(cy - 2.5)} l S`,
      `n ${fmtNum(cx - 4.2)} ${fmtNum(cy - 5)} m ${fmtNum(cx + 4.2)} ${fmtNum(cy - 5)} l S`,
      `${pdfCirclePath(cx, cy + 0.5, 3.2)} S`,
      `n ${fmtNum(cx)} ${fmtNum(cy + 5.2)} m ${fmtNum(cx)} ${fmtNum(cy + 6.8)} l S`,
      `n ${fmtNum(cx - 4.5)} ${fmtNum(cy + 3.5)} m ${fmtNum(cx - 5.8)} ${fmtNum(cy + 4.8)} l S`,
      `n ${fmtNum(cx + 4.5)} ${fmtNum(cy + 3.5)} m ${fmtNum(cx + 5.8)} ${fmtNum(cy + 4.8)} l S`,
    );
    return ops.join('\n');
  }

  // Sol radiante (Manhã / Padrão)
  ops.push(
    `${rgStroke(color)}\n1.4 w`,
    `${pdfCirclePath(cx, cy, 3.2)} S`,
    `n ${fmtNum(cx)} ${fmtNum(cy + 4.8)} m ${fmtNum(cx)} ${fmtNum(cy + 6.6)} l S`,
    `n ${fmtNum(cx)} ${fmtNum(cy - 4.8)} m ${fmtNum(cx)} ${fmtNum(cy - 6.6)} l S`,
    `n ${fmtNum(cx + 4.8)} ${fmtNum(cy)} m ${fmtNum(cx + 6.6)} ${fmtNum(cy)} l S`,
    `n ${fmtNum(cx - 4.8)} ${fmtNum(cy)} m ${fmtNum(cx - 6.6)} ${fmtNum(cy)} l S`,
    `n ${fmtNum(cx + 3.4)} ${fmtNum(cy + 3.4)} m ${fmtNum(cx + 4.7)} ${fmtNum(cy + 4.7)} l S`,
    `n ${fmtNum(cx - 3.4)} ${fmtNum(cy - 3.4)} m ${fmtNum(cx - 4.7)} ${fmtNum(cy - 4.7)} l S`,
    `n ${fmtNum(cx - 3.4)} ${fmtNum(cy + 3.4)} m ${fmtNum(cx - 4.7)} ${fmtNum(cy + 4.7)} l S`,
    `n ${fmtNum(cx + 3.4)} ${fmtNum(cy - 3.4)} m ${fmtNum(cx + 4.7)} ${fmtNum(cy - 4.7)} l S`,
  );
  return ops.join('\n');
};

const getStatusColors = (
  status: RDO['status'],
): { label: string; bg: RgbColor; text: RgbColor; dot: RgbColor } => {
  switch (status) {
    case 'aprovado':
      return {
        label: 'APROVADO',
        bg: COLORS.emeraldBg,
        text: COLORS.emeraldText,
        dot: COLORS.emeraldDot,
      };
    case 'submetido':
      return {
        label: 'EM ANÁLISE',
        bg: COLORS.amberBg,
        text: COLORS.amberText,
        dot: COLORS.amberDot,
      };
    case 'devolvido':
      return {
        label: 'DEVOLVIDO',
        bg: COLORS.redBg,
        text: COLORS.redText,
        dot: COLORS.redDot,
      };
    case 'rascunho':
    default:
      return {
        label: 'RASCUNHO',
        bg: COLORS.blueBg,
        text: COLORS.blueText,
        dot: COLORS.blueDot,
      };
  }
};

const getActivityBadgeColors = (
  status?: string,
): { label: string; bg: RgbColor; text: RgbColor; dot: RgbColor; bar: RgbColor } => {
  const norm = (status || 'Em andamento').toLowerCase();
  if (norm.includes('conclu')) {
    return {
      label: 'CONCLUÍDA',
      bg: COLORS.emeraldBg,
      text: COLORS.emeraldText,
      dot: COLORS.emeraldDot,
      bar: COLORS.emeraldDot,
    };
  }
  if (norm.includes('paralis')) {
    return {
      label: 'PARALISADA',
      bg: COLORS.redBg,
      text: COLORS.redText,
      dot: COLORS.redDot,
      bar: COLORS.redDot,
    };
  }
  if (norm.includes('iniciad')) {
    return {
      label: 'INICIADA',
      bg: COLORS.blueBg,
      text: COLORS.blueText,
      dot: COLORS.blueDot,
      bar: COLORS.orange,
    };
  }
  return {
    label: 'EM ANDAMENTO',
    bg: COLORS.orangeSoftBg,
    text: COLORS.orangeDark,
    dot: COLORS.orange,
    bar: COLORS.orange,
  };
};

const getOccurrenceCategoryColors = (
  type: string,
): { label: string; bg: RgbColor; text: RgbColor; dot: RgbColor } => {
  const norm = (type || 'outro').toLowerCase();
  if (norm === 'dds') {
    return {
      label: 'DDS · SEGURANÇA',
      bg: COLORS.blueBg,
      text: COLORS.blueText,
      dot: COLORS.blueDot,
    };
  }
  if (norm === 'acidente') {
    return {
      label: 'ACIDENTE',
      bg: COLORS.redBg,
      text: COLORS.redText,
      dot: COLORS.redDot,
    };
  }
  if (norm === 'paralisacao') {
    return {
      label: 'PARALISAÇÃO',
      bg: COLORS.amberBg,
      text: COLORS.amberText,
      dot: COLORS.amberDot,
    };
  }
  if (norm === 'interferencia') {
    return {
      label: 'INTERFERÊNCIA',
      bg: COLORS.orangeSoftBg,
      text: COLORS.orangeDark,
      dot: COLORS.orange,
    };
  }
  if (norm === 'pendencia') {
    return {
      label: 'PENDÊNCIA',
      bg: COLORS.amberBg,
      text: COLORS.amberText,
      dot: COLORS.amberDot,
    };
  }
  return {
    label: (type || 'OCORRÊNCIA').toUpperCase(),
    bg: COLORS.surfaceVariant,
    text: COLORS.navy,
    dot: COLORS.slate,
  };
};

/**
 * Monta o nome de arquivo oficial para download do PDF:
 * Ex: RDO_004_-_11-08-2026_-_Alphaville.pdf
 */
export const getRdoPdfFilename = (rdo: RDO): string => {
  const paddedNum = formatRdoNumberPadded(rdo.number);
  const dateBr = formatReportDateBr(rdo.date).replace(/\//g, '-');
  const safeWork = (rdo.workName || 'Obra')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
  return `RDO_${paddedNum}_-_${dateBr}_-_${safeWork || 'StackLab'}.pdf`;
};

/**
 * Gera um documento binário `%PDF-1.4` (A4, 2 páginas vetoriais) com o layout executivo
 * Obras Check / StackLab e todos os 6 blocos preenchidos no RDO.
 */
export const generateRdoPdfBytes = (rdo: RDO, work?: Partial<Work> | null): Uint8Array => {
  const paddedNum = formatRdoNumberPadded(rdo.number);
  const generatedAt = formatReportTimestampBr(new Date());
  const dateBr = formatReportDateBr(rdo.date);
  const dateWithWeekday = formatReportDateWithWeekday(rdo.date);

  const workTitle = rdo.workName || work?.name || 'Obra StackLab';
  const workSubtitle = work?.address || work?.subtitle || 'Canteiro Principal';
  const contractorName = work?.client || 'StackLab Engenharia';
  const authorName = rdo.authorName || 'Operador Responsável';
  const approverName =
    rdo.signature?.signedByName || (rdo.status === 'aprovado' ? rdo.authorName : '—');
  const signedAtFormatted = rdo.signature?.signedAt
    ? formatReportTimestampBr(rdo.signature.signedAt)
    : '';

  const page1Ops: string[] = [];
  const page2Ops: string[] = [];

  // =========================================================================
  // PÁGINA 1 — CABEÇALHO, METADADOS E BLOCOS 1 A 5
  // =========================================================================
  page1Ops.push('q');

  // 1. Cabeçalho Executivo StackLab
  page1Ops.push(drawStackLabLogo(40, 785, false));
  page1Ops.push(
    drawTextRight('RELATÓRIO DIÁRIO DE OBRA', 555, 806, 7.5, COLORS.slateMuted, 'F2', 1.2),
  );
  const numText = `#${paddedNum}`;
  const numW = estimateTextWidth(numText, 18, 'F2', -0.4);
  const rdoLabelW = estimateTextWidth('RDO ', 18, 'F2', -0.4);
  page1Ops.push(drawText('RDO ', 555 - numW - rdoLabelW, 784, 18, COLORS.navy, 'F2', -0.4));
  page1Ops.push(drawText(numText, 555 - numW, 784, 18, COLORS.orange, 'F2', -0.4));
  page1Ops.push(drawTextRight(dateWithWeekday, 555, 772, 9, COLORS.slate, 'F1', 0));
  page1Ops.push(drawLine(40, 766, 555, 766, COLORS.border, 1));

  // 2. Nome da Obra + Endereço + Pill de Status
  page1Ops.push(
    drawText(truncateToWidth(workTitle, 380, 17, 'F2'), 40, 736, 17, COLORS.navy, 'F2', -0.3),
  );
  page1Ops.push(
    drawText(truncateToWidth(workSubtitle, 380, 9.5, 'F1'), 40, 721.5, 9.5, COLORS.slate, 'F1', 0),
  );

  const statusMeta = getStatusColors(rdo.status);
  const statusPillW = Math.max(
    68,
    estimateTextWidth(statusMeta.label, 8.5, 'F2', 0.5) + 26,
  );
  const statusPillX = 555 - statusPillW;
  page1Ops.push(
    drawFilledRoundedRect(statusPillX, 733.5, statusPillW, 18.5, 9.25, statusMeta.bg),
  );
  page1Ops.push(drawFilledCircle(statusPillX + 11, 742.75, 3, statusMeta.dot));
  page1Ops.push(
    drawText(statusMeta.label, statusPillX + 18, 739.8, 8.5, statusMeta.text, 'F2', 0.5),
  );

  // 3. Card de Identificação (Construtora | Data | Realizado por | Aprovado por)
  page1Ops.push(
    drawFilledRoundedRect(40, 653, 515, 53, 10, COLORS.surfaceVariant, COLORS.borderStrong, 1),
  );
  // Barra vertical laranja StackLab à esquerda do card
  page1Ops.push(`${rgFill(COLORS.orange)}\nn 40 665 4 29 re f*`);

  const metaCols = [
    { label: 'CONSTRUTORA', value: contractorName, x: 60 },
    { label: 'DATA', value: dateBr, x: 185 },
    { label: 'REALIZADO POR', value: authorName, x: 306 },
    { label: 'APROVADO POR', value: approverName, x: 429 },
  ];
  for (const col of metaCols) {
    page1Ops.push(drawText(col.label, col.x, 685, 7, COLORS.slateMuted, 'F2', 0.8));
    page1Ops.push(
      drawText(truncateToWidth(col.value, 114, 10, 'F2'), col.x, 670.5, 10, COLORS.navy, 'F2', 0),
    );
  }

  // 4. Seção 1: Condições Climáticas (Manhã, Tarde, Noite)
  page1Ops.push(drawSectionHeader('CONDIÇÕES CLIMÁTICAS', 629));

  const weatherByShift = new Map<Shift, WeatherEntry>();
  (rdo.weather || []).forEach((w) => weatherByShift.set(w.shift, w));

  const shiftConfigs: {
    shift: Shift;
    title: string;
    x: number;
    bg: RgbColor;
    color: RgbColor;
  }[] = [
    { shift: 'manha', title: 'MANHÃ', x: 40, bg: COLORS.morningBg, color: COLORS.morningText },
    {
      shift: 'tarde',
      title: 'TARDE',
      x: 214.333,
      bg: COLORS.afternoonBg,
      color: COLORS.afternoonText,
    },
    { shift: 'noite', title: 'NOITE', x: 388.667, bg: COLORS.nightBg, color: COLORS.nightText },
  ];

  for (const cfg of shiftConfigs) {
    const entry = weatherByShift.get(cfg.shift);
    const condText = entry?.condition || '—';
    const practicalText = entry
      ? entry.practical === false
        ? `Impraticável${entry.stoppageHours ? ` · ${entry.stoppageHours}h paradas` : ''}`
        : 'Praticável'
      : '—';

    page1Ops.push(drawFilledRoundedRect(cfg.x, 581, 166.333, 42, 9, cfg.bg));
    page1Ops.push(drawWeatherVectorIcon(cfg.x + 23, 602, cfg.shift, condText, cfg.color));
    page1Ops.push(drawText(cfg.title, cfg.x + 44, 612, 7.5, cfg.color, 'F2', 0.8));
    page1Ops.push(
      drawText(
        truncateToWidth(condText, 115, 10.5, 'F2'),
        cfg.x + 44,
        600.5,
        10.5,
        cfg.color,
        'F2',
        0,
      ),
    );
    page1Ops.push(
      drawText(
        truncateToWidth(practicalText, 115, 7.8, 'F1'),
        cfg.x + 44,
        588.5,
        7.8,
        cfg.color,
        'F1',
        0,
      ),
    );
  }

  let cursorY = 562;

  // =========================================================================
  // SEÇÃO 2: MÃO DE OBRA & EFETIVOS
  // =========================================================================
  const laborList = rdo.labor || [];
  const totalHeadcount = calcHeadcount(laborList);
  const totalHh = calcManHours(laborList);
  page1Ops.push(
    drawSectionHeader(
      'MÃO DE OBRA & EFETIVOS',
      cursorY - 3,
      `${totalHeadcount} ${totalHeadcount === 1 ? 'pessoa' : 'pessoas'}`,
      `${laborList.length} ${laborList.length === 1 ? 'função' : 'funções'} · ${totalHh} Hh`,
    ),
  );

  const laborTableTop = cursorY - 9;
  const laborHeaderH = 21;
  const laborRowH = 24;
  const laborRowsCount = Math.max(1, Math.min(laborList.length, 5));
  const laborTableH = laborHeaderH + laborRowsCount * laborRowH;
  const laborTableBottom = laborTableTop - laborTableH;

  // Cabeçalho da tabela de Mão de Obra
  page1Ops.push(
    `${rgFill(COLORS.tableHeaderBg)}\n${pdfTopRoundedRectPath(
      40,
      laborTableTop - laborHeaderH,
      515,
      laborHeaderH,
      9,
    )}\nf*`,
  );
  page1Ops.push(
    drawLine(40, laborTableTop - laborHeaderH, 555, laborTableTop - laborHeaderH, COLORS.border, 0.6),
  );

  const laborHeaders = [
    { label: 'FUNÇÃO', x: 50 },
    { label: 'NOME', x: 155 },
    { label: 'VÍNCULO', x: 255 },
    { label: 'QTD', x: 340 },
    { label: 'ENTRADA', x: 382 },
    { label: 'SAÍDA', x: 442 },
    { label: 'DURAÇÃO', x: 500 },
  ];
  for (const h of laborHeaders) {
    page1Ops.push(
      drawText(h.label, h.x, laborTableTop - 13, 7.2, COLORS.slate, 'F2', 0.6),
    );
  }

  if (laborList.length === 0) {
    page1Ops.push(
      drawText(
        'Nenhum efetivo registrado neste turno.',
        215,
        laborTableTop - laborHeaderH - 15,
        8.5,
        COLORS.slateMuted,
        'F3',
      ),
    );
  } else {
    laborList.slice(0, 5).forEach((item, idx) => {
      const rowTop = laborTableTop - laborHeaderH - idx * laborRowH;
      const textY = rowTop - 15;
      if (idx > 0) {
        page1Ops.push(drawLine(44, rowTop, 551, rowTop, COLORS.rowDivider, 0.5));
      }
      page1Ops.push(
        drawText(truncateToWidth(item.role, 98, 8.8, 'F2'), 50, textY, 8.8, COLORS.navy, 'F2'),
      );
      page1Ops.push(
        drawText(
          truncateToWidth(item.name || '—', 92, 8.5, 'F1'),
          155,
          textY,
          8.5,
          item.name ? COLORS.navyText : COLORS.slateMuted,
          'F1',
        ),
      );
      page1Ops.push(
        drawText(
          item.isContractor ? 'Terceirizado' : 'Próprio',
          255,
          textY,
          8.3,
          COLORS.navyText,
          'F1',
        ),
      );

      // QTD pill
      page1Ops.push(
        drawFilledRoundedRect(337, textY - 3.5, 22, 14, 6, COLORS.tableHeaderBg),
      );
      page1Ops.push(
        drawText(String(item.quantity), 344, textY, 8.2, COLORS.navy, 'F2'),
      );

      page1Ops.push(
        drawText(
          item.horaInicio || '—',
          382,
          textY,
          8.3,
          item.horaInicio ? COLORS.navyText : COLORS.slateMuted,
          'F1',
        ),
      );
      page1Ops.push(
        drawText(
          item.horaFim || '—',
          442,
          textY,
          8.3,
          item.horaFim ? COLORS.navyText : COLORS.slateMuted,
          'F1',
        ),
      );
      page1Ops.push(
        drawText(
          item.hours ? `${item.hours}h (${item.quantity * item.hours} Hh)` : '—',
          500,
          textY,
          8.2,
          COLORS.navy,
          'F2',
        ),
      );
    });
  }

  page1Ops.push(drawStrokedRoundedRect(40, laborTableBottom, 515, laborTableH, 9, COLORS.border, 1));
  cursorY = laborTableBottom - 16;

  // =========================================================================
  // SEÇÃO 3: EQUIPAMENTOS PRESENTES
  // =========================================================================
  const equipList = rdo.equipment || [];
  const totalEquipUnits = equipList.reduce((acc, e) => acc + (e.quantity ?? 1), 0);
  page1Ops.push(
    drawSectionHeader(
      'EQUIPAMENTOS PRESENTES',
      cursorY - 3,
      `${equipList.length} ${equipList.length === 1 ? 'tipo' : 'tipos'}`,
      `${totalEquipUnits} ${totalEquipUnits === 1 ? 'unidade' : 'unidades'}`,
    ),
  );

  const equipTableTop = cursorY - 9;
  const equipHeaderH = 21;
  const equipRowH = 24;
  const equipRowsCount = Math.max(1, Math.min(equipList.length, 4));
  const equipTableH = equipHeaderH + equipRowsCount * equipRowH;
  const equipTableBottom = equipTableTop - equipTableH;

  page1Ops.push(
    `${rgFill(COLORS.tableHeaderBg)}\n${pdfTopRoundedRectPath(
      40,
      equipTableTop - equipHeaderH,
      515,
      equipHeaderH,
      9,
    )}\nf*`,
  );
  page1Ops.push(
    drawLine(40, equipTableTop - equipHeaderH, 555, equipTableTop - equipHeaderH, COLORS.border, 0.6),
  );

  const equipHeaders = [
    { label: 'EQUIPAMENTO / MARCA', x: 50 },
    { label: 'QTD', x: 218 },
    { label: 'ENTRADA', x: 258 },
    { label: 'SAÍDA', x: 318 },
    { label: 'H. ATIVAS', x: 374 },
    { label: 'OBSERVAÇÕES', x: 432 },
  ];
  for (const h of equipHeaders) {
    page1Ops.push(drawText(h.label, h.x, equipTableTop - 13, 7.2, COLORS.slate, 'F2', 0.6));
  }

  if (equipList.length === 0) {
    page1Ops.push(
      drawText(
        'Nenhum equipamento registrado neste turno.',
        205,
        equipTableTop - equipHeaderH - 15,
        8.5,
        COLORS.slateMuted,
        'F3',
      ),
    );
  } else {
    equipList.slice(0, 4).forEach((item, idx) => {
      const rowTop = equipTableTop - equipHeaderH - idx * equipRowH;
      const textY = rowTop - 15;
      if (idx > 0) {
        page1Ops.push(drawLine(44, rowTop, 551, rowTop, COLORS.rowDivider, 0.5));
      }
      const brandLabel = [item.name, item.brand, item.code ? `[${item.code}]` : '']
        .filter(Boolean)
        .join(' · ');
      page1Ops.push(
        drawText(truncateToWidth(brandLabel, 160, 8.8, 'F2'), 50, textY, 8.8, COLORS.navy, 'F2'),
      );

      page1Ops.push(drawFilledRoundedRect(215, textY - 3.5, 22, 14, 6, COLORS.tableHeaderBg));
      page1Ops.push(drawText(String(item.quantity ?? 1), 222, textY, 8.2, COLORS.navy, 'F2'));

      page1Ops.push(
        drawText(
          item.horaInicio || '—',
          258,
          textY,
          8.3,
          item.horaInicio ? COLORS.navyText : COLORS.slateMuted,
          'F1',
        ),
      );
      page1Ops.push(
        drawText(
          item.horaFim || '—',
          318,
          textY,
          8.3,
          item.horaFim ? COLORS.navyText : COLORS.slateMuted,
          'F1',
        ),
      );
      page1Ops.push(
        drawText(
          `${item.activeHours}h${item.idleHours ? ` / ${item.idleHours}h oc.` : ''}`,
          374,
          textY,
          8.2,
          COLORS.navyText,
          'F1',
        ),
      );
      const obsText = item.observations || item.idleJustification || '—';
      page1Ops.push(
        drawText(
          truncateToWidth(obsText, 115, 8.2, 'F1'),
          432,
          textY,
          8.2,
          obsText !== '—' ? COLORS.navyText : COLORS.slateMuted,
          'F1',
        ),
      );
    });
  }

  page1Ops.push(drawStrokedRoundedRect(40, equipTableBottom, 515, equipTableH, 9, COLORS.border, 1));
  cursorY = equipTableBottom - 16;

  // =========================================================================
  // SEÇÃO 4: ATIVIDADES EXECUTADAS
  // =========================================================================
  const actList = rdo.activities || [];
  const completedCount = actList.filter((a) =>
    (a.status || '').toLowerCase().includes('conclu'),
  ).length;
  page1Ops.push(
    drawSectionHeader(
      'ATIVIDADES EXECUTADAS',
      cursorY - 3,
      `${actList.length} ${actList.length === 1 ? 'frente' : 'frentes'}`,
      `${completedCount} ${completedCount === 1 ? 'concluída' : 'concluídas'}`,
    ),
  );

  const actTableTop = cursorY - 9;
  const actHeaderH = 21;
  const actRowH = 26;
  const actRowsCount = Math.max(1, Math.min(actList.length, 4));
  const actTableH = actHeaderH + actRowsCount * actRowH;
  const actTableBottom = actTableTop - actTableH;

  page1Ops.push(
    `${rgFill(COLORS.tableHeaderBg)}\n${pdfTopRoundedRectPath(
      40,
      actTableTop - actHeaderH,
      515,
      actHeaderH,
      9,
    )}\nf*`,
  );
  page1Ops.push(
    drawLine(40, actTableTop - actHeaderH, 555, actTableTop - actHeaderH, COLORS.border, 0.6),
  );

  const actHeaders = [
    { label: 'DESCRIÇÃO', x: 50 },
    { label: 'PROGRESSO', x: 215 },
    { label: 'STATUS', x: 292 },
    { label: 'LOCAL / PAVIMENTO', x: 386 },
    { label: 'QTD / UN.', x: 495 },
  ];
  for (const h of actHeaders) {
    page1Ops.push(drawText(h.label, h.x, actTableTop - 13, 7.2, COLORS.slate, 'F2', 0.6));
  }

  if (actList.length === 0) {
    page1Ops.push(
      drawText(
        'Nenhuma atividade executada registrada.',
        208,
        actTableTop - actHeaderH - 16,
        8.5,
        COLORS.slateMuted,
        'F3',
      ),
    );
  } else {
    actList.slice(0, 4).forEach((item, idx) => {
      const rowTop = actTableTop - actHeaderH - idx * actRowH;
      const textY = rowTop - 15;
      if (idx > 0) {
        page1Ops.push(drawLine(44, rowTop, 551, rowTop, COLORS.rowDivider, 0.5));
      }

      page1Ops.push(
        drawText(
          truncateToWidth(item.description, 155, 8.8, 'F2'),
          50,
          textY,
          8.8,
          COLORS.navy,
          'F2',
        ),
      );

      // Progresso (%) + barra vetorial
      const pct = Math.max(0, Math.min(100, item.progress ?? 100));
      const badgeMeta = getActivityBadgeColors(item.status);
      page1Ops.push(drawText(`${pct}%`, 215, textY + 3, 8.2, COLORS.navy, 'F2'));
      page1Ops.push(drawFilledRoundedRect(215, textY - 4.5, 56, 4.5, 2.25, COLORS.border));
      if (pct > 0) {
        const fillW = Math.max(4.5, (56 * pct) / 100);
        page1Ops.push(drawFilledRoundedRect(215, textY - 4.5, fillW, 4.5, 2.25, badgeMeta.bar));
      }

      // Status Pill
      const pill = drawBadgePill(
        badgeMeta.label,
        292,
        textY + 2.5,
        badgeMeta.bg,
        badgeMeta.text,
        badgeMeta.dot,
        7,
        14,
      );
      page1Ops.push(pill.ops);

      page1Ops.push(
        drawText(
          truncateToWidth(item.location || '—', 98, 8.3, 'F1'),
          386,
          textY,
          8.3,
          item.location ? COLORS.navyText : COLORS.slateMuted,
          'F1',
        ),
      );
      page1Ops.push(
        drawText(
          `${item.quantity} ${item.unit || ''}`.trim(),
          495,
          textY,
          8.3,
          COLORS.navy,
          'F2',
        ),
      );
    });
  }

  page1Ops.push(drawStrokedRoundedRect(40, actTableBottom, 515, actTableH, 9, COLORS.border, 1));
  cursorY = actTableBottom - 16;

  // =========================================================================
  // SEÇÃO 5: OCORRÊNCIAS & DDS
  // =========================================================================
  const occList = rdo.occurrences || [];
  page1Ops.push(
    drawSectionHeader(
      'OCORRÊNCIAS & DDS',
      cursorY - 3,
      `${occList.length} ${occList.length === 1 ? 'ocorrência' : 'ocorrências'}`,
    ),
  );

  const occTableTop = cursorY - 9;
  const occHeaderH = 21;
  const occRowH = 25;
  const occRowsCount = Math.max(1, Math.min(occList.length, 3));
  const occTableH = occHeaderH + occRowsCount * occRowH;
  const occTableBottom = occTableTop - occTableH;

  page1Ops.push(
    `${rgFill(COLORS.tableHeaderBg)}\n${pdfTopRoundedRectPath(
      40,
      occTableTop - occHeaderH,
      515,
      occHeaderH,
      9,
    )}\nf*`,
  );
  page1Ops.push(
    drawLine(40, occTableTop - occHeaderH, 555, occTableTop - occHeaderH, COLORS.border, 0.6),
  );

  const occHeaders = [
    { label: 'CATEGORIA', x: 50 },
    { label: 'DESCRIÇÃO', x: 174 },
    { label: 'INÍCIO', x: 425 },
    { label: 'TÉRMINO', x: 493 },
  ];
  for (const h of occHeaders) {
    page1Ops.push(drawText(h.label, h.x, occTableTop - 13, 7.2, COLORS.slate, 'F2', 0.6));
  }

  if (occList.length === 0) {
    page1Ops.push(
      drawText(
        'Nenhuma ocorrência ou DDS registrado no período.',
        195,
        occTableTop - occHeaderH - 15,
        8.5,
        COLORS.slateMuted,
        'F3',
      ),
    );
  } else {
    occList.slice(0, 3).forEach((item, idx) => {
      const rowTop = occTableTop - occHeaderH - idx * occRowH;
      const textY = rowTop - 15;
      if (idx > 0) {
        page1Ops.push(drawLine(44, rowTop, 551, rowTop, COLORS.rowDivider, 0.5));
      }
      const catMeta = getOccurrenceCategoryColors(item.type);
      const pill = drawBadgePill(
        catMeta.label,
        50,
        textY + 2.5,
        catMeta.bg,
        catMeta.text,
        catMeta.dot,
        7,
        14,
      );
      page1Ops.push(pill.ops);

      page1Ops.push(
        drawText(
          truncateToWidth(item.description, 240, 8.6, 'F1'),
          174,
          textY,
          8.6,
          COLORS.navyText,
          'F1',
        ),
      );
      page1Ops.push(
        drawText(
          item.horaInicio || '—',
          425,
          textY,
          8.3,
          item.horaInicio ? COLORS.navyText : COLORS.slateMuted,
          'F1',
        ),
      );
      page1Ops.push(
        drawText(
          item.horaFim || '—',
          493,
          textY,
          8.3,
          item.horaFim ? COLORS.navyText : COLORS.slateMuted,
          'F1',
        ),
      );
    });
  }

  page1Ops.push(drawStrokedRoundedRect(40, occTableBottom, 515, occTableH, 9, COLORS.border, 1));

  // Rodapé da Página 1
  page1Ops.push(drawPageFooter(rdo, generatedAt, 1, 2));
  page1Ops.push('Q');

  // =========================================================================
  // PÁGINA 2 — OBSERVAÇÕES, REGISTRO FOTOGRÁFICO E ASSINATURAS
  // =========================================================================
  page2Ops.push('q');

  // Cabeçalho Compacto Página 2
  page2Ops.push(drawStackLabLogo(40, 792, true));
  page2Ops.push(
    drawTextRight(
      `RDO #${paddedNum} · ${dateBr} · ${truncateToWidth(workTitle, 180, 8.5, 'F2')}`,
      555,
      799,
      8.5,
      COLORS.slate,
      'F2',
      0,
    ),
  );
  page2Ops.push(drawLine(40, 782, 555, 782, COLORS.border, 0.8));

  // 1. Seção Observações e Pareceres
  const commentsList = rdo.comments || [];
  const notesTexts =
    commentsList.length > 0
      ? commentsList.map((c) => `${c.authorName}: ${c.text}`).join(' | ')
      : 'Sem observações complementares registradas para este RDO.';

  page2Ops.push(
    drawSectionHeader(
      'OBSERVAÇÕES',
      760,
      `${commentsList.length || 1} ${commentsList.length === 1 ? 'nota' : 'notas'}`,
    ),
  );
  page2Ops.push(drawFilledRoundedRect(40, 706, 515, 46, 9, COLORS.tableHeaderBg, COLORS.border, 1));
  page2Ops.push(drawText('“', 52, 718, 26, COLORS.orange, 'F2', 0));

  const wrappedNotes = wrapTextLines(notesTexts, 465, 9, 'F1', 2);
  wrappedNotes.forEach((line, idx) => {
    page2Ops.push(drawText(line, 74, 732 - idx * 13, 9, COLORS.navyText, 'F1', 0));
  });

  // 2. Seção 6: Registro Fotográfico (Fotos da Obra)
  const photosList = rdo.photos || [];
  page2Ops.push(
    drawSectionHeader(
      'REGISTRO FOTOGRÁFICO',
      682,
      `${photosList.length} ${photosList.length === 1 ? 'foto' : 'fotos'}`,
    ),
  );

  if (photosList.length === 0) {
    page2Ops.push(
      drawFilledRoundedRect(40, 560, 515, 112, 10, COLORS.tableHeaderBg, COLORS.border, 1),
    );
    page2Ops.push(
      drawText(
        'Nenhum registro fotográfico anexado a este RDO.',
        192,
        612,
        9,
        COLORS.slateMuted,
        'F3',
      ),
    );
  } else {
    const displayedPhotos = photosList.slice(0, 2);
    displayedPhotos.forEach((photo, idx) => {
      const cardX = idx === 0 ? 40 : 303.5;
      const cardW = 251.5;
      const cardBottom = 436;
      const cardH = 236;
      const captionH = 40;
      const imgBottom = cardBottom + captionH;
      const imgH = cardH - captionH;

      // Card container
      page2Ops.push(drawFilledRoundedRect(cardX, cardBottom, cardW, cardH, 10, COLORS.white, COLORS.border, 1));
      // Área superior da imagem
      page2Ops.push(
        `${rgFill(COLORS.surfaceVariant)}\n${pdfTopRoundedRectPath(
          cardX,
          imgBottom,
          cardW,
          imgH,
          10,
        )}\nf*`,
      );

      // Ilustração vetorial de câmera / registro de obra no centro do quadro
      const centerX = cardX + cardW / 2;
      const centerY = imgBottom + imgH / 2 + 8;
      page2Ops.push(drawFilledCircle(centerX, centerY, 24, COLORS.white));
      page2Ops.push(
        drawFilledRoundedRect(centerX - 11, centerY - 7, 22, 14, 3, COLORS.navy),
      );
      page2Ops.push(drawFilledCircle(centerX, centerY, 4.2, COLORS.orange));
      page2Ops.push(
        drawText(
          'REGISTRO FOTOGRÁFICO OFICIAL',
          centerX - 58,
          centerY - 36,
          7,
          COLORS.slate,
          'F2',
          0.5,
        ),
      );
      if (photo.metadata?.hash) {
        page2Ops.push(
          drawText(
            `Hash: ${photo.metadata.hash}`,
            centerX - 36,
            centerY - 47,
            6.8,
            COLORS.slateMuted,
            'F1',
          ),
        );
      }

      // Badge numérico "01", "02" no canto superior esquerdo da foto
      const badgeNum = String(idx + 1).padStart(2, '0');
      page2Ops.push(
        drawFilledRoundedRect(cardX + 10, cardBottom + cardH - 24, 24, 15, 7, COLORS.navy),
      );
      page2Ops.push(
        drawText(badgeNum, cardX + 16.5, cardBottom + cardH - 19, 7.2, COLORS.white, 'F2', 0.4),
      );

      // Rodapé de legenda da foto
      page2Ops.push(drawLine(cardX, imgBottom, cardX + cardW, imgBottom, COLORS.rowDivider, 0.6));
      page2Ops.push(
        drawText(
          truncateToWidth(photo.caption || 'Foto da obra', cardW - 20, 8.5, 'F2'),
          cardX + 10,
          cardBottom + 23,
          8.5,
          COLORS.navy,
          'F2',
        ),
      );
      const photoMetaLine = `${formatReportTimestampBr(photo.takenAt)}${
        photo.author ? ` · ${photo.author}` : ''
      }`;
      page2Ops.push(
        drawText(
          truncateToWidth(photoMetaLine, cardW - 20, 7.5, 'F1'),
          cardX + 10,
          cardBottom + 10,
          7.5,
          COLORS.slateMuted,
          'F1',
        ),
      );
    });
  }

  // 3. Seção de Assinaturas e Conferência (Idêntico ao modelo de referência)
  const sigLineY = 350;

  // Assinatura Esquerda: Realizado por
  page2Ops.push(
    drawText(
      truncateToWidth(authorName, 180, 13, 'F3'),
      162 - estimateTextWidth(authorName, 13, 'F3') / 2,
      sigLineY + 10,
      13,
      COLORS.navy,
      'F3',
    ),
  );
  page2Ops.push(drawLine(46, sigLineY, 279.5, sigLineY, COLORS.navyText, 0.8));
  page2Ops.push(
    drawText(
      authorName,
      162.75 - estimateTextWidth(authorName, 9.5, 'F2') / 2,
      sigLineY - 14,
      9.5,
      COLORS.navy,
      'F2',
    ),
  );
  page2Ops.push(
    drawText(
      'Realizado por',
      162.75 - estimateTextWidth('Realizado por', 8.5, 'F1') / 2,
      sigLineY - 26,
      8.5,
      COLORS.slate,
      'F1',
    ),
  );

  // Assinatura Direita: Aprovado por
  if (approverName && approverName !== '—') {
    page2Ops.push(
      drawText(
        truncateToWidth(approverName, 180, 13, 'F3'),
        432 - estimateTextWidth(approverName, 13, 'F3') / 2,
        sigLineY + 10,
        13,
        COLORS.navy,
        'F3',
      ),
    );
  }
  page2Ops.push(drawLine(315.5, sigLineY, 549, sigLineY, COLORS.navyText, 0.8));
  page2Ops.push(
    drawText(
      approverName,
      432.25 - estimateTextWidth(approverName, 9.5, 'F2') / 2,
      sigLineY - 14,
      9.5,
      COLORS.navy,
      'F2',
    ),
  );
  page2Ops.push(
    drawText(
      'Aprovado por',
      432.25 - estimateTextWidth('Aprovado por', 8.5, 'F1') / 2,
      sigLineY - 26,
      8.5,
      COLORS.slate,
      'F1',
    ),
  );
  if (signedAtFormatted) {
    const stampText = `em ${signedAtFormatted}`;
    page2Ops.push(
      drawText(
        stampText,
        432.25 - estimateTextWidth(stampText, 7.5, 'F1') / 2,
        sigLineY - 36.5,
        7.5,
        COLORS.slateMuted,
        'F1',
      ),
    );
  }

  // Rodapé da Página 2
  page2Ops.push(drawPageFooter(rdo, generatedAt, 2, 2));
  page2Ops.push('Q');

  // =========================================================================
  // MONTAGEM DA ESTRUTURA BINÁRIA `%PDF-1.4`
  // =========================================================================
  const page1Stream = page1Ops.join('\n');
  const page2Stream = page2Ops.join('\n');

  const objects: string[] = [
    // 1 0 obj: Info / Producer
    `<< /Producer (StackLab RDO Engine) /Title (${encodePdfWinAnsi(
      `StackLab - RDO #${paddedNum} - ${workTitle}`,
    )}) >>`,
    // 2 0 obj: Pages
    `<< /Type /Pages /Count 2 /Kids [ 4 0 R 6 0 R ] >>`,
    // 3 0 obj: Catalog
    `<< /Type /Catalog /Pages 2 0 R >>`,
    // 4 0 obj: Page 1
    `<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 595 842 ] /Contents 5 0 R /Resources << /Font << /F1 8 0 R /F2 9 0 R /F3 10 0 R >> /ProcSet [ /PDF /Text ] >> >>`,
    // 5 0 obj: Page 1 Contents
    `<< /Length ${page1Stream.length} >>\nstream\n${page1Stream}\nendstream`,
    // 6 0 obj: Page 2
    `<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 595 842 ] /Contents 7 0 R /Resources << /Font << /F1 8 0 R /F2 9 0 R /F3 10 0 R >> /ProcSet [ /PDF /Text ] >> >>`,
    // 7 0 obj: Page 2 Contents
    `<< /Length ${page2Stream.length} >>\nstream\n${page2Stream}\nendstream`,
    // 8 0 obj: Font F1 (Helvetica Regular)
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
    // 9 0 obj: Font F2 (Helvetica Bold)
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
    // 10 0 obj: Font F3 (Helvetica Oblique)
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`,
  ];

  let pdfContent = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdfContent.length);
    pdfContent += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdfContent.length;
  pdfContent += `xref\n0 ${objects.length + 1}\n`;
  pdfContent += `0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdfContent += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdfContent += `trailer\n<< /Size ${objects.length + 1} /Root 3 0 R /Info 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const bytes = new Uint8Array(pdfContent.length);
  for (let i = 0; i < pdfContent.length; i++) {
    bytes[i] = pdfContent.charCodeAt(i) & 0xff;
  }
  return bytes;
};
