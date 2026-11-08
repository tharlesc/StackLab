-- =============================================================================
-- Migração: Adiciona suporte ao papel 'client' no enum user_role
-- -----------------------------------------------------------------------------
-- Execute este script no SQL Editor do Supabase se desejar que a coluna 'role'
-- da tabela public.profiles armazene nativamente o valor 'client'.
-- =============================================================================

alter type public.user_role add value if not exists 'client';
