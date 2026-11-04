import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { errorHandler } from './middlewares/error.middleware.js';
import rdoRoutes from './modules/rdo/rdo.routes.js';
import photosRoutes from './modules/photos/photos.routes.js';

export function createApp(): Express {
  const app = express();

  // Security Headers (configured for cross-origin image asset loading on mobile/web)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS Configuration
  const allowedOrigin = process.env.CORS_ORIGIN || '*';
  app.use(
    cors({
      origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(','),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Body Parsing Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static Upload Serving
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));

  // Healthcheck Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'stacklab-rdo-server',
      version: '1.0.0',
    });
  });

  // API v1 Modules
  app.use('/api/v1/rdos', rdoRoutes);
  app.use('/api/v1/photos', photosRoutes);

  // 404 Handler for Unmatched Routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
