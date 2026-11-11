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

const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const formatRdoNumberPadded = (num: number): string => {
  return String(num ?? 1).padStart(3, '0');
};

export const formatReportDateBr = (dateStr?: string): string => {
  if (!dateStr) return '—';
  const parsed = parseFlexibleDate(dateStr);
  if (!parsed) return dateStr;
  const d = String(parsed.getDate()).padStart(2, '0');
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const y = parsed.getFullYear();
  return `${d}/${m}/${y}`;
};

export const formatReportDateWithWeekday = (dateStr?: string): string => {
  const parsed = parseFlexibleDate(dateStr);
  const formatted = formatReportDateBr(dateStr);
  if (!parsed) return formatted;
  const weekday = WEEKDAYS_PT[parsed.getDay()];
  return `${weekday} · ${formatted}`;
};

export const formatReportTimestampBr = (isoOrDate?: string | Date): string => {
  const parsed = isoOrDate instanceof Date ? isoOrDate : parseFlexibleDate(isoOrDate);
  if (!parsed) return isoOrDate ? String(isoOrDate) : '—';
  const d = String(parsed.getDate()).padStart(2, '0');
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const y = parsed.getFullYear();
  const hh = String(parsed.getHours()).padStart(2, '0');
  const mm = String(parsed.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${y} ${hh}:${mm}`;
};

const getStatusBadgeMeta = (status: RDO['status']) => {
  switch (status) {
    case 'aprovado':
      return {
        label: 'APROVADO',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        color: '#047857',
        dot: '#10B981',
      };
    case 'submetido':
      return {
        label: 'EM ANÁLISE',
        bg: '#FFFBEB',
        border: '#FDE68A',
        color: '#92400E',
        dot: '#F59E0B',
      };
    case 'devolvido':
      return {
        label: 'DEVOLVIDO',
        bg: '#FEF2F2',
        border: '#FECACA',
        color: '#B91C1C',
        dot: '#EF4444',
      };
    case 'rascunho':
    default:
      return {
        label: 'RASCUNHO',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        color: '#1D4ED8',
        dot: '#3B82F6',
      };
  }
};

const getActivityStatusBadgeMeta = (status?: string) => {
  const norm = (status || 'Em andamento').toLowerCase();
  if (norm.includes('conclu')) {
    return {
      label: 'CONCLUÍDA',
      bg: '#ECFDF5',
      color: '#047857',
      dot: '#10B981',
      barColor: '#10B981',
    };
  }
  if (norm.includes('paralis')) {
    return {
      label: 'PARALISADA',
      bg: '#FEF2F2',
      color: '#B91C1C',
      dot: '#EF4444',
      barColor: '#EF4444',
    };
  }
  if (norm.includes('iniciad')) {
    return {
      label: 'INICIADA',
      bg: '#EFF6FF',
      color: '#1D4ED8',
      dot: '#3B82F6',
      barColor: '#F97316',
    };
  }
  return {
    label: 'EM ANDAMENTO',
    bg: '#FFF7ED',
    color: '#C2410C',
    dot: '#F97316',
    barColor: '#F97316',
  };
};

const getOccurrenceBadgeMeta = (type: string) => {
  const norm = (type || 'outro').toLowerCase();
  switch (norm) {
    case 'dds':
      return {
        label: 'DDS · DIÁLOGO DE SEGURANÇA',
        bg: '#EFF6FF',
        color: '#1D4ED8',
        dot: '#3B82F6',
      };
    case 'acidente':
      return {
        label: 'ACIDENTE',
        bg: '#FEF2F2',
        color: '#B91C1C',
        dot: '#EF4444',
      };
    case 'paralisacao':
      return {
        label: 'PARALISAÇÃO',
        bg: '#FFFBEB',
        color: '#92400E',
        dot: '#F59E0B',
      };
    case 'interferencia':
      return {
        label: 'INTERFERÊNCIA',
        bg: '#FFF7ED',
        color: '#C2410C',
        dot: '#F97316',
      };
    case 'pendencia':
      return {
        label: 'PENDÊNCIA',
        bg: '#FEF3C7',
        color: '#92400E',
        dot: '#D97706',
      };
    default:
      return {
        label: type ? type.toUpperCase() : 'OUTRO',
        bg: '#EEF2F6',
        color: '#0B2240',
        dot: '#5B6B80',
      };
  }
};

const getWeatherShiftSvg = (shift: Shift, condition?: string) => {
  const cond = (condition || '').toLowerCase();
  if (cond.includes('chuv')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`;
  }
  if (cond.includes('nublad')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
  }
  if (cond.includes('inst')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`;
  }
  if (shift === 'noite') {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  }
  if (shift === 'tarde') {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-7.894 0"/><path d="M2 16h20"/><path d="M6 20h12"/></svg>`;
  }
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
};

/**
 * Gera o HTML oficial do Relatório Diário de Obra (RDO) no modelo executivo
 * personalizado com a identidade visual e paleta de cores do StackLab,
 * contemplando os 6 blocos do preenchimento do aplicativo:
 * 1. Identificação e Clima
 * 2. Mão de Obra e Efetivos
 * 3. Equipamentos Presentes
 * 4. Atividades Executadas
 * 5. Ocorrências e DDS
 * 6. Fotos da Obra (Registro Fotográfico) + Observações e Assinaturas
 */
export const generateRdoReportHtml = (
  rdo: RDO,
  work?: Partial<Work> | null,
  options?: { autoPrint?: boolean },
): string => {
  const paddedNum = formatRdoNumberPadded(rdo.number);
  const statusMeta = getStatusBadgeMeta(rdo.status);
  const formattedDate = formatReportDateBr(rdo.date);
  const dateWithWeekday = formatReportDateWithWeekday(rdo.date);
  const generatedAt = formatReportTimestampBr(new Date());

  const headcount = calcHeadcount(rdo.labor || []);
  const manHours = calcManHours(rdo.labor || []);
  const totalRoles = (rdo.labor || []).length;

  const totalEquipTypes = (rdo.equipment || []).length;
  const totalEquipUnits = (rdo.equipment || []).reduce((acc, e) => acc + (e.quantity ?? 1), 0);

  const totalActivities = (rdo.activities || []).length;
  const completedActivities = (rdo.activities || []).filter((a) =>
    (a.status || '').toLowerCase().includes('conclu'),
  ).length;

  const totalOccurrences = (rdo.occurrences || []).length;
  const totalPhotos = (rdo.photos || []).length;
  const totalComments = (rdo.comments || []).length + (rdo.returnReason ? 1 : 0);

  const contractorName = work?.client || rdo.workName || 'StackLab Engenharia';
  const workAddress = work?.address || work?.subtitle || 'Canteiro de Obras StackLab';
  const approverName =
    rdo.signature?.signedByName || (rdo.status === 'aprovado' ? rdo.authorName : '—');
  const signedAtFormatted = rdo.signature?.signedAt
    ? formatReportTimestampBr(rdo.signature.signedAt)
    : '';

  const shifts: { key: Shift; label: string; cardBg: string; iconBg: string; accent: string; subColor: string }[] = [
    {
      key: 'manha',
      label: 'MANHÃ',
      cardBg: '#FFFBEB',
      iconBg: '#FFFFFF',
      accent: '#B45309',
      subColor: '#92400E',
    },
    {
      key: 'tarde',
      label: 'TARDE',
      cardBg: '#FFF7ED',
      iconBg: '#FFFFFF',
      accent: '#C2410C',
      subColor: '#9A3412',
    },
    {
      key: 'noite',
      label: 'NOITE',
      cardBg: '#EEF2F6',
      iconBg: '#FFFFFF',
      accent: '#0B2240',
      subColor: '#5B6B80',
    },
  ];

  const weatherMap = new Map<Shift, WeatherEntry>();
  (rdo.weather || []).forEach((w) => {
    if (w && w.shift) weatherMap.set(w.shift, w);
  });

  const weatherCardsHtml = shifts
    .map((s) => {
      const entry = weatherMap.get(s.key);
      const conditionText = entry?.condition ? escapeHtml(entry.condition) : '—';
      const practicalText = entry
        ? entry.practical === false
          ? 'Impraticável'
          : 'Praticável'
        : '—';
      const stoppageInfo =
        entry && (entry.stoppageHours ?? 0) > 0
          ? `<div class="weather-impact">Paralisação: ${escapeHtml(entry.stoppageHours)}h${
              entry.impact ? ` · ${escapeHtml(entry.impact)}` : ''
            }</div>`
          : '';

      return `
        <div class="weather-card" style="background-color: ${s.cardBg};">
          <div class="weather-icon-circle" style="background-color: ${s.iconBg}; color: ${s.accent};">
            ${getWeatherShiftSvg(s.key, entry?.condition)}
          </div>
          <div class="weather-info">
            <div class="weather-shift" style="color: ${s.accent};">${s.label}</div>
            <div class="weather-cond" style="color: ${s.accent};">${conditionText}</div>
            <div class="weather-prac" style="color: ${s.subColor};">${practicalText}</div>
            ${stoppageInfo}
          </div>
        </div>
      `;
    })
    .join('');

  const laborRowsHtml =
    (rdo.labor || []).length === 0
      ? `<tr><td colspan="7" class="empty-cell">Nenhum efetivo de mão de obra registrado.</td></tr>`
      : (rdo.labor || [])
          .map((l) => {
            const vinculo = l.isContractor ? 'Terceirizado' : 'Próprio';
            const nome = l.name ? escapeHtml(l.name) : '—';
            const entrada = l.horaInicio ? escapeHtml(l.horaInicio) : '—';
            const saida = l.horaFim ? escapeHtml(l.horaFim) : '—';
            const duracao = `${l.hours}h (${l.quantity * l.hours} Hh)`;
            return `
              <tr>
                <td class="td-strong">${escapeHtml(l.role)}</td>
                <td>${nome}</td>
                <td>${vinculo}</td>
                <td class="td-center"><span class="qty-badge">${escapeHtml(l.quantity)}</span></td>
                <td class="td-center">${entrada}</td>
                <td class="td-center">${saida}</td>
                <td class="td-center">${escapeHtml(duracao)}</td>
              </tr>
            `;
          })
          .join('');

  const equipmentRowsHtml =
    (rdo.equipment || []).length === 0
      ? `<tr><td colspan="7" class="empty-cell">Nenhum equipamento registrado no canteiro.</td></tr>`
      : (rdo.equipment || [])
          .map((e) => {
            const brandCode = [e.brand, e.code ? `[${e.code}]` : ''].filter(Boolean).join(' ');
            const vinculo = e.isRented ? 'Locado' : 'Próprio';
            const qty = e.quantity ?? 1;
            const entrada = e.horaInicio ? escapeHtml(e.horaInicio) : '—';
            const saida = e.horaFim ? escapeHtml(e.horaFim) : '—';
            const horasDesc = `${e.activeHours}h ativas${
              e.idleHours > 0 ? ` / ${e.idleHours}h paradas` : ''
            }`;
            const obsParts = [
              e.observations,
              e.idleHours > 0 && e.idleJustification
                ? `Inatividade: ${e.idleJustification}`
                : '',
            ].filter(Boolean);
            const obsText = obsParts.length > 0 ? escapeHtml(obsParts.join(' · ')) : '—';

            return `
              <tr>
                <td>
                  <div class="td-strong">${escapeHtml(e.name)}</div>
                  ${brandCode ? `<div class="td-sub">${escapeHtml(brandCode)}</div>` : ''}
                </td>
                <td>${vinculo}</td>
                <td class="td-center"><span class="qty-badge">${escapeHtml(qty)}</span></td>
                <td class="td-center">${entrada}</td>
                <td class="td-center">${saida}</td>
                <td class="td-center">${escapeHtml(horasDesc)}</td>
                <td>${obsText}</td>
              </tr>
            `;
          })
          .join('');

  const activityRowsHtml =
    (rdo.activities || []).length === 0
      ? `<tr><td colspan="5" class="empty-cell">Nenhuma atividade registrada.</td></tr>`
      : (rdo.activities || [])
          .map((a) => {
            const badge = getActivityStatusBadgeMeta(a.status);
            const hasProgress = typeof a.progress === 'number' && a.progress > 0;
            const pct = Math.min(100, Math.max(0, Number(a.progress ?? 0)));
            const progressHtml = hasProgress
              ? `
                <div class="progress-cell">
                  <span class="progress-label">${pct}%</span>
                  <div class="progress-track">
                    <div class="progress-fill" style="width: ${pct}%; background-color: ${badge.barColor};"></div>
                  </div>
                </div>
              `
              : '—';

            return `
              <tr>
                <td class="td-strong">${escapeHtml(a.description)}</td>
                <td>${escapeHtml(a.location || '—')}</td>
                <td class="td-center">${escapeHtml(a.quantity)} ${escapeHtml(a.unit)}</td>
                <td>${progressHtml}</td>
                <td>
                  <span class="status-pill" style="background-color: ${badge.bg}; color: ${badge.color};">
                    <span class="status-dot" style="background-color: ${badge.dot};"></span>
                    ${badge.label}
                  </span>
                </td>
              </tr>
            `;
          })
          .join('');

  const occurrenceRowsHtml =
    (rdo.occurrences || []).length === 0
      ? `<tr><td colspan="4" class="empty-cell">Nenhuma ocorrência ou DDS registrado.</td></tr>`
      : (rdo.occurrences || [])
          .map((o) => {
            const badge = getOccurrenceBadgeMeta(o.type);
            const inicio = o.horaInicio ? escapeHtml(o.horaInicio) : '—';
            const termino = o.horaFim ? escapeHtml(o.horaFim) : '—';
            return `
              <tr>
                <td style="width: 28%;">
                  <span class="occ-pill" style="background-color: ${badge.bg}; color: ${badge.color};">
                    <span class="status-dot" style="background-color: ${badge.dot};"></span>
                    ${escapeHtml(badge.label)}
                  </span>
                </td>
                <td class="td-strong" style="font-weight: 500;">${escapeHtml(o.description)}</td>
                <td class="td-center" style="width: 12%;">${inicio}</td>
                <td class="td-center" style="width: 12%;">${termino}</td>
              </tr>
            `;
          })
          .join('');

  const allNotes: { author?: string; text: string }[] = [];
  if (rdo.returnReason) {
    allNotes.push({ author: 'Motivo de Devolução', text: rdo.returnReason });
  }
  (rdo.comments || []).forEach((c) => {
    allNotes.push({ author: `${c.authorName} (${c.section})`, text: c.text });
  });

  const observationsSectionHtml =
    allNotes.length > 0
      ? `
        <div class="section-block">
          <div class="section-header-row">
            <div class="section-title">
              <span class="section-bullet"></span>
              OBSERVAÇÕES & APONTAMENTOS TÉCNICOS
            </div>
            <div class="section-summary">
              <strong>${allNotes.length} ${allNotes.length === 1 ? 'nota' : 'notas'}</strong>
            </div>
          </div>
          ${allNotes
            .map(
              (n) => `
              <div class="obs-card">
                <span class="obs-quote">“</span>
                <div class="obs-body">
                  ${n.author ? `<div class="obs-author">${escapeHtml(n.author)}</div>` : ''}
                  <div class="obs-text">${escapeHtml(n.text)}</div>
                </div>
              </div>
            `,
            )
            .join('')}
        </div>
      `
      : '';

  const photosGridHtml =
    (rdo.photos || []).length === 0
      ? `<div class="empty-box">Nenhuma foto anexada ao registro fotográfico deste RDO.</div>`
      : `
        <div class="photos-grid">
          ${(rdo.photos || [])
            .map((p, idx) => {
              const photoNum = String(idx + 1).padStart(2, '0');
              const imgUrl = p.watermarkedUri || p.uri || '';
              const takenAt = formatReportTimestampBr(p.takenAt);
              const gpsInfo = p.metadata
                ? `GPS: ${p.metadata.latitude.toFixed(4)}, ${p.metadata.longitude.toFixed(4)}`
                : '';

              return `
                <div class="photo-card">
                  <div class="photo-frame">
                    <span class="photo-num-badge">${photoNum}</span>
                    ${
                      imgUrl
                        ? `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.caption)}" class="photo-img" crossorigin="anonymous" />`
                        : `<div class="photo-placeholder">Registro Fotográfico #${photoNum}</div>`
                    }
                  </div>
                  <div class="photo-meta">
                    <div class="photo-caption">${escapeHtml(p.caption || '—')}</div>
                    <div class="photo-timestamp">
                      ${escapeHtml(takenAt)}${p.author ? ` · ${escapeHtml(p.author)}` : ''}${
                        gpsInfo ? ` · ${escapeHtml(gpsInfo)}` : ''
                      }
                    </div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>StackLab · RDO #${paddedNum} · ${escapeHtml(rdo.workName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #CBD5E1;
      color: #0B2240;
      font-size: 11px;
      line-height: 1.4;
    }

    /* Barra de ferramentas flutuante na visualização Web (oculta na impressão/PDF) */
    .toolbar-no-print {
      position: sticky;
      top: 0;
      z-index: 999;
      background-color: #0B2240;
      color: #FFFFFF;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .toolbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 14px;
    }

    .toolbar-actions {
      display: flex;
      gap: 10px;
    }

    .toolbar-btn {
      background-color: #F97316;
      color: #0B2240;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: opacity 0.15s;
    }

    .toolbar-btn:hover {
      opacity: 0.92;
    }

    .toolbar-btn.secondary {
      background-color: rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }

    .pages-wrapper {
      padding: 24px 0 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      background-color: #FFFFFF;
      padding: 14mm 15mm 18mm;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 30px rgba(11, 34, 64, 0.15);
      page-break-after: always;
      break-after: page;
    }

    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .page-content {
      flex: 1;
    }

    /* Cabeçalho Principal StackLab */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 12px;
      border-bottom: 1px solid #E2E8F0;
      margin-bottom: 14px;
    }

    .brand-logo-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-squircle {
      width: 38px;
      height: 38px;
      border-radius: 9px;
      background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(249, 115, 22, 0.28);
    }

    .brand-wordmark {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0B2240;
    }

    .brand-wordmark span {
      color: #F97316;
    }

    .header-right {
      text-align: right;
    }

    .header-overline {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.4px;
      color: #5B6B80;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .header-rdo-title {
      font-size: 22px;
      font-weight: 800;
      color: #0B2240;
      letter-spacing: -0.5px;
      line-height: 1.15;
    }

    .header-rdo-title .rdo-num {
      color: #F97316;
    }

    .header-rdo-date {
      font-size: 11px;
      color: #5B6B80;
      font-weight: 500;
      margin-top: 2px;
    }

    /* Linha da Obra e Status */
    .work-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .work-name {
      font-size: 19px;
      font-weight: 800;
      color: #0B2240;
      line-height: 1.2;
    }

    .work-address {
      font-size: 11.5px;
      color: #5B6B80;
      margin-top: 2px;
    }

    .top-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.4px;
      border: 1px solid transparent;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }

    /* Card de Identificação com Barra Lateral StackLab */
    .meta-summary-card {
      background-color: #EEF2F6;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      align-items: stretch;
      gap: 14px;
      margin-bottom: 18px;
    }

    .meta-accent-bar {
      width: 4px;
      border-radius: 4px;
      background-color: #F97316;
      flex-shrink: 0;
    }

    .meta-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .meta-item-label {
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.9px;
      color: #5B6B80;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .meta-item-value {
      font-size: 12px;
      font-weight: 700;
      color: #0B2240;
    }

    /* Seções */
    .section-block {
      margin-bottom: 16px;
    }

    .section-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.9px;
      color: #0B2240;
      text-transform: uppercase;
    }

    .section-bullet {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #F97316;
      display: inline-block;
    }

    .section-summary {
      font-size: 10.5px;
      color: #5B6B80;
    }

    .section-summary strong {
      color: #0B2240;
      font-weight: 700;
    }

    /* Condições Climáticas (3 cards) */
    .weather-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .weather-card {
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid rgba(11, 34, 64, 0.06);
    }

    .weather-icon-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }

    .weather-info {
      flex: 1;
      min-width: 0;
    }

    .weather-shift {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    .weather-cond {
      font-size: 13px;
      font-weight: 800;
      line-height: 1.2;
      margin: 1px 0;
    }

    .weather-prac {
      font-size: 10.5px;
      font-weight: 500;
    }

    .weather-impact {
      font-size: 9.5px;
      color: #B91C1C;
      font-weight: 600;
      margin-top: 2px;
    }

    /* Tabelas Padronizadas StackLab */
    .table-card {
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      overflow: hidden;
      background-color: #FFFFFF;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead tr {
      background-color: #EEF2F6;
      border-bottom: 1px solid #E2E8F0;
    }

    th {
      text-align: left;
      padding: 7px 10px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #5B6B80;
      text-transform: uppercase;
    }

    th.th-center,
    td.td-center {
      text-align: center;
    }

    tbody tr {
      border-bottom: 1px solid #F1F5F9;
    }

    tbody tr:last-child {
      border-bottom: none;
    }

    td {
      padding: 8px 10px;
      font-size: 11px;
      color: #5B6B80;
      vertical-align: middle;
    }

    td.td-strong,
    .td-strong {
      color: #0B2240;
      font-weight: 600;
    }

    .td-sub {
      font-size: 9.5px;
      color: #5B6B80;
      margin-top: 1px;
    }

    .empty-cell {
      text-align: center;
      color: #5B6B80;
      font-style: italic;
      padding: 12px;
    }

    .qty-badge {
      display: inline-block;
      min-width: 24px;
      padding: 2px 7px;
      border-radius: 6px;
      background-color: #EEF2F6;
      color: #0B2240;
      font-weight: 700;
      font-size: 11px;
      text-align: center;
    }

    /* Progresso & Status */
    .progress-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 72px;
    }

    .progress-label {
      font-size: 10px;
      font-weight: 700;
      color: #0B2240;
    }

    .progress-track {
      width: 100%;
      height: 5px;
      background-color: #E2E8F0;
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 999px;
    }

    .status-pill,
    .occ-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    /* Observações */
    .obs-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
    }

    .obs-quote {
      font-size: 26px;
      line-height: 1;
      font-weight: 800;
      color: #F97316;
      font-family: Georgia, serif;
    }

    .obs-author {
      font-size: 9.5px;
      font-weight: 700;
      color: #0B2240;
      margin-bottom: 2px;
    }

    .obs-text {
      font-size: 11px;
      color: #0B2240;
    }

    /* Registro Fotográfico */
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .photo-card {
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      overflow: hidden;
      background-color: #FFFFFF;
    }

    .photo-frame {
      position: relative;
      width: 100%;
      height: 220px;
      background-color: #EEF2F6;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .photo-num-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background-color: #0B2240;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 999px;
      z-index: 2;
    }

    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-placeholder {
      color: #5B6B80;
      font-size: 11px;
      font-weight: 600;
    }

    .photo-meta {
      padding: 10px 12px;
      border-top: 1px solid #F1F5F9;
    }

    .photo-caption {
      font-size: 11px;
      font-weight: 600;
      color: #0B2240;
      margin-bottom: 3px;
    }

    .photo-timestamp {
      font-size: 9.5px;
      color: #5B6B80;
    }

    .empty-box {
      border: 1px dashed #CBD5E1;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      color: #5B6B80;
      font-size: 11px;
    }

    /* Assinaturas */
    .signatures-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 36px;
      margin-top: 36px;
      margin-bottom: 20px;
      padding: 0 12px;
    }

    .signature-col {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
    }

    .signature-cursive {
      font-family: 'Caveat', cursive;
      font-size: 26px;
      color: #0B2240;
      min-height: 34px;
      margin-bottom: 4px;
    }

    .signature-line {
      width: 100%;
      height: 1px;
      background-color: #0B2240;
      margin-bottom: 6px;
    }

    .signature-name {
      font-size: 12px;
      font-weight: 700;
      color: #0B2240;
    }

    .signature-role {
      font-size: 10.5px;
      color: #5B6B80;
      margin-top: 1px;
    }

    .signature-stamp {
      font-size: 9.5px;
      color: #5B6B80;
      margin-top: 2px;
    }

    /* Rodapé Padrão StackLab */
    .page-footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 10px;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #5B6B80;
    }

    .footer-left strong {
      color: #0B2240;
      font-weight: 700;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-badge {
      background-color: #0B2240;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 9.5px;
      padding: 3px 10px;
      border-radius: 999px;
    }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    @media print {
      body {
        background-color: #FFFFFF;
      }
      .toolbar-no-print {
        display: none !important;
      }
      .pages-wrapper {
        padding: 0;
        gap: 0;
      }
      .page {
        box-shadow: none;
        margin: 0;
        width: 210mm;
        min-height: 297mm;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar-no-print">
    <div class="toolbar-brand">
      <span>StackLab · Relatório Diário de Obra (RDO #${paddedNum})</span>
    </div>
    <div class="toolbar-actions">
      <button class="toolbar-btn" onclick="window.print()">
        🖨️ Baixar / Salvar como PDF
      </button>
      <button class="toolbar-btn secondary" onclick="window.close()">
        Fechar
      </button>
    </div>
  </div>

  <div class="pages-wrapper" id="rdo-pdf-root">
    <!-- =================================================================== -->
    <!-- PÁGINA 1: IDENTIFICAÇÃO, CLIMA, EFETIVO, EQUIPAMENTOS, ATIVIDADES   -->
    <!-- =================================================================== -->
    <div class="page">
      <div class="page-content">
        <!-- Cabeçalho StackLab -->
        <div class="report-header">
          <div class="brand-logo-group">
            <div class="brand-squircle">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                <rect x="15" y="14" width="21" height="4" rx="2" fill="#FFFFFF"/>
                <rect x="12" y="22" width="21" height="4" rx="2" fill="#FFFFFF"/>
                <rect x="9" y="30" width="21" height="4" rx="2" fill="#FFFFFF"/>
              </svg>
            </div>
            <div class="brand-wordmark">Stack<span>Lab</span></div>
          </div>

          <div class="header-right">
            <div class="header-overline">RELATÓRIO DIÁRIO DE OBRA</div>
            <div class="header-rdo-title">
              RDO <span class="rdo-num">#${paddedNum}</span>${rdo.version > 1 ? ` <small style="font-size:13px;color:#5B6B80;">(v${rdo.version})</small>` : ''}
            </div>
            <div class="header-rdo-date">${escapeHtml(dateWithWeekday)}</div>
          </div>
        </div>

        <!-- Obra + Badge de Status -->
        <div class="work-title-row">
          <div>
            <div class="work-name">${escapeHtml(rdo.workName)}</div>
            <div class="work-address">${escapeHtml(workAddress)}</div>
          </div>
          <div
            class="top-status-pill"
            style="background-color: ${statusMeta.bg}; border-color: ${statusMeta.border}; color: ${statusMeta.color};"
          >
            <span class="status-dot" style="background-color: ${statusMeta.dot};"></span>
            ${statusMeta.label}
          </div>
        </div>

        <!-- Quadro Resumo de Identificação -->
        <div class="meta-summary-card">
          <div class="meta-accent-bar"></div>
          <div class="meta-grid">
            <div>
              <div class="meta-item-label">CONSTRUTORA / CLIENTE</div>
              <div class="meta-item-value">${escapeHtml(contractorName)}</div>
            </div>
            <div>
              <div class="meta-item-label">DATA</div>
              <div class="meta-item-value">${escapeHtml(formattedDate)}</div>
            </div>
            <div>
              <div class="meta-item-label">REALIZADO POR</div>
              <div class="meta-item-value">${escapeHtml(rdo.authorName)}</div>
            </div>
            <div>
              <div class="meta-item-label">APROVADO POR</div>
              <div class="meta-item-value">${escapeHtml(approverName)}</div>
            </div>
          </div>
        </div>

        <!-- 1. CONDIÇÕES CLIMÁTICAS -->
        <div class="section-block">
          <div class="section-header-row">
            <div class="section-title">
              <span class="section-bullet"></span>
              CONDIÇÕES CLIMÁTICAS
            </div>
          </div>
          <div class="weather-grid">
            ${weatherCardsHtml}
          </div>
        </div>

        <!-- 2. MÃO DE OBRA & EFETIVOS -->
        <div class="section-block">
          <div class="section-header-row">
            <div class="section-title">
              <span class="section-bullet"></span>
              MÃO DE OBRA & EFETIVOS
            </div>
            <div class="section-summary">
              <strong>${headcount} ${headcount === 1 ? 'pessoa' : 'pessoas'}</strong> · ${totalRoles} ${
                totalRoles === 1 ? 'função' : 'funções'
              } · ${manHours} Hh
            </div>
          </div>
          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th>FUNÇÃO</th>
                  <th>NOME</th>
                  <th>VÍNCULO</th>
                  <th class="th-center">QTD</th>
                  <th class="th-center">ENTRADA</th>
                  <th class="th-center">SAÍDA</th>
                  <th class="th-center">DURAÇÃO</th>
                </tr>
              </thead>
              <tbody>
                ${laborRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. EQUIPAMENTOS PRESENTES -->
        <div class="section-block">
          <div class="section-header-row">
            <div class="section-title">
              <span class="section-bullet"></span>
              EQUIPAMENTOS PRESENTES
            </div>
            <div class="section-summary">
              <strong>${totalEquipTypes} ${totalEquipTypes === 1 ? 'tipo' : 'tipos'}</strong> · ${totalEquipUnits} ${
                totalEquipUnits === 1 ? 'unidade' : 'unidades'
              }
            </div>
          </div>
          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th>EQUIPAMENTO</th>
                  <th>VÍNCULO</th>
                  <th class="th-center">QTD</th>
                  <th class="th-center">ENTRADA</th>
                  <th class="th-center">SAÍDA</th>
                  <th class="th-center">HORAS</th>
                  <th>OBSERVAÇÕES</th>
                </tr>
              </thead>
              <tbody>
                ${equipmentRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. ATIVIDADES EXECUTADAS -->
        <div class="section-block">
          <div class="section-header-row">
            <div class="section-title">
              <span class="section-bullet"></span>
              ATIVIDADES EXECUTADAS
            </div>
            <div class="section-summary">
              <strong>${totalActivities} ${totalActivities === 1 ? 'frente' : 'frentes'}</strong> · ${completedActivities} ${
                completedActivities === 1 ? 'concluída' : 'concluídas'
              }
            </div>
          </div>
          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th>DESCRIÇÃO</th>
                  <th>LOCAL / PAVIMENTO</th>
                  <th class="th-center">QTD / UNID.</th>
                  <th>PROGRESSO</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${activityRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 5. OCORRÊNCIAS & DDS -->
        <div class="section-block">
          <div class="section-header-row">
            <div class="section-title">
              <span class="section-bullet"></span>
              OCORRÊNCIAS & DDS
            </div>
            <div class="section-summary">
              <strong>${totalOccurrences} ${totalOccurrences === 1 ? 'ocorrência' : 'ocorrências'}</strong>
            </div>
          </div>
          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th>CATEGORIA</th>
                  <th>DESCRIÇÃO / TEMA DO DDS</th>
                  <th class="th-center">INÍCIO</th>
                  <th class="th-center">TÉRMINO</th>
                </tr>
              </thead>
              <tbody>
                ${occurrenceRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Rodapé Página 1 -->
      <div class="page-footer">
        <div class="footer-left">
          <strong>StackLab</strong> · RDO #${paddedNum} · ${escapeHtml(rdo.workName)}
        </div>
        <div class="footer-right">
          <span>Gerado em ${escapeHtml(generatedAt)}</span>
          <span class="page-badge">1 / 2</span>
        </div>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- PÁGINA 2: OBSERVAÇÕES, FOTOS DA OBRA E ASSINATURAS                  -->
    <!-- =================================================================== -->
    <div class="page">
      <div class="page-content">
        ${observationsSectionHtml}

        <!-- 6. FOTOS DA OBRA (REGISTRO FOTOGRÁFICO) -->
        <div class="section-block">
          <div class="section-header-row">
            <div class="section-title">
              <span class="section-bullet"></span>
              FOTOS DA OBRA · REGISTRO FOTOGRÁFICO
            </div>
            <div class="section-summary">
              <strong>${totalPhotos} ${totalPhotos === 1 ? 'foto' : 'fotos'}</strong>
            </div>
          </div>
          ${photosGridHtml}
        </div>

        <!-- BLOCO DE ASSINATURAS -->
        <div class="signatures-row">
          <div class="signature-col">
            <div class="signature-cursive">${escapeHtml(rdo.authorName)}</div>
            <div class="signature-line"></div>
            <div class="signature-name">${escapeHtml(rdo.authorName)}</div>
            <div class="signature-role">Realizado por</div>
          </div>

          <div class="signature-col">
            <div class="signature-cursive">
              ${rdo.status === 'aprovado' ? escapeHtml(approverName) : ''}
            </div>
            <div class="signature-line"></div>
            <div class="signature-name">${escapeHtml(approverName)}</div>
            <div class="signature-role">Aprovado por</div>
            ${
              signedAtFormatted
                ? `<div class="signature-stamp">em ${escapeHtml(signedAtFormatted)}${
                    rdo.signature?.hash ? ` · Hash: ${escapeHtml(rdo.signature.hash)}` : ''
                  }</div>`
                : ''
            }
          </div>
        </div>
      </div>

      <!-- Rodapé Página 2 -->
      <div class="page-footer">
        <div class="footer-left">
          <strong>StackLab</strong> · RDO #${paddedNum} · ${escapeHtml(rdo.workName)}
        </div>
        <div class="footer-right">
          <span>Gerado em ${escapeHtml(generatedAt)}</span>
          <span class="page-badge">2 / 2</span>
        </div>
      </div>
    </div>
  </div>
  ${
    options?.autoPrint
      ? `<script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              try { window.print(); } catch (e) {}
            }, 350);
          });
        </script>`
      : ''
  }
</body>
</html>`;
};

/**
 * Gera conteúdo CSV analítico completo com os 6 blocos do RDO StackLab.
 */
export const generateRdoCsv = (rdo: RDO, work?: Partial<Work> | null): string => {
  const lines: string[] = [];
  const paddedNum = formatRdoNumberPadded(rdo.number);
  lines.push(`"STACKLAB - RELATÓRIO DIÁRIO DE OBRA";"RDO #${paddedNum} (v${rdo.version})"`);
  lines.push(`"Obra";"${rdo.workName}";"Endereço";"${work?.address || work?.subtitle || ''}"`);
  lines.push(`"Data";"${formatReportDateBr(rdo.date)}";"Status";"${rdo.status.toUpperCase()}"`);
  lines.push(
    `"Realizado por";"${rdo.authorName}";"Aprovado por";"${rdo.signature?.signedByName || '—'}"`,
  );
  lines.push('');

  lines.push('"1. CONDIÇÕES CLIMÁTICAS"');
  lines.push('"Turno";"Condição";"Praticável";"Horas Paradas";"Impacto"');
  (rdo.weather || []).forEach((w) => {
    lines.push(
      `"${w.shift}";"${w.condition}";"${w.practical === false ? 'Impraticável' : 'Praticável'}";"${
        w.stoppageHours ?? 0
      }";"${w.impact || ''}"`,
    );
  });
  lines.push('');

  lines.push('"2. MÃO DE OBRA E EFETIVOS"');
  lines.push('"Função";"Nome";"Vínculo";"Qtd";"Entrada";"Saída";"Duração (h)";"Homem-Hora (Hh)"');
  (rdo.labor || []).forEach((l) => {
    lines.push(
      `"${l.role}";"${l.name || '—'}";"${
        l.isContractor ? 'Terceirizado' : 'Próprio'
      }";"${l.quantity}";"${l.horaInicio || '—'}";"${l.horaFim || '—'}";"${l.hours}";"${
        l.quantity * l.hours
      }"`,
    );
  });
  lines.push('');

  lines.push('"3. EQUIPAMENTOS PRESENTES"');
  lines.push(
    '"Equipamento";"Marca";"Código";"Vínculo";"Qtd";"Entrada";"Saída";"Horas Ativas";"Horas Ociosas";"Observações"',
  );
  (rdo.equipment || []).forEach((e) => {
    lines.push(
      `"${e.name}";"${e.brand || ''}";"${e.code || ''}";"${
        e.isRented ? 'Locado' : 'Próprio'
      }";"${e.quantity ?? 1}";"${e.horaInicio || '—'}";"${e.horaFim || '—'}";"${
        e.activeHours
      }";"${e.idleHours}";"${e.observations || e.idleJustification || ''}"`,
    );
  });
  lines.push('');

  lines.push('"4. ATIVIDADES EXECUTADAS"');
  lines.push('"Descrição";"Local / Pavimento";"Quantidade";"Unidade";"Progresso (%)";"Status"');
  (rdo.activities || []).forEach((a) => {
    lines.push(
      `"${a.description}";"${a.location || ''}";"${a.quantity}";"${a.unit}";"${
        a.progress ?? 0
      }%";"${a.status || 'Em andamento'}"`,
    );
  });
  lines.push('');

  lines.push('"5. OCORRÊNCIAS E DDS"');
  lines.push('"Categoria";"Descrição";"Início";"Término"');
  (rdo.occurrences || []).forEach((o) => {
    lines.push(
      `"${o.type.toUpperCase()}";"${o.description}";"${o.horaInicio || '—'}";"${
        o.horaFim || '—'
      }"`,
    );
  });
  lines.push('');

  lines.push('"6. FOTOS DA OBRA"');
  lines.push('"#";"Legenda";"Data/Hora";"Autor";"URL"');
  (rdo.photos || []).forEach((p, idx) => {
    lines.push(
      `"${idx + 1}";"${p.caption}";"${p.takenAt}";"${p.author}";"${p.watermarkedUri || p.uri || ''}"`,
    );
  });

  return '\uFEFF' + lines.join('\n');
};

/**
 * Em ambiente Web, abre a janela de impressão/salvamento oficial em PDF
 * com o template do RDO no padrão StackLab.
 */
export const triggerWebPdfDownload = (rdo: RDO, work?: Partial<Work> | null): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const html = generateRdoReportHtml(rdo, work, { autoPrint: true });
    const printWin = window.open('', '_blank');
    if (printWin && printWin.document) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      return true;
    }

    // Fallback caso pop-up seja bloqueado: iframe invisível para acionar o diálogo nativo de PDF
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 450);
      return true;
    }
  } catch (err) {
    console.warn('Falha ao abrir janela de impressão do PDF:', err);
  }
  return false;
};

/**
 * Em ambiente Web, faz download direto da planilha CSV analítica do RDO.
 */
export const triggerWebCsvDownload = (rdo: RDO, work?: Partial<Work> | null): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const csvContent = generateRdoCsv(rdo, work);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const paddedNum = formatRdoNumberPadded(rdo.number);
    link.href = url;
    link.setAttribute('download', `StackLab_RDO_${paddedNum}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.warn('Falha ao baixar CSV:', err);
    return false;
  }
};
