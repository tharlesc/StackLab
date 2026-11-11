-- =============================================================================
-- StackLab — Migração: Disponibilização Automática de RDO para o Cliente da Obra
-- -----------------------------------------------------------------------------
-- Regra de Negócio:
--   Quando o Master aprovar e assinar o RDO, ele se torna imutável e é disponibilizado
--   automaticamente para o usuário cliente vinculado à obra.
--
-- Conteúdo:
--   1. Permite vinculação de perfis 'client' na tabela obra_operadores.
--   2. Adiciona coluna assinatura_hash em public.rdos para registro do hash do Master.
--   3. Atualiza função can_read_rdo() para conceder leitura do RDO e suas tabelas
--      filhas ao cliente vinculado à obra exclusivamente quando status = 'aprovado'.
--   4. Atualiza política RLS rdos_select para disponibilizar RDOs aprovados para o cliente.
--   5. Garante publicação em Realtime para notificação e atualização instantânea.
-- =============================================================================

-- 1. Permite vinculação de clientes a obras
create or replace function public.validate_obra_operador()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = new.operador_id and role in ('operador', 'client')
  ) then
    raise exception 'O usuário % não possui perfil válido para vinculação à obra.', new.operador_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- 2. Coluna para persistir o hash da assinatura do Master
alter table public.rdos
  add column if not exists assinatura_hash text;

-- 3. Atualiza can_read_rdo (usado pelas tabelas filhas e Storage)
create or replace function public.can_read_rdo(p_rdo_id uuid)
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
          and (
            r.operador_id = auth.uid()
            or (
              r.status = 'aprovado'
              and exists (
                select 1 from public.obra_operadores oo
                where oo.obra_id = r.obra_id
                  and oo.operador_id = auth.uid()
              )
            )
          )
      );
$$;

-- 4. Atualiza política RLS para consulta da tabela rdos
drop policy if exists rdos_select on public.rdos;
create policy rdos_select on public.rdos
  for select to authenticated
  using (
    public.is_master()
    or operador_id = auth.uid()
    or (
      status = 'aprovado'
      and exists (
        select 1 from public.obra_operadores oo
        where oo.obra_id = rdos.obra_id
          and oo.operador_id = auth.uid()
      )
    )
  );

-- 5. Configuração Realtime
alter table public.rdos replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.rdos;
exception when others then
  null;
end $$;
