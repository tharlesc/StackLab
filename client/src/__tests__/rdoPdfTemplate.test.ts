import {
  generateRdoReportHtml,
  generateRdoCsv,
  generateRdoPdfBytes,
  getRdoPdfFilename,
  encodePdfWinAnsi,
  formatRdoNumberPadded,
  formatReportDateBr,
  formatReportTimestampBr,
} from '@/utils/rdoPdfTemplate';
import type { RDO, Work } from '@/types';

declare const Buffer: any;

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

    // R2 Verification: Real image XObjects embedded in binary PDF
    expect(rawPdf).toContain('/Type /XObject');
    expect(rawPdf).toContain('/Subtype /Image');
    expect(rawPdf).toContain('/Im1');
    expect(rawPdf).toContain('/ImageC');
    expect(rawPdf).toContain('/ColorSpace /DeviceRGB');
    expect(rawPdf).toContain('/Im1 Do');

    expect(rawPdf.trim().endsWith('%%EOF')).toBe(true);
  });

  it('R2: embeds multiple images including Base64 JPEG data URIs in generated PDF without blank areas', () => {
    // 1x1 valid sample JPEG base64
    const sampleBase64Jpeg =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

    const multiPhotoRdo: RDO = {
      ...sampleRdo,
      id: 'rdo-pdf-multi-img',
      photos: [
        {
          id: 'p-base64',
          caption: 'Foto da armação com Base64 JPEG',
          uri: sampleBase64Jpeg,
          watermarkedUri: sampleBase64Jpeg,
          takenAt: '2026-10-30T10:00:00.000Z',
          author: 'Eng. Tharles Silva',
        },
        {
          id: 'p-remote',
          caption: 'Foto da concretagem',
          uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
          takenAt: '2026-10-30T15:30:00.000Z',
          author: 'Eng. Tharles Silva',
        },
      ],
    };

    const pdfBytes = generateRdoPdfBytes(multiPhotoRdo, sampleWork);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.byteLength).toBeGreaterThan(5000);

    const rawPdf = Array.from(pdfBytes)
      .map((b) => String.fromCharCode(b))
      .join('');

    // Verification of multiple embedded image XObjects
    expect(rawPdf).toContain('/Im1');
    expect(rawPdf).toContain('/Im2');
    expect(rawPdf).toContain('/Im1 Do');
    expect(rawPdf).toContain('/Im2 Do');
    expect(rawPdf).toContain('/ImageC');
    expect(rawPdf).toContain('/Filter /DCTDecode'); // Base64 JPEG decoded
    expect(rawPdf).toContain(encodePdfWinAnsi('Foto da armação com Base64 JPEG'));
    expect(rawPdf).toContain('Foto da concretagem');
    expect(rawPdf.trim().endsWith('%%EOF')).toBe(true);
  });

  describe('Adversarial & Edge Cases: Image URI Resolution & PDF Binary Embedding', () => {
    it('resolvePhotoUri resolves string inputs, database rows with url or storage_path, and falls back gracefully', () => {
      const { resolvePhotoUri, DEFAULT_CONSTRUCTION_PHOTOS } = require('@/utils/rdoPhotoUtils');

      // 1. Direct string input & local filesystem schemes
      expect(resolvePhotoUri('https://cdn.stacklab.com/obr1/foto.jpg')).toBe(
        'https://cdn.stacklab.com/obr1/foto.jpg',
      );
      expect(resolvePhotoUri('data:image/jpeg;base64,/9j/4AAQ...')).toBe(
        'data:image/jpeg;base64,/9j/4AAQ...',
      );
      expect(resolvePhotoUri('file:///var/mobile/foto.jpg')).toBe('file:///var/mobile/foto.jpg');
      expect(resolvePhotoUri('/var/mobile/Containers/Data/Application/123/foto.jpg')).toBe(
        '/var/mobile/Containers/Data/Application/123/foto.jpg',
      );
      expect(resolvePhotoUri('/data/user/0/host.exp.exponent/cache/foto.jpg')).toBe(
        '/data/user/0/host.exp.exponent/cache/foto.jpg',
      );
      expect(resolvePhotoUri('ph://ED7AC36B-A150-4C38-BB8C-B6D696F69A2C')).toBe(
        'ph://ED7AC36B-A150-4C38-BB8C-B6D696F69A2C',
      );

      // 1b. Raw Base64 JPEGs (/9j/) and PNGs (iVBORw0KGgo) without data: prefix
      expect(resolvePhotoUri('/9j/4AAQSkZJRgABAQ...')).toBe(
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...',
      );
      expect(resolvePhotoUri('iVBORw0KGgoAAAANSUhEUg...')).toBe(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
      );

      // 2. Database row with "url" column (from Supabase rdo_fotos)
      expect(
        resolvePhotoUri({
          id: 'row-1',
          url: 'https://cdn.stacklab.com/supa-url.jpg',
        } as any),
      ).toBe('https://cdn.stacklab.com/supa-url.jpg');

      // 3. Object with "storagePath" or "storage_path"
      const pathResolved = resolvePhotoUri({
        id: 'row-2',
        storage_path: 'obra-alphaville/foto-1.jpg',
      } as any);
      expect(typeof pathResolved).toBe('string');
      expect(pathResolved.length).toBeGreaterThan(0);

      // 4. Fallback for null / undefined / empty object / literal 'null' / 'undefined'
      expect(resolvePhotoUri(null, 0)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[0]);
      expect(resolvePhotoUri(undefined, 1)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[1]);
      expect(resolvePhotoUri({}, 2)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[2]);
      expect(resolvePhotoUri('null', 0)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[0]);
      expect(resolvePhotoUri('undefined', 1)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[1]);

      // 5. Adversarial: Empty/whitespace string in earlier candidate fields does not drop downstream valid URI
      expect(
        resolvePhotoUri({
          id: 'row-empty-watermark',
          watermarkedUri: '',
          uri: 'https://cdn.stacklab.com/real-photo.jpg',
        } as any),
      ).toBe('https://cdn.stacklab.com/real-photo.jpg');

      expect(
        resolvePhotoUri({
          id: 'row-whitespace-candidates',
          watermarkedUri: '   ',
          uri: 'null',
          url: 'https://cdn.stacklab.com/url-photo.jpg',
        } as any),
      ).toBe('https://cdn.stacklab.com/url-photo.jpg');

      expect(
        resolvePhotoUri({
          id: 'row-nested-object',
          uri: { uri: 'https://cdn.stacklab.com/nested.jpg' },
        } as any),
      ).toBe('https://cdn.stacklab.com/nested.jpg');
    });

    it('resolvePdfImagePayload safely falls back to DeviceRGB bitmap when Base64 is corrupted or not a valid JPEG', () => {
      const { resolvePdfImagePayload } = require('@/utils/rdoPhotoUtils');

      // Valid Base64 JPEG
      const validBase64Jpeg =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
      const validPayload = resolvePdfImagePayload({ id: 'valid', uri: validBase64Jpeg } as any);
      expect(validPayload.filter).toBe('/DCTDecode');
      expect(validPayload.width).toBeGreaterThan(0);
      expect(validPayload.height).toBeGreaterThan(0);

      // Adversarial: empty watermarkedUri must not prevent downstream valid Base64 JPEG in uri from being embedded
      const emptyWatermarkPayload = resolvePdfImagePayload({
        id: 'empty-watermark',
        watermarkedUri: '',
        uri: validBase64Jpeg,
      } as any);
      expect(emptyWatermarkPayload.filter).toBe('/DCTDecode');
      expect(emptyWatermarkPayload.width).toBeGreaterThan(0);

      // Corrupted Base64: valid Base64 string but completely invalid JPEG content
      const corruptedBase64 = 'data:image/jpeg;base64,' + Buffer.from('corrupted_not_a_real_jpeg_stream').toString('base64');
      const corruptedPayload = resolvePdfImagePayload({ id: 'corrupted', uri: corruptedBase64 } as any);
      // MUST NOT set /DCTDecode on corrupted bytes, MUST fallback to DeviceRGB bitmap
      expect(corruptedPayload.filter).toBeUndefined();
      expect(corruptedPayload.colorSpace).toBe('/DeviceRGB');
      expect(corruptedPayload.width).toBe(160);
      expect(corruptedPayload.height).toBe(120);
      expect(corruptedPayload.bytes.length).toBe(160 * 120 * 3);

      // Malformed Base64 string syntax
      const malformedPayload = resolvePdfImagePayload({ id: 'malformed', uri: 'data:image/jpeg;base64,???bad_base64!!!' } as any);
      expect(malformedPayload.filter).toBeUndefined();
      expect(malformedPayload.colorSpace).toBe('/DeviceRGB');
      expect(malformedPayload.bytes.length).toBe(160 * 120 * 3);

      // Grayscale JPEG binary check
      const grayscaleBytes = new Uint8Array([
        0xff, 0xd8, // SOI
        0xff, 0xc0, // SOF0
        0x00, 0x0b, // Length = 11
        0x08,       // Precision = 8
        0x00, 0x64, // Height = 100
        0x00, 0xc8, // Width = 200
        0x01,       // Components = 1 (Grayscale)
        0x01, 0x11, 0x00, // Component 1 info
        0xff, 0xd9, // EOI
      ]);
      const { getJpegDimensions } = require('@/utils/rdoPhotoUtils');
      const grayDims = getJpegDimensions(grayscaleBytes);
      expect(grayDims).not.toBeNull();
      expect(grayDims?.width).toBe(200);
      expect(grayDims?.height).toBe(100);
      expect(grayDims?.colorSpace).toBe('/DeviceGray');
      expect(grayDims?.components).toBe(1);

      // JPEG with 0xff fill byte padding and APP0 header
      const jpegWithPaddingAndApp0 = new Uint8Array([
        0xff, 0xd8, // SOI
        0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, // APP0 segment with length 4
        0xff, 0xff, // 0xff fill byte padding before marker
        0xc0,       // SOF0
        0x00, 0x0b, // Length = 11
        0x08,       // Precision = 8
        0x01, 0x20, // Height = 288
        0x01, 0xe0, // Width = 480
        0x03,       // Components = 3
        0x01, 0x11, 0x00,
        0xff, 0xd9, // EOI
      ]);
      const padDims = getJpegDimensions(jpegWithPaddingAndApp0);
      expect(padDims).not.toBeNull();
      expect(padDims?.width).toBe(480);
      expect(padDims?.height).toBe(288);
      expect(padDims?.colorSpace).toBe('/DeviceRGB');

      // Raw Base64 string without data:image/ scheme is parsed and embedded as DCTDecode
      const rawBase64 = validBase64Jpeg.replace(/^data:image\/jpeg;base64,/, '');
      const rawPayload = resolvePdfImagePayload(rawBase64);
      expect(rawPayload.filter).toBe('/DCTDecode');
      expect(rawPayload.width).toBeGreaterThan(0);
      expect(rawPayload.height).toBeGreaterThan(0);
    });

    it('generateRdoPdfBytes produces valid PDF when RDO contains corrupted photo Base64 data without crashing or blank areas', () => {
      const corruptedRdo: RDO = {
        ...sampleRdo,
        id: 'rdo-corrupted-test',
        photos: [
          {
            id: 'corrupt-1',
            caption: 'Foto com Base64 corrompido',
            uri: 'data:image/jpeg;base64,bm90IGEgamVwZw==', // decodes to "not a jpeg"
            takenAt: '2026-10-31T10:00:00.000Z',
            author: 'Eng. Tharles',
          },
          {
            id: 'db-row-photo',
            caption: 'Foto vinda do Supabase',
            url: 'https://cdn.stacklab.com/obras/foto-obra.jpg',
            takenAt: '2026-10-31T11:00:00.000Z',
            author: 'Eng. Tharles',
          } as any,
        ],
      };

      const pdfBytes = generateRdoPdfBytes(corruptedRdo, sampleWork);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.byteLength).toBeGreaterThan(5000);

      const rawPdf = Array.from(pdfBytes)
        .map((b) => String.fromCharCode(b))
        .join('');

      // PDF must contain both image XObjects
      expect(rawPdf).toContain('/Im1');
      expect(rawPdf).toContain('/Im2');
      expect(rawPdf).toContain('/Im1 Do');
      expect(rawPdf).toContain('/Im2 Do');
      expect(rawPdf).toContain('/ColorSpace /DeviceRGB');
      // Im1 should NOT have /Filter /DCTDecode since it was not a valid JPEG
      expect(rawPdf).not.toContain('/Filter /DCTDecode');
      expect(rawPdf.trim().endsWith('%%EOF')).toBe(true);
    });

    it('watermark text and hash layout in PDF render without double-escaping accents or overlapping text', () => {
      const rdoWithAccentsAndHash: RDO = {
        ...sampleRdo,
        id: 'rdo-accents-hash-test',
        workName: 'ALPHAVILLE Araçagy',
        authorName: 'João da Conceição',
        photos: [
          {
            id: 'p-accent',
            caption: 'Fundação da Ala Oeste',
            takenAt: '2026-10-31T09:30:00.000Z',
            author: 'João da Conceição',
            metadata: {
              latitude: -2.53,
              longitude: -44.3,
              accuracy: 3.5,
              capturedAt: '2026-10-31T09:30:00.000Z',
              authorId: 'u1',
              authorName: 'João da Conceição',
              workId: 'w1',
              workName: 'ALPHAVILLE Araçagy',
              rdoNumber: 1,
              hash: 'SHA256-abcdef1234567890',
            },
          },
        ],
      };

      const pdfBytes = generateRdoPdfBytes(rdoWithAccentsAndHash, sampleWork);
      const rawPdf = Array.from(pdfBytes)
        .map((b) => String.fromCharCode(b))
        .join('');

      // 1. Watermark contains [Marca d'Água] with single WinAnsi octal escape (\301 for Á), not double-escaped (\\301)
      expect(rawPdf).toContain("[Marca d'\\301gua]");
      expect(rawPdf).not.toContain("[Marca d'\\\\301gua]");

      // 2. Hash line is present and truncated cleanly
      expect(rawPdf).toContain('Hash: SHA256-');

      // 3. Im1 is present for single photo without error
      expect(rawPdf).toContain('/Im1');
      expect(rawPdf).toContain('/Im1 Do');
    });

    it('generateRdoCsv resolves photo URLs for database rows with url or storage_path', () => {
      const { generateRdoCsv } = require('@/utils/rdoPdfTemplate');
      const rdoForCsv: RDO = {
        ...sampleRdo,
        photos: [
          {
            id: 'p1',
            caption: 'Foto de teste Supabase',
            takenAt: '2026-10-31T12:00:00.000Z',
            author: 'Eng. Tharles',
            url: 'https://cdn.stacklab.com/obras/foto1.jpg',
          } as any,
        ],
      };

      const csv = generateRdoCsv(rdoForCsv, sampleWork);
      expect(csv).toContain('https://cdn.stacklab.com/obras/foto1.jpg');
    });

    it('R2 (Adversarial): generateRdoPdfBytes handles RDO with 3 or more photos without cardBottom ReferenceError', () => {
      const rdoWith3Photos: RDO = {
        ...sampleRdo,
        id: 'rdo-3-photos',
        photos: [
          {
            id: 'p1',
            caption: 'Foto 1 - Estrutura',
            uri: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563',
            takenAt: '2026-10-31T10:00:00.000Z',
            author: 'Eng. Tharles',
          },
          {
            id: 'p2',
            caption: 'Foto 2 - Alvenaria',
            uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
            takenAt: '2026-10-31T11:00:00.000Z',
            author: 'Eng. Tharles',
          },
          {
            id: 'p3',
            caption: 'Foto 3 - Acabamento',
            uri: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f',
            takenAt: '2026-10-31T12:00:00.000Z',
            author: 'Eng. Tharles',
          },
        ],
      };

      // Must execute without throwing ReferenceError: cardBottom is not defined
      const pdfBytes = generateRdoPdfBytes(rdoWith3Photos, sampleWork);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.byteLength).toBeGreaterThan(5000);

      const rawPdf = Array.from(pdfBytes)
        .map((b) => String.fromCharCode(b))
        .join('');

      expect(rawPdf).toContain('/Im1');
      expect(rawPdf).toContain('/Im2');
      expect(rawPdf).toContain(encodePdfWinAnsi('+ 1 registro(s) fotografico(s) adicional(is) arquivado(s) no acervo da obra'));
      expect(rawPdf.trim().endsWith('%%EOF')).toBe(true);
    });

    it('R2 (Adversarial): generateRdoReportHtml does not crash when photo metadata lacks GPS coordinates', () => {
      const rdoWithMissingGps: RDO = {
        ...sampleRdo,
        id: 'rdo-no-gps',
        photos: [
          {
            id: 'p-no-gps',
            caption: 'Foto importada sem GPS',
            uri: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563',
            takenAt: '2026-10-31T14:00:00.000Z',
            author: 'Eng. Tharles',
            metadata: {
              latitude: undefined as any,
              longitude: undefined as any,
              capturedAt: '2026-10-31T14:00:00.000Z',
              authorId: 'u1',
              authorName: 'Eng. Tharles',
              workId: 'w1',
              workName: 'Obra',
              rdoNumber: 1,
              hash: 'SHA256-test',
            },
          },
        ],
      };

      // Must not throw TypeError: Cannot read properties of undefined (reading 'toFixed')
      const html = generateRdoReportHtml(rdoWithMissingGps, sampleWork);
      expect(html).toContain('Foto importada sem GPS');
      expect(html).toContain('onerror=');
      expect(html).not.toContain('undefined');
    });

    it('resolvePhotoUri preserves Windows filesystem paths', () => {
      const { resolvePhotoUri } = require('@/utils/rdoPhotoUtils');
      expect(resolvePhotoUri('C:\\Users\\pedro\\AppData\\foto.jpg')).toBe(
        'C:\\Users\\pedro\\AppData\\foto.jpg',
      );
      expect(resolvePhotoUri('D:/obras/fotos/canteiro.png')).toBe(
        'D:/obras/fotos/canteiro.png',
      );
    });

    it('R1 & R2 (Adversarial): resolvePhotoUri and resolvePdfImagePayload handle non-string / nested image inputs without throwing TypeError', () => {
      const { resolvePhotoUri, resolvePdfImagePayload } = require('@/utils/rdoPhotoUtils');

      // Nested object with uri property
      expect(resolvePhotoUri({ uri: { uri: 'https://example.com/nested.jpg' } } as any)).toBe(
        'https://example.com/nested.jpg',
      );

      // Numeric or non-string uri safely returns fallback
      const fallbackUrl = resolvePhotoUri(null, 0);
      expect(resolvePhotoUri({ uri: 12345 } as any)).toBe(fallbackUrl);
      expect(resolvePhotoUri({ uri: Object.create(null) } as any)).toBe(fallbackUrl);
      expect(resolvePdfImagePayload({ uri: Object.create(null) } as any)).toBeDefined();

      // RDO with null or undefined in photos array
      const rdoWithNullPhoto = {
        ...sampleRdo,
        photos: [null as any, undefined as any],
      };
      expect(() => generateRdoPdfBytes(rdoWithNullPhoto, sampleWork)).not.toThrow();
      expect(() => generateRdoReportHtml(rdoWithNullPhoto, sampleWork)).not.toThrow();
      expect(() => generateRdoCsv(rdoWithNullPhoto, sampleWork)).not.toThrow();

      // resolvePdfImagePayload handles nested object and non-string inputs safely
      const payload1 = resolvePdfImagePayload({ uri: { uri: 'https://example.com/nested.jpg' } } as any);
      expect(payload1).toBeDefined();
      expect(payload1.colorSpace).toBe('/DeviceRGB');

      const payload2 = resolvePdfImagePayload({ uri: 12345 } as any);
      expect(payload2).toBeDefined();
      expect(payload2.colorSpace).toBe('/DeviceRGB');

      // Adversarial: Prototype-less objects in caption, author, takenAt, metadata
      expect(encodePdfWinAnsi(Object.create(null))).toBe('');
      expect(formatReportTimestampBr(Object.create(null))).toBe('—');

      const rdoWithPrototypeLessProps = {
        ...sampleRdo,
        photos: [
          {
            id: 'p-prototype-less',
            caption: Object.create(null) as any,
            author: Object.create(null) as any,
            takenAt: Object.create(null) as any,
            uri: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563',
            metadata: {
              hash: Object.create(null) as any,
            } as any,
          },
        ],
      };
      expect(() => generateRdoPdfBytes(rdoWithPrototypeLessProps, sampleWork)).not.toThrow();
      expect(() => generateRdoReportHtml(rdoWithPrototypeLessProps, sampleWork)).not.toThrow();
      expect(() => generateRdoCsv(rdoWithPrototypeLessProps, sampleWork)).not.toThrow();
    });

    it('R2 (Adversarial): PDF binary xref table offsets and trailer /Root exactly match objects and Catalog dictionary', () => {
      [0, 1, 2, 3].forEach((photoCount) => {
        const testRdo: RDO = {
          ...sampleRdo,
          id: `rdo-test-${photoCount}`,
          photos: Array.from({ length: photoCount }, (_, i) => ({
            id: `p-${i}`,
            caption: `Foto #${i + 1}`,
            uri: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563',
            takenAt: '2026-10-31T12:00:00.000Z',
            author: 'Eng. Tharles',
          })),
        };

        const pdfBytes = generateRdoPdfBytes(testRdo, sampleWork);
        const rawPdf = Array.from(pdfBytes)
          .map((b) => String.fromCharCode(b))
          .join('');

        // 1. Trailer has valid syntax and points to Catalog
        const rootMatch = rawPdf.match(/\/Root\s+(\d+)\s+0\s+R/);
        expect(rootMatch).not.toBeNull();
        const catalogObjNum = Number(rootMatch![1]);

        // 2. The referenced Root object exists and is a /Type /Catalog
        const catalogHeader = `${catalogObjNum} 0 obj`;
        const catalogIdx = rawPdf.indexOf(catalogHeader);
        expect(catalogIdx).toBeGreaterThan(0);
        const catalogSnippet = rawPdf.slice(catalogIdx, catalogIdx + 120);
        expect(catalogSnippet).toContain('/Type /Catalog');

        // 3. startxref points to exact byte offset of 'xref'
        const startXrefMatch = rawPdf.match(/startxref\s+(\d+)\s+%%EOF/);
        expect(startXrefMatch).not.toBeNull();
        const xrefOffset = Number(startXrefMatch![1]);
        expect(rawPdf.slice(xrefOffset, xrefOffset + 4)).toBe('xref');

        // 4. Verify each object offset recorded in the xref table matches the actual object position
        const xrefSection = rawPdf.slice(xrefOffset);
        const entryRegex = /(\d{10})\s+(\d{5})\s+([nf])/g;
        let match;
        let objIndex = 0;
        while ((match = entryRegex.exec(xrefSection)) !== null) {
          if (objIndex === 0) {
            expect(match[3]).toBe('f');
          } else {
            expect(match[3]).toBe('n');
            const recordedOffset = Number(match[1]);
            const expectedHeader = `${objIndex} 0 obj`;
            const actualHeader = rawPdf.slice(recordedOffset, recordedOffset + expectedHeader.length);
            expect(actualHeader).toBe(expectedHeader);
          }
          objIndex++;
        }
      });
    });

    it('R1 & R2 (Adversarial): getConstructionPhotoFallback and resolvePhotoUri handle NaN, null, and non-finite indices safely without returning undefined', () => {
      const {
        resolvePhotoUri,
        getConstructionPhotoFallback,
        DEFAULT_CONSTRUCTION_PHOTOS,
      } = require('@/utils/rdoPhotoUtils');

      // NaN index must not return undefined
      const fallbackForNaN = resolvePhotoUri(null, NaN);
      expect(typeof fallbackForNaN).toBe('string');
      expect(fallbackForNaN).toBe(DEFAULT_CONSTRUCTION_PHOTOS[0]);
      expect(fallbackForNaN).toBeTruthy();

      expect(getConstructionPhotoFallback(NaN)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[0]);
      expect(getConstructionPhotoFallback(-Infinity as any)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[0]);
      expect(getConstructionPhotoFallback(Infinity as any)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[0]);
      expect(getConstructionPhotoFallback(null as any)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[0]);
      expect(getConstructionPhotoFallback(undefined)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[0]);
      expect(getConstructionPhotoFallback(-5)).toBe(DEFAULT_CONSTRUCTION_PHOTOS[1]);
    });

    it('R1 & R2 (Adversarial): extractRawPhotoCandidate extracts valid URIs from wrapped photo/image/file objects', () => {
      const { extractRawPhotoCandidate } = require('@/utils/rdoPhotoUtils');

      expect(
        extractRawPhotoCandidate({
          photo: { url: 'https://cdn.stacklab.com/wrapped-photo.jpg' },
        }),
      ).toBe('https://cdn.stacklab.com/wrapped-photo.jpg');

      expect(
        extractRawPhotoCandidate({
          image: 'https://cdn.stacklab.com/image-direct.jpg',
        }),
      ).toBe('https://cdn.stacklab.com/image-direct.jpg');

      expect(
        extractRawPhotoCandidate({
          file: 'https://cdn.stacklab.com/file-direct.jpg',
        }),
      ).toBe('https://cdn.stacklab.com/file-direct.jpg');

      expect(
        extractRawPhotoCandidate({
          asset: { uri: 'https://cdn.stacklab.com/asset-photo.jpg' },
        }),
      ).toBe('https://cdn.stacklab.com/asset-photo.jpg');

      expect(
        extractRawPhotoCandidate({
          original: 'https://cdn.stacklab.com/original-photo.jpg',
        }),
      ).toBe('https://cdn.stacklab.com/original-photo.jpg');

      expect(
        extractRawPhotoCandidate({
          photo: ['https://cdn.stacklab.com/array-photo.jpg'],
        }),
      ).toBe('https://cdn.stacklab.com/array-photo.jpg');
    });

    it('R1 & R2 (Adversarial): resolvePhotoUri preserves Windows UNC network paths and normalizes raw WebP and GIF base64', () => {
      const { resolvePhotoUri } = require('@/utils/rdoPhotoUtils');

      // Windows UNC network share path
      expect(resolvePhotoUri('\\\\servidor-obra\\compartilhamento\\foto.jpg')).toBe(
        '\\\\servidor-obra\\compartilhamento\\foto.jpg',
      );

      // Raw Base64 WebP (starts with UklGR)
      const rawWebP = 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsSScAB4AbsAAP7/wgAA';
      expect(resolvePhotoUri(rawWebP)).toBe(`data:image/webp;base64,${rawWebP}`);

      // Raw Base64 GIF (starts with R0lGOD)
      const rawGif = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      expect(resolvePhotoUri(rawGif)).toBe(`data:image/gif;base64,${rawGif}`);
    });

    it('R2 (Adversarial): generateDeviceRgbConstructionBitmap handles NaN, non-finite and zero width/height gracefully', () => {
      const { generateDeviceRgbConstructionBitmap } = require('@/utils/rdoPhotoUtils');

      const nanBuffer = generateDeviceRgbConstructionBitmap(NaN, NaN, NaN);
      expect(nanBuffer).toBeInstanceOf(Uint8Array);
      expect(nanBuffer.length).toBe(160 * 120 * 3); // safely defaulted to 160x120

      const zeroBuffer = generateDeviceRgbConstructionBitmap(0, 0, 0);
      expect(zeroBuffer).toBeInstanceOf(Uint8Array);
      expect(zeroBuffer.length).toBe(160 * 120 * 3);

      const negativeBuffer = generateDeviceRgbConstructionBitmap(-1, -50, -50);
      expect(negativeBuffer).toBeInstanceOf(Uint8Array);
      expect(negativeBuffer.length).toBe(160 * 120 * 3);
    });

    it('R2 (Adversarial): triggerWebPdfDownload creates valid blob and triggers browser download link when DOM is present', () => {
      jest.useFakeTimers();
      const { triggerWebPdfDownload } = require('@/utils/rdoPdfTemplate');

      // 1. In Node environment without window/document, returns false safely
      expect(triggerWebPdfDownload(sampleRdo, sampleWork)).toBe(false);

      // 2. In browser-like environment with window/document
      const fakeClick = jest.fn();
      const fakeLink: any = {
        href: '',
        style: {},
        setAttribute: jest.fn(),
        click: fakeClick,
        parentNode: {
          removeChild: jest.fn(),
        },
      };

      const origWindow = (globalThis as any).window;
      const origDocument = (globalThis as any).document;
      const origCreateObjectURL = URL.createObjectURL;
      const origRevokeObjectURL = URL.revokeObjectURL;

      try {
        (globalThis as any).window = {};
        (globalThis as any).document = {
          createElement: jest.fn().mockReturnValue(fakeLink),
          body: {
            appendChild: jest.fn(),
          },
        };
        URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-pdf-url');
        URL.revokeObjectURL = jest.fn();

        const success = triggerWebPdfDownload(sampleRdo, sampleWork);
        expect(success).toBe(true);
        expect(fakeLink.setAttribute).toHaveBeenCalledWith(
          'download',
          expect.stringMatching(/^RDO_004_-_.*\.pdf$/),
        );
        expect(fakeClick).toHaveBeenCalled();

        // Fast-forward revokeObjectURL and cleanup timer
        jest.runAllTimers();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-pdf-url');
        expect(fakeLink.parentNode.removeChild).toHaveBeenCalledWith(fakeLink);
      } finally {
        (globalThis as any).window = origWindow;
        (globalThis as any).document = origDocument;
        URL.createObjectURL = origCreateObjectURL;
        URL.revokeObjectURL = origRevokeObjectURL;
        jest.useRealTimers();
      }
    });

    it('R2 (Adversarial): triggerMobilePdfDownload writes binary PDF to device cache and previews file', async () => {
      const { triggerMobilePdfDownload } = require('@/utils/rdoPdfTemplate');

      const mockWrite = jest.fn().mockResolvedValue(undefined);
      const mockPreview = jest.fn().mockResolvedValue(undefined);
      const mockCreate = jest.fn();
      const mockDelete = jest.fn();

      jest.mock(
        'expo-file-system',
        () => ({
          Paths: { cache: '/mock-cache-path' },
          File: jest.fn().mockImplementation((path: string, name: string) => ({
            exists: true,
            path,
            name,
            delete: mockDelete,
            create: mockCreate,
            write: mockWrite,
            preview: mockPreview,
          })),
          Directory: {
            pickDirectoryAsync: jest.fn(),
          },
        }),
        { virtual: true },
      );

      const rdoWithPhotos: RDO = {
        ...sampleRdo,
        photos: [
          {
            id: 'p-mob-1',
            caption: 'Foto da fundação',
            uri: 'file:///data/user/0/host.exp.exponent/cache/photo1.jpg',
            takenAt: '2026-11-16T10:00:00Z',
            author: 'Eng. Tharles',
          },
          {
            id: 'p-mob-2',
            caption: 'Foto do pilar sul',
            uri: 'content://media/external/images/media/1234',
            takenAt: '2026-11-16T11:00:00Z',
            author: 'Eng. Tharles',
          },
        ],
      };

      const success = await triggerMobilePdfDownload(rdoWithPhotos, sampleWork);
      expect(success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith({ overwrite: true });
      expect(mockWrite).toHaveBeenCalled();
      const writtenBytes = mockWrite.mock.calls[0][0];
      expect(writtenBytes).toBeInstanceOf(Uint8Array);
      expect(writtenBytes.byteLength).toBeGreaterThan(1000);
      expect(mockPreview).toHaveBeenCalledWith({
        mimeType: 'application/pdf',
        title: expect.stringMatching(/^RDO_004_-_.*\.pdf$/),
      });
    });
  });
});
