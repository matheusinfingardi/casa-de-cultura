-- ============================================================================
-- Casa de Cultura — Fecha a criação de administradores pelo cadastro (v1.7.1)
--
-- QUANDO RODAR
--   * Uma vez, no banco que já está no ar, assim que a v1.7.1 for publicada:
--     Supabase > Dashboard > SQL Editor > New query > cole o arquivo > Run.
--   * Rodar de novo não faz mal: só reescreve a mesma função.
--   * Em banco novo não é preciso: o db/roles-presencas.sql já vem com esta versão.
--
-- Seguro: só troca a função do gatilho de cadastro. Não apaga nem altera dados.
-- ATENÇÃO: não rode o db/roles-presencas.sql inteiro de novo no banco que já está
-- no ar: ele recria a tabela de presenças (drop table) e apagaria as presenças.
-- Para desfazer esta mudança, veja a seção 4, no fim do arquivo.
-- ============================================================================

-- 1. Todo cadastro novo nasce como 'cliente', mesmo que alguém envie role='admin'
--    nos dados do cadastro. Antes, a página /admin-signup usava isso para criar
--    administradores. Agora o papel só muda pelo portal, em Suporte > Usuários,
--    feito por um administrador (policy profiles_update_admin).
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
    'cliente'::public.user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Banco sem nenhum administrador? Tire os dois traços do início da linha abaixo,
--    troque o e-mail e rode de novo. Os próximos são promovidos pelo portal.
-- update public.profiles set role = 'admin' where email = 'pessoa@exemplo.com';

-- 3. Conferência (só leitura): quem é administrador hoje. A página /admin-signup
--    ficou aberta até a v1.7.0, então confira se todos desta lista devem mesmo ser
--    administradores. Quem não deveria, rebaixe pelo portal (Suporte > Usuários).
select nome, email, created_at
from public.profiles
where role = 'admin'
order by created_at;

-- 4. PARA DESFAZER (só se for realmente necessário) ----------------------------
--    Volta o gatilho ao comportamento anterior à v1.7.1: o cadastro passa de novo a
--    aceitar role='admin' enviado pelo navegador.
--    ⚠️ Isso REABRE a brecha: qualquer pessoa volta a conseguir se cadastrar como
--    administrador. E não rebaixa ninguém que tenha sido promovido nesse meio-tempo.
--    Como usar: copie só o bloco abaixo para uma nova query, tire os "-- " do início
--    de cada linha e rode. Para fechar de novo, rode as seções 1 a 3 deste arquivo.
--
-- create or replace function public.handle_new_user()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path = public
-- as $$
-- begin
--   insert into public.profiles (id, nome, email, role)
--   values (
--     new.id,
--     new.raw_user_meta_data->>'nome',
--     new.email,
--     case when new.raw_user_meta_data->>'role' = 'admin'
--          then 'admin'::public.user_role
--          else 'cliente'::public.user_role end
--   )
--   on conflict (id) do nothing;
--   return new;
-- end;
-- $$;
