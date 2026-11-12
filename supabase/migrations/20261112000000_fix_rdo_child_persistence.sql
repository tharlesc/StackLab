-- =============================================================================
-- Migration: Corrigir persistência de dados filhos do RDO durante submissão
-- -----------------------------------------------------------------------------
-- Permite que o operador insira registros filhos nas tabelas do RDO (clima,
-- efetivo, máquinas, atividades, fatos, fotos) tanto em rascunho quanto durante
-- o ciclo de envio para aprovação.
-- =============================================================================

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
          and (
            r.status in ('rascunho', 'rejeitado')
            or (r.status = 'pendente_aprovacao' and r.enviado_em >= now() - interval '10 minutes')
          )
          and public.is_obra_operador(r.obra_id)
      );
$$;
