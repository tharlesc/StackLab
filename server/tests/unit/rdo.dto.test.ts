import { describe, it, expect } from 'vitest';
import {
  WeatherEntrySchema,
  LaborEntrySchema,
  EquipmentEntrySchema,
  ActivityEntrySchema,
  MaterialEntrySchema,
  OccurrenceEntrySchema,
  PhotoUploadMetadataSchema,
  CreateRDOSchema,
  SubmitRDOSchema,
  ReturnRDOSchema,
  AuditedEditSchema,
  ApproveRDOSchema,
} from '../../src/modules/rdo/rdo.dto';

describe('RDO DTO Validation Unit Tests', () => {
  describe('WeatherEntrySchema', () => {
    it('accepts sunny weather without stoppageHours', () => {
      const valid = { shift: 'manha', condition: 'Ensolarado' };
      const parsed = WeatherEntrySchema.parse(valid);
      expect(parsed.condition).toBe('Ensolarado');
      expect(parsed.stoppageHours).toBeUndefined();
    });

    it('rejects rain condition if stoppageHours is missing', () => {
      const rain = { shift: 'tarde', condition: 'Chuva moderada' };
      expect(() => WeatherEntrySchema.parse(rain)).toThrowError(
        /Horas de paralisação são obrigatórias quando há condição de chuva/,
      );
    });

    it('rejects rain condition if stoppageHours > 0 but impact is missing', () => {
      const rain = { shift: 'tarde', condition: 'Chuva', stoppageHours: 3 };
      expect(() => WeatherEntrySchema.parse(rain)).toThrowError(
        /Justificativa do impacto é obrigatória quando houver horas de paralisação por chuva/,
      );
    });

    it('accepts rain condition with stoppageHours and impact', () => {
      const rain = {
        shift: 'tarde',
        condition: 'Chuva torrencial',
        stoppageHours: 2.5,
        impact: 'Paralisação da concretagem da laje',
      };
      const parsed = WeatherEntrySchema.parse(rain);
      expect(parsed.stoppageHours).toBe(2.5);
      expect(parsed.impact).toBe('Paralisação da concretagem da laje');
    });

    it('rejects invalid shift enum', () => {
      expect(() =>
        WeatherEntrySchema.parse({ shift: 'madrugada', condition: 'Nublado' }),
      ).toThrow();
    });
  });

  describe('LaborEntrySchema', () => {
    it('accepts valid labor entry and defaults isContractor to false', () => {
      const entry = { role: 'Pedreiro', quantity: 4, hours: 8 };
      expect(LaborEntrySchema.parse(entry)).toEqual({
        ...entry,
        isContractor: false,
      });
    });

    it('accepts explicit isContractor: true', () => {
      const entry = { role: 'Eletricista Terceirizado', quantity: 2, hours: 8, isContractor: true };
      const parsed = LaborEntrySchema.parse(entry);
      expect(parsed.isContractor).toBe(true);
    });

    it('transforms legacy isSubcontracted: true to isContractor: true', () => {
      const entry = { role: 'Pintor Subcontratado', quantity: 3, hours: 8, isSubcontracted: true };
      const parsed = LaborEntrySchema.parse(entry);
      expect(parsed.isContractor).toBe(true);
    });

    it('rejects quantity <= 0 or non-integer', () => {
      expect(() =>
        LaborEntrySchema.parse({ role: 'Servente', quantity: 0, hours: 8 }),
      ).toThrowError(/Quantidade de operários deve ser maior que zero/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Servente', quantity: 2.5, hours: 8 }),
      ).toThrowError(/número inteiro/);
    });

    it('rejects hours <= 0 or hours > 24', () => {
      expect(() =>
        LaborEntrySchema.parse({ role: 'Armador', quantity: 2, hours: 0 }),
      ).toThrowError(/Horas trabalhadas devem ser maiores que zero/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Armador', quantity: 2, hours: 25 }),
      ).toThrowError(/não pode exceder 24 horas/);
    });
  });

  describe('EquipmentEntrySchema', () => {
    it('accepts active equipment without idle hours and handles quantity', () => {
      const eq = { name: 'Betoneira 400L', activeHours: 8, idleHours: 0 };
      expect(EquipmentEntrySchema.parse(eq)).toEqual({
        ...eq,
        quantity: 1,
      });
    });

    it('accepts custom quantity >= 1', () => {
      const eq = { name: 'Compactador de Solo', quantity: 3, activeHours: 6, idleHours: 0 };
      const parsed = EquipmentEntrySchema.parse(eq);
      expect(parsed.quantity).toBe(3);
    });

    it('rejects quantity <= 0 or non-integer', () => {
      expect(() =>
        EquipmentEntrySchema.parse({ name: 'Trator', quantity: 0, activeHours: 4, idleHours: 0 }),
      ).toThrowError(/Quantidade de equipamentos deve ser maior que zero/);

      expect(() =>
        EquipmentEntrySchema.parse({ name: 'Trator', quantity: 1.5, activeHours: 4, idleHours: 0 }),
      ).toThrowError(/número inteiro/);
    });

    it('rejects idleHours > 0 without idleJustification', () => {
      const eq = { name: 'Grua Torre', activeHours: 4, idleHours: 4 };
      expect(() => EquipmentEntrySchema.parse(eq)).toThrowError(
        /Justificativa de ociosidade é obrigatória/,
      );
    });

    it('rejects idleHours > 0 with short justification (< 5 chars)', () => {
      const eq = {
        name: 'Grua Torre',
        activeHours: 4,
        idleHours: 4,
        idleJustification: 'queb',
      };
      expect(() => EquipmentEntrySchema.parse(eq)).toThrowError(
        /mínimo 5 caracteres/,
      );
    });

    it('accepts idleHours > 0 with valid justification', () => {
      const eq = {
        name: 'Retroescavadeira',
        activeHours: 2,
        idleHours: 6,
        idleJustification: 'Aguardando liberação de caçamba para bota-fora',
      };
      expect(EquipmentEntrySchema.parse(eq)).toEqual({
        ...eq,
        quantity: 1,
      });
    });

    it('rejects activeHours + idleHours > 24', () => {
      const eq = {
        name: 'Trator',
        activeHours: 15,
        idleHours: 10,
        idleJustification: 'Parada noturna para manutenção preventiva',
      };
      expect(() => EquipmentEntrySchema.parse(eq)).toThrowError(
        /não pode exceder 24 horas no mesmo dia/,
      );
    });
  });

  describe('ActivityEntrySchema', () => {
    it('accepts valid activity with progress', () => {
      const act = {
        description: 'Alvenaria de vedação',
        location: '2º Pavimento - Ala Sul',
        unit: 'm²',
        quantity: 45.5,
        progress: 80,
      };
      expect(ActivityEntrySchema.parse(act)).toEqual(act);
    });

    it('rejects progress outside 0-100 range', () => {
      expect(() =>
        ActivityEntrySchema.parse({
          description: 'Pintura',
          location: 'Hall',
          unit: 'm²',
          quantity: 10,
          progress: 105,
        }),
      ).toThrowError(/máximo é 100%/);

      expect(() =>
        ActivityEntrySchema.parse({
          description: 'Pintura',
          location: 'Hall',
          unit: 'm²',
          quantity: 10,
          progress: -5,
        }),
      ).toThrowError(/mínimo é 0%/);
    });

    it('rejects quantity <= 0', () => {
      expect(() =>
        ActivityEntrySchema.parse({
          description: 'Pintura',
          location: 'Hall',
          unit: 'm²',
          quantity: 0,
        }),
      ).toThrowError(/Quantidade executada deve ser maior que zero/);
    });
  });

  describe('MaterialEntrySchema', () => {
    it('accepts valid material', () => {
      const mat = {
        name: 'Cimento CP-II',
        supplier: 'Votorantim Cimentos',
        invoice: 'NF-e 88.421',
      };
      expect(MaterialEntrySchema.parse(mat)).toEqual(mat);
    });

    it('rejects missing or short fields', () => {
      expect(() =>
        MaterialEntrySchema.parse({ name: 'A', supplier: '', invoice: '1' }),
      ).toThrow();
    });
  });

  describe('OccurrenceEntrySchema', () => {
    it('accepts valid DDS occurrence', () => {
      const occ = {
        type: 'dds',
        description: 'Orientação sobre trabalho em altura e uso correto de trava-quedas.',
      };
      expect(OccurrenceEntrySchema.parse(occ)).toEqual(occ);
    });

    it('accepts paralisacao occurrence', () => {
      const occ = {
        type: 'paralisacao',
        description: 'Paralisação das fundações devido a chuva torrencial e alagamento da cava.',
      };
      expect(OccurrenceEntrySchema.parse(occ)).toEqual(occ);
    });

    it('accepts interferencia occurrence', () => {
      const occ = {
        type: 'interferencia',
        description: 'Interferência de rede de gás não cadastrada no projeto de drenagem.',
      };
      expect(OccurrenceEntrySchema.parse(occ)).toEqual(occ);
    });

    it('accepts all 6 statutory occurrence types', () => {
      const allTypes = ['dds', 'acidente', 'paralisacao', 'interferencia', 'pendencia', 'outro'] as const;
      for (const t of allTypes) {
        const occ = { type: t, description: `Registro de teste para categoria ${t}.` };
        expect(OccurrenceEntrySchema.parse(occ).type).toBe(t);
      }
    });

    it('rejects description < 5 characters', () => {
      expect(() =>
        OccurrenceEntrySchema.parse({ type: 'outro', description: 'ok' }),
      ).toThrowError(/mínimo 5 caracteres/);
    });

    it('rejects invalid occurrence type enum and lists valid options', () => {
      expect(() =>
        OccurrenceEntrySchema.parse({ type: 'emergencia', description: 'Alerta geral' }),
      ).toThrowError(/dds, acidente, paralisacao, interferencia, pendencia, outro/);
    });
  });

  describe('PhotoUploadMetadataSchema', () => {
    it('accepts valid photo metadata and coerces string numbers', () => {
      const data = {
        caption: 'Fachada leste concluída',
        workId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        takenAt: '2026-10-29T14:30:00.000Z',
        latitude: '-2.5307',
        longitude: '-44.3068',
        accuracy: '4.5',
        watermarkText: '[Marca d\'Água]: 29/10/2026 14:30 • Obra: Alphaville',
      };
      const parsed = PhotoUploadMetadataSchema.parse(data);
      expect(parsed.latitude).toBe(-2.5307);
      expect(parsed.longitude).toBe(-44.3068);
      expect(parsed.accuracy).toBe(4.5);
    });

    it('rejects out of bound latitude/longitude', () => {
      expect(() =>
        PhotoUploadMetadataSchema.parse({
          caption: 'Foto',
          workId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          takenAt: '2026-10-29T14:30:00.000Z',
          latitude: 95,
          longitude: -44,
          watermarkText: 'Carimbo Válido',
        }),
      ).toThrowError(/Latitude deve estar entre -90 e 90/);
    });
  });

  describe('CreateRDOSchema vs SubmitRDOSchema', () => {
    const validWorkId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

    it('allows empty lists in CreateRDOSchema for saving drafts', () => {
      const draft = {
        workId: validWorkId,
        date: '2026-10-29',
      };
      const parsed = CreateRDOSchema.parse(draft);
      expect(parsed.status).toBe('rascunho');
      expect(parsed.weather).toEqual([]);
      expect(parsed.labor).toEqual([]);
      expect(parsed.activities).toEqual([]);
    });

    it('rejects empty labor or activities in SubmitRDOSchema', () => {
      const submitPayload = {
        workId: validWorkId,
        date: '2026-10-29',
        weather: [{ shift: 'manha', condition: 'Sol' }],
        labor: [],
        activities: [],
      };
      expect(() => SubmitRDOSchema.parse(submitPayload)).toThrowError(
        /Ao menos uma equipe\/função de mão de obra deve ser informada/,
      );
    });

    it('accepts complete submission in SubmitRDOSchema', () => {
      const full = {
        workId: validWorkId,
        date: '2026-10-29',
        weather: [{ shift: 'manha', condition: 'Sol' }],
        labor: [{ role: 'Encarregado', quantity: 1, hours: 8 }],
        activities: [
          {
            description: 'Concretagem',
            location: 'Bloco A',
            unit: 'm³',
            quantity: 12,
            progress: 100,
          },
        ],
      };
      const parsed = SubmitRDOSchema.parse(full);
      expect(parsed.labor).toHaveLength(1);
      expect(parsed.activities).toHaveLength(1);
    });
  });

  describe('Master Workflow Schemas', () => {
    it('ReturnRDOSchema enforces minimum 10 characters', () => {
      expect(() => ReturnRDOSchema.parse({ reason: 'corrigir' })).toThrowError(
        /mínimo 10 caracteres/,
      );
      expect(
        ReturnRDOSchema.parse({
          reason: 'Faltou anexar as fotos da concretagem da laje.',
        }),
      ).toBeDefined();
    });

    it('AuditedEditSchema requires change and minimum 5 characters justification', () => {
      expect(() =>
        AuditedEditSchema.parse({
          section: 'atividades',
          field: 'description',
          previousValue: 'Pintura',
          newValue: 'Pintura',
          justification: 'Ajuste de texto técnico',
        }),
      ).toThrowError(/novo valor deve ser diferente do valor anterior/);

      expect(() =>
        AuditedEditSchema.parse({
          section: 'atividades',
          field: 'description',
          previousValue: 'Pintura',
          newValue: 'Pintura Acrílica',
          justification: 'ok',
        }),
      ).toThrowError(/mínimo 5 caracteres/);

      expect(
        AuditedEditSchema.parse({
          section: 'atividades',
          field: 'description',
          previousValue: 'Pintura',
          newValue: 'Pintura Acrílica',
          justification: 'Especificação do tipo de tinta conforme projeto executivo',
        }),
      ).toBeDefined();
    });

    it('ApproveRDOSchema validates pin and deviceId', () => {
      expect(() => ApproveRDOSchema.parse({ pin: '12', deviceId: 'dev' })).toThrow();
      expect(
        ApproveRDOSchema.parse({ pin: '1234', deviceId: 'iphone-15-pro' }),
      ).toBeDefined();
    });
  });
});
