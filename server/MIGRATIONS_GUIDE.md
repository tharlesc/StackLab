# Guia Didático e Técnico de Migrations com Prisma & SQLite — StackLab

Este guia foi elaborado para capacitar engenheiros de software, desenvolvedores frontend/backend e equipes de DevOps que trabalham no **StackLab RDO**. Ele apresenta os fundamentos teóricos, a arquitetura interna do **Prisma Migrate** com **SQLite**, os comandos operacionais do dia a dia e os procedimentos de resolução de incidentes.

---

## Sumário
1. [O que são Migrations e por que Versionar o Esquema como Código?](#1-o-que-são-migrations-e-por-que-versionar-o-esquema-como-código)
   - [A Analogia do Git para o Banco de Dados](#a-analogia-do-git-para-o-banco-de-dados)
   - [Os Cinco Pilares do Versionamento de Esquema](#os-cinco-pilares-do-versionamento-de-esquema)
   - [Comparativo Aprofundado: `prisma migrate dev` vs `prisma db push`](#comparativo-aprofundado-prisma-migrate-dev-vs-prisma-db-push)
2. [Arquitetura do Prisma Migrate com SQLite](#2-arquitetura-do-prisma-migrate-com-sqlite)
   - [Visão Geral e Fluxo de Execução](#visão-geral-e-fluxo-de-execução)
   - [Componente 1: `schema.prisma` (Fonte Única da Verdade)](#componente-1-schemaprisma-fonte-única-da-verdade)
   - [Componente 2: `_prisma_migrations` (Tabela Interna de Auditoria)](#componente-2-_prisma_migrations-tabela-interna-de-auditoria)
   - [Componente 3: `migration_lock.toml` (Lockfile de Engine)](#componente-3-migration_locktoml-lockfile-de-engine)
   - [Componente 4: O Mecanismo de Shadow Database no SQLite](#componente-4-o-mecanismo-de-shadow-database-no-sqlite)
3. [Comandos Essenciais: Guia Prático de Desenvolvimento e Produção](#3-comandos-essenciais-guia-prático-de-desenvolvimento-e-produção)
   - [Tabela de Referência Rápida](#tabela-de-referência-rápida)
   - [`npx prisma migrate dev --name <nome>` (O Fluxo Diário)](#npx-prisma-migrate-dev---name-nome-o-fluxo-diário)
   - [`npx prisma migrate dev --create-only` (Revisão e SQL Customizado)](#npx-prisma-migrate-dev---create-only-revisão-e-sql-customizado)
   - [`npx prisma migrate status` (Verificação de Integridade e CI)](#npx-prisma-migrate-status-verificação-de-integridade-e-ci)
   - [`npx prisma migrate deploy` (O Comando Exclusivo de Produção / CI)](#npx-prisma-migrate-deploy-o-comando-exclusivo-de-produção--ci)
   - [`npx prisma migrate reset` (Recriação Limpa de Ambiente)](#npx-prisma-migrate-reset-recriação-limpa-de-ambiente)
   - [`npx prisma db seed` / `npm run seed` (Carga Idempotente)](#npx-prisma-db-seed--npm-run-seed-carga-idempotente)
   - [`npx prisma studio` (Exploração Visual de Dados e Metadados)](#npx-prisma-studio-exploração-visual-de-dados-e-metadados)
4. [Particularidades Técnicas do Motor SQLite](#4-particularidades-técnicas-do-motor-sqlite)
   - [Recriação de Tabelas em Operações DDL (`Table Recreation`)](#recriação-de-tabelas-em-operações-ddl-table-recreation)
   - [Emulação de Tipos Enumerados (`Enums`)](#emulação-de-tipos-enumerados-enums)
   - [Concorrência e Travas de Arquivo Local (`SQLITE_BUSY`)](#concorrência-e-travas-de-arquivo-local-sqlite_busy)
   - [Caminho de Evolução para PostgreSQL em Produção](#caminho-de-evolução-para-postgresql-em-produção)
5. [Troubleshooting e Resolução de Incidentes](#5-troubleshooting-e-resolução-de-incidentes)
   - [Falhas de Migração e o Comando `prisma migrate resolve`](#falhas-de-migração-e-o-comando-prisma-migrate-resolve)
   - [Divergência de Esquema (`Schema Drift`)](#divergência-de-esquema-schema-drift)
   - [Erro de Checksum Alterado (`Checksum Mismatch`)](#erro-de-checksum-alterado-checksum-mismatch)
   - [Conflitos de Migração Concorrente em Branches Git](#conflitos-de-migração-concorrente-em-branches-git)
6. [Checklists Operacionais](#6-checklists-operacionais)
   - [Checklist do Desenvolvedor (Nova Feature com Banco)](#checklist-do-desenvolvedor-nova-feature-com-banco)
   - [Checklist de CI/CD para Produção](#checklist-de-cicd-para-produção)

---

## 1. O que são Migrations e por que Versionar o Esquema como Código?

### A Analogia do Git para o Banco de Dados
Imagine desenvolver um software em equipe sem Git: se cada desenvolvedor editasse os arquivos de código diretamente no servidor sem histórico, sem branches e sem mensagens de commit, o projeto rapidamente colapsaria em conflitos e perda irreversível de trabalho.

Historicamente, o banco de dados era tratado dessa forma caótica: alguém entrava no cliente SQL de produção e executava comandos manuais como `ALTER TABLE "User" ADD COLUMN "role" TEXT`. Ninguém sabia quando o comando fora executado, quem o executara, por que fora executado ou como reproduzir aquele estado na máquina de outro desenvolvedor ou no ambiente de homologação.

Uma **Database Migration** (ou Migração de Banco de Dados) é exatamente o **Git do esquema do banco de dados**. Trata-se de um conjunto ordenado, reproduzível e incremental de instruções SQL de DDL (*Data Definition Language*) que transforma o banco de dados de um estado estrutural $N$ para um estado $N+1$.

```
[Estado Inicial: Vazio]
       │
       ▼ (20261031000000_init)
[Estado 1: Tabelas Base - User, Work, RDO...]
       │
       ▼ (20261105143000_add_rdo_geolocation)
[Estado 2: Novos Campos de GPS e Índices]
       │
       ▼ (20261112091500_create_contractor_table)
[Estado 3: Nova Entidade de Empreiteiras]
```

Cada migration é empacotada em um arquivo físico `migration.sql` dentro de uma pasta com carimbo de data/hora (*timestamp*). Ela é versionada no repositório de código fonte junto com as telas, rotas e regras de negócio da aplicação.

---

### Os Cinco Pilares do Versionamento de Esquema

1. **Rastreabilidade e Auditoria Contínua**:
   Cada alteração estrutural no banco de dados está associada a um *Pull Request* e a um autor no Git. É possível saber exatamente quando e por que determinada tabela, coluna, índice ou restrição estrangeira foi criada ou modificada.

2. **Reprodutibilidade Determinística**:
   Qualquer membro da equipe ou novo estagiário que clonar o repositório pode subir uma instância idêntica do banco de dados executando um único comando. Elimina-se para sempre o clássico problema *"Na minha máquina funciona, mas em homologação a coluna não existe"*.

3. **Segurança de Dados e Prevenção de Regressões Destrutivas**:
   Ferramentas profissionais de migração inspecionam as mudanças antes de aplicá-las. Se você tentar renomear ou remover uma coluna que contém milhões de registros, o sistema emite um alerta explícito e exige confirmação, evitando a perda acidental de dados.

4. **Automação Segura em Pipelines de CI/CD**:
   Em esteiras automatizadas de integração e entrega contínua (GitHub Actions, GitLab CI, ArgoCD), as migrações são aplicadas antes do boot da nova versão da aplicação, garantindo que o esquema esteja sincronizado sem intervenção humana.

5. **Colaboração e Resolução de Conflitos**:
   Quando múltiplos desenvolvedores trabalham em branches concorrentes, as migrações geram arquivos distintos. Se houver sobreposição estrutural, o sistema detecta a divergência e permite conciliar os esquemas de forma controlada.

---

### Comparativo Aprofundado: `prisma migrate dev` vs `prisma db push`

O Prisma oferece duas abordagens para modificar a estrutura do banco de dados a partir do `schema.prisma`. É crucial entender a diferença fundamental de propósito entre elas:

| Critério de Comparação | `npx prisma migrate dev` (Recomendado) | `npx prisma db push` (Prototipação Apenas) |
| :--- | :--- | :--- |
| **Geração de Arquivos SQL** | **Sim**. Gera arquivos `migration.sql` versionáveis no Git. | **Não**. Não gera nenhum arquivo ou registro físico. |
| **Tabela de Auditoria (`_prisma_migrations`)** | **Sim**. Registra nome, hash SHA-256 e status de cada migração no banco. | **Não**. Não registra nada; o banco não sabe que foi alterado pelo Prisma. |
| **Ambiente de Uso Indicado** | Desenvolvimento em equipe, Staging, Homologação e Produção. | Prototipação rápida individual (*throwaway spikes*), sandboxes descartáveis. |
| **Aptidão para CI/CD** | **Totalmente apto**. Via `npx prisma migrate deploy`. | **Extremamente arriscado / Não recomendado**. Pode truncar tabelas silenciosamente. |
| **Detecção de Perda de Dados** | **Alta**. Exige confirmação explícita ou scripts manuais se houver risco de perda. | **Média/Baixa**. Pode abortar ou exigir flag `--accept-data-loss`. |
| **Customização de SQL** | **Total**. Permite adicionar comandos manuais (triggers, views, índices parciais). | **Impossível**. Executa apenas o que o DSL do Prisma suporta. |
| **Validação com Shadow DB** | **Sim**. Valida se a migração quebra a cadeia histórica anterior. | **Não**. Tenta sincronizar diretamente o banco alvo com o modelo atual. |

> ⚠️ **Aviso de Segurança para o StackLab**:
> Nunca utilize `prisma db push` em ambientes compartilhados ou em produção. Se dois desenvolvedores usarem `db push`, um pode sobrescrever silenciosamente colunas criadas pelo outro sem que o Git registre qualquer conflito, levando a corrupção estrutural silenciosa e quebras em tempo de execução.

---

## 2. Arquitetura do Prisma Migrate com SQLite

Para compreender como o Prisma mantém a integridade do banco de dados SQLite (`server/prisma/dev.db`), vejamos o diagrama de blocos de sua arquitetura:

```
┌─────────────────────────────────────────────────────────────┐
│                   Código Fonte (Git)                        │
├──────────────────────────┬──────────────────────────────────┤
│   prisma/schema.prisma   │  prisma/migrations/              │
│  (Esquema Declarativo)   │  ├── migration_lock.toml         │
│                          │  └── 20261031000000_init/        │
│                          │      └── migration.sql           │
└────────────┬─────────────┴────────────────┬─────────────────┘
             │                              │
             │   (Validação e Detecção)     │  (Execução Incremental)
             ▼                              ▼
┌──────────────────────────┐      ┌───────────────────────────┐
│     Shadow Database      │      │     dev.db (SQLite)       │
│  (Banco Temp. em Disco)  │      │  ├── Tabelas de Domínio   │
│  Detecta Drift e Quebras │      │  └── _prisma_migrations   │
└──────────────────────────┘      └───────────────────────────┘
```

### Componente 1: `schema.prisma` (Fonte Única da Verdade)
Localizado em `server/prisma/schema.prisma`, este arquivo declarativo define os modelos de dados, relacionamentos, índices e configurações da engine. Ele não contém SQL, mas sim a definição abstrata das entidades da aplicação:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String      @id @default(uuid())
  name      String
  email     String      @unique
  role      String
  profile   UserProfile @default(common)
  active    Boolean     @default(true)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  // ...
}
```

O desenvolvedor edita **apenas** o `schema.prisma`. A ferramenta se encarrega de comparar o estado anterior com o novo estado e gerar o SQL correspondente.

---

### Componente 2: `_prisma_migrations` (Tabela Interna de Auditoria)
Quando o Prisma Migrate é inicializado, ele cria automaticamente no SQLite uma tabela oculta de controle chamada `_prisma_migrations`.

A estrutura exata desta tabela no SQLite é:

```sql
CREATE TABLE "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count"   INTEGER NOT NULL DEFAULT 0
);
```

#### Finalidade dos Campos Principais:
- **`migration_name`**: Nome da pasta da migração (ex.: `20261031000000_init`).
- **`checksum`**: Hash criptográfico **SHA-256** do conteúdo do arquivo `migration.sql` no momento em que ele foi aplicado. Se alguém alterar mesmo que seja um único espaço no arquivo SQL após a aplicação, o Prisma detectará a divergência e abortará qualquer operação futura para proteger o banco.
- **`started_at` e `finished_at`**: Carimbos de tempo que registram quando a execução da migração começou e quando terminou com sucesso. Se `finished_at` estiver nulo e `rolled_back_at` também estiver nulo, o Prisma sabe que a migração falhou no meio do caminho.
- **`applied_steps_count`**: Número de instruções internas executadas com êxito.

---

### Componente 3: `migration_lock.toml` (Lockfile de Engine)
Localizado na raiz da pasta de migrações (`server/prisma/migrations/migration_lock.toml`), este arquivo simples, mas vital, fixa o provedor de banco de dados para o qual todo o histórico de migrações foi gerado:

```toml
# Please do not edit this file manually
# It should be added in your version-control system (e.g., Git)
provider = "sqlite"
```

#### Por que ele é fundamental?
A sintaxe SQL varia drasticamente entre sistemas gerenciadores de banco de dados (SQLite, PostgreSQL, MySQL, SQL Server). O SQLite, por exemplo, não possui tipos nativos `BOOLEAN`, `TIMESTAMP` ou `ENUM`, utilizando `INTEGER` e `TEXT`. 

O `migration_lock.toml` garante que o Prisma aborte imediatamente a execução caso alguém aponte acidentalmente um histórico de migrações gerado para SQLite contra um banco PostgreSQL de produção, prevenindo erros catastróficos de sintaxe e corrupção estrutural. **Este arquivo deve sempre ser versionado no Git**.

---

### Componente 4: O Mecanismo de Shadow Database no SQLite

O que é o **Shadow Database**?
Durante a execução de comandos de desenvolvimento (`npx prisma migrate dev`), o Prisma precisa responder a duas perguntas críticas:
1. *O arquivo `schema.prisma` foi alterado em relação à última migração registrada?*
2. *As migrações já existentes no disco ainda conseguem ser executadas com sucesso a partir de um banco completamente limpo?*

Para responder a isso sem alterar ou corromper seu banco de dados local (`dev.db`), o Prisma Migrate cria um **banco de dados temporário e efêmero** (chamado *Shadow Database*). No SQLite, o Prisma cria um arquivo temporário no sistema de arquivos local, aplica todas as migrações sequencialmente a partir do zero, calcula a diferença em relação ao seu `schema.prisma` e, ao terminar, remove o arquivo temporário.

#### Limitações e Nuances no SQLite:
- **Zero Configuração Requerida**: Em motores como PostgreSQL ou MySQL em nuvem com permissões restritas, o usuário muitas vezes precisa fornecer uma URL explícita para o shadow db (`shadowDatabaseUrl`). No SQLite local, o Prisma cuida de toda a criação e deleção do arquivo temporário automaticamente.
- **Não é utilizado em Produção**: O comando de produção (`prisma migrate deploy`) **NÃO** cria nem necessita de shadow database. Ele apenas lê os scripts existentes e os aplica diretamente ao banco de destino.

---

## 3. Comandos Essenciais: Guia Prático de Desenvolvimento e Produção

### Tabela de Referência Rápida

| Comando | Finalidade | Ambiente | Interativo? | Atualiza Client? |
| :--- | :--- | :--- | :--- | :--- |
| `npx prisma migrate dev --name <nome>` | Cria uma nova migração e aplica no banco local | Desenvolvimento | Sim | Sim (`prisma generate`) |
| `npx prisma migrate dev --create-only` | Gera o SQL da migração sem aplicar no banco | Desenvolvimento | Não | Não |
| `npx prisma migrate status` | Checa se há migrações pendentes ou divergências | Dev / CI / Prod | Não | Não |
| `npx prisma migrate deploy` | Aplica migrações pendentes em ordem | CI / Produção | **Não** | Não |
| `npx prisma migrate reset` | Apaga o banco, recria do zero e roda seed | Desenvolvimento | Sim (pede confirmação) | Sim |
| `npx prisma db seed` | Executa o script de carga inicial de dados | Dev / Testes | Não | Não |
| `npx prisma studio` | Abre interface web para inspecionar registros | Desenvolvimento | Sim | Não |

---

### `npx prisma migrate dev --name <nome>` (O Fluxo Diário)

Este é o comando que você utilizará sempre que fizer uma alteração em `server/prisma/schema.prisma` (ex.: adicionar um campo, criar uma nova tabela ou criar um índice).

#### Exemplo Prático:
1. Você adicionou um novo campo `emergencyContact` no modelo `Work` em `schema.prisma`.
2. No terminal do servidor (`server/`), execute:
   ```bash
   npx prisma migrate dev --name add_work_emergency_contact
   ```
3. O Prisma executará os seguintes passos automaticamente:
   - Valida o esquema contra o Shadow Database.
   - Cria o diretório `prisma/migrations/<timestamp>_add_work_emergency_contact/`.
   - Gera o arquivo `migration.sql` com o comando DDL correspondente.
   - Aplica o SQL no banco local `prisma/dev.db`.
   - Registra a nova linha na tabela `_prisma_migrations`.
   - Executa `prisma generate` em segundo plano para atualizar os tipos TypeScript do `@prisma/client`.

---

### `npx prisma migrate dev --create-only` (Revisão e SQL Customizado)

Em projetos corporativos, alterações estruturais no banco frequentemente exigem mais do que apenas criar uma coluna; elas exigem comandos SQL customizados que o Prisma não gera sozinho, tais como:
- Criar **Views** ou **Triggers** SQL.
- Executar scripts de preenchimento ou migração de dados (*data backfill*) antes de tornar uma coluna obrigatória (`NOT NULL`).
- Criar índices parciais ou restrições especiais (`CHECK constraints`).

#### Como utilizar:
1. Altere o `schema.prisma`.
2. Gere a migração sem aplicá-la:
   ```bash
   npx prisma migrate dev --name add_rdo_check_constraint --create-only
   ```
3. O Prisma informará que o arquivo foi criado, mas **não** foi aplicado ao banco:
   ```text
   Prisma Migrate created the following migration without applying it:
   20261101100000_add_rdo_check_constraint/migration.sql
   ```
4. Abra o arquivo `migration.sql` gerado no seu editor e insira suas instruções SQL manuais (ex.: `CREATE TRIGGER...`, `UPDATE...`).
5. Aplique a migração revisada ao banco local executando o comando padrão:
   ```bash
   npx prisma migrate dev
   ```

---

### `npx prisma migrate status` (Verificação de Integridade e CI)

O comando de diagnóstico e checagem de integridade. Ele compara os arquivos físicos presentes na pasta `prisma/migrations` com as entradas registradas na tabela `_prisma_migrations` do banco alvo.

```bash
npx prisma migrate status
```

#### Possíveis Retornos:
- **Tudo Sincronizado (Exit code 0)**:
  ```text
  Database schema is up to date!
  ```
- **Migrações Pendentes (Exit code 1)**:
  ```text
  Following migrations have not yet been applied:
  20261101100000_add_rdo_check_constraint
  To apply these migrations, run prisma migrate deploy
  ```
- **Divergência de Esquema / Banco não gerenciado (Exit code 1)**:
  ```text
  The database is not in sync with the migration history.
  ```

> 💡 **Uso em CI/CD**: Utilize `npx prisma migrate status` em etapas de checagem pré-deploy (*dry-run*) ou em testes de integridade para garantir que não há código novo com migração esquecida.

---

### `npx prisma migrate deploy` (O Comando Exclusivo de Produção / CI)

Este é o **único** comando de migração que deve ser executado em ambientes de homologação, staging, produção ou dentro de pipelines de CI/CD.

```bash
npx prisma migrate deploy
```

#### Características Vitais de Segurança:
- **Totalmente Não-Interativo**: Nunca exibirá prompts pedindo confirmação (`y/N`) que travam pipelines automatizadas.
- **Sem Shadow Database**: Não necessita de privilégios para criar bancos temporários.
- **Fail-Fast (Falha Rápida)**: Se detectar que o histórico de migrações diverge do banco de produção ou que alguma migração foi modificada, ele aborta imediatamente com código de erro diferente de zero, impedindo a subida de uma versão quebrada da API.
- **Aplicação Sequencial Estrita**: Aplica apenas as migrações que ainda não constam na tabela `_prisma_migrations`, na ordem cronológica de seus timestamps.

---

### `npx prisma migrate reset` (Recriação Limpa de Ambiente)

Utilizado exclusivamente em ambiente de desenvolvimento local quando o banco de dados local ficou poluído com dados de teste, quando você trocou de branch Git e o esquema ficou incompatível, ou quando deseja validar se todo o histórico de migrações é executável do zero.

```bash
npx prisma migrate reset
```

#### O que o comando faz:
1. Solicita confirmação interativa do desenvolvedor (`Are you sure you want to reset your database? All data will be lost`).
2. Descarta todas as tabelas e dados existentes no `dev.db`.
3. Executa todas as migrações da pasta `prisma/migrations` em ordem cronológica a partir do início.
4. Executa automaticamente o script de seed configurado em `package.json` (`npm run seed`), restaurando os usuários e obras padrão de teste.
5. Reexecuta `prisma generate`.

---

### `npx prisma db seed` / `npm run seed` (Carga Idempotente)

Para que uma aplicação funcione logo após a clonagem do repositório ou após um reset de banco, ela precisa de dados fundamentais (usuários mestres, obras ativas, parâmetros de configuração).

No StackLab, o script `server/src/seed.ts` é idempotente: ele verifica se os registros essenciais já existem antes de inseri-los:

```bash
# Executado via npm script padronizado
npm run seed

# Ou diretamente pelo utilitário do Prisma
npx prisma db seed
```

Para que o Prisma execute o seed automaticamente durante o `prisma migrate reset`, a seguinte configuração deve constar em `server/package.json`:

```json
{
  "scripts": {
    "seed": "tsx src/seed.ts"
  },
  "prisma": {
    "seed": "tsx src/seed.ts"
  }
}
```

---

### `npx prisma studio` (Exploração Visual de Dados e Metadados)

O Prisma inclui um painel de administração visual completo baseado na web.

```bash
npx prisma studio
```

Ao executar o comando, o servidor iniciará uma interface gráfica acessível no navegador em `http://localhost:5555`. 
Através do Studio, você pode:
- Inspecionar e filtrar registros de todas as 14 tabelas do StackLab (`User`, `Work`, `RDO`, `AuditLog`, etc.).
- Inspecionar diretamente as linhas da tabela oculta `_prisma_migrations` para auditar datas de aplicação e hashes de integridade.
- Testar inserções manuais para depuração de interfaces.

---

## 4. Particularidades Técnicas do Motor SQLite

O SQLite é um banco de dados relacional de alto desempenho, embarcado e baseado em arquivo único. Embora seja excelente para desenvolvimento local, testes automatizados e aplicações operacionais com baixa escrita simultânea, seu motor possui características de engenharia bem distintas de servidores cliente-servidor tradicionais (como PostgreSQL ou MySQL).

### Recriação de Tabelas em Operações DDL (`Table Recreation`)

Nos bancos tradicionais, a alteração de uma tabela é feita via comandos `ALTER TABLE`:
```sql
-- PostgreSQL ou MySQL
ALTER TABLE "User" DROP COLUMN "oldField";
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
```

No SQLite, historicamente o comando `ALTER TABLE` possui suporte extremamente limitado (basicamente permite apenas renomear a tabela e adicionar colunas simples no final). O SQLite **não suporta nativamente**:
- Alterar o tipo de dados de uma coluna existente.
- Remover uma coluna (`DROP COLUMN`) em versões mais antigas ou quando existem chaves estrangeiras complexas associadas.
- Adicionar ou alterar restrições de chave estrangeira (`FOREIGN KEY`) ou restrições de unicidade (`UNIQUE`) em tabelas já povoadas.

#### Como o Prisma Migrate resolve essa limitação?
Quando você altera um campo existente em um modelo no SQLite, o Prisma Migrate implementa uma estratégia segura de **Recriação em 12 Passos** (*Table Recreation*):
1. Desativa temporariamente a checagem de chaves estrangeiras: `PRAGMA foreign_keys=OFF;`
2. Cria uma nova tabela temporária com o esquema final: `CREATE TABLE "_new_User" (...);`
3. Copia todos os dados da tabela original para a temporária: `INSERT INTO "_new_User" SELECT ... FROM "User";`
4. Deleta a tabela antiga: `DROP TABLE "User";`
5. Renomeia a tabela temporária para o nome definitivo: `ALTER TABLE "_new_User" RENAME TO "User";`
6. Recria todos os índices e gatilhos da tabela.
7. Reativa a checagem de integridade referencial: `PRAGMA foreign_keys=ON;`

> 💡 **Impacto Prático**: Se você inspecionar o arquivo `migration.sql` gerado pelo Prisma para o SQLite após modificar uma coluna, você verá este bloco de criação de tabela `_new_*` e cópia de dados. Isto é perfeitamente normal e esperado no ecossistema SQLite.

---

### Emulação de Tipos Enumerados (`Enums`)

No PostgreSQL, os enums são tipos de dados nativos de primeira classe no banco (`CREATE TYPE "UserProfile" AS ENUM ('common', 'master');`).

O SQLite possui apenas **5 tipos básicos de armazenamento** (*Storage Classes*):
1. `NULL`
2. `INTEGER`
3. `REAL` (ponto flutuante)
4. `TEXT` (strings, datas ISO, enums)
5. `BLOB` (dados binários puros)

Portanto, quando você define em `schema.prisma`:
```prisma
enum UserProfile {
  common
  master
}

model User {
  // ...
  profile UserProfile @default(common)
}
```

O Prisma gera no SQLite uma coluna comum do tipo `TEXT`:
```sql
CREATE TABLE "User" (
    -- ...
    "profile" TEXT NOT NULL DEFAULT 'common'
);
```

#### Onde ocorre a validação dos valores?
A validação estrita dos enums é garantida na camada de aplicação:
1. Pelo **Prisma Client**, cujos tipos TypeScript gerados impedem a inserção de strings arbitrárias.
2. Pelos esquemas **Zod** de validação de DTO no backend Express (`server/src/dtos/`).
3. *(Opcional)* Se você desejar forçar a validação também no motor do SQLite, você pode usar `--create-only` e adicionar uma regra de `CHECK`:
   ```sql
   "profile" TEXT NOT NULL DEFAULT 'common' CHECK("profile" IN ('common', 'master'))
   ```

---

### Concorrência e Travas de Arquivo Local (`SQLITE_BUSY`)

Diferente do PostgreSQL, onde conexões concorrentes operam através de processos independentes com bloqueios a nível de linha (*row-level locking*), o SQLite gerencia a concorrência através de travas no arquivo físico do sistema operacional (`server/prisma/dev.db`).

O SQLite opera sob o princípio de **múltiplos leitores simultâneos, mas apenas um único escritor por vez**.

#### A Causa do Erro `database is locked` / `SQLITE_BUSY`:
Se a API do Express estiver rodando em segundo plano (`npm run dev`) ou se o Prisma Studio estiver aberto mantendo uma transação de escrita aberta, e você tentar rodar no terminal:
```bash
npx prisma migrate dev
# ou
npx prisma migrate reset
```
O comando falhará com a mensagem:
```text
Error: P3014: SQLite database error: database is locked
```

#### Boas Práticas para Evitar e Resolver:
1. **Encerre processos de escrita antes de resetar**: Ao executar `prisma migrate reset` ou migrações complexas, pause momentaneamente o servidor backend com `Ctrl+C`.
2. **Ativação do Modo WAL (Write-Ahead Logging)**: Por padrão, o SQLite opera em modo de rollback journal tradicional. Habilitar o modo WAL melhora drasticamente a concorrência, permitindo leituras simultâneas enquanto uma escrita ocorre. Para ativar o WAL no banco de desenvolvimento:
   ```bash
   # Via sqlite3 CLI ou script de inicialização
   sqlite3 prisma/dev.db "PRAGMA journal_mode=WAL;"
   ```

---

### Caminho de Evolução para PostgreSQL em Produção

No arquivo `server/.env.example`, consta a documentação da arquitetura:
```env
# Database Connection (SQLite for zero-config dev/testing, PostgreSQL for production)
DATABASE_URL="file:./dev.db"
```

Se a infraestrutura do StackLab migrar para um cluster PostgreSQL em produção, **as migrações geradas para SQLite NÃO poderão ser reutilizadas diretamente no PostgreSQL**. O arquivo `migration_lock.toml` rejeitará a execução porque as sintaxes DDL (chaves primárias UUID, índices e tipos de dados) são distintas.

#### Procedimento Padronizado de Transição para PostgreSQL:
1. No branch de infraestrutura de produção, altere o provedor em `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Inicialize um novo histórico limpo de migrações para PostgreSQL:
   ```bash
   npx prisma migrate dev --name init_postgres
   ```
3. O Prisma criará a pasta `migrations/` com a sintaxe nativa do Postgres (`UUID`, `TIMESTAMP(3)`, `CREATE TYPE "UserProfile"`), gerando um novo `migration_lock.toml` com `provider = "postgresql"`.

---

## 5. Troubleshooting e Resolução de Incidentes

Mesmo em equipes experientes, incidentes de banco de dados podem ocorrer. Abaixo estão os cenários mais frequentes e seus procedimentos determinísticos de resolução.

---

### Falhas de Migração e o Comando `prisma migrate resolve`

#### Cenário de Falha:
Você criou uma migração com SQL customizado (via `--create-only`), mas o comando continha um erro de sintaxe ou violou uma chave estrangeira. Ao rodar `prisma migrate dev` ou `deploy`, a migração falha na metade.

O Prisma registrará na tabela `_prisma_migrations` que a migração começou (`started_at`), mas nunca terminou com sucesso (`finished_at = NULL`). A partir deste momento, **o banco é bloqueado para novas migrações**.

#### Como Resolver com `prisma migrate resolve`:

Existem dois caminhos de resolução, dependendo se as alterações parciais foram desfeitas ou mantidas:

**Opção A — Se a alteração não surtiu efeito e você deseja tentar novamente:**
1. Desfaça manualmente qualquer alteração parcial que tenha sido criada no banco.
2. Informe ao Prisma que a migração falha deve ser marcada como revertida:
   ```bash
   npx prisma migrate resolve --rolled-back 20261101100000_nome_da_migracao
   ```
3. Corrija o arquivo `migration.sql` correspondente.
4. Rode novamente:
   ```bash
   npx prisma migrate dev
   ```

**Opção B — Se você corrigiu o problema manualmente no banco e quer marcá-la como resolvida:**
1. Aplique a correção estrutural diretamente no banco de dados.
2. Informe ao Prisma que a migração deve ser considerada aplicada com sucesso:
   ```bash
   npx prisma migrate resolve --applied 20261101100000_nome_da_migracao
   ```
3. Verifique com `npx prisma migrate status` se o banco voltou a reportar sincronia total.

---

### Divergência de Esquema (`Schema Drift`)

#### O que é Drift?
Ocorre quando o banco de dados físico sofreu alterações externas diretas (por exemplo, alguém abriu uma ferramenta gráfica de SQLite e adicionou uma tabela ou removeu uma coluna manualmente sem usar o Prisma Migrate).

Ao rodar `npx prisma migrate dev`, o Prisma compara o banco real com o Shadow Database e emite o aviso:
```text
Drift detected: Your database schema is not in sync with the migration history.
```

#### Procedimento de Resolução:
1. Inspecione a divergência exata gerando o diff entre o banco real e seu modelo:
   ```bash
   npx prisma migrate diff \
     --from-schema-datasource ./prisma/schema.prisma \
     --to-schema-datamodel ./prisma/schema.prisma
   ```
2. **Em ambiente de desenvolvimento**: Se as alterações manuais eram testes descartáveis, execute `npx prisma migrate reset` para restaurar o estado canônico do repositório.
3. **Se as alterações manuais devem ser preservadas**: Atualize o `schema.prisma` para refletir os novos campos e execute:
   ```bash
   npx prisma migrate dev --name sync_schema_drift
   ```

---

### Erro de Checksum Alterado (`Checksum Mismatch`)

#### O que ocorre:
Um desenvolvedor rodou uma migração localmente há três dias. Hoje, ele resolveu abrir o arquivo `prisma/migrations/20261031000000_init/migration.sql` e adicionar um novo comentário ou alterar um nome de coluna diretamente no arquivo já aplicado.

Ao rodar qualquer comando do Prisma, ele falha com o erro:
```text
Error: P3008: The migration `20261031000000_init` was modified after it was applied to the database.
```

#### Regra Fundamental de Ouro:
> 🚫 **NUNCA modifique o conteúdo de um arquivo de migração que já foi aplicado e commitado no Git.**

#### Como Resolver:
1. Reverta o arquivo de migração antigo exatamente ao seu conteúdo original (o hash SHA-256 voltará a bater com o registro da tabela `_prisma_migrations`).
2. Se você precisa alterar o esquema, crie **SEMPRE** uma **nova** migração para frente (*roll-forward*):
   ```bash
   npx prisma migrate dev --name adjust_column_rules
   ```

---

### Conflitos de Migração Concorrente em Branches Git

#### O Cenário:
- O Desenvolvedor A está trabalhando no branch `feat/photos` e gera a migração:
  `20261101140000_add_photo_geohash`
- O Desenvolvedor B está trabalhando no branch `feat/weather` e gera a migração:
  `20261101140500_add_weather_humidity`
- Ambos fazem merge na branch principal `main`.

#### O que acontece?
Como as pastas possuem nomes distintos, o Git não acusará conflito de merge de arquivos. No entanto, o Desenvolvedor A (ou a esteira de CI) terá em seu disco a migração do Desenvolvedor B que ainda não foi aplicada em seu banco local.

#### Procedimento de Resolução:
1. Após fazer o `git pull` ou `git rebase` da branch principal:
2. Execute o comando de status para inspecionar as pendências:
   ```bash
   npx prisma migrate status
   ```
3. Aplique as migrações vindas da branch do colega:
   ```bash
   npx prisma migrate dev
   ```
   O Prisma reconhecerá a migração pendente, aplicará ao banco local e re-executará o `prisma generate` para sincronizar os tipos TypeScript.

---

## 6. Checklists Operacionais

### Checklist do Desenvolvedor (Nova Feature com Banco)

Ao implementar uma funcionalidade que altera a estrutura de dados:
- [ ] O servidor backend foi pausado para evitar travas de arquivo SQLite (`SQLITE_BUSY`).
- [ ] O modelo foi ajustado no arquivo `server/prisma/schema.prisma`.
- [ ] Foi executado `npx prisma migrate dev --name <nome_claro_e_descritivo>`.
- [ ] O arquivo `prisma/migrations/<timestamp>_<nome>/migration.sql` foi inspecionado visualmente para garantir que não há comandos indesejados.
- [ ] A aplicação backend compila sem erros: `npm run build`.
- [ ] A suíte de testes passa com sucesso: `npm test`.
- [ ] O status do banco está sincronizado: `npx prisma migrate status` reporta código 0.
- [ ] Todos os novos arquivos da pasta `prisma/migrations/` foram adicionados ao commit do Git:
  ```bash
  git add prisma/schema.prisma prisma/migrations/
  git commit -m "feat(db): adiciona migracao para suporte a geolocalizacao do RDO"
  ```

---

### Checklist de CI/CD para Produção

Na esteira automatizada de entrega contínua:
- [ ] O repositório é clonado com todo o histórico de código.
- [ ] A variável `DATABASE_URL` está configurada corretamente no ambiente de destino.
- [ ] O comando de deploy de migrações é executado antes da inicialização do serviço:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] A etapa de deploy verifica o código de saída (deve ser 0). Se for diferente de zero, a esteira aborta imediatamente o deploy do container.
- [ ] O comando `npx prisma migrate status` confirma que não há migrações não aplicadas no ambiente produtivo.
- [ ] O processo da API é iniciado (`npm start` ou `node dist/server.js`).

---
*Documentação oficial mantida pela equipe de Arquitetura e Engenharia do StackLab RDO.*
