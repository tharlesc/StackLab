-- =============================================================================
-- StackLab — Migração: Funções RPC para Criação e Gestão de Usuários Clientes
-- -----------------------------------------------------------------------------
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em RUN.
-- Ele habilita a criação direta de usuários com confirmação instantânea de e-mail,
-- contornando limites de taxa de SMTP/e-mail do Supabase no ambiente de desenvolvimento/produção.
-- =============================================================================

-- 1. Garante que a extensão pgcrypto está ativa no schema extensions
create extension if not exists "pgcrypto" with schema extensions;

-- 2. Garante o papel 'client' no enum de perfis caso ainda não exista
do $$ begin
  alter type public.user_role add value if not exists 'client';
exception when others then null; end $$;

-- 3. Garante colunas de status e primeiro acesso em public.profiles
alter table public.profiles
  add column if not exists is_online boolean not null default false,
  add column if not exists last_sync_at timestamptz default now(),
  add column if not exists is_first_access boolean not null default true,
  add column if not exists temp_password text default null;

create index if not exists profiles_is_online_idx on public.profiles (is_online);

-- 4. Função RPC: public.create_client_user
-- Cria ou atualiza o usuário diretamente em auth.users com email_confirmed_at = now()
-- evitando envio de e-mails via SMTP do Supabase e eliminando o erro de rate limit.
create or replace function public.create_client_user(
  p_email text,
  p_password text,
  p_name text,
  p_role text default 'client',
  p_cargo text default 'Cliente / Fiscal',
  p_obra_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid;
  v_encrypted_pw text;
  v_clean_email text;
  v_obra_uuid uuid;
  v_existing_id uuid;
begin
  v_clean_email := lower(trim(p_email));
  v_encrypted_pw := extensions.crypt(p_password, extensions.gen_salt('bf'));

  -- Verifica se o usuário já existe em auth.users
  select id into v_existing_id from auth.users where email = v_clean_email limit 1;

  if v_existing_id is not null then
    v_user_id := v_existing_id;
    -- Atualiza a senha e confirma o email
    update auth.users
    set encrypted_password = v_encrypted_pw,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = raw_user_meta_data || jsonb_build_object('name', p_name, 'role', p_role, 'cargo', p_cargo),
        updated_at = now()
    where id = v_user_id;
  else
    v_user_id := gen_random_uuid();

    -- Cria o registro em auth.users com confirmação imediata
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_clean_email,
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', p_name, 'role', p_role, 'cargo', p_cargo),
      now(),
      now(),
      '',
      ''
    );

    -- Cria o registro em auth.identities para o Supabase GoTrue permitir login com senha
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_clean_email),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    )
    on conflict (provider, provider_id) do update set
      last_sign_in_at = now(),
      updated_at = now();
  end if;

  -- Upsert em public.profiles
  insert into public.profiles (
    id,
    nome,
    email,
    cargo,
    role,
    ativo,
    is_online,
    last_sync_at,
    is_first_access,
    temp_password,
    created_at,
    updated_at
  ) values (
    v_user_id,
    p_name,
    v_clean_email,
    p_cargo,
    case when p_role = 'master' then 'master'::public.user_role else 'operador'::public.user_role end,
    true,
    false,
    now(),
    true,
    p_password,
    now(),
    now()
  )
  on conflict (id) do update set
    nome = excluded.nome,
    email = excluded.email,
    cargo = excluded.cargo,
    is_first_access = true,
    temp_password = excluded.temp_password,
    updated_at = now();

  -- Vincula o usuário à obra na tabela obra_operadores se o ID for válido
  if p_obra_id is not null and p_obra_id <> '' then
    begin
      v_obra_uuid := p_obra_id::uuid;
      insert into public.obra_operadores (obra_id, operador_id)
      values (v_obra_uuid, v_user_id)
      on conflict do nothing;
    exception when others then
      -- Se p_obra_id não for UUID válido no banco, continua sem travar
      null;
    end;
  end if;

  return jsonb_build_object(
    'id', v_user_id,
    'email', v_clean_email,
    'name', p_name,
    'role', p_cargo,
    'profile', p_role,
    'tempPassword', p_password,
    'isFirstAccess', true
  );
end;
$$;

-- 5. Função RPC: public.reset_client_password
-- Atualiza a senha no auth.users e define is_first_access = true no perfil
create or replace function public.reset_client_password(
  p_user_id uuid,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_encrypted_pw text;
begin
  v_encrypted_pw := extensions.crypt(p_new_password, extensions.gen_salt('bf'));

  update auth.users
  set encrypted_password = v_encrypted_pw,
      updated_at = now()
  where id = p_user_id;

  update public.profiles
  set is_first_access = true,
      temp_password = p_new_password,
      updated_at = now()
  where id = p_user_id;

  return true;
end;
$$;

-- 6. Concede permissão de execução das RPCs para as roles anon, authenticated e service_role
grant execute on function public.create_client_user(text, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.reset_client_password(uuid, text) to anon, authenticated, service_role;
