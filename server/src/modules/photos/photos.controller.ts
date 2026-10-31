import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { prisma } from '../../config/database.js';
import { PhotoUploadMetadataSchema } from '../rdo/rdo.dto.js';
import { AppError } from '../../middlewares/error.middleware.js';

export class PhotosController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('Nenhum arquivo de foto enviado no campo "photo".', 400);
      }

      // Valida metadados que acompanham o upload da foto
      const parsedMeta = PhotoUploadMetadataSchema.parse(req.body);

      const fileUrl = `/uploads/photos/${req.file.filename}`;
      const takenAtDate = parsedMeta.takenAt ? new Date(parsedMeta.takenAt) : new Date();

      const photoRecord = await prisma.rDOPhoto.create({
        data: {
          workId: parsedMeta.workId,
          rdoId: parsedMeta.rdoId ?? null,
          caption: parsedMeta.caption ?? '',
          fileUrl,
          fileName: req.file.filename,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          takenAt: isNaN(takenAtDate.getTime()) ? new Date() : takenAtDate,
          authorId: parsedMeta.authorId ?? 'usr-default',
          authorName: parsedMeta.authorName ?? 'Operário Responsável',
          latitude: parsedMeta.latitude,
          longitude: parsedMeta.longitude,
          accuracy: parsedMeta.accuracy ?? null,
          watermarkText: parsedMeta.watermarkText,
          hash: parsedMeta.hash ?? null,
        },
      });

      res.status(201).json({
        status: 'success',
        statusCode: 201,
        data: photoRecord,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const photo = await prisma.rDOPhoto.findUnique({
        where: { id },
      });

      if (!photo) {
        throw new AppError(`Foto com ID "${id}" não encontrada.`, 404);
      }

      res.status(200).json({
        status: 'success',
        data: photo,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const photosController = new PhotosController();
