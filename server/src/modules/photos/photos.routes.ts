import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { photosController } from './photos.controller.js';

const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos.'));
    }
  },
});

const router = Router();

// Upload de fotos com marca d'água e metadados
router.post('/upload', upload.single('photo'), (req, res, next) =>
  photosController.upload(req, res, next),
);

// Obter detalhes de foto
router.get('/:id', (req, res, next) => photosController.getById(req, res, next));

export default router;

