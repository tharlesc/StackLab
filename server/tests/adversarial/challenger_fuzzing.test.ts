import { describe, it, expect } from 'vitest';
import {
  OccurrenceTypeEnum,
  OccurrenceEntrySchema,
  LaborEntrySchema,
  EquipmentEntrySchema,
  SubmitRDOSchema,
  CreateRDOSchema,
} from '../../src/modules/rdo/rdo.dto.js';

describe('Challenger M1 R2 Adversarial Fuzzing & Stress Suite', () => {
  // ==========================================================================
  // Section A: OccurrenceTypeEnum & OccurrenceEntrySchema Fuzzing
  // ==========================================================================
  describe('A. OccurrenceTypeEnum & OccurrenceEntrySchema Fuzzing', () => {
    const validTypes = ['dds', 'acidente', 'paralisacao', 'interferencia', 'pendencia', 'outro'] as const;

    it('A1. Accepts all 6 statutory occurrence types cleanly', () => {
      for (const t of validTypes) {
        expect(OccurrenceTypeEnum.parse(t)).toBe(t);
        const parsed = OccurrenceEntrySchema.parse({
          type: t,
          description: `Justificativa legal e detalhamento técnico para ${t}`,
        });
        expect(parsed.type).toBe(t);
      }
    });

    it('A2. Rejects unexpected and unauthorized occurrence types with Portuguese message', () => {
      const invalidTypes = [
        'emergencia',
        'fatalidade',
        'greve',
        'chuva',
        'clima',
        'atraso',
        'furto',
        'embargo',
        'notificacao',
        '',
      ];

      for (const invalid of invalidTypes) {
        expect(() => OccurrenceTypeEnum.parse(invalid)).toThrowError(
          /Tipo de ocorrência inválido\. Valores permitidos: dds, acidente, paralisacao, interferencia, pendencia, outro\./,
        );
      }
    });

    it('A3. Rejects uppercase and mixed-case occurrence types (strict case sensitivity)', () => {
      const casedTypes = [
        'DDS',
        'Dds',
        'ACIDENTE',
        'Acidente',
        'PARALISACAO',
        'Paralisacao',
        'Paralisação', // with accent
        'INTERFERENCIA',
        'Interferencia',
        'Interferência', // with accent
        'PENDENCIA',
        'Pendencia',
        'OUTRO',
        'Outro',
      ];

      for (const cased of casedTypes) {
        expect(() => OccurrenceTypeEnum.parse(cased)).toThrow();
        expect(() =>
          OccurrenceEntrySchema.parse({
            type: cased,
            description: 'Validação de sensibilidade de caixa',
          }),
        ).toThrow();
      }
    });

    it('A4. Rejects occurrence types with leading, trailing or internal whitespaces', () => {
      const whitespaceTypes = [
        ' dds',
        'dds ',
        ' dds ',
        '  paralisacao',
        'paralisacao  ',
        '\tinterferencia',
        'interferencia\n',
        'outro ',
        ' pendencia ',
      ];

      for (const ws of whitespaceTypes) {
        expect(() => OccurrenceTypeEnum.parse(ws)).toThrow();
      }
    });

    it('A5. Rejects non-string types for OccurrenceTypeEnum', () => {
      const nonStrings = [123, true, false, null, undefined, {}, [], Symbol('dds')];
      for (const val of nonStrings) {
        expect(() => OccurrenceTypeEnum.parse(val)).toThrow();
      }
    });

    it('A6. OccurrenceEntrySchema enforces description boundaries and trimming', () => {
      // Rejects short description (< 5 characters)
      expect(() =>
        OccurrenceEntrySchema.parse({
          type: 'dds',
          description: '1234',
        }),
      ).toThrowError(/mínimo 5 caracteres/);

      // Rejects empty or whitespace-only description
      expect(() =>
        OccurrenceEntrySchema.parse({
          type: 'paralisacao',
          description: '      ',
        }),
      ).toThrowError(/mínimo 5 caracteres/);

      // Trims description and accepts if trimmed length >= 5
      const parsed = OccurrenceEntrySchema.parse({
        type: 'interferencia',
        description: '   Rede subterrânea identificada   ',
      });
      expect(parsed.description).toBe('Rede subterrânea identificada');
    });
  });

  // ==========================================================================
  // Section B: LaborEntrySchema Fuzzing (Contractor & Boundaries)
  // ==========================================================================
  describe('B. LaborEntrySchema Contractor Flag & Boundary Fuzzing', () => {
    it('B1. Defaults isContractor to false when omitted', () => {
      const input = { role: 'Pedreiro', quantity: 3, hours: 8 };
      const parsed = LaborEntrySchema.parse(input);
      expect(parsed.isContractor).toBe(false);
      expect(parsed.role).toBe('Pedreiro');
      expect(parsed.quantity).toBe(3);
      expect(parsed.hours).toBe(8);
    });

    it('B2. Correctly preserves explicit isContractor boolean values', () => {
      const contractorTrue = LaborEntrySchema.parse({
        role: 'Eletricista',
        quantity: 2,
        hours: 8,
        isContractor: true,
      });
      expect(contractorTrue.isContractor).toBe(true);

      const contractorFalse = LaborEntrySchema.parse({
        role: 'Eletricista',
        quantity: 2,
        hours: 8,
        isContractor: false,
      });
      expect(contractorFalse.isContractor).toBe(false);
    });

    it('B3. Supports legacy isSubcontracted field mapping to isContractor', () => {
      const legacyTrue = LaborEntrySchema.parse({
        role: 'Pintor',
        quantity: 4,
        hours: 8,
        isSubcontracted: true,
      });
      expect(legacyTrue.isContractor).toBe(true);

      const legacyFalse = LaborEntrySchema.parse({
        role: 'Pintor',
        quantity: 4,
        hours: 8,
        isSubcontracted: false,
      });
      expect(legacyFalse.isContractor).toBe(false);
    });

    it('B4. Priority precedence: isContractor takes precedence over isSubcontracted when defined', () => {
      // isContractor: false, isSubcontracted: true -> isContractor should win (explicit false)
      const parsed1 = LaborEntrySchema.parse({
        role: 'Serralheiro',
        quantity: 1,
        hours: 8,
        isContractor: false,
        isSubcontracted: true,
      });
      expect(parsed1.isContractor).toBe(false);

      // isContractor: true, isSubcontracted: false -> isContractor should win (explicit true)
      const parsed2 = LaborEntrySchema.parse({
        role: 'Serralheiro',
        quantity: 1,
        hours: 8,
        isContractor: true,
        isSubcontracted: false,
      });
      expect(parsed2.isContractor).toBe(true);
    });

    it('B5. Boundary fuzzing on labor hours: rejects <= 0, > 24, NaN, Infinity', () => {
      // Zero hours
      expect(() =>
        LaborEntrySchema.parse({ role: 'Ajudante', quantity: 1, hours: 0 }),
      ).toThrowError(/Horas trabalhadas devem ser maiores que zero/);

      // Negative hours
      expect(() =>
        LaborEntrySchema.parse({ role: 'Ajudante', quantity: 1, hours: -0.001 }),
      ).toThrowError(/Horas trabalhadas devem ser maiores que zero/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Ajudante', quantity: 1, hours: -1 }),
      ).toThrowError(/Horas trabalhadas devem ser maiores que zero/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Ajudante', quantity: 1, hours: -24 }),
      ).toThrowError(/Horas trabalhadas devem ser maiores que zero/);

      // Fractional hours > 24
      expect(() =>
        LaborEntrySchema.parse({ role: 'Ajudante', quantity: 1, hours: 24.0001 }),
      ).toThrowError(/Jornada não pode exceder 24 horas/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Ajudante', quantity: 1, hours: 24.1 }),
      ).toThrowError(/Jornada não pode exceder 24 horas/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Ajudante', quantity: 1, hours: 25 }),
      ).toThrowError(/Jornada não pode exceder 24 horas/);

      // NaN / Infinity
      expect(() =>
        LaborEntrySchema.parse({ role: 'Ajudante', quantity: 1, hours: NaN }),
      ).toThrow();

      expect(() =>
        LaborEntrySchema.parse({ role: 'Ajudante', quantity: 1, hours: Infinity }),
      ).toThrow();
    });

    it('B6. Valid hours: accepts fractional hours in (0, 24] range', () => {
      const fractionalHours = [0.1, 0.5, 4.25, 8, 8.5, 10.75, 23.9, 24];
      for (const h of fractionalHours) {
        const parsed = LaborEntrySchema.parse({ role: 'Armador', quantity: 2, hours: h });
        expect(parsed.hours).toBe(h);
      }
    });

    it('B7. Quantity fuzzing: rejects 0, negative integers, floats, NaN, non-integers', () => {
      // Zero
      expect(() =>
        LaborEntrySchema.parse({ role: 'Carpinteiro', quantity: 0, hours: 8 }),
      ).toThrowError(/Quantidade de operários deve ser maior que zero/);

      // Negative
      expect(() =>
        LaborEntrySchema.parse({ role: 'Carpinteiro', quantity: -1, hours: 8 }),
      ).toThrowError(/Quantidade de operários deve ser maior que zero/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Carpinteiro', quantity: -10, hours: 8 }),
      ).toThrowError(/Quantidade de operários deve ser maior que zero/);

      // Floats / Decimals
      expect(() =>
        LaborEntrySchema.parse({ role: 'Carpinteiro', quantity: 1.5, hours: 8 }),
      ).toThrowError(/número inteiro/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Carpinteiro', quantity: 0.5, hours: 8 }),
      ).toThrowError(/número inteiro/);

      expect(() =>
        LaborEntrySchema.parse({ role: 'Carpinteiro', quantity: 2.0001, hours: 8 }),
      ).toThrowError(/número inteiro/);

      // Missing
      expect(() =>
        LaborEntrySchema.parse({ role: 'Carpinteiro', hours: 8 } as any),
      ).toThrow();
    });

    it('B8. Quantity fuzzing: accepts positive integers up to large scales', () => {
      const validQuantities = [1, 2, 10, 50, 100, 1000, 50000];
      for (const q of validQuantities) {
        const parsed = LaborEntrySchema.parse({ role: 'Operário', quantity: q, hours: 8 });
        expect(parsed.quantity).toBe(q);
      }
    });

    it('B9. Role string validation: enforces min 2 chars and trims whitespace', () => {
      expect(() =>
        LaborEntrySchema.parse({ role: 'A', quantity: 1, hours: 8 }),
      ).toThrowError(/Função\/cargo é obrigatório \(mínimo 2 caracteres\)/);

      expect(() =>
        LaborEntrySchema.parse({ role: '   ', quantity: 1, hours: 8 }),
      ).toThrowError(/Função\/cargo é obrigatório \(mínimo 2 caracteres\)/);

      const parsed = LaborEntrySchema.parse({
        role: '   Encarregado Geral   ',
        quantity: 1,
        hours: 8,
      });
      expect(parsed.role).toBe('Encarregado Geral');
    });
  });

  // ==========================================================================
  // Section C: EquipmentEntrySchema Fuzzing (Quantity & Boundaries)
  // ==========================================================================
  describe('C. EquipmentEntrySchema Quantity & Boundary Fuzzing', () => {
    const baseEquipment = {
      name: 'Retroescavadeira JCB',
      activeHours: 8,
      idleHours: 0,
    };

    it('C1. Rejects quantity === 0 with specific error message', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          ...baseEquipment,
          quantity: 0,
        }),
      ).toThrowError(/Quantidade de equipamentos deve ser maior que zero/);
    });

    it('C2. Rejects negative quantities (e.g. quantity === -1, -50)', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          ...baseEquipment,
          quantity: -1,
        }),
      ).toThrowError(/Quantidade de equipamentos deve ser maior que zero/);

      expect(() =>
        EquipmentEntrySchema.parse({
          ...baseEquipment,
          quantity: -50,
        }),
      ).toThrowError(/Quantidade de equipamentos deve ser maior que zero/);
    });

    it('C3. Rejects float quantities (e.g. quantity === 1.5, 0.5, 2.7)', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          ...baseEquipment,
          quantity: 1.5,
        }),
      ).toThrowError(/Quantidade de equipamentos deve ser um número inteiro/);

      expect(() =>
        EquipmentEntrySchema.parse({
          ...baseEquipment,
          quantity: 0.5,
        }),
      ).toThrowError(/Quantidade de equipamentos deve ser um número inteiro/);

      expect(() =>
        EquipmentEntrySchema.parse({
          ...baseEquipment,
          quantity: 2.7,
        }),
      ).toThrowError(/Quantidade de equipamentos deve ser um número inteiro/);
    });

    it('C4. Defaults quantity to 1 when quantity is omitted or undefined', () => {
      const omitted = EquipmentEntrySchema.parse({
        name: 'Betoneira 400L',
        activeHours: 6,
        idleHours: 0,
      });
      expect(omitted.quantity).toBe(1);

      const withUndefined = EquipmentEntrySchema.parse({
        name: 'Betoneira 400L',
        quantity: undefined,
        activeHours: 6,
        idleHours: 0,
      });
      expect(withUndefined.quantity).toBe(1);
    });

    it('C5. Accepts large positive integer quantities', () => {
      const largeIntegers = [1, 5, 25, 100, 1000, 999999];
      for (const qty of largeIntegers) {
        const parsed = EquipmentEntrySchema.parse({
          ...baseEquipment,
          quantity: qty,
        });
        expect(parsed.quantity).toBe(qty);
      }
    });

    it('C6. Rejects non-numeric types for quantity', () => {
      const nonNumeric = ['1', 'um', null, {}, [1], true];
      for (const bad of nonNumeric) {
        expect(() =>
          EquipmentEntrySchema.parse({
            ...baseEquipment,
            quantity: bad as any,
          }),
        ).toThrow();
      }
    });

    it('C7. Enforces activeHours + idleHours <= 24 constraint', () => {
      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Guindaste',
          activeHours: 12.5,
          idleHours: 12,
          idleJustification: 'Aguardando manobra de içamento',
        }),
      ).toThrowError(/A soma de horas ativas e horas ociosas não pode exceder 24 horas no mesmo dia\./);

      const validBoundary = EquipmentEntrySchema.parse({
        name: 'Guindaste',
        activeHours: 12,
        idleHours: 12,
        idleJustification: 'Aguardando manobra de içamento',
      });
      expect(validBoundary.activeHours + validBoundary.idleHours).toBe(24);
    });

    it('C8. Enforces idleJustification min length 5 when idleHours > 0', () => {
      // Missing
      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Compactador',
          activeHours: 4,
          idleHours: 4,
        }),
      ).toThrowError(/Justificativa de ociosidade é obrigatória \(mínimo 5 caracteres\) quando houver horas ociosas\./);

      // 4 characters
      expect(() =>
        EquipmentEntrySchema.parse({
          name: 'Compactador',
          activeHours: 4,
          idleHours: 4,
          idleJustification: '1234',
        }),
      ).toThrowError(/mínimo 5 caracteres/);

      // Exactly 5 characters
      const valid = EquipmentEntrySchema.parse({
        name: 'Compactador',
        activeHours: 4,
        idleHours: 4,
        idleJustification: 'quebr',
      });
      expect(valid.idleJustification).toBe('quebr');
    });
  });

  // ==========================================================================
  // Section D: Composite Lifecycle & Aggregate Submission Invariants
  // ==========================================================================
  describe('D. Composite Lifecycle & Aggregate Submission Invariants', () => {
    const validWorkId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    it('D1. SubmitRDOSchema validates aggregate with transformed labor and all occurrence types', () => {
      const submission = {
        workId: validWorkId,
        date: '2026-10-29',
        weather: [
          { shift: 'manha' as const, condition: 'Sol entre nuvens' },
          { shift: 'tarde' as const, condition: 'Chuva fraca', stoppageHours: 1, impact: 'Pausa preventiva' },
        ],
        labor: [
          { role: 'Encarregado', quantity: 1, hours: 8, isContractor: false },
          { role: 'Eletricista Terceirizado', quantity: 3, hours: 8, isSubcontracted: true },
        ],
        equipment: [
          { name: 'Betoneira', activeHours: 6, idleHours: 0 }, // default quantity 1
          { name: 'Andaime', quantity: 10, activeHours: 8, idleHours: 0 },
        ],
        activities: [
          {
            description: 'Instalação de eletrodutos no 3º pavimento',
            location: 'Ala Norte',
            unit: 'm',
            quantity: 45,
            progress: 30,
          },
        ],
        occurrences: [
          { type: 'dds' as const, description: 'DDS sobre uso correto de EPIs e trabalho elétrico.' },
          { type: 'paralisacao' as const, description: 'Paralisação momentânea devido à chuva fraca na laje.' },
          { type: 'interferencia' as const, description: 'Interferência entre tubulações hidrossanitárias e eletrocalhas.' },
        ],
      };

      const parsed = SubmitRDOSchema.parse(submission);
      expect(parsed.labor[0].isContractor).toBe(false);
      expect(parsed.labor[1].isContractor).toBe(true);
      expect(parsed.equipment[0].quantity).toBe(1);
      expect(parsed.equipment[1].quantity).toBe(10);
      expect(parsed.occurrences).toHaveLength(3);
    });

    it('D2. SubmitRDOSchema rejects submission when total labor headcount is 0', () => {
      expect(() =>
        SubmitRDOSchema.parse({
          workId: validWorkId,
          date: '2026-10-29',
          weather: [{ shift: 'manha' as const, condition: 'Ensolarado' }],
          labor: [],
          activities: [
            { description: 'Alvenaria', location: 'Térreo', unit: 'm²', quantity: 10 },
          ],
        }),
      ).toThrowError(/Ao menos uma equipe\/função de mão de obra deve ser informada/);
    });
  });
});
