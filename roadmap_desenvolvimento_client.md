# Tracking de Desenvolvimento - RDO Mobile (StackLab)

Este documento centraliza o status real de todos os requisitos definidos para o aplicativo **RDO Mobile (StackLab)**, classificando cada entrega em três estados:

- ✅ **Real**: Implementado e funcional no cliente conforme especificação.
- 🧪 **Mock / Parcial**: Fluxo funcional em memória ou simulado na interface, aguardando persistência nativa, criptografia de backend ou integração com hardware/API.
- ⏳ **Pendente**: Item de backlog ainda não implementado.

---

## 1. Design System, Acessibilidade e Infraestrutura de UI

- ✅ **Arquitetura Expo Router (SDK 57) com `typedRoutes`**: Rotas enxutas em `client/app/` e código-fonte modularizado em `client/src/` via alias `@/*`.
- ✅ **Design System & Contraste WCAG AA (`constants/theme.ts`)**:
  - Escala tipográfica semântica (`largeTitle`, `title`, `headline`, `body`, `callout`, `footnote`, `caption` >= 12px com `lineHeight` explícito).
  - Tokens semânticos de espaçamento (`theme.spacing`), alvos de toque >= 44pt (`theme.touchTarget`), ícones padronizados (`theme.icon`) e cores de gráfico (`colors.chart`).
  - Auditoria automatizada (`scripts/check-contrast.ts` e `src/__tests__/contrast.test.ts`) garantindo contraste >= 4,5:1 para texto e >= 3,0:1 para componentes nos temas claro e escuro.
- ✅ **Modo Escuro Adaptativo (`contexts/ThemeContext.tsx`)**:
  - Suporte aos modos `'system' | 'light' | 'dark'` via `useColorScheme`, persistido em `@react-native-async-storage/async-storage`, `userInterfaceStyle: "automatic"` no `app.json` e seletor de 3 opções em Ajustes (`/settings`).
- ✅ **Glossário Único de Status e Textos Centralizados (`constants/strings.ts`, `utils/rdo.ts`)**:
  - Status padronizados em todo o app via `RDO_STATUS_META`: `Rascunho`, `Submetido`, `Devolvido`, `Aprovado` e o status derivado `Atrasado` (> 24h sem análise).
- ✅ **Qualidade e Testes Automatizados**:
  - ESLint (`eslint-config-expo`), Prettier, TypeScript estrito (`npm run typecheck`) e testes unitários com `jest-expo` (`npm test`) cobrindo `utils/rdo`, `utils/date`, `utils/text`, `rdoWorkflow` e contraste WCAG.

---

## 2. Autenticação, Perfis (RBAC) e Administração

- ✅ **Matriz RBAC Unificada (`constants/permissions.ts`)**: Controle formal de permissões entre `common` (Operacional) e `master` (Gestor/Engenheiro) via helper `can()` e `getAvailableActions()`.
- 🧪 **Autenticação e Sessão (`contexts/AuthContext.tsx`, `/login`)**:
  - Login funcional por e-mail sobre lista de usuários mockados em memória e atalhos de troca rápida de perfil; ainda sem autenticação JWT em backend real.
- 🧪 **Módulo de Administração e Matriz de Acessos (`/admin`, `contexts/AdminContext.tsx`)**:
  - Cadastro de obras, cadastro de usuários e atribuição/desatribuição em tempo real de operadores a obras (`assignedWorkIds`) funcionando em memória (sem persistência em API).

---

## 3. Dashboard, Busca e Conectividade

- ✅ **Dashboard Adaptativo por Perfil (`/`)**:
  - **Master**: Alerta prioritário de SLA no topo do dashboard com ícone, busca global em todos os RDOs (incluindo busca pelo rótulo de status do glossário), totalizadores e `DonutChart` acessível.
  - **Operacional**: Visão restrita às obras alocadas (`assignedWorkIds`), alerta de RDOs devolvidos e ação rápida para emissão de RDO.
- 🧪 **Banner de Conectividade e Fila de Sincronização (`/sync-queue`)**:
  - Interface de fila offline, retentativa manual e indicador de sincronização baseados em estado mockado (`useSyncQueue`); pendente integração com `@react-native-community/netinfo` e banco local SQLite/WatermelonDB.

---

## 4. Fluxo de Revisão, Chancela, Auditoria e Ciclo de Vida do RDO

- ✅ **Caixa de Entrada de Validação (`/inbox`)**:
  - Ordenação automática por prioridade (`sortByReviewPriority`: atrasados primeiro, depois submetidos mais antigos), gatilho de SLA de 24h (`isOverdue`), filtros por status e alvo de toque único por cartão.
- ✅ **Máquina de Estados Pura do RDO (`services/modules/rdoWorkflow.ts`)**:
  - Transições testadas isoladamente: `submitRdo`, `approveRdo` (restrito a `submetido`), `returnRdo` (exige justificativa), `auditedEdit`, `addComment` e `rectifyRdo` (congela a versão anterior e substitui na lista ativa sem duplicar).
- 🧪 **Revisão de RDO e Seções Modulares (`/rdo-review`)**:
  - Exibe todos os módulos do RDO (Identificação/Clima, Mão de Obra/Hh, Equipamentos, Atividades, Materiais, Ocorrências/DDS e Fotos) com adição de comentários por seção; layout em cartões modulares (não implementa timeline gráfica contínua com linha conectora vertical).
- 🧪 **Edição Auditável (`auditedEdit` em `/rdo-review`)**:
  - Altera em memória o campo principal do primeiro registro da seção selecionada, exige justificativa (mín. 5 caracteres) e grava valor anterior/novo no log; pendente seletor granular para editar qualquer item individual de listas multi-registro e persistência em backend.
- 🧪 **Trilha de Auditoria (`/audit-trail`)**:
  - Modal cronológico `append-only` durante a sessão em memória (`RDOContext`); a imutabilidade jurídica e armazenamento à prova de adulteração dependem de persistência em backend.
- 🧪 **Homologação 2FA e Hash de Integridade (`approveRdo` / `computeIntegrityHash`)**:
  - Validação de segundo fator simulada via PIN fixo (`1234`), metadados de IP/Device ID simulados e hash determinístico local (`FNV-1a` 32-bit com prefixo `SL-`). Em produção, requer `expo-local-authentication` (biometria/TOTP) e geração de hash criptográfico `SHA-256` sobre o PDF final no servidor.
- 🧪 **Exportações (PDF Oficial, CSV Analítico e Fotos em Lote)**:
  - Ações de exportação em `/rdo-review` exibem feedback simulado na interface; geração real de arquivos PDF/CSV/ZIP ainda pendente.

---

## 5. Backlog Pendente (⏳ O Que Falta Fazer)

- ⏳ **Persistência Offline-First Real**: Instalar e configurar SQLite / WatermelonDB para armazenamento local persistente de RDOs, fila de sincronização e fotos.
- ⏳ **Wizard Completo de "Novo RDO" (`/new-rdo`)**:
  - Atualmente `/new-rdo` cria/submete um diário simplificado; falta o formulário sequencial completo passo a passo (Clima/Turno com horas paradas, Mão de Obra, Equipamentos com justificativa de ociosidade, Atividades, Materiais/NF-e, Ocorrências/DDS e captura de Fotos).
- ⏳ **Câmera Nativa e Marca d'Água (`expo-camera` / `expo-image-picker`)**: Captura de fotos em campo com carimbo automático de data/hora/coordenadas e upload em lote.
- ⏳ **Biometria Nativa e Assinatura em Tela (`expo-local-authentication` / `react-native-signature-canvas`)**.
- ⏳ **Integração com Backend RESTful**: Autenticação JWT, sincronização transacional, geração de PDF com hash SHA-256 + QR Code e envio de Push Notifications.
- ⏳ **Área do Usuário Cliente**: Dashboard de leitura de RDOs homologados e assinatura de ciência com ressalvas.
