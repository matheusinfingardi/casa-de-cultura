-- ============================================================================
-- Casa de Cultura — Reverter TODAS as alterações de roles-presencas.sql
-- Rode no Supabase: Dashboard > SQL Editor > New query > Run.
-- Idempotente (if exists). NÃO altera auth.users — nenhum cadastro é perdido.
-- Ordem: remover as TABELAS antes das FUNÇÕES (as policies dependem de is_admin()).
-- ============================================================================

-- 1. Remover o trigger de signup (para de criar perfis automaticamente)
drop trigger if exists on_auth_user_created on auth.users;

-- 2. Remover a tabela de presenças (suas policies somem junto)
drop table if exists public.presencas;

-- 2b. Remover as policies de RLS das 5 tabelas de CRUD e DESLIGAR a RLS
--     (no estado original essas tabelas não tinham RLS).
do $$
declare
  t text;
begin
  foreach t in array array['atividades','eventos','oficinas','centros','assistencia']
  loop
    execute format('drop policy if exists %I on public.%I;', t || '_select_all', t);
    execute format('drop policy if exists %I on public.%I;', t || '_admin_write', t);
    execute format('alter table public.%I disable row level security;', t);
  end loop;
end $$;

-- 3. Remover as colunas de responsável adicionadas nas 5 entidades
alter table public.atividades  drop column if exists responsavel_id;
alter table public.centros     drop column if exists responsavel_id;
alter table public.oficinas    drop column if exists responsavel_id;
alter table public.assistencia drop column if exists responsavel_id;
alter table public.eventos     drop column if exists responsavel_id;
alter table public.eventos     drop column if exists responsavel;

-- 4. Remover a tabela de perfis (suas policies somem junto)
drop table if exists public.profiles;

-- 5. Remover as funções (agora nenhuma policy depende delas).
--    CASCADE é uma rede de segurança caso ainda reste alguma dependência.
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_responsavel_do_item(text, uuid) cascade;
drop function if exists public.is_admin() cascade;

-- 6. Remover os enums (só depois que as tabelas que os usavam sumiram)
drop type if exists public.presenca_status;
drop type if exists public.user_role;

-- Pronto: o banco volta exatamente ao estado anterior (5 tabelas de CRUD
-- originais, atividades sem responsavel_id). As policies somem junto com as tabelas.
