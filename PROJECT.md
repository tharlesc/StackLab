# Project: StackLab — Hooks Centralization & SQLite Prisma Migrations

## Architecture
- **Client (Mobile)**:
  - Framework: React Native 0.88 / Expo SDK 58 / Expo Router / TypeScript.
  - Dedicated Hooks Architecture: Centralization of all custom UI and workflow logic into `client/src/hooks/`, with modular barrel exports in `client/src/hooks/index.ts`.
  - Consumers: Screens (`client/src/screens/`), View components, and tests (`client/src/__tests__/`) consuming hooks strictly via `@/hooks`.
- **Backend (Server)**:
  - Framework: Node.js v24 + Express 5 + TypeScript + Prisma ORM 6.4 + SQLite (`server/prisma/dev.db`).
  - Migration Versioning: Automated, reproducible DDL migrations under `server/prisma/migrations/` managed via Prisma Migrate.
  - Seeding: Idempotent database initialization via `server/src/seed.ts` integrated into `prisma.seed`.
  - Educational Documentation: `server/MIGRATIONS_GUIDE.md` explaining migration concepts, architecture, CLI commands, and SQLite specificities.
- **Verification Harness**:
  - Client Jest test suite (11 suites, 120 tests).
  - Client TypeScript typechecking (`npm run typecheck`).
  - Server Vitest test suite (8 files, 119 tests).
  - Server TypeScript compilation (`npm run build`).
  - Prisma Migrate status check (`npx prisma migrate status`).
  - Root E2E Test Suite (4 tiers, 302 tests via `node tests/e2e/runner.mjs`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Centralized Hooks Directory | Criação de `client/src/hooks/` e relocalização dos 10 hooks de telas | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Modular Hook Exports Index | Criação de `client/src/hooks/index.ts` exportando hooks e tipos/constantes auxiliares (`STEPS`, `AdminTab`, `InboxFilter`, `NotificationFilter`, `DashboardTab`, `WORKS_PER_PAGE`) | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Screen Consumers Path Migration | Atualização dos 10 arquivos de View em `client/src/screens/` para importar de `@/hooks` | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Screen Index Cleanup | Remoção de re-exportações locais de hooks e arquivos duplicados nas pastas de tela | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Test Imports & Type Safety | Atualização de `client/src/__tests__/newRDO.test.tsx` para `@/hooks` e validação com `tsc --noEmit` | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Prisma Migrations Directory & Baseline | Criação de `server/prisma/migrations/` com migration inicial DDL reproduzível e sincronização do `dev.db` via baseline | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Prisma Seeding Integration | Configuração de script de seed e `prisma.seed` em `server/package.json` | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Migration Status Verification | Validação de sincronia completa via `npx prisma migrate status` reportando zero divergências e esquema atualizado | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Educational Migrations Guide | Criação de `server/MIGRATIONS_GUIDE.md` abrangendo conceitos, arquitetura, comandos (dev, deploy, reset, status) e particularidades do SQLite | M2 | ORIGINAL_REQUEST §R3 |
| 10 | Full Regression & E2E Acceptance | Execução e aprovação de 100% dos testes do cliente (Jest), backend (Vitest) e suíte E2E (302 testes) | M3 | ORIGINAL_REQUEST §Verification |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Client Custom Hooks Centralization | Criação de `client/src/hooks/`, migração dos 10 hooks customizados, criação de `index.ts`, atualização de todas as telas, componentes e testes, remoção de arquivos residuais em telas, validação `tsc --noEmit` e Jest | none | DONE |
| M2 | SQLite Prisma Migrations & Educational Guide | Geração da migration inicial reproduzível em `server/prisma/migrations/`, baseline de `dev.db` com `prisma migrate resolve`, integração de seed no `package.json`, criação de `server/MIGRATIONS_GUIDE.md`, validação `prisma migrate status`, Vitest e build | none | DONE |
| M3 | Final Integration, 100% E2E Pass & Adversarial Hardening | Execução de suíte E2E (302 testes), validação cruzada cliente/servidor, testes adversariais e auditoria forense de integridade | M1, M2 | DONE |

## Interface Contracts
### Client Hook Module Contracts (`@/hooks`)
- `useDashboardHome`: Retorna estado do dashboard do operário/master, paginação e filtros. Exporta `WORKS_PER_PAGE`, `DashboardTab`.
- `useLogin`: Retorna credenciais, estados de formulário, alternância de visibilidade e handlers de login.
- `useNewRDO`: Retorna estado do Wizard de 7 passos, handlers de rascunho, validações e submissão. Exporta `STEPS`.
- `useNotifications`: Retorna notificações e contadores de não lidas. Exporta `NotificationFilter`.
- `useProfile`: Retorna dados do usuário autenticado e ações de perfil.
- `useSettings`: Retorna preferências de tema e configurações locais.
- `useSyncQueue`: Retorna status e handlers de fila offline.
- `useAdminScreen`: Retorna abas administrativas, listas filtradas e modais de criação. Exporta `AdminTab`.
- `useInbox`: Retorna fila de RDOs pendentes para o master. Exporta `InboxFilter`.
- `useRDOReview`: Retorna RDO selecionado, seções, modais de aprovação/devolução/edição/comentários e PIN.

### Server Migration Contract
- Engine: SQLite (`provider = "sqlite"`).
- Database File: `server/prisma/dev.db`.
- Migration History Table: `_prisma_migrations` gerada e mantida pelo Prisma Migrate.
- Lockfile: `server/prisma/migrations/migration_lock.toml` fixando provider `"sqlite"`.
- Migration Baseline: `server/prisma/migrations/20261031000000_init/migration.sql` espelhando perfeitamente os 14 modelos e 5 enums de `schema.prisma`.

## Code Layout
- **Client**:
  - `client/src/hooks/`: Diretório exclusivo de hooks customizados reutilizáveis e de tela.
  - `client/src/hooks/index.ts`: Ponto único de exportação modular de hooks, tipos e constantes.
  - `client/src/screens/`: Apenas telas, views e estilos (sem arquivos `use*.ts`).
  - `client/src/__tests__/`: Testes unitários e de integração do cliente.
- **Server**:
  - `server/prisma/schema.prisma`: Esquema declarativo do Prisma.
  - `server/prisma/migrations/`: Histórico versionado de migrations SQL.
  - `server/prisma/migrations/migration_lock.toml`: Lock de engine SQLite.
  - `server/MIGRATIONS_GUIDE.md`: Guia didático de migrations.
  - `server/src/seed.ts`: Seed idempotente do banco.
  - `server/tests/`: Testes automatizados Vitest.
- **E2E Testing**:
  - `tests/e2e/runner.mjs`: Test runner ponta a ponta (Tiers 1 a 4).
