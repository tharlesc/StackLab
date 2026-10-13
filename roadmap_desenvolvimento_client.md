# Tracking de Desenvolvimento - RDO Mobile (StackLab)

Este documento centraliza o status de todos os requisitos definidos no Documento de Requisitos de Desenvolvimento de Aplicação (DRDA) e na especificação unificada do RDO Mobile.

---

## ✅ O QUE JÁ TEMOS (Implementado)

### Base, UI e Componentes Curados
- [x] Estrutura inicial do projeto com Expo e React Native (Expo Router v57).
- [x] Design System baseado no Apple Human Interface Guidelines (HIG) e Styled Components.
- [x] Curadoria e unificação de componentes reutilizáveis:
  - `Avatar`: Inicial com iniciais automáticas, borda de destaque e dimensões nativas.
  - `SearchBar`: Campo de busca acessível com limpeza rápida.
  - `SegmentedControl`: Controle segmentado com suporte a temas claro/escuro.
  - `StatusBadge`: Pílula de status semântica vinculada à paleta de status (sucesso, aviso, erro, info).
  - `Button`, `Input`, `Card`, `InteractiveCard`, `Dialog`, `Toggle`, `EmptyState`, `Header`, `BottomNavigation`.
- [x] Token de tema `hero` e paleta contrastante com modo claro e escuro.
- [x] Contextos globais: `ThemeContext`, `AuthContext` (com RBAC `can()`), `RDOContext` e `AdminContext`.

### Perfis de Usuário & Diferenciação (RBAC)
- [x] **Matriz RBAC Unificada (`constants/permissions.ts`)**: Definição formal das permissões de Operacional vs Master.
- [x] **Dashboard Adaptativo**:
  - **Operacional**: Visão restrita exclusivamente às obras designadas (`assignedWorkIds`), banner contínuo de status de conectividade ("Modo Offline / Sincronizado"), alerta de RDOs devolvidos para correção e FAB central de "Novo RDO".
  - **Master**: Visão global de todas as obras, barra de busca global por termos em todos os diários da organização, totalizadores e Donut Chart em tempo real, atalho direto para Inbox de Validação com alertas de SLA.

### Telas e Fluxos do Usuário Master (Gestor / Engenheiro)
- [x] **Caixa de Entrada (Inbox) de Validação (`/inbox`)**:
  - Triagem ordenada por prioridade temporal.
  - Gatilho de SLA: Relatórios submetidos há mais de 24 horas recebem destaque visual automático e status de "Atrasado".
  - Filtros segmentados (Todos, Atrasados, Em Análise, Devolvidos) e busca por texto.
- [x] **Tela de Análise, Chancela e Assinatura (`/rdo-review`)**:
  - Linha do tempo vertical contínua com módulos (Identificação/Clima, Mão de Obra e Homem-Hora, Equipamentos com justificativa de inatividade, Atividades e Materiais, Ocorrências e Fotos com marcas d'água).
  - **Comentários Técnicos por Módulo**: O Master pode registrar apontamentos em cada seção.
  - **Edição Auditável**: Alteração técnica pelo Master exigindo justificativa obrigatória e gravando registro inalterável (valor anterior vs novo valor).
  - **Devolução Motivada**: Recusa fundamentada com desbloqueio pontual da edição para a equipe de campo.
  - **Homologação e Assinatura 2FA**: Validação com segundo fator (PIN de segurança), captura de IP, Device ID e timestamp, gerando Hash SHA de verificação e travando o documento como imutável (`locked`).
- [x] **Painel de Retificação e Exportações (`/rdo-review`)**:
  - Emissão de Termo de Retificação Oficial: congela a versão v1 original e gera uma nova versão de trabalho v2 para nova chancela, preservando a cadeia de custódia jurídica.
  - Exportação simulada: PDF Oficial formatado, Planilha Analítica CSV e Download em lote de Fotos.
- [x] **Módulo de Administração & Cadastros (`/admin`)**:
  - Gestão de Obras (cadastrar e ativar/desativar).
  - Cadastro de Usuários (cadastrar, definir cargo e perfil Master/Operacional).
  - **Matriz de Acessos**: Atribuição e desatribuição em tempo real de operadores a obras específicas.
- [x] **Trilha de Auditoria Inalterável (`/audit-trail`)**:
  - Modal com linha do tempo append-only de todas as ações executadas no RDO (submissões, devoluções, edições auditadas, comentários, assinaturas e retificações).

---

## ⏳ O QUE FALTA FAZER (Backlog)

### 1. Dependências Core e Infraestrutura (Prioridade Alta)
- [ ] Instalar e configurar banco de dados local (ex: WatermelonDB ou SQLite/MMKV) para funcionamento Offline-First com SQLite nativo (RF05, RNF03).
- [ ] Instalar pacotes de Hardware e Media: `expo-camera`, `expo-image-picker`.
- [ ] Instalar pacotes de UI Essenciais: `react-native-signature-canvas` (Canvas de Assinatura por desenho), `expo-local-authentication` (Biometria nativa FaceID/TouchID).

### 2. Fluxo do Usuário Operacional (O Core do App)
- [ ] **Wizard Completo de "Novo RDO" (Formulário Sequencial Passo a Passo)**:
  - [ ] Passo 1: Clima e Turno (com campos obrigatórios de horas paradas e impacto em caso de Chuva).
  - [ ] Passo 2: Mão de Obra e Equipamentos (cálculo automatizado de Hh e justificativa de inatividade).
  - [ ] Passo 3: Atividades Executadas (com frente e quantidade) e Materiais recebidos (NF-e).
  - [ ] Passo 4: Ocorrências, DDS e Fotos (câmera nativa com carimbo de marca d'água de data/hora/autor e legenda obrigatória).
  - [ ] Passo 5: Revisão consolidada, aceite de responsabilidade e submissão com trava somente leitura.
- [ ] Tela de Histórico de RDOs da Obra / Calendário interativo com tags de status.

### 3. Integração com Backend e Nuvem
- [ ] Integração com API RESTful e autenticação real via JWT.
- [ ] Sincronização offline transacional (upload em lote de fotos para AWS S3/GCS e envio de fila).
- [ ] Geração do documento PDF final pelo backend com QR Code criptográfico (RF12).
- [ ] Disparo de Push Notifications e e-mails de notificação (RF13).

### 4. Área do Usuário Cliente
- [ ] Dashboard exclusivo do Cliente (visualizando apenas suas obras contratadas).
- [ ] Leitura de RDOs homologados, inserção de ressalva e Assinatura de Ciência (RF10, RF11).
