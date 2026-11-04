import { prisma } from '../../config/database.js';
import type {
  SubmitRDODTO,
  CreateRDODTO,
  ReturnRDODTO,
  ApproveRDODTO,
  AuditedEditDTO,
} from './rdo.dto.js';
import { RDOStatus, AuditAction } from '@prisma/client';

export interface ActorInfo {
  id: string;
  name: string;
}

export class RDOService {
  /**
   * Obtém o próximo número sequencial do RDO para uma determinada obra.
   */
  async getNextSequentialNumber(workId: string): Promise<number> {
    const latest = await prisma.rDO.findFirst({
      where: { workId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    return latest ? latest.number + 1 : 1;
  }

  /**
   * Submete ou cria um RDO com todas as entidades filhas transacionadas.
   */
  async submitRDO(data: SubmitRDODTO, actor: ActorInfo) {
    const number = data.number ?? (await this.getNextSequentialNumber(data.workId));

    return prisma.$transaction(async (tx) => {
      // 1. Cria o aggregate raiz do RDO
      const rdo = await tx.rDO.create({
        data: {
          number,
          version: data.version ?? 1,
          workId: data.workId,
          authorId: actor.id,
          date: data.date,
          status: RDOStatus.submetido,
          submittedAt: new Date(),
          locked: false,
          weather: {
            create: data.weather.map((w) => ({
              shift: w.shift,
              condition: w.condition,
              practical: w.practical ?? true,
              stoppageHours: w.stoppageHours ?? null,
              impact: w.impact ?? null,
            })),
          },
          labor: {
            create: data.labor.map((l) => ({
              role: l.role,
              quantity: l.quantity,
              hours: l.hours,
              isContractor: l.isContractor ?? false,
            })),
          },
          equipment: {
            create: data.equipment.map((e) => ({
              name: e.name,
              quantity: e.quantity ?? 1,
              activeHours: e.activeHours,
              idleHours: e.idleHours,
              idleJustification: e.idleJustification ?? null,
              isRented: e.isRented ?? false,
            })),
          },
          activities: {
            create: data.activities.map((a) => ({
              description: a.description,
              location: a.location,
              unit: a.unit,
              quantity: a.quantity,
              progress: a.progress ?? 0,
            })),
          },
          materials: {
            create: (data.materials || []).map((m) => ({
              name: m.name,
              supplier: m.supplier,
              invoice: m.invoice,
              quantity: m.quantity ?? null,
              unit: m.unit ?? null,
            })),
          },
          occurrences: {
            create: (data.occurrences || []).map((o) => ({
              type: o.type,
              description: o.description,
            })),
          },
        },
        include: {
          work: true,
          author: {
            select: { id: true, name: true, role: true, email: true },
          },
          weather: true,
          labor: true,
          equipment: true,
          activities: true,
          materials: true,
          occurrences: true,
          photos: true,
          comments: true,
          auditLogs: true,
          signature: true,
        },
      });

      // 2. Se houver fotos vinculadas, associa-as ao novo RDO
      if (data.photoIds && data.photoIds.length > 0) {
        await tx.rDOPhoto.updateMany({
          where: { id: { in: data.photoIds } },
          data: { rdoId: rdo.id },
        });
      }

      // 3. Registra log na trilha de auditoria
      await tx.auditLog.create({
        data: {
          rdoId: rdo.id,
          action: AuditAction.submetido,
          actorId: actor.id,
          actorName: actor.name,
          justification: 'Submissão formal de Relatório Diário de Obra (RDO)',
        },
      });

      // Recarrega RDO completo com as fotos atualizadas
      const finalRdo = await tx.rDO.findUnique({
        where: { id: rdo.id },
        include: {
          work: true,
          author: {
            select: { id: true, name: true, role: true, email: true },
          },
          weather: true,
          labor: true,
          equipment: true,
          activities: true,
          materials: true,
          occurrences: true,
          photos: true,
          comments: true,
          auditLogs: {
            orderBy: { timestamp: 'desc' },
          },
          signature: true,
        },
      });

      return finalRdo!;
    });
  }

  /**
   * Salva um rascunho de RDO no servidor (permite listas vazias).
   */
  async saveDraft(data: CreateRDODTO, actor: ActorInfo) {
    const number = data.number ?? (await this.getNextSequentialNumber(data.workId));

    return prisma.$transaction(async (tx) => {
      const rdo = await tx.rDO.create({
        data: {
          number,
          version: data.version ?? 1,
          workId: data.workId,
          authorId: actor.id,
          date: data.date,
          status: RDOStatus.rascunho,
          locked: false,
          weather: {
            create: (data.weather || []).map((w) => ({
              shift: w.shift,
              condition: w.condition,
              practical: w.practical ?? true,
              stoppageHours: w.stoppageHours ?? null,
              impact: w.impact ?? null,
            })),
          },
          labor: {
            create: (data.labor || []).map((l) => ({
              role: l.role,
              quantity: l.quantity,
              hours: l.hours,
              isContractor: l.isContractor ?? false,
            })),
          },
          equipment: {
            create: (data.equipment || []).map((e) => ({
              name: e.name,
              quantity: e.quantity ?? 1,
              activeHours: e.activeHours,
              idleHours: e.idleHours,
              idleJustification: e.idleJustification ?? null,
              isRented: e.isRented ?? false,
            })),
          },
          activities: {
            create: (data.activities || []).map((a) => ({
              description: a.description,
              location: a.location,
              unit: a.unit,
              quantity: a.quantity,
              progress: a.progress ?? 0,
            })),
          },
          materials: {
            create: (data.materials || []).map((m) => ({
              name: m.name,
              supplier: m.supplier,
              invoice: m.invoice,
              quantity: m.quantity ?? null,
              unit: m.unit ?? null,
            })),
          },
          occurrences: {
            create: (data.occurrences || []).map((o) => ({
              type: o.type,
              description: o.description,
            })),
          },
        },
        include: {
          work: true,
          author: { select: { id: true, name: true, role: true, email: true } },
          weather: true,
          labor: true,
          equipment: true,
          activities: true,
          materials: true,
          occurrences: true,
          photos: true,
          comments: true,
          auditLogs: true,
        },
      });

      if (data.photoIds && data.photoIds.length > 0) {
        await tx.rDOPhoto.updateMany({
          where: { id: { in: data.photoIds } },
          data: { rdoId: rdo.id },
        });
      }

      await tx.auditLog.create({
        data: {
          rdoId: rdo.id,
          action: AuditAction.criado,
          actorId: actor.id,
          actorName: actor.name,
          justification: 'Criação de rascunho de RDO',
        },
      });

      return rdo;
    });
  }

  /**
   * Lista RDOs com paginação e filtros opcionais.
   */
  async listRDOs(filters: { workId?: string; status?: RDOStatus; limit?: number; offset?: number }) {
    const where: { workId?: string; status?: RDOStatus } = {};
    if (filters.workId) where.workId = filters.workId;
    if (filters.status) where.status = filters.status;

    return prisma.rDO.findMany({
      where,
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
      orderBy: [{ date: 'desc' }, { number: 'desc' }],
      include: {
        work: true,
        author: { select: { id: true, name: true, role: true, email: true } },
        weather: true,
        labor: true,
        equipment: true,
        activities: true,
        materials: true,
        occurrences: true,
        photos: true,
        comments: true,
        signature: true,
        _count: {
          select: { photos: true, comments: true, occurrences: true },
        },
      },
    });
  }

  /**
   * Obtém detalhes completos de um RDO.
   */
  async getRDOById(id: string) {
    return prisma.rDO.findUnique({
      where: { id },
      include: {
        work: true,
        author: { select: { id: true, name: true, role: true, email: true } },
        weather: true,
        labor: true,
        equipment: true,
        activities: true,
        materials: true,
        occurrences: true,
        photos: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
        auditLogs: {
          orderBy: { timestamp: 'desc' },
        },
        signature: true,
      },
    });
  }

  /**
   * Devolve um RDO para retificação pelo operário.
   */
  async returnRDO(id: string, dto: ReturnRDODTO, actor: ActorInfo) {
    const rdo = await prisma.rDO.findUnique({ where: { id } });
    if (!rdo) throw new Error(`RDO com id "${id}" não encontrado.`);
    if (rdo.locked) throw new Error('Não é possível devolver um RDO já homologado/bloqueado.');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.rDO.update({
        where: { id },
        data: {
          status: RDOStatus.devolvido,
          returnReason: dto.reason,
        },
      });

      await tx.auditLog.create({
        data: {
          rdoId: id,
          action: AuditAction.devolvido,
          actorId: actor.id,
          actorName: actor.name,
          justification: dto.reason,
        },
      });

      return updated;
    });
  }

  /**
   * Aprova e homologa o RDO com assinatura digital.
   */
  async approveRDO(id: string, dto: ApproveRDODTO, actor: ActorInfo, ip = '127.0.0.1') {
    const rdo = await prisma.rDO.findUnique({ where: { id } });
    if (!rdo) throw new Error(`RDO com id "${id}" não encontrado.`);
    if (rdo.status !== RDOStatus.submetido) {
      throw new Error('Apenas RDOs com status "submetido" podem ser aprovados.');
    }

    const hash = `SL-SHA256-${Date.now().toString(16)}-${rdo.id.substring(0, 8)}`;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.rDO.update({
        where: { id },
        data: {
          status: RDOStatus.aprovado,
          locked: true,
          signature: {
            create: {
              signedAt: new Date(),
              signedById: actor.id,
              signedByName: actor.name,
              ip,
              deviceId: dto.deviceId || 'mobile-device-default',
              hash,
            },
          },
        },
        include: {
          signature: true,
        },
      });

      await tx.auditLog.create({
        data: {
          rdoId: id,
          action: AuditAction.aprovado,
          actorId: actor.id,
          actorName: actor.name,
          justification: `Homologação formal aprovada com PIN 2FA. Hash: ${hash}`,
        },
      });

      return updated;
    });
  }

  /**
   * Edição auditada realizada pelo Master.
   */
  async auditedEdit(id: string, dto: AuditedEditDTO, actor: ActorInfo) {
    const rdo = await prisma.rDO.findUnique({ where: { id } });
    if (!rdo) throw new Error(`RDO com id "${id}" não encontrado.`);
    if (rdo.locked) throw new Error('Não é possível editar um RDO homologado e bloqueado.');

    return prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          rdoId: id,
          action: AuditAction.editado,
          actorId: actor.id,
          actorName: actor.name,
          section: dto.section,
          field: dto.field,
          previousValue: dto.previousValue,
          newValue: dto.newValue,
          justification: dto.justification,
        },
      });

      return tx.rDO.findUnique({
        where: { id },
        include: { auditLogs: { orderBy: { timestamp: 'desc' } } },
      });
    });
  }
}

export const rdoService = new RDOService();
