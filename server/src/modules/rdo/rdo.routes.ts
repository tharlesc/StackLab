import { Router } from 'express';
import { rdoController } from './rdo.controller.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import {
  SubmitRDOSchema,
  CreateRDOSchema,
  ReturnRDOSchema,
  ApproveRDOSchema,
  AuditedEditSchema,
} from './rdo.dto.js';

const router = Router();

// Submissão formal de RDO (validações estritas de efetivo, atividades e justificativas)
router.post('/', validateBody(SubmitRDOSchema), (req, res, next) =>
  rdoController.submit(req, res, next),
);

// Criação ou salvamento de rascunho de RDO (listas opcionais/vazias permitidas)
router.post('/draft', validateBody(CreateRDOSchema), (req, res, next) =>
  rdoController.createDraft(req, res, next),
);

// Listagem de RDOs
router.get('/', (req, res, next) => rdoController.list(req, res, next));

// Detalhamento de um RDO específico com eager load de todos os módulos
router.get('/:id', (req, res, next) => rdoController.getById(req, res, next));

// Devolução motivada para correção
router.patch('/:id/return', validateBody(ReturnRDOSchema), (req, res, next) =>
  rdoController.returnRDO(req, res, next),
);

// Homologação e assinatura digital com 2FA
router.patch('/:id/approve', validateBody(ApproveRDOSchema), (req, res, next) =>
  rdoController.approveRDO(req, res, next),
);

// Edição técnica auditada
router.patch('/:id/edit', validateBody(AuditedEditSchema), (req, res, next) =>
  rdoController.auditedEdit(req, res, next),
);

export default router;

