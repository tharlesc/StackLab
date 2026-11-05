-- =============================================================================
-- StackLab — RDO (Relatório Diário de Obra) — Schema completo para Supabase
-- -----------------------------------------------------------------------------
-- Cole este arquivo inteiro no SQL Editor do Supabase e execute.
-- O script é re-executável (idempotente): pode rodar de novo sem quebrar nada.
--
-- Conteúdo:
--   1. Tipos (enums)
--   2. Funções utilitárias (updated_at)
--   3. profiles + trigger de criação automática a partir de auth.users
--   4. obras + obra_operadores
--   5. rdos (tabela principal) + máquina de estados do workflow
--   6. Tabelas filhas do wizard (clima, efetivo, máquinas, atividades,
--      insumos, fatos, fotos)
--   7. Funções de autorização usadas pelo RLS
--   8. Políticas RLS
--   9. Realtime (RDO aparece instantaneamente no painel do master)
--  10. Storage: bucket rdo-fotos + políticas
--
-- Convenção de caminho no Storage:  rdo-fotos/{rdo_id}/{nome-do-arquivo}
-- =============================================================================


-- =============================================================================
-- 1. TIPOS
-- =============================================================================
do $$ begin
  create type public.user_role as enum ('master', 'operador');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.rdo_status as enum ('rascunho', 'pendente_aprovacao', 'aprovado', 'rejeitado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.turno as enum ('manha', 'tarde', 'noite');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.atividade_status as enum ('iniciado', 'em_andamento', 'concluido', 'paralisado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fato_tipo as enum ('dds', 'acidente', 'paralisacao', 'interferencia', 'pendencia', 'outro');
exception when duplicate_object then null; end $$;


-- =============================================================================
-- 2. FUNÇÕES UTILITÁRIAS
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =============================================================================
-- 3. PROFILES (integrado com auth.users)
-- =============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null default '',
  email       text not null,
  cargo       text,                       -- ex.: "Engenheiro Residente" (apenas exibição)
  crea        text,
  avatar_url  text,
  role        public.user_role not null default 'operador',
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o profile automaticamente quando um usuário é criado no Supabase Auth.
-- SEGURANÇA: o role NUNCA é lido do metadata enviado pelo app (o usuário poderia
-- se cadastrar como master). Todo novo usuário nasce 'operador'; a promoção a
-- master é feita por outro master ou pelo SQL Editor.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nome)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantém o e-mail do profile sincronizado quando ele muda no Auth.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();


-- =============================================================================
-- 4. OBRAS E ATRIBUIÇÃO DE OPERADORES
-- =============================================================================
create table if not exists public.obras (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null check (length(trim(nome)) > 0),
  descricao          text,
  cliente            text,
  endereco           text,
  data_inicio        date,
  data_previsao_fim  date,
  ativa              boolean not null default true,
  created_by         uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint obras_datas_chk check (data_previsao_fim is null or data_inicio is null or data_previsao_fim >= data_inicio)
);

create index if not exists obras_ativa_idx on public.obras (ativa);

drop trigger if exists obras_set_updated_at on public.obras;
create trigger obras_set_updated_at
  before update on public.obras
  for each row execute function public.set_updated_at();

create table if not exists public.obra_operadores (
  obra_id        uuid not null references public.obras (id) on delete cascade,
  operador_id    uuid not null references public.profiles (id) on delete cascade,
  atribuido_por  uuid default auth.uid() references public.profiles (id) on delete set null,
  atribuido_em   timestamptz not null default now(),
  primary key (obra_id, operador_id)
);

-- A PK (obra_id, operador_id) já cobre buscas por obra; este cobre "minhas obras".
create index if not exists obra_operadores_operador_idx on public.obra_operadores (operador_id);


-- =============================================================================
-- 5. RDOS (tabela principal)
-- =============================================================================
create table if not exists public.rdos (
  id                  uuid primary key default gen_random_uuid(),
  obra_id             uuid not null references public.obras (id) on delete restrict,
  operador_id         uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  numero              integer not null,                 -- sequencial por obra (preenchido por trigger)
  data                date not null default current_date,
  status              public.rdo_status not null default 'rascunho',

  -- Etapa "Clean": observações gerais do dia
  observacoes_gerais  text,

  -- Workflow / aprovação
  enviado_em          timestamptz,
  aprovado_por        uuid references public.profiles (id) on delete set null,
  aprovado_em         timestamptz,
  rejeitado_por       uuid references public.profiles (id) on delete set null,
  rejeitado_em        timestamptz,
  motivo_rejeicao     text,

  -- Auditoria
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint rdos_numero_unq unique (obra_id, numero),
  constraint rdos_rejeicao_motivo_chk
    check (status <> 'rejeitado' or length(trim(coalesce(motivo_rejeicao, ''))) > 0)
);

create index if not exists rdos_obra_id_idx       on public.rdos (obra_id);
create index if not exists rdos_operador_id_idx   on public.rdos (operador_id);
create index if not exists rdos_status_idx        on public.rdos (status);
create index if not exists rdos_obra_data_idx     on public.rdos (obra_id, data desc);
-- Fila do painel do master (consulta mais quente do app)
create index if not exists rdos_pendentes_idx     on public.rdos (enviado_em)
  where status = 'pendente_aprovacao';

drop trigger if exists rdos_set_updated_at on public.rdos;
create trigger rdos_set_updated_at
  before update on public.rdos
  for each row execute function public.set_updated_at();


-- =============================================================================
-- 6. TABELAS FILHAS DO WIZARD
-- =============================================================================

-- Etapa "Clean": clima por turno (complementa observacoes_gerais em rdos)
create table if not exists public.rdo_clima (
  id                 uuid primary key default gen_random_uuid(),
  rdo_id             uuid not null references public.rdos (id) on delete cascade,
  turno              public.turno not null,
  condicao           text not null,                    -- "Ensolarado", "Nublado", "Chuva", ...
  praticavel         boolean not null default true,
  horas_paralisadas  numeric(4,2) check (horas_paralisadas between 0 and 24),
  impacto            text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint rdo_clima_turno_unq unique (rdo_id, turno)
);

-- Etapa "Efetivo": equipe / trabalhadores
create table if not exists public.rdo_efetivo (
  id             uuid primary key default gen_random_uuid(),
  rdo_id         uuid not null references public.rdos (id) on delete cascade,
  funcao         text not null check (length(trim(funcao)) > 0),
  nome           text,
  quantidade     integer not null default 1 check (quantidade > 0),
  horas          numeric(5,2) not null default 0 check (horas >= 0),
  terceirizado   boolean not null default false,
  empresa        text,
  hora_inicio    time,
  hora_fim       time,
  ordem          integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Etapa "Máquinas": equipamentos e horas
create table if not exists public.rdo_maquinas (
  id                        uuid primary key default gen_random_uuid(),
  rdo_id                    uuid not null references public.rdos (id) on delete cascade,
  equipamento               text not null check (length(trim(equipamento)) > 0),
  marca                     text,
  codigo                    text,
  quantidade                integer not null default 1 check (quantidade > 0),
  locado                    boolean not null default false,
  horas_ativas              numeric(5,2) not null default 0 check (horas_ativas >= 0),
  horas_ociosas             numeric(5,2) not null default 0 check (horas_ociosas >= 0),
  justificativa_ociosidade  text,
  hora_inicio               time,
  hora_fim                  time,
  observacoes               text,
  ordem                     integer not null default 0,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint rdo_maquinas_ociosidade_chk
    check (horas_ociosas = 0 or length(trim(coalesce(justificativa_ociosidade, ''))) > 0)
);

-- Etapa "Atividades": tarefas executadas e status
create table if not exists public.rdo_atividades (
  id           uuid primary key default gen_random_uuid(),
  rdo_id       uuid not null references public.rdos (id) on delete cascade,
  descricao    text not null check (length(trim(descricao)) > 0),
  local        text,                                   -- pavimento / trecho
  unidade      text,                                   -- m², m³, un, kg, m
  quantidade   numeric(12,3) check (quantidade >= 0),
  progresso    numeric(5,2) not null default 0 check (progresso between 0 and 100),
  status       public.atividade_status not null default 'em_andamento',
  ordem        integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Etapa "Insumos": materiais e quantidades
create table if not exists public.rdo_insumos (
  id            uuid primary key default gen_random_uuid(),
  rdo_id        uuid not null references public.rdos (id) on delete cascade,
  material      text not null check (length(trim(material)) > 0),
  quantidade    numeric(12,3) check (quantidade >= 0),
  unidade       text,
  fornecedor    text,
  nota_fiscal   text,
  observacoes   text,
  ordem         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Etapa "Fatos": ocorrências / imprevistos
create table if not exists public.rdo_fatos (
  id           uuid primary key default gen_random_uuid(),
  rdo_id       uuid not null references public.rdos (id) on delete cascade,
  tipo         public.fato_tipo not null default 'outro',
  descricao    text not null check (length(trim(descricao)) > 0),
  hora_inicio  time,
  hora_fim     time,
  ordem        integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Etapa "Fotos": metadados das imagens (o binário fica no Storage)
create table if not exists public.rdo_fotos (
  id             uuid primary key default gen_random_uuid(),
  rdo_id         uuid not null references public.rdos (id) on delete cascade,
  storage_path   text not null unique,                 -- ex.: "{rdo_id}/1730740000-abc.jpg"
  legenda        text,
  tirada_em      timestamptz,
  latitude       double precision check (latitude between -90 and 90),
  longitude      double precision check (longitude between -180 and 180),
  precisao_m     double precision,
  endereco       text,
  hash           text,                                 -- integridade (SHA-256)
  mime_type      text,
  tamanho_bytes  bigint check (tamanho_bytes >= 0),
  autor_id       uuid default auth.uid() references public.profiles (id) on delete set null,
  ordem          integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- a foto precisa estar na pasta do próprio RDO
  constraint rdo_fotos_path_chk check (storage_path like rdo_id::text || '/%')
);

-- Índice por rdo_id + trigger de updated_at em todas as filhas
do $$
declare
  t text;
begin
  foreach t in array array['rdo_clima','rdo_efetivo','rdo_maquinas','rdo_atividades','rdo_insumos','rdo_fatos','rdo_fotos']
  loop
    execute format('create index if not exists %I on public.%I (rdo_id)', t || '_rdo_id_idx', t);
    execute format('drop trigger if exists %I on public.%I', t || '_set_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end $$;


-- =============================================================================
-- 7. FUNÇÕES DE AUTORIZAÇÃO (usadas pelo RLS)
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER evita recursão de RLS (ex.: policy de profiles consultando
-- profiles) e mantém as policies curtas e legíveis.
-- =============================================================================
create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'master' and ativo
  );
$$;

-- O usuário logado é operador ativo atribuído a esta obra?
create or replace function public.is_obra_operador(p_obra_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.obra_operadores oo
    join public.profiles p on p.id = oo.operador_id
    where oo.obra_id = p_obra_id
      and oo.operador_id = auth.uid()
      and p.ativo
  );
$$;

-- Pode LER o RDO (e seus filhos/fotos)?
create or replace function public.can_read_rdo(p_rdo_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_master()
      or exists (select 1 from public.rdos r where r.id = p_rdo_id and r.operador_id = auth.uid());
$$;

-- Pode EDITAR o RDO (e seus filhos/fotos)?
-- Operador: só o próprio RDO, em rascunho ou rejeitado, de obra ainda atribuída a ele.
create or replace function public.can_edit_rdo(p_rdo_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_master()
      or exists (
        select 1 from public.rdos r
        where r.id = p_rdo_id
          and r.operador_id = auth.uid()
          and r.status in ('rascunho', 'rejeitado')
          and public.is_obra_operador(r.obra_id)
      );
$$;

-- Extrai o rdo_id da primeira pasta do caminho no Storage (null se inválido).
create or replace function public.rdo_id_from_storage_path(p_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_folder text := split_part(p_name, '/', 1);
begin
  if v_folder ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return v_folder::uuid;
  end if;
  return null;
end;
$$;


-- =============================================================================
-- 5b. REGRAS DE NEGÓCIO EM TRIGGERS (defesa no banco, não só no app)
-- =============================================================================

-- Impede que um operador altere o próprio role/ativo/email via API.
-- (No SQL Editor / service_role, auth.uid() é null e a alteração é liberada.)
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_master() then
    if new.role is distinct from old.role
       or new.ativo is distinct from old.ativo
       or new.email is distinct from old.email then
      raise exception 'Apenas o master pode alterar perfil de acesso, status ou e-mail.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Só usuários com role 'operador' podem ser atribuídos a obras.
create or replace function public.validate_obra_operador()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles where id = new.operador_id and role = 'operador'
  ) then
    raise exception 'O usuário % não é um operador.', new.operador_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists obra_operadores_validate on public.obra_operadores;
create trigger obra_operadores_validate
  before insert or update on public.obra_operadores
  for each row execute function public.validate_obra_operador();

-- Máquina de estados do RDO:
--   rascunho ──enviar──▶ pendente_aprovacao ──aprovar──▶ aprovado
--      ▲                        │
--      └──corrigir── rejeitado ◀┘ (rejeitar, com motivo)
create or replace function public.rdos_workflow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid    := auth.uid();
  v_master boolean := public.is_master();
begin
  if tg_op = 'INSERT' then
    -- Número sequencial por obra, sem corrida entre inserts simultâneos.
    perform pg_advisory_xact_lock(hashtextextended(new.obra_id::text, 0));
    select coalesce(max(r.numero), 0) + 1 into new.numero
    from public.rdos r where r.obra_id = new.obra_id;

    if v_uid is not null and not v_master then
      new.operador_id := v_uid;   -- operador não cria RDO em nome de outro
    end if;

    if new.status not in ('rascunho', 'pendente_aprovacao') then
      raise exception 'Um RDO só pode ser criado como rascunho ou enviado para aprovação.'
        using errcode = 'check_violation';
    end if;

    new.aprovado_por    := null;
    new.aprovado_em     := null;
    new.rejeitado_por   := null;
    new.rejeitado_em    := null;
    new.motivo_rejeicao := null;
    new.enviado_em      := case when new.status = 'pendente_aprovacao' then now() end;
    return new;
  end if;

  -- UPDATE ------------------------------------------------------------------
  if v_uid is null then
    return new;   -- SQL Editor / service_role: manutenção administrativa
  end if;

  if new.obra_id <> old.obra_id or new.operador_id <> old.operador_id or new.numero <> old.numero then
    raise exception 'Obra, operador e número do RDO não podem ser alterados.'
      using errcode = 'check_violation';
  end if;
  new.created_at := old.created_at;

  if not v_master then
    if old.status not in ('rascunho', 'rejeitado') then
      raise exception 'RDO com status "%" não pode mais ser editado pelo operador.', old.status
        using errcode = '42501';
    end if;
    if new.status is distinct from old.status
       and new.status not in ('rascunho', 'pendente_aprovacao') then
      raise exception 'Operador só pode salvar rascunho ou enviar para aprovação.'
        using errcode = '42501';
    end if;
    -- campos de aprovação são exclusivos do master
    new.aprovado_por    := old.aprovado_por;
    new.aprovado_em     := old.aprovado_em;
    new.rejeitado_por   := old.rejeitado_por;
    new.rejeitado_em    := old.rejeitado_em;
    new.motivo_rejeicao := old.motivo_rejeicao;
  elsif new.status is distinct from old.status
        and new.status in ('aprovado', 'rejeitado')
        and old.status <> 'pendente_aprovacao' then
    raise exception 'Só é possível aprovar ou rejeitar RDOs pendentes de aprovação.'
      using errcode = 'check_violation';
  end if;

  if new.status is distinct from old.status then
    case new.status
      when 'pendente_aprovacao' then
        new.enviado_em := now();
      when 'aprovado' then
        new.aprovado_por := v_uid;
        new.aprovado_em  := now();
      when 'rejeitado' then
        if length(trim(coalesce(new.motivo_rejeicao, ''))) = 0 then
          raise exception 'Informe o motivo da rejeição.' using errcode = 'check_violation';
        end if;
        new.rejeitado_por := v_uid;
        new.rejeitado_em  := now();
      else
        null;
    end case;
  end if;

  return new;
end;
$$;

drop trigger if exists rdos_workflow_trg on public.rdos;
create trigger rdos_workflow_trg
  before insert or update on public.rdos
  for each row execute function public.rdos_workflow();


-- =============================================================================
-- 8. ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles        enable row level security;
alter table public.obras           enable row level security;
alter table public.obra_operadores enable row level security;
alter table public.rdos            enable row level security;

-- ---------- profiles ----------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_master() or role = 'master');  -- operador vê quem o aprovou/rejeitou

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_master())
  with check (id = auth.uid() or public.is_master());
-- INSERT: só pelo trigger handle_new_user. DELETE: excluir o usuário no Auth (cascade).

-- ---------- obras ----------
drop policy if exists obras_select on public.obras;
create policy obras_select on public.obras
  for select to authenticated
  using (public.is_master() or public.is_obra_operador(id));

drop policy if exists obras_master_all on public.obras;
create policy obras_master_all on public.obras
  for all to authenticated
  using (public.is_master())
  with check (public.is_master());

-- ---------- obra_operadores ----------
drop policy if exists obra_operadores_select on public.obra_operadores;
create policy obra_operadores_select on public.obra_operadores
  for select to authenticated
  using (public.is_master() or operador_id = auth.uid());

drop policy if exists obra_operadores_master_all on public.obra_operadores;
create policy obra_operadores_master_all on public.obra_operadores
  for all to authenticated
  using (public.is_master())
  with check (public.is_master());

-- ---------- rdos ----------
drop policy if exists rdos_select on public.rdos;
create policy rdos_select on public.rdos
  for select to authenticated
  using (public.is_master() or operador_id = auth.uid());

drop policy if exists rdos_insert on public.rdos;
create policy rdos_insert on public.rdos
  for insert to authenticated
  with check (
    public.is_master()
    or (
      operador_id = auth.uid()
      and public.is_obra_operador(obra_id)
      and exists (select 1 from public.obras o where o.id = rdos.obra_id and o.ativa)
    )
  );

drop policy if exists rdos_update on public.rdos;
create policy rdos_update on public.rdos
  for update to authenticated
  using (
    public.is_master()
    or (operador_id = auth.uid() and status in ('rascunho', 'rejeitado') and public.is_obra_operador(obra_id))
  )
  with check (
    public.is_master()
    or (operador_id = auth.uid() and status in ('rascunho', 'pendente_aprovacao', 'rejeitado'))
  );

drop policy if exists rdos_delete on public.rdos;
create policy rdos_delete on public.rdos
  for delete to authenticated
  using (public.is_master() or (operador_id = auth.uid() and status = 'rascunho'));

-- ---------- tabelas filhas (mesma regra para todas) ----------
do $$
declare
  t text;
begin
  foreach t in array array['rdo_clima','rdo_efetivo','rdo_maquinas','rdo_atividades','rdo_insumos','rdo_fatos','rdo_fotos']
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.can_read_rdo(rdo_id))',
      t || '_select', t);

    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.can_edit_rdo(rdo_id))',
      t || '_insert', t);

    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.can_edit_rdo(rdo_id)) with check (public.can_edit_rdo(rdo_id))',
      t || '_update', t);

    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.can_edit_rdo(rdo_id))',
      t || '_delete', t);
  end loop;
end $$;


-- =============================================================================
-- 9. REALTIME
-- -----------------------------------------------------------------------------
-- O Realtime respeita o RLS: o master recebe todos os RDOs; o operador recebe
-- só os seus e as atribuições de obra feitas a ele.
-- =============================================================================
do $$
declare
  t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  foreach t in array array['rdos', 'obra_operadores', 'obras']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;


-- =============================================================================
-- 10. STORAGE — bucket rdo-fotos
-- -----------------------------------------------------------------------------
-- Bucket PÚBLICO: a leitura pela URL pública (getPublicUrl) não passa por RLS.
-- As policies abaixo controlam upload, substituição, exclusão e listagem.
-- Caminho obrigatório: {rdo_id}/{arquivo}
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rdo-fotos',
  'rdo-fotos',
  true,
  10485760,  -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists rdo_fotos_storage_select on storage.objects;
create policy rdo_fotos_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'rdo-fotos'
    and public.can_read_rdo(public.rdo_id_from_storage_path(name))
  );

drop policy if exists rdo_fotos_storage_insert on storage.objects;
create policy rdo_fotos_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'rdo-fotos'
    and public.can_edit_rdo(public.rdo_id_from_storage_path(name))
  );

drop policy if exists rdo_fotos_storage_update on storage.objects;
create policy rdo_fotos_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'rdo-fotos'
    and public.can_edit_rdo(public.rdo_id_from_storage_path(name))
  )
  with check (
    bucket_id = 'rdo-fotos'
    and public.can_edit_rdo(public.rdo_id_from_storage_path(name))
  );

drop policy if exists rdo_fotos_storage_delete on storage.objects;
create policy rdo_fotos_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'rdo-fotos'
    and public.can_edit_rdo(public.rdo_id_from_storage_path(name))
  );


-- =============================================================================
-- PÓS-INSTALAÇÃO: promover o primeiro master
-- -----------------------------------------------------------------------------
-- 1. Crie o usuário em Authentication > Users (ou cadastre-se pelo app).
-- 2. Rode (trocando o e-mail):
--
--    update public.profiles set role = 'master' where email = 'gestor@suaempresa.com.br';
-- =============================================================================
