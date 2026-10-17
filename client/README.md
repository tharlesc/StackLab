# StackLab — RDO Mobile (Client)

Aplicativo móvel de **Relatório Diário de Obra (RDO)** construído com **Expo SDK 57**, **React Native 0.86**, **Expo Router** (typed routes) e **styled-components/native**, seguindo as diretrizes de acessibilidade da **Apple Human Interface Guidelines (HIG)** e **WCAG AA** (contraste mínimo `4,5:1` para texto e `3,0:1` para componentes de interface, nos temas claro e escuro).

---

## ⚡ Quick Start (< 5 min)

```bash
cd client
npm i
npx expo start
```

Atalhos no terminal do Expo:
- Pressione `i` para abrir no simulador iOS
- Pressione `a` para abrir no emulador Android
- Pressione `w` para abrir no navegador Web
- Ou escaneie o QR Code com o **Expo Go** no dispositivo físico

---

## 👥 Política de Mocks e Usuários de Teste

O cliente opera atualmente em modo **Offline/In-Memory Mock** (`src/mocks/index.ts`), permitindo testar ponta a ponta toda a máquina de estados do RDO (`src/services/modules/rdoWorkflow.ts`), matriz de permissões RBAC (`src/constants/permissions.ts`) e fluxos de homologação sem depender de servidor externo.

Na tela de **Login** (`/login`), você pode usar os **atalhos de acesso rápido** no rodapé ou digitar qualquer senha com um dos e-mails abaixo:

| Perfil | Usuário | E-mail | Cargo | PIN de Homologação (Master) |
| :--- | :--- | :--- | :--- | :--- |
| **Master** (`master`) | Eng. Carlos Mendes | `carlos.mendes@stacklab.eng.br` | Diretor de Engenharia | `1234` |
| **Operacional** (`common`) | Davi Hudson | `davi.hudson@stacklab.eng.br` | Técnico de Edificações | — |
| **Operacional** (`common`) | Marina Rocha | `marina.rocha@stacklab.eng.br` | Estagiária de Engenharia | — |

### O que cada perfil pode testar
- **Master (`carlos.mendes@stacklab.eng.br`)**:
  - Visualiza todas as obras da empresa, KPIs consolidados, Donut Chart e alerta de SLA no topo do Dashboard.
  - Acessa a **Inbox de Validação** (`/inbox`) ordenada por prioridade (RDOs submetidos há > 24h aparecem como **Atrasado**).
  - Na tela de **Revisão de RDO** (`/rdo-review`), pode adicionar comentários por seção, realizar **Edição Auditada** (com justificativa), **Devolver** ao campo, **Validar e Assinar** (PIN `1234`) ou emitir **Termo de Retificação** em RDOs aprovados.
  - Gerencia obras, equipe e a **Matriz de Acessos** em **Administração** (`/admin`).
- **Operacional (`davi.hudson@stacklab.eng.br`)**:
  - Visualiza apenas as obras às quais está alocado (`assignedWorkIds`).
  - Recebe alertas de RDOs devolvidos para correção, cria/submete diários em `/new-rdo` e acompanha a fila de sincronização (`/sync-queue`).

---

## 📂 Estrutura de Pastas

O projeto adota roteamento baseado em arquivos na raiz (`client/app/`) separado da implementação em `client/src/` (sempre importada via alias `@/*`):

```text
client/
├── app/                        # Rotas Expo Router (arquivos enxutos que reexportam as Views)
│   ├── _layout.tsx             # Providers globais, fontes Inter e guarda de autenticação
│   ├── index.tsx               # Dashboard Principal (Operacional / Master)
│   ├── login.tsx               # Autenticação
│   ├── inbox.tsx               # Caixa de Entrada de Validação (Master)
│   ├── rdo-review.tsx          # Análise, Chancela, Assinatura e Retificação
│   ├── admin.tsx               # Gestão de Obras, Equipe e Matriz de Acessos (Master)
│   ├── audit-trail.tsx         # Modal de Trilha de Auditoria
│   ├── new-rdo.tsx             # Criação / Submissão de RDO
│   ├── sync-queue.tsx          # Fila de Sincronização Offline
│   ├── notifications.tsx       # Central de Notificações
│   ├── profile.tsx             # Perfil do Usuário
│   └── settings.tsx            # Ajustes e Aparência (Sistema / Claro / Escuro)
├── assets/                     # Imagens e ícones estáticos
├── scripts/
│   └── check-contrast.ts       # Auditoria automatizada de contraste WCAG AA (claro/escuro)
└── src/
    ├── __tests__/              # Testes unitários (Jest + jest-expo)
    ├── components/
    │   ├── common/             # Design System (Button, Input, Field, Dialog, Toggle, Chip, Card...)
    │   ├── dashboard/          # Cartões de perfil e resumo semanal
    │   ├── navigation/         # Header, BottomNavigation, NavigationItem, PrimaryActionItem
    │   ├── ui/                 # DonutChart, WeatherIcon
    │   └── works/              # ActiveWorkCard
    ├── constants/
    │   ├── theme.ts            # Tokens semânticos (lightTheme/darkTheme), tipografia, espaçamento
    │   ├── strings.ts          # Textos em pt-BR e glossário único de status de RDO
    │   ├── permissions.ts      # Matriz RBAC (common vs master)
    │   └── R.ts                # Namespace de recursos estáticos (R.strings, R.images)
    ├── contexts/               # ThemeContext, AuthContext, RDOContext, AdminContext
    ├── mocks/                  # Dados iniciais em memória para simulação
    ├── screens/                # Views, estilos e hooks de cada tela (Padrão View + Hook)
    ├── services/
    │   └── modules/
    │       └── rdoWorkflow.ts  # Máquina de estados pura do RDO (submeter, aprovar, devolver, retificar)
    ├── types/                  # Contratos TypeScript (auth, rdo, work, ui, sync, styled.d.ts)
    └── utils/                  # Funções puras (rdo, date, text, contrast)
```

---

## 🛠️ Scripts Disponíveis

Execute a partir da pasta `client/`:

| Comando | Descrição |
| :--- | :--- |
| `npm start` | Inicia o servidor de desenvolvimento do Expo (`expo start`). |
| `npm run android` | Inicia o Expo abrindo no Android (`expo start --android`). |
| `npm run ios` | Inicia o Expo abrindo no iOS (`expo start --ios`). |
| `npm run web` | Inicia o Expo para navegador Web (`expo start --web`). |
| `npm run typecheck` | Executa a verificação estática de tipos do TypeScript (`tsc --noEmit`), incluindo rotas tipadas (`typedRoutes`). |
| `npm run lint` | Executa o ESLint (`eslint-config-expo`) em todo o projeto. |
| `npm test` | Executa a suíte de testes unitários com Jest (`rdo`, `date`, `text`, `rdoWorkflow` e auditoria de contraste WCAG). |
| `npm run format` | Formata os arquivos do projeto com Prettier. |
