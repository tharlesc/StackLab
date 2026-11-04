import dotenv from 'dotenv';
import path from 'path';
import { app } from './app.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3333;
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

const server = app.listen(PORT, () => {
  console.log(`🚀 StackLab RDO Server running on port ${PORT}`);
  console.log(`📍 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`📂 Static uploads directory: ${uploadDir}`);
});

function handleShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('✅ HTTP server closed successfully.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export { server };
