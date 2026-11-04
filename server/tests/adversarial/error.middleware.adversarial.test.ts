import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import http from 'http';
import { EventEmitter } from 'events';
import express from 'express';
import { errorHandler, AppError } from '../../src/middlewares/error.middleware.js';
import { validateBody } from '../../src/middlewares/validate.middleware.js';
import { SubmitRDOSchema } from '../../src/modules/rdo/rdo.dto.js';

// HTTP test request helper without socket listening (isolated in-memory dispatch)
function request(handler: any) {
  const execute = (method: string, path: string, body?: any, customHeaders: Record<string, string> = {}) => {
    return new Promise<{ status: number; body: any; headers: any }>((resolve, reject) => {
      const socket = new EventEmitter();
      (socket as any).destroy = () => {};
      (socket as any).encrypted = false;
      const req = new http.IncomingMessage(socket as any);
      req.method = method;
      req.url = path;
      req.headers = { host: '127.0.0.1', ...customHeaders };

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
          // keep raw
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
    get: (path: string, headers?: Record<string, string>) => execute('GET', path, undefined, headers),
    post: (path: string, headers?: Record<string, string>) => ({
      send: (data: any) => execute('POST', path, data, headers),
    }),
  };
}

describe('Error Handling Middleware Adversarial & Security Tests', () => {
  let app: express.Express;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    app = express();
    app.use(express.json());

    // 1. Zod Validation route
    app.post('/api/rdo/submit', validateBody(SubmitRDOSchema), (_req, res) => {
      res.status(201).json({ success: true });
    });

    // 2. Prisma Foreign Key Violation (P2003)
    app.get('/api/simulate/prisma-foreign-key', () => {
      const err: any = new Error('Foreign key constraint failed on the field: `workId`');
      err.name = 'PrismaClientKnownRequestError';
      err.code = 'P2003';
      err.meta = { field_name: 'workId' };
      throw err;
    });

    // 3. Prisma Value Too Long (P2000)
    app.get('/api/simulate/prisma-value-too-long', () => {
      const err: any = new Error('The provided value for the column is too long for the column type.');
      err.name = 'PrismaClientKnownRequestError';
      err.code = 'P2000';
      err.meta = { column_name: 'description' };
      throw err;
    });

    // 4. Prisma Unhandled Query Code (P2010 - Raw query failed)
    app.get('/api/simulate/prisma-raw-query-fail', () => {
      const err: any = new Error('Raw query failed. Code: 1. Message: no such table: secret_table');
      err.name = 'PrismaClientKnownRequestError';
      err.code = 'P2010';
      err.meta = { code: '1', message: 'no such table: secret_table' };
      throw err;
    });

    // 5. Prisma Client Validation Error (AST / Schema mismatch)
    app.get('/api/simulate/prisma-validation-error', () => {
      const err: any = new Error('Invalid `prisma.rDO.create()` invocation: Unknown arg `secretField` in data.');
      err.name = 'PrismaClientValidationError';
      throw err;
    });

    // 6. Prisma Initialization Error with Database Credentials in Message
    app.get('/api/simulate/prisma-init-error', () => {
      const err: any = new Error(
        'Can\'t reach database server at `postgres://admin:SuperSecretPass123@prod-db.internal:5432/stacklab`',
      );
      err.name = 'PrismaClientInitializationError';
      throw err;
    });

    // 7. Malformed JSON simulated parser error
    app.get('/api/simulate/malformed-json', () => {
      const err: any = new SyntaxError('Unexpected token } in JSON at position 42');
      err.status = 400;
      err.body = '{"workId":}';
      throw err;
    });

    // 8. Multer File Size Error
    app.get('/api/simulate/multer-error', () => {
      const err: any = new Error('File too large');
      err.name = 'MulterError';
      err.code = 'LIMIT_FILE_SIZE';
      throw err;
    });

    // 9. Generic Crash with sensitive stack trace
    app.get('/api/simulate/crash-with-stack', () => {
      const err = new Error('Internal database socket timeout at file:///var/run/secrets/token');
      throw err;
    });

    app.use(errorHandler);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  // --------------------------------------------------------------------------
  // Clean HTTP 400 Responses & Zero Stack Leakage on Validation Failures
  // --------------------------------------------------------------------------
  describe('Zod Validation Error Translation', () => {
    it('returns clean HTTP 400 without leaking stack traces or internals', async () => {
      const res = await request(app)
        .post('/api/rdo/submit')
        .send({
          workId: 'invalid-not-uuid',
          date: 'invalid-date',
          weather: [],
          labor: [],
          activities: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.message).toBe('Erro de validação nos dados fornecidos.');
      expect(Array.isArray(res.body.details)).toBe(true);
      expect(res.body.details.length).toBeGreaterThan(0);

      // Verify no stack trace or internal memory structures are exposed
      expect(res.body.stack).toBeUndefined();
      expect(res.body.rawMessage).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('node_modules');
      expect(JSON.stringify(res.body)).not.toContain('.ts:');
    });

    it('returns specific field error codes for programmatic client mapping', async () => {
      const res = await request(app)
        .post('/api/rdo/submit')
        .send({
          workId: 'a3fa51e2-b36c-4861-8ee4-ea0be2d62734',
          date: '2026-10-29',
          weather: [{ shift: 'invalido', condition: 'Chuva' }],
          labor: [{ role: 'A', quantity: 0, hours: 26 }],
          activities: [{ description: 'OK', location: 'T', unit: '', quantity: -5 }],
        });

      expect(res.status).toBe(400);
      const fields = res.body.details.map((d: any) => d.field);
      expect(fields).toContain('weather.0.shift');
      expect(fields).toContain('labor.0.role');
      expect(fields).toContain('labor.0.quantity');
      expect(fields).toContain('labor.0.hours');
      expect(fields).toContain('activities.0.unit');
      expect(fields).toContain('activities.0.quantity');
    });
  });

  // --------------------------------------------------------------------------
  // Database Error Sanitization (Prisma P-codes)
  // --------------------------------------------------------------------------
  describe('Database Error Translation & Information Concealment', () => {
    it('translates P2003 (Foreign Key) to clean 400 without exposing schema SQL', async () => {
      const res = await request(app).get('/api/simulate/prisma-foreign-key');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.error).toBe('Foreign Key Constraint Violation');
      expect(res.body.message).toBe(
        'Referência inválida: o registro associado (obra, usuário ou RDO) não existe.',
      );
      expect(res.body.stack).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('dev.db');
      expect(JSON.stringify(res.body)).not.toContain('SELECT');
    });

    it('translates P2000 (Value Too Long) to clean 400', async () => {
      const res = await request(app).get('/api/simulate/prisma-value-too-long');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.error).toBe('Value Too Long');
      expect(res.body.message).toBe(
        'O valor fornecido excede o tamanho máximo permitido para o campo.',
      );
      expect(res.body.stack).toBeUndefined();
    });

    it('translates arbitrary Prisma error codes (P2010) to 400 without leaking raw query', async () => {
      const res = await request(app).get('/api/simulate/prisma-raw-query-fail');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.error).toBe('Database Error');
      expect(res.body.message).toBe('Operação de banco de dados rejeitada (Código P2010).');
      // Verifies internal table name is not exposed in response
      expect(JSON.stringify(res.body)).not.toContain('secret_table');
      expect(res.body.stack).toBeUndefined();
    });

    it('translates PrismaClientValidationError to clean 400 without leaking AST', async () => {
      const res = await request(app).get('/api/simulate/prisma-validation-error');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.error).toBe('Database Validation Error');
      expect(res.body.message).toBe(
        'Dados inválidos fornecidos para a consulta ao banco de dados.',
      );
      expect(JSON.stringify(res.body)).not.toContain('secretField');
      expect(res.body.stack).toBeUndefined();
    });

    it('translates Malformed JSON SyntaxError to clean 400', async () => {
      const res = await request(app).get('/api/simulate/malformed-json');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.error).toBe('Malformed JSON');
      expect(res.body.message).toBe(
        'O corpo da requisição contém JSON com formatação inválida.',
      );
      expect(res.body.stack).toBeUndefined();
    });

    it('translates MulterError to clean 400', async () => {
      const res = await request(app).get('/api/simulate/multer-error');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.error).toBe('File Upload Error');
      expect(res.body.message).toBe('File too large');
      expect(res.body.stack).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // Production vs Development Crash Sanitization (HTTP 500)
  // --------------------------------------------------------------------------
  describe('HTTP 500 Production Concealment Verification', () => {
    it('completely strips stack traces and internal secrets when NODE_ENV=production', async () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app).get('/api/simulate/crash-with-stack');
      expect(res.status).toBe(500);
      expect(res.body.status).toBe('error');
      expect(res.body.statusCode).toBe(500);
      expect(res.body.message).toBe('Erro interno do servidor.');
      expect(res.body.stack).toBeUndefined();
      expect(res.body.rawMessage).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('/var/run/secrets');

      consoleSpy.mockRestore();
    });

    it('completely hides database connection string with password when NODE_ENV=production', async () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app).get('/api/simulate/prisma-init-error');
      expect(res.status).toBe(500);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Erro interno do servidor.');
      expect(res.body.stack).toBeUndefined();
      expect(res.body.rawMessage).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('SuperSecretPass123');
      expect(JSON.stringify(res.body)).not.toContain('prod-db.internal');

      consoleSpy.mockRestore();
    });
  });
});
