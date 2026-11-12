import {
  generateRdoReportHtml,
  generateRdoCsv,
  generateRdoPdfBytes,
  getRdoPdfFilename,
  formatRdoNumberPadded,
  formatReportDateBr,
} from '@/utils/rdoPdfTemplate';
import type { RDO, Work } from '@/types';

describe('StackLab RDO Official PDF Report Template', () => {
  const sampleWork: Work = {
    id: 'w-alpha',
    name: 'Residencial Alphaville',
    subtitle: 'Torre B — Alvenaria e Estrutura',
    client: 'Alphaville Urbanismo',
    address: 'Av. dos Holandeses, Quadra 09',
    active: true,
  };

  const sampleRdo: RDO = {
    id: 'rdo-004',
    number: 4,
    version: 1,
    workId: 'w-alpha',
    workName: 'Residencial Alphaville',
    date: '2026-10-30',
    authorId: 'u-1',
    authorName: 'Pedro Operador',
    status: 'aprovado',
    locked: true,
    weather: [
      {
        shift: 'manha',
        condition: 'Chuvoso',
        practical: false,
        stoppageHours: 2,
        impact: 'Pausa na alvenaria externa',
      },
      {
        shift: 'tarde',
        condition: 'Ensolarado',
        practical: true,
      },
      {
        shift: 'noite',
        condition: 'Nublado',
        practical: true,
      },
    ],
    labor: [
      {
        role: 'Apontador',
        name: 'Pedro',
        quantity: 4,
        hours: 8,
        isContractor: false,
        horaInicio: '07:00',
        horaFim: '16:00',
      },
      {
        role: 'Ajudante',
        quantity: 1,
        hours: 8,
        isContractor: true,
      },
    ],
    equipment: [
      {
        name: 'Caminhão Munck',
        brand: 'Volvo',
        code: 'MK-01',
        quantity: 4,
        activeHours: 6,
        idleHours: 2,
        idleJustification: 'Manutenção hidráulica',
        isRented: true,
        horaInicio: '08:00',
        horaFim: '16:00',
        observations: 'Operação normal à tarde',
      },
      {
        name: 'Betoneira',
        quantity: 3,
        activeHours: 8,
        idleHours: 0,
        isRented: false,
      },
    ],
    activities: [
      {
        description: 'Elevação de alvenaria estrutural',
        location: '2º Pavimento',
        unit: 'm²',
        quantity: 45,
        progress: 100,
        status: 'Concluído',
      },
      {
        description: 'Impermeabilização de baldrame',
        location: 'Térreo',
        unit: 'm²',
        quantity: 20,
        progress: 40,
        status: 'Paralisado',
      },
    ],
    materials: [],
    occurrences: [
      {
        type: 'dds',
        description: 'DDS sobre uso de EPIs e trabalho em altura',
        horaInicio: '07:00',
        horaFim: '07:20',
      },
      {
        type: 'pendencia',
        description: 'Atraso na liberação de frentes do subsolo',
      },
    ],
    photos: [
      {
        id: 'p-1',
        caption: 'Alvenaria do 2º pavimento finalizada',
        uri: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563',
        watermarkedUri: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563',
        takenAt: '2026-10-30T19:18:00.000Z',
        author: 'Pedro Operador',
        metadata: {
          latitude: -2.5307,
          longitude: -44.3068,
          accuracy: 3.5,
          capturedAt: '2026-10-30T19:18:00.000Z',
          authorId: 'u-1',
          authorName: 'Pedro Operador',
          workId: 'w-alpha',
          workName: 'Residencial Alphaville',
          rdoNumber: 4,
          hash: 'SL-HASH-004',
        },
      },
    ],
    comments: [
      {
        id: 'c-1',
        section: 'atividades',
        authorId: 'u-master',
        authorName: 'Eng. Master Davi',
        text: 'Serviço conferido e aprovado em campo.',
        createdAt: '2026-10-30T19:19:00.000Z',
      },
    ],
    signature: {
      signedById: 'u-master',
      signedByName: 'Eng. Master Davi',
      signedAt: '2026-10-30T19:19:00.000Z',
      ip: '177.12.40.8',
      deviceId: 'device-01',
      hash: 'SL-9F3A21C7',
    },
  };

  it('formats RDO number padded to 3 digits and Brazilian date accurately', () => {
    expect(formatRdoNumberPadded(1)).toBe('001');
    expect(formatRdoNumberPadded(4)).toBe('004');
    expect(formatRdoNumberPadded(184)).toBe('184');
    expect(formatReportDateBr('2026-10-30')).toBe('30/10/2026');
  });

  it('generates 2-page HTML with StackLab brand palette and all 6 RDO sections', () => {
    const html = generateRdoReportHtml(sampleRdo, sampleWork);

    // Identidade e cores StackLab
    expect(html).toContain('Stack<span>Lab</span>');
    expect(html).toContain('#0B2240'); // Deep Navy
    expect(html).toContain('#F97316'); // Safety Orange
    expect(html).toContain('RDO <span class="rdo-num">#004</span>');
    expect(html).toContain('APROVADO');
    expect(html).toContain('Alphaville Urbanismo');
    expect(html).toContain('Av. dos Holandeses, Quadra 09');

    // 1. Identificação e Clima
    expect(html).toContain('CONDIÇÕES CLIMÁTICAS');
    expect(html).toContain('MANHÃ');
    expect(html).toContain('TARDE');
    expect(html).toContain('NOITE');
    expect(html).toContain('Chuvoso');
    expect(html).toContain('Impraticável');
    expect(html).toContain('Pausa na alvenaria externa');

    // 2. Mão de Obra e Efetivos
    expect(html).toContain('MÃO DE OBRA & EFETIVOS');
    expect(html).toContain('5 pessoas');
    expect(html).toContain('Apontador');
    expect(html).toContain('Pedro');
    expect(html).toContain('Próprio');
    expect(html).toContain('Terceirizado');
    expect(html).toContain('07:00');
    expect(html).toContain('16:00');

    // 3. Equipamentos Presentes
    expect(html).toContain('EQUIPAMENTOS PRESENTES');
    expect(html).toContain('2 tipos');
    expect(html).toContain('7 unidades');
    expect(html).toContain('Caminhão Munck');
    expect(html).toContain('Volvo [MK-01]');
    expect(html).toContain('Locado');
    expect(html).toContain('Manutenção hidráulica');

    // 4. Atividades Executadas
    expect(html).toContain('ATIVIDADES EXECUTADAS');
    expect(html).toContain('Elevação de alvenaria estrutural');
    expect(html).toContain('2º Pavimento');
    expect(html).toContain('100%');
    expect(html).toContain('CONCLUÍDA');
    expect(html).toContain('PARALISADA');

    // 5. Ocorrências e DDS
    expect(html).toContain('OCORRÊNCIAS & DDS');
    expect(html).toContain('DDS · DIÁLOGO DE SEGURANÇA');
    expect(html).toContain('DDS sobre uso de EPIs e trabalho em altura');
    expect(html).toContain('PENDÊNCIA');

    // 6. Fotos da Obra + Observações + Assinaturas + Paginação
    expect(html).toContain('FOTOS DA OBRA · REGISTRO FOTOGRÁFICO');
    expect(html).toContain('Alvenaria do 2º pavimento finalizada');
    expect(html).toContain('Serviço conferido e aprovado em campo.');
    expect(html).toContain('Realizado por');
    expect(html).toContain('Aprovado por');
    expect(html).toContain('Eng. Master Davi');
    expect(html).toContain('1 / 2');
    expect(html).toContain('2 / 2');
  });

  it('generates analytical CSV containing all 6 sections of the RDO', () => {
    const csv = generateRdoCsv(sampleRdo, sampleWork);
    expect(csv).toContain('1. CONDIÇÕES CLIMÁTICAS');
    expect(csv).toContain('2. MÃO DE OBRA E EFETIVOS');
    expect(csv).toContain('3. EQUIPAMENTOS PRESENTES');
    expect(csv).toContain('4. ATIVIDADES EXECUTADAS');
    expect(csv).toContain('5. OCORRÊNCIAS E DDS');
    expect(csv).toContain('6. FOTOS DA OBRA');
    expect(csv).toContain('Caminhão Munck');
    expect(csv).toContain('DDS sobre uso de EPIs e trabalho em altura');
  });

  it('generates valid 2-page A4 binary %PDF-1.4 file with StackLab brand and RDO fields for direct download', () => {
    const filename = getRdoPdfFilename(sampleRdo);
    expect(filename).toBe('RDO_004_-_30-10-2026_-_Residencial_Alphaville.pdf');

    const pdfBytes = generateRdoPdfBytes(sampleRdo, sampleWork);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.byteLength).toBeGreaterThan(2000);

    const rawPdf = Array.from(pdfBytes)
      .map((b) => String.fromCharCode(b))
      .join('');

    expect(rawPdf.startsWith('%PDF-1.4')).toBe(true);
    expect(rawPdf).toContain('/Type /Pages /Count 2');
    expect(rawPdf).toContain('/MediaBox [ 0 0 595 842 ]');
    expect(rawPdf).toContain('StackLab');
    expect(rawPdf).toContain('#004');
    expect(rawPdf).toContain('APROVADO');
    expect(rawPdf).toContain('Alphaville Urbanismo');
    expect(rawPdf).toContain('Apontador');
    expect(rawPdf).toContain('Betoneira');
    expect(rawPdf).toContain('1 / 2');
    expect(rawPdf).toContain('2 / 2');
    expect(rawPdf.trim().endsWith('%%EOF')).toBe(true);
  });
});
