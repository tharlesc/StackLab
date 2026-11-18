-- Adiciona coluna url na tabela rdo_fotos para suportar renderizacao direta de fotos no web/mobile e aprovacao do master
alter table public.rdo_fotos add column if not exists url text;
