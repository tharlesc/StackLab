import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // 1. Zod Validation Error -> HTTP 400
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    res.status(400).json({
      status: 'fail',
      statusCode: 400,
      error: 'Validation Error',
      message: 'Erro de validação nos dados fornecidos.',
      details,
    });
    return;
  }

  // 2. Custom App Operational Error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode >= 500 ? 'error' : 'fail',
      statusCode: err.statusCode,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // 3. Prisma Known Request Errors
  if (err?.name === 'PrismaClientKnownRequestError' || (typeof err?.code === 'string' && err.code.startsWith('P'))) {
    switch (err.code) {
      case 'P2002': {
        const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'campo único';
        res.status(409).json({
          status: 'fail',
          statusCode: 409,
          error: 'Conflict',
          message: `Conflito de dados: registro duplicado com o mesmo valor para (${target}).`,
        });
        return;
      }
      case 'P2025': {
        res.status(404).json({
          status: 'fail',
          statusCode: 404,
          error: 'Not Found',
          message: 'Registro não encontrado no banco de dados.',
        });
        return;
      }
      case 'P2003': {
        res.status(400).json({
          status: 'fail',
          statusCode: 400,
          error: 'Foreign Key Constraint Violation',
          message: 'Referência inválida: o registro associado (obra, usuário ou RDO) não existe.',
        });
        return;
      }
      case 'P2000': {
        res.status(400).json({
          status: 'fail',
          statusCode: 400,
          error: 'Value Too Long',
          message: 'O valor fornecido excede o tamanho máximo permitido para o campo.',
        });
        return;
      }
      default: {
        res.status(400).json({
          status: 'fail',
          statusCode: 400,
          error: 'Database Error',
          message: `Operação de banco de dados rejeitada (Código ${err.code}).`,
        });
        return;
      }
    }
  }

  // 4. Prisma Validation Error
  if (err?.name === 'PrismaClientValidationError') {
    res.status(400).json({
      status: 'fail',
      statusCode: 400,
      error: 'Database Validation Error',
      message: 'Dados inválidos fornecidos para a consulta ao banco de dados.',
    });
    return;
  }

  // 5. Malformed JSON Body
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      status: 'fail',
      statusCode: 400,
      error: 'Malformed JSON',
      message: 'O corpo da requisição contém JSON com formatação inválida.',
    });
    return;
  }

  // 6. Multer File Upload Errors
  if (err?.name === 'MulterError') {
    res.status(400).json({
      status: 'fail',
      statusCode: 400,
      error: 'File Upload Error',
      message: err.message,
    });
    return;
  }

  // 7. Generic / Unexpected Internal Server Error
  const isDev = process.env.NODE_ENV !== 'production';
  console.error('[Unhandled Error]:', err);

  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Erro interno do servidor.',
    ...(isDev ? { stack: err?.stack, rawMessage: err?.message } : {}),
  });
};
