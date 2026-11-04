import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { randomUUID } from 'crypto';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';

const request = supertest(app);

describe('RDO API Integration Tests', () => {
  let testUserId: string;
  let testWorkId: string;

  beforeAll(async () => {
    // Cria dados de seed para os testes
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: 'Operário Teste',
        email: `worker-${randomUUID()}@stacklab.com`,
        password: 'hash-password',
        role: 'Encarregado',
        profile: 'common',
      },
    });
    testUserId = user.id;

    const work = await prisma.work.create({
      data: {
        id: randomUUID(),
        name: 'Obra Teste Integração',
        client: 'Cliente Teste',
        address: 'Rua das Flores, 123',
      },
    });
    testWorkId = work.id;
  });

  afterAll(async () => {
    // Limpeza de dados gerados
    await prisma.rDOPhoto.deleteMany({ where: { workId: testWorkId } });
    await prisma.rDO.deleteMany({ where: { workId: testWorkId } });
    await prisma.work.deleteMany({ where: { id: testWorkId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  describe('POST /api/v1/rdos (Submit RDO)', () => {
    it('creates and submits a full RDO with nested modules', async () => {
      const payload = {
        workId: testWorkId,
        date: '2026-10-31',
        authorId: testUserId,
        authorName: 'Operário Teste',
        weather: [
          { shift: 'manha', condition: 'Ensolarado', practical: true },
          { shift: 'tarde', condition: 'Nublado', practical: true },
        ],
        labor: [
          { role: 'Pedreiro', quantity: 4, hours: 8, isContractor: false },
          { role: 'Eletricista', quantity: 2, hours: 8, isContractor: true },
        ],
        equipment: [
          { name: 'Betoneira 400L', quantity: 1, activeHours: 8, idleHours: 0, isRented: false },
        ],
        activities: [
          {
            description: 'Concretagem de pilares do 2º pavimento',
            location: '2º Pavimento',
            unit: 'm³',
            quantity: 18.5,
            progress: 85,
          },
        ],
        materials: [
          { name: 'Cimento CP-II', supplier: 'Votoran', invoice: 'NF-10294', quantity: 50, unit: 'sacos' },
        ],
        occurrences: [
          { type: 'dds', description: 'DDS matinal sobre segurança no trabalho em altura.' },
        ],
      };

      const res = await request.post('/api/v1/rdos').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.workId).toBe(testWorkId);
      expect(res.body.data.status).toBe('submetido');
      expect(res.body.data.labor).toHaveLength(2);
      expect(res.body.data.weather).toHaveLength(2);
      expect(res.body.data.activities).toHaveLength(1);
      expect(res.body.data.activities[0].progress).toBe(85);
      expect(res.body.data.auditLogs).toHaveLength(1);
    });

    it('rejects submission without labor with 400 Validation Error', async () => {
      const invalidPayload = {
        workId: testWorkId,
        date: '2026-10-31',
        weather: [{ shift: 'manha', condition: 'Ensolarado', practical: true }],
        labor: [], // Vazio!
        equipment: [],
        activities: [
          { description: 'Atividade sem operário', location: 'Térreo', unit: 'm', quantity: 10 },
        ],
      };

      const res = await request.post('/api/v1/rdos').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });

    it('rejects submission with rain stoppage without impact description', async () => {
      const invalidPayload = {
        workId: testWorkId,
        date: '2026-10-31',
        weather: [
          { shift: 'tarde', condition: 'Chuva', stoppageHours: 3 }, // missing impact!
        ],
        labor: [{ role: 'Servente', quantity: 2, hours: 8 }],
        equipment: [],
        activities: [{ description: 'Escavação manual', location: 'Subsolo', unit: 'm³', quantity: 5 }],
      };

      const res = await request.post('/api/v1/rdos').send(invalidPayload);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/rdos/draft (Save Draft)', () => {
    it('accepts saving drafts with empty lists and sets status to rascunho', async () => {
      const draftPayload = {
        workId: testWorkId,
        date: '2026-10-31',
        authorId: testUserId,
        authorName: 'Operário Teste',
        weather: [],
        labor: [],
        equipment: [],
        activities: [],
      };

      const res = await request.post('/api/v1/rdos/draft').send(draftPayload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('rascunho');
    });
  });

  describe('POST /api/v1/photos/upload (Upload Photo with Watermark Metadata)', () => {
    it('uploads a photo with security watermark metadata', async () => {
      const buffer = Buffer.from('fake-image-bytes-jpeg');

      const res = await request
        .post('/api/v1/photos/upload')
        .attach('photo', buffer, 'canteiro.jpg')
        .field('workId', testWorkId)
        .field('takenAt', new Date().toISOString())
        .field('caption', 'Armação de vigas do 2º pavimento')
        .field('latitude', '-2.5307')
        .field('longitude', '-44.3068')
        .field('accuracy', '3.5')
        .field(
          'watermarkText',
          '[STACKLAB SECURITY] Obra: Teste | Data: 2026-10-31 | GPS: -2.5307, -44.3068 | Autor: Operário Teste',
        );

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.fileUrl).toContain('/uploads/photos/');
      expect(res.body.data.latitude).toBe(-2.5307);
    });
  });

  describe('GET /api/v1/rdos and GET /api/v1/rdos/:id', () => {
    it('lists rdos filtered by workId and retrieves single rdo with relations', async () => {
      const listRes = await request.get(`/api/v1/rdos?workId=${testWorkId}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.results).toBeGreaterThanOrEqual(1);

      const targetId = listRes.body.data[0].id;
      const getRes = await request.get(`/api/v1/rdos/${targetId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.id).toBe(targetId);
      expect(getRes.body.data.work).toBeDefined();
    });
  });
});
