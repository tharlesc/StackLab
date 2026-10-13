# Tracking de Desenvolvimento - RDO Mobile Backend (StackLab Server)

Este documento centraliza o status de todos os requisitos do lado do **Servidor (Backend)** exigidos no Documento de Requisitos de Desenvolvimento de Aplicação (DRDA).

---

## ✅ O QUE JÁ TEMOS (Implementado)

### Base e Infraestrutura Inicial
- [x] Inicialização do projeto Node.js com TypeScript e Express (`package.json` base).
*(Nota: O servidor encontra-se completamente zerado, possuindo apenas as configurações iniciais de pacote).*

---

## ⏳ O QUE FALTA FAZER (Backlog)

### 1. Configuração e Arquitetura Base (Prioridade Alta)
- [ ] Definir e configurar o Banco de Dados (ex: PostgreSQL, MySQL ou MongoDB) com ORM (Prisma ou TypeORM).
- [ ] Estruturar pastas do projeto (MVC ou Clean Architecture: rotas, controladores, serviços, modelos).
- [ ] Configurar tratamentos de erro globais e middlewares de validação (ex: Zod ou Joi).

### 2. Autenticação e Segurança (RNF02, 3.4)
- [ ] Instalar pacotes de segurança (`bcrypt`, `jsonwebtoken`, `cors`, `helmet`).
- [ ] Implementar criptografia de senhas usando `bcrypt`.
- [ ] Criar endpoint de Login gerando Token JWT para controle de sessão.
- [ ] Implementar Middleware de Autenticação para proteger rotas privadas.
- [ ] Implementar Controle de Acesso Baseado em Perfis (Role-Based Access Control) para separar rotas de Master, Operacional e Cliente.

### 3. Módulo de Cadastros Base (RF03)
- [ ] Criar CRUD e APIs para **Empresas**.
- [ ] Criar CRUD e APIs para **Obras** e **Contratos**.
- [ ] Criar CRUD e APIs para **Usuários**, permitindo vinculação entre Usuário <-> Obra.

### 4. Módulo Core: Registro Diário de Obra (RDO)
- [ ] Modelar a estrutura do RDO no banco de dados (Clima, Efetivo, Equipamentos, Atividades, Ocorrências).
- [ ] Criar API de submissão do RDO, preparada para receber dados offline sincronizados de uma vez (RF05).
- [ ] Criar API para Registro Fotográfico, integrando com um serviço de Nuvem (AWS S3, Google Cloud Storage ou Firebase) (3.1.3).
- [ ] Criar máquina de estados e APIs para o Fluxo de Validação:
  - [ ] RDO Submetido (Operacional).
  - [ ] RDO Devolvido para correção (Master).
  - [ ] RDO Validado/Assinado pelo Gestor (Master).
  - [ ] RDO Assinado com Ciência/Ressalva (Cliente).

### 5. Assinatura Eletrônica e Imutabilidade (RF11, RF12)
- [ ] Implementar lógica para capturar e validar as Assinaturas Eletrônicas (salvando metadados como IP, Data, Hora e autor).
- [ ] Implementar geração de Documento PDF final no backend (ex: Puppeteer ou pdfkit).
- [ ] Gerar QR Code ou Hash criptográfico no documento para garantir integridade e evitar falsificações (RNF06).

### 6. Sistema de Notificações (RF13, 3.1.4)
- [ ] Integrar serviço de envio de E-mails (ex: SendGrid, AWS SES ou Nodemailer).
- [ ] Integrar serviço de Push Notifications (ex: Firebase Cloud Messaging ou Expo Push API).
- [ ] Configurar disparo automático de alertas em mudanças de status do RDO.

### 7. Painel Gerencial e Exportação (Painel Web)
- [ ] Criar APIs de listagem e filtros (RDOs pendentes, aprovados, atrasados).
- [ ] Criar funcionalidade para exportar relatórios em formato Excel e pacotes ZIP contendo fotos.

---

*Nota: Conforme completarmos as atividades acima no lado do servidor, mudaremos o status de `[ ]` para `[x]` e atualizaremos este mapa.*
