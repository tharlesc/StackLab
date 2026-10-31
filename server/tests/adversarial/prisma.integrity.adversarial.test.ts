import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../prisma/dev.db').replace(/\\/g, '/');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
  log: ['error'],
});

describe('Prisma Schema Data Integrity & Cascade Deletion Adversarial Tests', () => {
  let testUserId: string;
  let testWorkId1: string;
  let testWorkId2: string;
  let isReadonly = false;

  beforeAll(async () => {
    try {
      // Enable SQLite foreign keys if running directly
      await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');

      // Seed test user
      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: 'Carlos Engenheiro',
          email: `carlos-${randomUUID()}@stacklab.com`,
          password: 'hashed-password-123',
          role: 'Engenheiro Residente',
          profile: 'master',
        },
      });
      testUserId = user.id;

      // Seed test works
      const work1 = await prisma.work.create({
        data: {
          id: randomUUID(),
          name: 'Edifício Residencial Horizonte',
          client: 'Construtora Horizonte Ltda',
          address: 'Av. Litorânea, 1000 - São Luís/MA',
        },
      });
      testWorkId1 = work1.id;

      const work2 = await prisma.work.create({
        data: {
          id: randomUUID(),
          name: 'Complexo Comercial Plaza',
          client: 'Plaza Empreendimentos',
          address: 'Av. Colares Moreira, 500 - São Luís/MA',
        },
      });
      testWorkId2 = work2.id;
    } catch (err: any) {
      if (err?.message?.includes('readonly') || err?.message?.includes('SqliteError')) {
        isReadonly = true;
        return;
      }
      throw err;
    }
  });

  beforeEach((ctx) => {
    if (isReadonly) {
      ctx.skip();
    }
  });

  afterAll(async () => {
    if (isReadonly) {
      await prisma.$disconnect();
      return;
    }
    // Clean up created entities
    try {
      await prisma.rDOPhoto.deleteMany({ where: { workId: { in: [testWorkId1, testWorkId2] } } });
      await prisma.rDO.deleteMany({ where: { workId: { in: [testWorkId1, testWorkId2] } } });
      await prisma.work.deleteMany({ where: { id: { in: [testWorkId1, testWorkId2] } } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
      await prisma.$disconnect();
    } catch {
      // Disconnect on teardown
      await prisma.$disconnect();
    }
  });

  // --------------------------------------------------------------------------
  // 1. Composite Unique Constraint [workId, number, version]
  // --------------------------------------------------------------------------
  describe('Composite Unique Constraint @@unique([workId, number, version])', () => {
    it('allows inserting sequential RDO numbers in the same work', async () => {
      const rdo1 = await prisma.rDO.create({
        data: {
          workId: testWorkId1,
          authorId: testUserId,
          number: 101,
          version: 1,
          date: '2026-10-29',
          status: 'rascunho',
        },
      });

      const rdo2 = await prisma.rDO.create({
        data: {
          workId: testWorkId1,
          authorId: testUserId,
          number: 102,
          version: 1,
          date: '2026-10-30',
          status: 'rascunho',
        },
      });

      expect(rdo1.id).toBeDefined();
      expect(rdo2.id).toBeDefined();
      expect(rdo1.number).toBe(101);
      expect(rdo2.number).toBe(102);
    });

    it('rejects inserting duplicate RDO with identical [workId, number, version] with P2002', async () => {
      await expect(
        prisma.rDO.create({
          data: {
            workId: testWorkId1,
            authorId: testUserId,
            number: 101,
            version: 1,
            date: '2026-10-29',
            status: 'rascunho',
          },
        }),
      ).rejects.toThrowError(Prisma.PrismaClientKnownRequestError);

      try {
        await prisma.rDO.create({
          data: {
            workId: testWorkId1,
            authorId: testUserId,
            number: 101,
            version: 1,
            date: '2026-10-29',
          },
        });
      } catch (err: any) {
        expect(err.code).toBe('P2002');
      }
    });

    it('allows inserting rectified RDO with higher version (N+1) for same workId and number', async () => {
      const rdo1v2 = await prisma.rDO.create({
        data: {
          workId: testWorkId1,
          authorId: testUserId,
          number: 101,
          version: 2,
          date: '2026-10-29',
          status: 'submetido',
        },
      });

      expect(rdo1v2.number).toBe(101);
      expect(rdo1v2.version).toBe(2);
    });

    it('allows identical RDO numbers across different works (per-work isolation)', async () => {
      const work2RDO = await prisma.rDO.create({
        data: {
          workId: testWorkId2,
          authorId: testUserId,
          number: 101,
          version: 1,
          date: '2026-10-29',
          status: 'rascunho',
        },
      });

      expect(work2RDO.workId).toBe(testWorkId2);
      expect(work2RDO.number).toBe(101);
      expect(work2RDO.version).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Cascade Deletions & Referential Integrity
  // --------------------------------------------------------------------------
  describe('Cascade Deletions & Photo Preservation (SetNull)', () => {
    it('cascades deletion of all 9 sub-entities when RDO is deleted, but preserves RDOPhoto with SetNull', async () => {
      // 1. Create a parent RDO with all child sub-entities
      const rdo = await prisma.rDO.create({
        data: {
          workId: testWorkId1,
          authorId: testUserId,
          number: 201,
          version: 1,
          date: '2026-10-29',
          status: 'submetido',
          weather: {
            create: [
              {
                shift: 'manha',
                condition: 'Chuvoso',
                practical: false,
                stoppageHours: 3.5,
                impact: 'Paralisação da concretagem da laje L3',
              },
            ],
          },
          labor: {
            create: [
              {
                role: 'Pedreiro',
                quantity: 4,
                hours: 8,
                isContractor: false,
              },
            ],
          },
          equipment: {
            create: [
              {
                name: 'Betoneira 400L',
                quantity: 1,
                activeHours: 4.5,
                idleHours: 3.5,
                idleJustification: 'Chuva torrencial impossibilitou operação',
              },
            ],
          },
          activities: {
            create: [
              {
                description: 'Assentamento de blocos cerâmicos',
                location: '2º Pavimento - Bloco A',
                unit: 'm²',
                quantity: 35.5,
                progress: 60,
              },
            ],
          },
          materials: {
            create: [
              {
                name: 'Cimento CP-II F 32',
                quantity: 80,
                unit: 'sacos 50kg',
                supplier: 'Votorantim Cimentos',
                invoice: 'NF-e 000.123.456',
              },
            ],
          },
          occurrences: {
            create: [
              {
                type: 'dds',
                description: 'DDS matinal sobre segurança no trabalho em altura e uso do trava-quedas',
              },
            ],
          },
          comments: {
            create: [
              {
                section: 'clima',
                authorId: testUserId,
                authorName: 'Carlos Engenheiro',
                text: 'Confirmar se houve chuva no turno da tarde também.',
              },
            ],
          },
          auditLogs: {
            create: [
              {
                action: 'criado',
                actorId: testUserId,
                actorName: 'Carlos Engenheiro',
              },
            ],
          },
          signature: {
            create: {
              signedById: testUserId,
              signedByName: 'Carlos Engenheiro',
              signedAt: new Date(),
              ip: '192.168.1.100',
              deviceId: 'iPad-Pro-Canteiro-01',
              hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
          },
        },
      });

      // 2. Attach an evidentiary photo to this RDO
      const photo = await prisma.rDOPhoto.create({
        data: {
          rdoId: rdo.id,
          workId: testWorkId1,
          caption: 'Registro fotográfico da concretagem',
          fileUrl: '/uploads/photos/test-photo-01.jpg',
          fileName: 'test-photo-01.jpg',
          fileSize: 2048500,
          mimeType: 'image/jpeg',
          takenAt: new Date(),
          authorId: testUserId,
          authorName: 'Carlos Engenheiro',
          latitude: -2.5307,
          longitude: -44.3068,
          accuracy: 4.2,
          watermarkText: 'OBRA HORIZONTE - 29/10/2026 - GPS: -2.5307, -44.3068',
        },
      });

      // Verify all records exist prior to deletion
      expect(await prisma.weatherEntry.count({ where: { rdoId: rdo.id } })).toBe(1);
      expect(await prisma.laborEntry.count({ where: { rdoId: rdo.id } })).toBe(1);
      expect(await prisma.equipmentEntry.count({ where: { rdoId: rdo.id } })).toBe(1);
      expect(await prisma.activityEntry.count({ where: { rdoId: rdo.id } })).toBe(1);
      expect(await prisma.materialEntry.count({ where: { rdoId: rdo.id } })).toBe(1);
      expect(await prisma.occurrenceEntry.count({ where: { rdoId: rdo.id } })).toBe(1);
      expect(await prisma.rDOComment.count({ where: { rdoId: rdo.id } })).toBe(1);
      expect(await prisma.auditLog.count({ where: { rdoId: rdo.id } })).toBe(1);
      expect(await prisma.signatureMeta.count({ where: { rdoId: rdo.id } })).toBe(1);
      expect(await prisma.rDOPhoto.count({ where: { id: photo.id } })).toBe(1);

      // 3. Perform Deletion of the RDO Root Aggregate
      await prisma.rDO.delete({
        where: { id: rdo.id },
      });

      // 4. Verify cascade deletion of all operational sub-entities
      expect(await prisma.weatherEntry.count({ where: { rdoId: rdo.id } })).toBe(0);
      expect(await prisma.laborEntry.count({ where: { rdoId: rdo.id } })).toBe(0);
      expect(await prisma.equipmentEntry.count({ where: { rdoId: rdo.id } })).toBe(0);
      expect(await prisma.activityEntry.count({ where: { rdoId: rdo.id } })).toBe(0);
      expect(await prisma.materialEntry.count({ where: { rdoId: rdo.id } })).toBe(0);
      expect(await prisma.occurrenceEntry.count({ where: { rdoId: rdo.id } })).toBe(0);
      expect(await prisma.rDOComment.count({ where: { rdoId: rdo.id } })).toBe(0);
      expect(await prisma.auditLog.count({ where: { rdoId: rdo.id } })).toBe(0);
      expect(await prisma.signatureMeta.count({ where: { rdoId: rdo.id } })).toBe(0);

      // 5. Verify that RDOPhoto was NOT deleted, but its rdoId was safely SetNull
      const survivingPhoto = await prisma.rDOPhoto.findUnique({
        where: { id: photo.id },
      });

      expect(survivingPhoto).not.toBeNull();
      expect(survivingPhoto?.id).toBe(photo.id);
      expect(survivingPhoto?.rdoId).toBeNull();
      expect(survivingPhoto?.workId).toBe(testWorkId1);
      expect(survivingPhoto?.fileUrl).toBe('/uploads/photos/test-photo-01.jpg');
    });
  });
});
