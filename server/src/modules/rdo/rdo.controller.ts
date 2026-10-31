import type { Request, Response, NextFunction } from 'express';
import { rdoService } from './rdo.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { prisma } from '../../config/database.js';

export class RDOController {
  private async getActor(req: Request) {
    const user = (req as any).user;
    if (user?.id) {
      return { id: user.id, name: user.name };
    }
    const bodyAuthorId = req.body?.authorId;
    if (bodyAuthorId) {
      const dbUser = await prisma.user.findUnique({ where: { id: bodyAuthorId } });
      if (dbUser) return { id: dbUser.id, name: dbUser.name };
    }
    const fallbackUser = await prisma.user.findFirst();
    if (fallbackUser) {
      return { id: fallbackUser.id, name: fallbackUser.name };
    }
    const created = await prisma.user.create({
      data: {
        id: bodyAuthorId || 'usr-default',
        name: req.body?.authorName || 'Operário Responsável',
        email: `worker-${Date.now()}-${Math.round(Math.random() * 1000)}@stacklab.com`,
        password: 'default-password',
        role: 'Encarregado de Obras',
        profile: 'common',
      },
    });
    return { id: created.id, name: created.name };
  }

  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const result = await rdoService.submitRDO(req.body, actor);
      res.status(201).json({
        status: 'success',
        statusCode: 201,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = await this.getActor(req);
      const result = await rdoService.saveDraft(req.body, actor);
      res.status(201).json({
        status: 'success',
        statusCode: 201,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workId, status, limit, offset } = req.query;
      const rdos = await rdoService.listRDOs({
        workId: workId ? String(workId) : undefined,
        status: status ? (String(status) as any) : undefined,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        results: rdos.length,
        data: rdos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      if (!id || id === 'undefined') {
        throw new AppError('ID do RDO é obrigatório.', 400);
      }
      const rdo = await rdoService.getRDOById(id);
      if (!rdo) {
        throw new AppError(`RDO com ID "${id}" não foi encontrado.`, 404);
      }

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: rdo,
      });
    } catch (error) {
      next(error);
    }
  }

  async returnRDO(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      if (!id || id === 'undefined') {
        throw new AppError('ID do RDO é obrigatório.', 400);
      }
      const actor = await this.getActor(req);
      const result = await rdoService.returnRDO(id, req.body, actor);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'RDO devolvido com sucesso para retificação.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveRDO(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      if (!id || id === 'undefined') {
        throw new AppError('ID do RDO é obrigatório.', 400);
      }
      const actor = await this.getActor(req);
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const result = await rdoService.approveRDO(id, req.body, actor, ip);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'RDO aprovado e homologado com sucesso.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async auditedEdit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      if (!id || id === 'undefined') {
        throw new AppError('ID do RDO é obrigatório.', 400);
      }
      const actor = await this.getActor(req);
      const result = await rdoService.auditedEdit(id, req.body, actor);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Edição auditada gravada com sucesso na trilha.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const rdoController = new RDOController();
