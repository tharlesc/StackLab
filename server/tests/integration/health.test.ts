import { describe, it, expect } from 'vitest';
import http from 'http';
import { EventEmitter } from 'events';
import { app } from '../../src/app';

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

describe('GET /api/health Integration Test', () => {
  it('returns HTTP 200 with status ok and valid timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(Date.parse(res.body.timestamp)).not.toBeNaN();
    expect(res.body.service).toBe('stacklab-rdo-server');
    expect(res.body.version).toBe('1.0.0');
  });

  it('returns 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/unknown-endpoint-test');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });
});
