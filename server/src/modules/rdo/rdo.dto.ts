import { z } from 'zod';

// ============================================================================
// 1. Shift & Weather (Clima por Turno)
// ============================================================================

export const ShiftEnum = z.enum(['manha', 'tarde', 'noite'], {
  errorMap: () => ({ message: 'Turno inválido. Valores permitidos: manha, tarde, noite.' }),
});

export type ShiftDTO = z.infer<typeof ShiftEnum>;

export const WeatherEntrySchema = z
  .object({
    shift: ShiftEnum,
    condition: z.string().trim().min(1, 'Condição climática é obrigatória'),
    practical: z.boolean().optional(),
    stoppageHours: z
      .number()
      .min(0, 'Horas de paralisação não podem ser negativas')
      .max(24, 'Horas de paralisação não podem exceder 24h')
      .optional(),
    impact: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const isRain =
      data.condition.toLowerCase().includes('chuva') ||
      data.condition.toLowerCase().includes('chuvoso');

    if (isRain) {
      if (data.stoppageHours === undefined || data.stoppageHours === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Horas de paralisação são obrigatórias quando há condição de chuva.',
          path: ['stoppageHours'],
        });
      }

      if (
        typeof data.stoppageHours === 'number' &&
        data.stoppageHours > 0 &&
        (!data.impact || data.impact.trim().length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Justificativa do impacto é obrigatória quando houver horas de paralisação por chuva.',
          path: ['impact'],
        });
      }
    }
  });

export type WeatherEntryDTO = z.infer<typeof WeatherEntrySchema>;

// ============================================================================
// 2. Labor (Efetivo / Mão de Obra)
// ============================================================================

export const LaborEntrySchema = z
  .object({
    role: z.string().trim().min(2, 'Função/cargo é obrigatório (mínimo 2 caracteres)'),
    quantity: z
      .number()
      .int('Quantidade de operários deve ser um número inteiro')
      .positive('Quantidade de operários deve ser maior que zero'),
    hours: z
      .number()
      .positive('Horas trabalhadas devem ser maiores que zero')
      .max(24, 'Jornada não pode exceder 24 horas'),
    isContractor: z.boolean().optional(),
    isSubcontracted: z.boolean().optional(),
  })
  .transform((data) => ({
    ...data,
    isContractor: data.isContractor ?? data.isSubcontracted ?? false,
  }));

export type LaborEntryDTO = z.infer<typeof LaborEntrySchema>;

// ============================================================================
// 3. Equipment (Maquinário / Equipamentos)
// ============================================================================

export const EquipmentEntrySchema = z
  .object({
    name: z.string().trim().min(2, 'Nome do equipamento é obrigatório (mínimo 2 caracteres)'),
    quantity: z
      .number()
      .int('Quantidade de equipamentos deve ser um número inteiro')
      .positive('Quantidade de equipamentos deve ser maior que zero')
      .default(1),
    activeHours: z
      .number()
      .min(0, 'Horas ativas não podem ser negativas')
      .max(24, 'Horas ativas não podem exceder 24h'),
    idleHours: z
      .number()
      .min(0, 'Horas ociosas não podem ser negativas')
      .max(24, 'Horas ociosas não podem exceder 24h'),
    idleJustification: z.string().trim().optional(),
    isRented: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.activeHours + data.idleHours > 24) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A soma de horas ativas e horas ociosas não pode exceder 24 horas no mesmo dia.',
        path: ['idleHours'],
      });
    }

    if (data.idleHours > 0) {
      if (!data.idleJustification || data.idleJustification.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Justificativa de ociosidade é obrigatória (mínimo 5 caracteres) quando houver horas ociosas.',
          path: ['idleJustification'],
        });
      }
    }
  });

export type EquipmentEntryDTO = z.infer<typeof EquipmentEntrySchema>;

// ============================================================================
// 4. Activity (Atividades Executadas)
// ============================================================================

export const ActivityEntrySchema = z.object({
  description: z.string().trim().min(3, 'Descrição da atividade é obrigatória (mínimo 3 caracteres)'),
  location: z.string().trim().min(2, 'Localização/frente de serviço é obrigatória (mínimo 2 caracteres)'),
  unit: z.string().trim().min(1, 'Unidade de medida é obrigatória (ex: m², m³, un, kg)'),
  quantity: z.number().positive('Quantidade executada deve ser maior que zero'),
  progress: z
    .number()
    .min(0, 'Avanço físico mínimo é 0%')
    .max(100, 'Avanço físico máximo é 100%')
    .optional(),
});

export type ActivityEntryDTO = z.infer<typeof ActivityEntrySchema>;

// ============================================================================
// 5. Material (Materiais Recebidos / Insumos)
// ============================================================================

export const MaterialEntrySchema = z.object({
  name: z.string().trim().min(2, 'Nome do material é obrigatório (mínimo 2 caracteres)'),
  supplier: z.string().trim().min(2, 'Fornecedor é obrigatório (mínimo 2 caracteres)'),
  invoice: z.string().trim().min(2, 'Número da nota fiscal é obrigatório (mínimo 2 caracteres)'),
  quantity: z.number().positive('Quantidade deve ser positiva').optional(),
  unit: z.string().trim().optional(),
});

export type MaterialEntryDTO = z.infer<typeof MaterialEntrySchema>;

// ============================================================================
// 6. Occurrence (Fatos Relevantes & DDS)
// ============================================================================

export const OccurrenceTypeEnum = z.enum(
  ['dds', 'acidente', 'paralisacao', 'interferencia', 'pendencia', 'outro'],
  {
    errorMap: () => ({
      message:
        'Tipo de ocorrência inválido. Valores permitidos: dds, acidente, paralisacao, interferencia, pendencia, outro.',
    }),
  },
);

export type OccurrenceTypeDTO = z.infer<typeof OccurrenceTypeEnum>;

export const OccurrenceEntrySchema = z.object({
  type: OccurrenceTypeEnum,
  description: z
    .string()
    .trim()
    .min(5, 'Descrição da ocorrência é obrigatória (mínimo 5 caracteres)'),
});

export type OccurrenceEntryDTO = z.infer<typeof OccurrenceEntrySchema>;

// ============================================================================
// 7. Photo Upload Metadata
// ============================================================================

export const PhotoUploadMetadataSchema = z.object({
  caption: z.string().trim().min(1, 'Legenda da foto é obrigatória'),
  workId: z.string().uuid('ID de obra inválido (deve ser UUID)'),
  takenAt: z
    .string()
    .datetime({ message: 'Data/hora de captura deve estar no formato ISO 8601' }),
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude deve estar entre -90 e 90 graus')
    .max(90, 'Latitude deve estar entre -90 e 90 graus'),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude deve estar entre -180 e 180 graus')
    .max(180, 'Longitude deve estar entre -180 e 180 graus'),
  accuracy: z.coerce.number().min(0, 'Precisão do GPS não pode ser negativa').optional(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  hash: z.string().optional(),
  watermarkText: z
    .string()
    .trim()
    .min(5, 'Texto da marca d\'água é obrigatório (mínimo 5 caracteres)'),
  rdoId: z.string().uuid('ID de RDO inválido').optional(),
});

export type PhotoUploadMetadataDTO = z.infer<typeof PhotoUploadMetadataSchema>;

// ============================================================================
// 8. RDO Creation & Submission (Draft & Submetido)
// ============================================================================

export const DateStringRegex = /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/;

export const CreateRDOSchema = z.object({
  workId: z.string().uuid('ID de obra inválido (deve ser UUID)'),
  date: z
    .string()
    .regex(DateStringRegex, 'Data deve estar no formato YYYY-MM-DD ou DD/MM/YYYY'),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  number: z.number().int().positive().optional(),
  version: z.number().int().positive().optional(),
  weather: z.array(WeatherEntrySchema).default([]),
  labor: z.array(LaborEntrySchema).default([]),
  equipment: z.array(EquipmentEntrySchema).default([]),
  activities: z.array(ActivityEntrySchema).default([]),
  materials: z.array(MaterialEntrySchema).default([]),
  occurrences: z.array(OccurrenceEntrySchema).default([]),
  photoIds: z.array(z.string().uuid('ID de foto inválido')).default([]),
  status: z.enum(['rascunho', 'submetido']).default('rascunho'),
});

export type CreateRDODTO = z.infer<typeof CreateRDOSchema>;

export const SubmitRDOSchema = z
  .object({
    workId: z.string().uuid('ID de obra inválido (deve ser UUID)'),
    date: z
      .string()
      .regex(DateStringRegex, 'Data deve estar no formato YYYY-MM-DD ou DD/MM/YYYY'),
    authorId: z.string().optional(),
    authorName: z.string().optional(),
    number: z.number().int().positive().optional(),
    version: z.number().int().positive().optional(),
    weather: z.array(WeatherEntrySchema).min(1, 'Ao menos um turno climático deve ser informado'),
    labor: z
      .array(LaborEntrySchema)
      .min(1, 'Ao menos uma equipe/função de mão de obra deve ser informada'),
    equipment: z.array(EquipmentEntrySchema).default([]),
    activities: z
      .array(ActivityEntrySchema)
      .min(1, 'Ao menos uma atividade executada deve ser informada'),
    materials: z.array(MaterialEntrySchema).default([]),
    occurrences: z.array(OccurrenceEntrySchema).default([]),
    photoIds: z.array(z.string().uuid('ID de foto inválido')).default([]),
  })
  .superRefine((data, ctx) => {
    const totalHeadcount = data.labor.reduce((sum, item) => sum + item.quantity, 0);
    if (totalHeadcount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'O efetivo total de colaboradores informados deve ser de no mínimo 1 operário.',
        path: ['labor'],
      });
    }
  });

export type SubmitRDODTO = z.infer<typeof SubmitRDOSchema>;

export const UpdateRDOSchema = CreateRDOSchema.partial();

export type UpdateRDODTO = z.infer<typeof UpdateRDOSchema>;

// ============================================================================
// 9. Master Profile Actions (Return, Audited Edit, Approve, Comment)
// ============================================================================

export const ReturnRDOSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'A justificativa de devolução deve ter no mínimo 10 caracteres'),
});

export type ReturnRDODTO = z.infer<typeof ReturnRDOSchema>;

export const AuditedEditSchema = z
  .object({
    section: z.enum(
      [
        'identificacao',
        'clima',
        'maoDeObra',
        'equipamentos',
        'atividades',
        'materiais',
        'ocorrencias',
        'fotos',
      ],
      { errorMap: () => ({ message: 'Seção de RDO inválida.' }) },
    ),
    field: z.string().trim().min(1, 'Identificador de campo é obrigatório'),
    previousValue: z.string(),
    newValue: z.string().trim().min(1, 'Novo valor é obrigatório'),
    justification: z
      .string()
      .trim()
      .min(5, 'A justificativa da alteração deve ter no mínimo 5 caracteres'),
  })
  .refine((data) => data.newValue !== data.previousValue, {
    message: 'O novo valor deve ser diferente do valor anterior.',
    path: ['newValue'],
  });

export type AuditedEditDTO = z.infer<typeof AuditedEditSchema>;

export const ApproveRDOSchema = z.object({
  pin: z.string().trim().min(4, 'PIN deve possuir no mínimo 4 caracteres'),
  deviceId: z.string().trim().min(1, 'Identificador de dispositivo é obrigatório'),
});

export type ApproveRDODTO = z.infer<typeof ApproveRDOSchema>;

export const AddCommentSchema = z.object({
  section: z.enum([
    'identificacao',
    'clima',
    'maoDeObra',
    'equipamentos',
    'atividades',
    'materiais',
    'ocorrencias',
    'fotos',
  ]),
  text: z.string().trim().min(1, 'Texto do comentário não pode ser vazio'),
});

export type AddCommentDTO = z.infer<typeof AddCommentSchema>;

export const RDOParamsSchema = z.object({
  id: z.string().uuid('ID do RDO deve ser um UUID válido'),
});

export type RDOParamsDTO = z.infer<typeof RDOParamsSchema>;

export const RDOQuerySchema = z.object({
  workId: z.string().uuid().optional(),
  status: z.enum(['rascunho', 'submetido', 'devolvido', 'aprovado', 'all']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
});

export type RDOQueryDTO = z.infer<typeof RDOQuerySchema>;
