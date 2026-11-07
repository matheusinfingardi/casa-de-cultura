# ADR 0002: acesso a dados isolado em lib/services

**Situação:** aceita. A escolha entre Supabase e Postgres próprio é da equipe de back-end.

**Contexto:** o back-end avalia sair do Supabase.

**Decisão:** nenhum componente fala direto com o banco. Tudo passa por `src/lib/services/`. Trocar de back-end significa reescrever só essa pasta.

**Consequências:** as telas não mudam na migração, desde que os dados mantenham o mesmo formato.
