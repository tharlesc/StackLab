import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  X,
  Download,
  Printer,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Moon,
  Camera,
} from 'lucide-react-native';
import type { RDO, Shift, WeatherEntry, Work } from '@/types';
import { calcHeadcount, calcManHours } from '@/utils/rdo';
import {
  formatRdoNumberPadded,
  formatReportDateBr,
  formatReportDateWithWeekday,
  formatReportTimestampBr,
  triggerWebPdfDownload,
} from '@/utils/rdoPdfTemplate';

export interface RdoPdfPreviewModalProps {
  visible: boolean;
  rdo: RDO;
  work?: Partial<Work> | null;
  onClose: () => void;
}

const getStatusBadgeColors = (status: RDO['status']) => {
  switch (status) {
    case 'aprovado':
      return { label: 'APROVADO', bg: '#ECFDF5', border: '#A7F3D0', text: '#047857', dot: '#10B981' };
    case 'submetido':
      return { label: 'EM ANÁLISE', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B' };
    case 'devolvido':
      return { label: 'DEVOLVIDO', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', dot: '#EF4444' };
    case 'rascunho':
    default:
      return { label: 'RASCUNHO', bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', dot: '#3B82F6' };
  }
};

const getActivityStatusColors = (status?: string) => {
  const norm = (status || 'Em andamento').toLowerCase();
  if (norm.includes('conclu')) {
    return { label: 'CONCLUÍDA', bg: '#ECFDF5', text: '#047857', dot: '#10B981', bar: '#10B981' };
  }
  if (norm.includes('paralis')) {
    return { label: 'PARALISADA', bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444', bar: '#EF4444' };
  }
  if (norm.includes('iniciad')) {
    return { label: 'INICIADA', bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6', bar: '#F97316' };
  }
  return { label: 'EM ANDAMENTO', bg: '#FFF7ED', text: '#C2410C', dot: '#F97316', bar: '#F97316' };
};

const getOccurrenceBadgeColors = (type: string) => {
  const norm = (type || 'outro').toLowerCase();
  switch (norm) {
    case 'dds':
      return { label: 'DDS · DIÁLOGO DE SEGURANÇA', bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' };
    case 'acidente':
      return { label: 'ACIDENTE', bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' };
    case 'paralisacao':
      return { label: 'PARALISAÇÃO', bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' };
    case 'interferencia':
      return { label: 'INTERFERÊNCIA', bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' };
    case 'pendencia':
      return { label: 'PENDÊNCIA', bg: '#FEF3C7', text: '#92400E', dot: '#D97706' };
    default:
      return { label: (type || 'OUTRO').toUpperCase(), bg: '#EEF2F6', text: '#0B2240', dot: '#5B6B80' };
  }
};

const renderShiftWeatherIcon = (shift: Shift, condition?: string, color = '#B45309') => {
  const cond = (condition || '').toLowerCase();
  if (cond.includes('chuv')) return <CloudRain size={16} color={color} />;
  if (cond.includes('nublad')) return <Cloud size={16} color={color} />;
  if (cond.includes('inst')) return <CloudLightning size={16} color={color} />;
  if (shift === 'noite') return <Moon size={16} color={color} />;
  return <Sun size={16} color={color} />;
};

export const RdoPdfPreviewModal: React.FC<RdoPdfPreviewModalProps> = ({
  visible,
  rdo,
  work,
  onClose,
}) => {
  const paddedNum = formatRdoNumberPadded(rdo.number);
  const statusMeta = getStatusBadgeColors(rdo.status);
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

  const contractorName = work?.client || rdo.workName || 'StackLab Engenharia';
  const workAddress = work?.address || work?.subtitle || 'Canteiro de Obras StackLab';
  const approverName =
    rdo.signature?.signedByName || (rdo.status === 'aprovado' ? rdo.authorName : '—');
  const signedAtFormatted = rdo.signature?.signedAt
    ? formatReportTimestampBr(rdo.signature.signedAt)
    : '';

  const weatherMap = new Map<Shift, WeatherEntry>();
  (rdo.weather || []).forEach((w) => {
    if (w && w.shift) weatherMap.set(w.shift, w);
  });

  const shiftMeta: {
    key: Shift;
    label: string;
    bg: string;
    accent: string;
    sub: string;
  }[] = [
    { key: 'manha', label: 'MANHÃ', bg: '#FFFBEB', accent: '#B45309', sub: '#92400E' },
    { key: 'tarde', label: 'TARDE', bg: '#FFF7ED', accent: '#C2410C', sub: '#9A3412' },
    { key: 'noite', label: 'NOITE', bg: '#EEF2F6', accent: '#0B2240', sub: '#5B6B80' },
  ];

  const allNotes: { author?: string; text: string }[] = [];
  if (rdo.returnReason) {
    allNotes.push({ author: 'Motivo de Devolução', text: rdo.returnReason });
  }
  (rdo.comments || []).forEach((c) => {
    allNotes.push({ author: `${c.authorName} (${c.section})`, text: c.text });
  });

  const handleDownloadPdf = () => {
    if (Platform.OS === 'web') {
      triggerWebPdfDownload(rdo, work);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* Top Action Bar in StackLab Deep Navy */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.miniSquircle}>
              <View style={[styles.miniBar, { marginLeft: 4 }]} />
              <View style={styles.miniBar} />
              <View style={[styles.miniBar, { marginRight: 4 }]} />
            </View>
            <View>
              <Text style={styles.topBarTitle}>Relatório Oficial RDO #{paddedNum}</Text>
              <Text style={styles.topBarSub}>Padrão Executivo StackLab · 2 Páginas</Text>
            </View>
          </View>

          <View style={styles.topBarActions}>
            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={handleDownloadPdf}
                accessibilityRole="button"
                accessibilityLabel="Baixar ou imprimir PDF Oficial"
              >
                <Printer size={15} color="#0B2240" />
                <Text style={styles.downloadBtnText}>Baixar PDF</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar visualização do PDF"
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* =============================================================== */}
          {/* PÁGINA 1 DO RELATÓRIO RDO STACKLAB                              */}
          {/* =============================================================== */}
          <View style={styles.pageSheet}>
            {/* Cabeçalho StackLab */}
            <View style={styles.reportHeader}>
              <View style={styles.brandGroup}>
                <View style={styles.brandSquircle}>
                  <View style={[styles.logoStepBar, { marginLeft: 6 }]} />
                  <View style={styles.logoStepBar} />
                  <View style={[styles.logoStepBar, { marginRight: 6 }]} />
                </View>
                <Text style={styles.brandWordmark}>
                  Stack<Text style={styles.brandWordmarkAccent}>Lab</Text>
                </Text>
              </View>

              <View style={styles.headerRight}>
                <Text style={styles.headerOverline}>RELATÓRIO DIÁRIO DE OBRA</Text>
                <Text style={styles.headerRdoTitle}>
                  RDO <Text style={styles.headerRdoNum}>#{paddedNum}</Text>
                </Text>
                <Text style={styles.headerRdoDate}>{dateWithWeekday}</Text>
              </View>
            </View>

            {/* Obra + Status Pill */}
            <View style={styles.workTitleRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.workName}>{rdo.workName}</Text>
                <Text style={styles.workAddress}>{workAddress}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: statusMeta.bg,
                    borderColor: statusMeta.border,
                  },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: statusMeta.dot }]} />
                <Text style={[styles.statusPillText, { color: statusMeta.text }]}>
                  {statusMeta.label}
                </Text>
              </View>
            </View>

            {/* Card Resumo de Identificação com Barra Lateral Laranja StackLab */}
            <View style={styles.metaSummaryCard}>
              <View style={styles.metaAccentBar} />
              <View style={styles.metaGrid}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>CONSTRUTORA</Text>
                  <Text style={styles.metaValue} numberOfLines={2}>
                    {contractorName}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>DATA</Text>
                  <Text style={styles.metaValue}>{formattedDate}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>REALIZADO POR</Text>
                  <Text style={styles.metaValue} numberOfLines={2}>
                    {rdo.authorName}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>APROVADO POR</Text>
                  <Text style={styles.metaValue} numberOfLines={2}>
                    {approverName}
                  </Text>
                </View>
              </View>
            </View>

            {/* 1. CONDIÇÕES CLIMÁTICAS */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <View style={styles.sectionBullet} />
                  <Text style={styles.sectionTitleText}>CONDIÇÕES CLIMÁTICAS</Text>
                </View>
              </View>

              <View style={styles.weatherGrid}>
                {shiftMeta.map((s) => {
                  const entry = weatherMap.get(s.key);
                  const condText = entry?.condition || '—';
                  const pracText = entry
                    ? entry.practical === false
                      ? 'Impraticável'
                      : 'Praticável'
                    : '—';
                  return (
                    <View
                      key={s.key}
                      style={[styles.weatherCard, { backgroundColor: s.bg }]}
                    >
                      <View style={styles.weatherIconCircle}>
                        {renderShiftWeatherIcon(s.key, entry?.condition, s.accent)}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.weatherShiftLabel, { color: s.accent }]}>
                          {s.label}
                        </Text>
                        <Text style={[styles.weatherCondText, { color: s.accent }]}>
                          {condText}
                        </Text>
                        <Text style={[styles.weatherPracText, { color: s.sub }]}>
                          {pracText}
                        </Text>
                        {entry && (entry.stoppageHours ?? 0) > 0 && (
                          <Text style={styles.weatherImpactText}>
                            {entry.stoppageHours}h parado
                            {entry.impact ? ` · ${entry.impact}` : ''}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 2. MÃO DE OBRA & EFETIVOS */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <View style={styles.sectionBullet} />
                  <Text style={styles.sectionTitleText}>MÃO DE OBRA & EFETIVOS</Text>
                </View>
                <Text style={styles.sectionSummaryText}>
                  <Text style={styles.sectionSummaryStrong}>
                    {headcount} {headcount === 1 ? 'pessoa' : 'pessoas'}
                  </Text>{' '}
                  · {totalRoles} {totalRoles === 1 ? 'função' : 'funções'} · {manHours} Hh
                </Text>
              </View>

              <View style={styles.tableCard}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { flex: 1.6 }]}>FUNÇÃO</Text>
                  <Text style={[styles.thCell, { flex: 1.3 }]}>NOME</Text>
                  <Text style={[styles.thCell, { flex: 1.2 }]}>VÍNCULO</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 0.7 }]}>QTD</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 0.9 }]}>ENTRADA</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 0.9 }]}>SAÍDA</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 1.2 }]}>DURAÇÃO</Text>
                </View>
                {(rdo.labor || []).length === 0 ? (
                  <Text style={styles.emptyTableText}>Nenhum efetivo registrado.</Text>
                ) : (
                  (rdo.labor || []).map((l, idx) => (
                    <View key={idx} style={styles.tableBodyRow}>
                      <Text style={[styles.tdCellStrong, { flex: 1.6 }]}>{l.role}</Text>
                      <Text style={[styles.tdCell, { flex: 1.3 }]}>{l.name || '—'}</Text>
                      <Text style={[styles.tdCell, { flex: 1.2 }]}>
                        {l.isContractor ? 'Terceirizado' : 'Próprio'}
                      </Text>
                      <View style={[{ flex: 0.7 }, styles.centerBox]}>
                        <View style={styles.qtyBadge}>
                          <Text style={styles.qtyBadgeText}>{l.quantity}</Text>
                        </View>
                      </View>
                      <Text style={[styles.tdCell, styles.textCenter, { flex: 0.9 }]}>
                        {l.horaInicio || '—'}
                      </Text>
                      <Text style={[styles.tdCell, styles.textCenter, { flex: 0.9 }]}>
                        {l.horaFim || '—'}
                      </Text>
                      <Text style={[styles.tdCell, styles.textCenter, { flex: 1.2 }]}>
                        {l.hours}h ({l.quantity * l.hours} Hh)
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* 3. EQUIPAMENTOS PRESENTES */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <View style={styles.sectionBullet} />
                  <Text style={styles.sectionTitleText}>EQUIPAMENTOS PRESENTES</Text>
                </View>
                <Text style={styles.sectionSummaryText}>
                  <Text style={styles.sectionSummaryStrong}>
                    {totalEquipTypes} {totalEquipTypes === 1 ? 'tipo' : 'tipos'}
                  </Text>{' '}
                  · {totalEquipUnits} {totalEquipUnits === 1 ? 'unidade' : 'unidades'}
                </Text>
              </View>

              <View style={styles.tableCard}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { flex: 1.8 }]}>TIPO / MÁQUINA</Text>
                  <Text style={[styles.thCell, { flex: 1 }]}>VÍNCULO</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 0.7 }]}>QTD</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 0.9 }]}>ENTRADA</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 0.9 }]}>SAÍDA</Text>
                  <Text style={[styles.thCell, { flex: 1.8 }]}>OBSERVAÇÕES</Text>
                </View>
                {(rdo.equipment || []).length === 0 ? (
                  <Text style={styles.emptyTableText}>Nenhum equipamento registrado.</Text>
                ) : (
                  (rdo.equipment || []).map((e, idx) => {
                    const sub = [e.brand, e.code ? `[${e.code}]` : ''].filter(Boolean).join(' ');
                    const obs = [
                      `${e.activeHours}h ativas`,
                      e.idleHours > 0 ? `${e.idleHours}h paradas` : '',
                      e.observations,
                      e.idleJustification ? `Motivo: ${e.idleJustification}` : '',
                    ]
                      .filter(Boolean)
                      .join(' · ');

                    return (
                      <View key={idx} style={styles.tableBodyRow}>
                        <View style={{ flex: 1.8, paddingRight: 4 }}>
                          <Text style={styles.tdCellStrong}>{e.name}</Text>
                          {sub ? <Text style={styles.tdSubText}>{sub}</Text> : null}
                        </View>
                        <Text style={[styles.tdCell, { flex: 1 }]}>
                          {e.isRented ? 'Locado' : 'Próprio'}
                        </Text>
                        <View style={[{ flex: 0.7 }, styles.centerBox]}>
                          <View style={styles.qtyBadge}>
                            <Text style={styles.qtyBadgeText}>{e.quantity ?? 1}</Text>
                          </View>
                        </View>
                        <Text style={[styles.tdCell, styles.textCenter, { flex: 0.9 }]}>
                          {e.horaInicio || '—'}
                        </Text>
                        <Text style={[styles.tdCell, styles.textCenter, { flex: 0.9 }]}>
                          {e.horaFim || '—'}
                        </Text>
                        <Text style={[styles.tdCell, { flex: 1.8 }]}>{obs || '—'}</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* 4. ATIVIDADES EXECUTADAS */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <View style={styles.sectionBullet} />
                  <Text style={styles.sectionTitleText}>ATIVIDADES EXECUTADAS</Text>
                </View>
                <Text style={styles.sectionSummaryText}>
                  <Text style={styles.sectionSummaryStrong}>
                    {totalActivities} {totalActivities === 1 ? 'frente' : 'frentes'}
                  </Text>{' '}
                  · {completedActivities} {completedActivities === 1 ? 'concluída' : 'concluídas'}
                </Text>
              </View>

              <View style={styles.tableCard}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { flex: 2.2 }]}>DESCRIÇÃO</Text>
                  <Text style={[styles.thCell, { flex: 1.3 }]}>LOCAL</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 1 }]}>QTD</Text>
                  <Text style={[styles.thCell, { flex: 1.2 }]}>PROGRESSO</Text>
                  <Text style={[styles.thCell, { flex: 1.4 }]}>STATUS</Text>
                </View>
                {(rdo.activities || []).length === 0 ? (
                  <Text style={styles.emptyTableText}>Nenhuma atividade registrada.</Text>
                ) : (
                  (rdo.activities || []).map((a, idx) => {
                    const badge = getActivityStatusColors(a.status);
                    const pct = Math.min(100, Math.max(0, Number(a.progress ?? 0)));
                    return (
                      <View key={idx} style={styles.tableBodyRow}>
                        <Text style={[styles.tdCellStrong, { flex: 2.2, paddingRight: 6 }]}>
                          {a.description}
                        </Text>
                        <Text style={[styles.tdCell, { flex: 1.3 }]}>{a.location || '—'}</Text>
                        <Text style={[styles.tdCell, styles.textCenter, { flex: 1 }]}>
                          {a.quantity} {a.unit}
                        </Text>
                        <View style={{ flex: 1.2, paddingRight: 8 }}>
                          {pct > 0 ? (
                            <>
                              <Text style={styles.progressPctText}>{pct}%</Text>
                              <View style={styles.progressTrack}>
                                <View
                                  style={[
                                    styles.progressFill,
                                    { width: `${pct}%`, backgroundColor: badge.bar },
                                  ]}
                                />
                              </View>
                            </>
                          ) : (
                            <Text style={styles.tdCell}>—</Text>
                          )}
                        </View>
                        <View style={{ flex: 1.4, alignItems: 'flex-start' }}>
                          <View style={[styles.inlineBadge, { backgroundColor: badge.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
                            <Text style={[styles.inlineBadgeText, { color: badge.text }]}>
                              {badge.label}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* 5. OCORRÊNCIAS & DDS */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <View style={styles.sectionBullet} />
                  <Text style={styles.sectionTitleText}>OCORRÊNCIAS & DDS</Text>
                </View>
                <Text style={styles.sectionSummaryText}>
                  <Text style={styles.sectionSummaryStrong}>
                    {totalOccurrences} {totalOccurrences === 1 ? 'ocorrência' : 'ocorrências'}
                  </Text>
                </Text>
              </View>

              <View style={styles.tableCard}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { flex: 1.6 }]}>CATEGORIA</Text>
                  <Text style={[styles.thCell, { flex: 2.4 }]}>DESCRIÇÃO</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 0.9 }]}>INÍCIO</Text>
                  <Text style={[styles.thCell, styles.textCenter, { flex: 0.9 }]}>TÉRMINO</Text>
                </View>
                {(rdo.occurrences || []).length === 0 ? (
                  <Text style={styles.emptyTableText}>Nenhuma ocorrência ou DDS registrado.</Text>
                ) : (
                  (rdo.occurrences || []).map((o, idx) => {
                    const badge = getOccurrenceBadgeColors(o.type);
                    return (
                      <View key={idx} style={styles.tableBodyRow}>
                        <View style={{ flex: 1.6, paddingRight: 6, alignItems: 'flex-start' }}>
                          <View style={[styles.inlineBadge, { backgroundColor: badge.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
                            <Text style={[styles.inlineBadgeText, { color: badge.text }]}>
                              {badge.label}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.tdCellStrong, { flex: 2.4, fontWeight: '500' }]}>
                          {o.description}
                        </Text>
                        <Text style={[styles.tdCell, styles.textCenter, { flex: 0.9 }]}>
                          {o.horaInicio || '—'}
                        </Text>
                        <Text style={[styles.tdCell, styles.textCenter, { flex: 0.9 }]}>
                          {o.horaFim || '—'}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* Rodapé Página 1 */}
            <View style={styles.pageFooter}>
              <Text style={styles.footerLeft}>
                <Text style={styles.footerBrandStrong}>StackLab</Text> · RDO #{paddedNum} ·{' '}
                {rdo.workName}
              </Text>
              <View style={styles.footerRight}>
                <Text style={styles.footerTimestamp}>Gerado em {generatedAt}</Text>
                <View style={styles.pageNumberBadge}>
                  <Text style={styles.pageNumberBadgeText}>1 / 2</Text>
                </View>
              </View>
            </View>
          </View>

          {/* =============================================================== */}
          {/* PÁGINA 2 DO RELATÓRIO RDO STACKLAB                              */}
          {/* =============================================================== */}
          <View style={styles.pageSheet}>
            {/* OBSERVAÇÕES (Se houver notas/comentários) */}
            {allNotes.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleGroup}>
                    <View style={styles.sectionBullet} />
                    <Text style={styles.sectionTitleText}>OBSERVAÇÕES</Text>
                  </View>
                  <Text style={styles.sectionSummaryText}>
                    <Text style={styles.sectionSummaryStrong}>
                      {allNotes.length} {allNotes.length === 1 ? 'nota' : 'notas'}
                    </Text>
                  </Text>
                </View>

                {allNotes.map((note, idx) => (
                  <View key={idx} style={styles.obsCard}>
                    <Text style={styles.obsQuoteMark}>“</Text>
                    <View style={{ flex: 1 }}>
                      {note.author ? (
                        <Text style={styles.obsAuthorText}>{note.author}</Text>
                      ) : null}
                      <Text style={styles.obsBodyText}>{note.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 6. FOTOS DA OBRA · REGISTRO FOTOGRÁFICO */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <View style={styles.sectionBullet} />
                  <Text style={styles.sectionTitleText}>
                    FOTOS DA OBRA · REGISTRO FOTOGRÁFICO
                  </Text>
                </View>
                <Text style={styles.sectionSummaryText}>
                  <Text style={styles.sectionSummaryStrong}>
                    {totalPhotos} {totalPhotos === 1 ? 'foto' : 'fotos'}
                  </Text>
                </Text>
              </View>

              {totalPhotos === 0 ? (
                <View style={styles.emptyPhotosBox}>
                  <Text style={styles.emptyTableText}>
                    Nenhuma foto anexada ao registro fotográfico deste RDO.
                  </Text>
                </View>
              ) : (
                <View style={styles.photosGrid}>
                  {(rdo.photos || []).map((p, idx) => {
                    const numStr = String(idx + 1).padStart(2, '0');
                    const imgUri = p.watermarkedUri || p.uri;
                    const takenFormatted = formatReportTimestampBr(p.takenAt);
                    return (
                      <View key={p.id || idx} style={styles.photoCard}>
                        <View style={styles.photoImageFrame}>
                          <View style={styles.photoNumberPill}>
                            <Text style={styles.photoNumberPillText}>{numStr}</Text>
                          </View>
                          {imgUri ? (
                            <Image
                              source={{ uri: imgUri }}
                              style={styles.photoImg}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.photoFallbackCenter}>
                              <Camera size={32} color="#5B6B80" />
                              <Text style={styles.photoFallbackText}>Foto #{numStr}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.photoMetaBox}>
                          <Text style={styles.photoCaptionText}>{p.caption || '—'}</Text>
                          <Text style={styles.photoTimestampText}>
                            {takenFormatted}
                            {p.author ? ` · ${p.author}` : ''}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* BLOCO DE ASSINATURAS */}
            <View style={styles.signaturesContainer}>
              <View style={styles.signatureCol}>
                <Text style={styles.signatureHandwritten}>{rdo.authorName}</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signaturePersonName}>{rdo.authorName}</Text>
                <Text style={styles.signatureRoleLabel}>Realizado por</Text>
              </View>

              <View style={styles.signatureCol}>
                <Text style={styles.signatureHandwritten}>
                  {rdo.status === 'aprovado' ? approverName : ''}
                </Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signaturePersonName}>{approverName}</Text>
                <Text style={styles.signatureRoleLabel}>Aprovado por</Text>
                {signedAtFormatted ? (
                  <Text style={styles.signatureDateStamp}>em {signedAtFormatted}</Text>
                ) : null}
              </View>
            </View>

            {/* Rodapé Página 2 */}
            <View style={styles.pageFooter}>
              <Text style={styles.footerLeft}>
                <Text style={styles.footerBrandStrong}>StackLab</Text> · RDO #{paddedNum} ·{' '}
                {rdo.workName}
              </Text>
              <View style={styles.footerRight}>
                <Text style={styles.footerTimestamp}>Gerado em {generatedAt}</Text>
                <View style={styles.pageNumberBadge}>
                  <Text style={styles.pageNumberBadgeText}>2 / 2</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#CBD5E1',
  },
  topBar: {
    backgroundColor: '#0B2240',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  miniSquircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  miniBar: {
    width: 14,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  topBarSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  downloadBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadBtnText: {
    color: '#0B2240',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 40,
    gap: 20,
    alignItems: 'center',
  },
  pageSheet: {
    width: '100%',
    maxWidth: 794,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 20,
    shadowColor: '#0B2240',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
    marginBottom: 14,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandSquircle: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3.5,
  },
  logoStepBar: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  brandWordmark: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B2240',
  },
  brandWordmarkAccent: {
    color: '#F97316',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerOverline: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#5B6B80',
  },
  headerRdoTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0B2240',
    marginTop: 1,
  },
  headerRdoNum: {
    color: '#F97316',
  },
  headerRdoDate: {
    fontSize: 11,
    color: '#5B6B80',
    marginTop: 2,
  },
  workTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B2240',
  },
  workAddress: {
    fontSize: 11.5,
    color: '#5B6B80',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaSummaryCard: {
    backgroundColor: '#EEF2F6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    marginBottom: 16,
  },
  metaAccentBar: {
    width: 4,
    borderRadius: 4,
    backgroundColor: '#F97316',
  },
  metaGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaCol: {
    flex: 1,
    minWidth: 110,
  },
  metaLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#5B6B80',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0B2240',
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
  },
  sectionTitleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#0B2240',
  },
  sectionSummaryText: {
    fontSize: 10.5,
    color: '#5B6B80',
  },
  sectionSummaryStrong: {
    color: '#0B2240',
    fontWeight: '700',
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weatherCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherShiftLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  weatherCondText: {
    fontSize: 12.5,
    fontWeight: '800',
    marginVertical: 1,
  },
  weatherPracText: {
    fontSize: 10.5,
  },
  weatherImpactText: {
    fontSize: 9.5,
    color: '#B91C1C',
    fontWeight: '600',
    marginTop: 2,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  thCell: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#5B6B80',
  },
  tableBodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tdCell: {
    fontSize: 10.5,
    color: '#5B6B80',
  },
  tdCellStrong: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0B2240',
  },
  tdSubText: {
    fontSize: 9,
    color: '#5B6B80',
    marginTop: 1,
  },
  textCenter: {
    textAlign: 'center',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBadge: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 22,
    alignItems: 'center',
  },
  qtyBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0B2240',
  },
  emptyTableText: {
    padding: 12,
    textAlign: 'center',
    fontSize: 10.5,
    color: '#5B6B80',
    fontStyle: 'italic',
  },
  progressPctText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 3,
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  inlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  inlineBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  obsCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  obsQuoteMark: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F97316',
    lineHeight: 24,
  },
  obsAuthorText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 2,
  },
  obsBodyText: {
    fontSize: 11,
    color: '#0B2240',
  },
  emptyPhotosBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: '48%',
    minWidth: 220,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  photoImageFrame: {
    width: '100%',
    height: 190,
    backgroundColor: '#EEF2F6',
    position: 'relative',
  },
  photoNumberPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    backgroundColor: '#0B2240',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  photoNumberPillText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoFallbackCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoFallbackText: {
    fontSize: 11,
    color: '#5B6B80',
    fontWeight: '600',
  },
  photoMetaBox: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  photoCaptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0B2240',
    marginBottom: 2,
  },
  photoTimestampText: {
    fontSize: 9.5,
    color: '#5B6B80',
  },
  signaturesContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 28,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  signatureCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  signatureHandwritten: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#0B2240',
    minHeight: 24,
    marginBottom: 4,
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#0B2240',
    marginBottom: 6,
  },
  signaturePersonName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0B2240',
  },
  signatureRoleLabel: {
    fontSize: 10,
    color: '#5B6B80',
    marginTop: 1,
  },
  signatureDateStamp: {
    fontSize: 9,
    color: '#5B6B80',
    marginTop: 2,
  },
  pageFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    fontSize: 9.5,
    color: '#5B6B80',
  },
  footerBrandStrong: {
    color: '#0B2240',
    fontWeight: '700',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerTimestamp: {
    fontSize: 9.5,
    color: '#5B6B80',
  },
  pageNumberBadge: {
    backgroundColor: '#0B2240',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pageNumberBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default RdoPdfPreviewModal;
