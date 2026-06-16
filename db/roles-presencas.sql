-- ============================================================================
-- Casa de Cultura — Papéis (cliente/responsavel/admin) + presença em atividades
-- Rode no Supabase: Dashboard > SQL Editor > New query > Run.
-- Idempotente (seguro rodar mais de uma vez). Para desfazer: db/rollback.sql
-- ============================================================================

-- 1. Enums ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('cliente', 'responsavel', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'presenca_status') then
    create type public.presenca_status as enum ('marcada', 'presente', 'ausente');
  end if;
end $$;

-- 2. Tabela de perfis (1 linha por usuário em auth.users) ----------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text,
  email      text,
  role       public.user_role not null default 'cliente',
  created_at timestamptz not null default now()
);

-- 3. responsavel_id nas 5 entidades (mantém a coluna 'responsavel' text p/ exibição)
alter table public.atividades  add column if not exists responsavel_id uuid references public.profiles(id);
alter table public.centros     add column if not exists responsavel_id uuid references public.profiles(id);
alter table public.oficinas    add column if not exists responsavel_id uuid references public.profiles(id);
alter table public.assistencia add column if not exists responsavel_id uuid references public.profiles(id);
-- eventos não tinha responsável: adiciona o texto (exibição) e a FK
alter table public.eventos     add column if not exists responsavel    text;
alter table public.eventos     add column if not exists responsavel_id uuid references public.profiles(id);

-- 4. Tabela de presenças (POLIMÓRFICA: serve às 5 entidades) --------------------
-- Muda o shape em relação à versão antiga, então recria do zero.
drop table if exists public.presencas cascade;
create table public.presencas (
  id         uuid primary key default gen_random_uuid(),
  item_tipo  text not null check (item_tipo in ('atividade','evento','oficina','centro','assistencia')),
  item_id    uuid not null,
  item_nome  text,                         -- denormalizado p/ o painel do cliente (sem join cruzado)
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  status     public.presenca_status not null default 'marcada',
  created_at timestamptz not null default now(),
  unique (item_tipo, item_id, cliente_id)
);

-- 5. Helper is_admin() — SECURITY DEFINER evita recursão de RLS ----------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 5b. Helper: o usuário atual é o responsável do item (qualquer um dos 5 tipos)?
create or replace function public.is_responsavel_do_item(p_tipo text, p_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select case p_tipo
    when 'atividade'   then exists (select 1 from public.atividades  where id = p_id and responsavel_id = auth.uid())
    when 'evento'      then exists (select 1 from public.eventos      where id = p_id and responsavel_id = auth.uid())
    when 'oficina'     then exists (select 1 from public.oficinas     where id = p_id and responsavel_id = auth.uid())
    when 'centro'      then exists (select 1 from public.centros      where id = p_id and responsavel_id = auth.uid())
    when 'assistencia' then exists (select 1 from public.assistencia  where id = p_id and responsavel_id = auth.uid())
    else false
  end;
$$;

-- 6. RLS: profiles -------------------------------------------------------------
alter table public.profiles enable row level security;

-- Leitura: qualquer autenticado (admin lista todos; responsável lista clientes;
-- form lista responsáveis). A escrita é que fica travada.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select
  using (auth.uid() is not null);

-- Atualização: somente admin pode alterar papéis.
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- 7. RLS: presencas ------------------------------------------------------------
alter table public.presencas enable row level security;

-- Leitura: o próprio cliente, o admin, ou o responsável do item.
drop policy if exists "presencas_select" on public.presencas;
create policy "presencas_select" on public.presencas
  for select
  using (
    cliente_id = auth.uid()
    or public.is_admin()
    or public.is_responsavel_do_item(item_tipo, item_id)
  );

-- Inserção: admin, responsável do item, OU o próprio cliente (auto-inscrição).
drop policy if exists "presencas_insert" on public.presencas;
create policy "presencas_insert" on public.presencas
  for insert
  with check (
    public.is_admin()
    or public.is_responsavel_do_item(item_tipo, item_id)
    or cliente_id = auth.uid()
  );

drop policy if exists "presencas_update" on public.presencas;
create policy "presencas_update" on public.presencas
  for update
  using (
    public.is_admin()
    or public.is_responsavel_do_item(item_tipo, item_id)
  )
  with check (
    public.is_admin()
    or public.is_responsavel_do_item(item_tipo, item_id)
  );

-- Exclusão: admin, responsável do item, OU o próprio cliente (cancelar inscrição).
drop policy if exists "presencas_delete" on public.presencas;
create policy "presencas_delete" on public.presencas
  for delete
  using (
    public.is_admin()
    or public.is_responsavel_do_item(item_tipo, item_id)
    or cliente_id = auth.uid()
  );

-- 7b. RLS das 5 tabelas de CRUD ------------------------------------------------
-- Leitura aberta (painel do responsável, listagens, páginas públicas);
-- escrita (insert/update/delete) somente admin (o portal de CRUD é admin-only).
do $$
declare
  t text;
begin
  foreach t in array array['atividades','eventos','oficinas','centros','assistencia']
  loop
    execute format('alter table public.%I enable row level security;', t);

    execute format('drop policy if exists %I on public.%I;', t || '_select_all', t);
    execute format(
      'create policy %I on public.%I for select using (true);',
      t || '_select_all', t
    );

    execute format('drop policy if exists %I on public.%I;', t || '_admin_write', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin());',
      t || '_admin_write', t
    );
  end loop;
end $$;

-- 8. Trigger: cria o perfil automaticamente no cadastro ------------------------
-- Default = 'cliente'. Honra role = 'admin' vindo do user_metadata (usado pela
-- rota aberta /admin-signup). 'responsavel' NÃO é honrado aqui — só por promoção.
-- ⚠️ TODO segurança: o signup é público, então é possível forjar role='admin'.
-- Intencional por enquanto (cadastro de admin fácil). Travar depois (Edge Function
-- com service_role, ou remover o honra-role abaixo).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'nome',
    new.email,
    case when new.raw_user_meta_data->>'role' = 'admin'
         then 'admin'::public.user_role
         else 'cliente'::public.user_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 9. Backfill: perfis para usuários que já existiam antes do trigger -----------
insert into public.profiles (id, nome, email, role)
select id, raw_user_meta_data->>'nome', email, 'cliente'
from auth.users
on conflict (id) do nothing;


