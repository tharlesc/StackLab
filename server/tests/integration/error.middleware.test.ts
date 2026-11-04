import { describe, it, expect } from 'vitest';
import http from 'http';
import { EventEmitter } from 'events';
import express from 'express';
import { errorHandler, AppError } from '../../src/middlewares/error.middleware.js';
import { validateBody } from '../../src/middlewares/validate.middleware.js';
import { WeatherEntrySchema } from '../../src/modules/rdo/rdo.dto.js';

function request(handler: any) {
  const execute = (method: string, path: string, body?: any) => {
    return new Promise<{ status: number; body: any; headers: any }>((resolve, reject) => {
      const socket = new EventEmitter();
      (socket as any).destroy = () => {};
      (socket as any).encrypted = false;
      const req = new http.IncomingMessage(socket as any);
      req.method = method;
      req.url = path;
      req.headers = { host: '127.0.0.1' };

      const res = new http.ServerResponse(req);
      res.assignSocket(socket as any);

      const chunks: Buffer[] = [];
      res.write = function (chunk: any) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      };

      res.end = function (chunk: any) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        const raw = Buffer.concat(chunks).toString('utf-8');
        let parsed: any = raw;
        try {
          parsed = JSON.parse(raw);
        } catch {
          // keep raw string
        }
        resolve({
          status: res.statusCode,
          body: parsed,
          headers: res.getHeaders(),
        });
        return res;
      };

      try {
        if (body !== undefined) {
          const payload = typeof body === 'string' ? body : JSON.stringify(body);
          req.headers['content-type'] = 'application/json';
          req.headers['content-length'] = Buffer.byteLength(payload).toString();
          (req as any).body = typeof body === 'string' ? JSON.parse(body) : body;
          (req as any)._body = true;
          handler(req, res);
          process.nextTick(() => {
            req.push(payload);
            req.push(null);
          });
        } else {
          handler(req, res);
          process.nextTick(() => {
            req.push(null);
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  return {
    get: (path: string) => execute('GET', path),
    post: (path: string) => ({
      send: (data: any) => execute('POST', path, data),
    }),
  };
}

const testApp = express();
testApp.use(express.json());

// Test Routes
testApp.post('/test/zod', validateBody(WeatherEntrySchema), (_req, res) => {
  res.status(200).json({ success: true });
});

testApp.get('/test/app-error', () => {
  throw new AppError('Obra não encontrada', 404);
});

testApp.get('/test/prisma-duplicate', () => {
  const prismaErr: any = new Error('Unique constraint');
  prismaErr.name = 'PrismaClientKnownRequestError';
  prismaErr.code = 'P2002';
  prismaErr.meta = { target: ['workId', 'number', 'version'] };
  throw prismaErr;
});

testApp.get('/test/prisma-not-found', () => {
  const prismaErr: any = new Error('Record not found');
  prismaErr.name = 'PrismaClientKnownRequestError';
  prismaErr.code = 'P2025';
  throw prismaErr;
});

testApp.get('/test/unhandled', () => {
  throw new Error('Unexpected crash');
});

testApp.use(errorHandler);

describe('Error Handling Middleware Integration Tests', () => {
  it('translates Zod validation errors to clean HTTP 400 responses', async () => {
    const res = await request(testApp)
      .post('/test/zod')
      .send({ shift: 'manha', condition: 'Chuva' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'stoppageHours',
          message: 'Horas de paralisação são obrigatórias quando há condição de chuva.',
        }),
      ]),
    );
  });

  it('translates custom AppError to specified status code', async () => {
    const res = await request(testApp).get('/test/app-error');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toBe('Obra não encontrada');
  });

  it('translates Prisma P2002 duplicate error to HTTP 409 Conflict', async () => {
    const res = await request(testApp).get('/test/prisma-duplicate');
    expect(res.status).toBe(409);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('workId, number, version');
  });

  it('translates Prisma P2025 record not found to HTTP 404 Not Found', async () => {
    const res = await request(testApp).get('/test/prisma-not-found');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('Registro não encontrado');
  });

  it('translates unhandled generic error to HTTP 500 without leaking stack in production', async () => {
    const res = await request(testApp).get('/test/unhandled');
    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Erro interno do servidor.');
  });
});
