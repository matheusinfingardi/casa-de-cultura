# Roadmap de Experiência do Usuário — Front-end

> Escopo: **somente front-end** (`front-end/`). Nada aqui exige mudança no banco ou em back-end.
> Itens que dependem do restante da equipe estão marcados com 🔗 e listados também em *Atualizações → Integrações* no portal.

## Diagnóstico (estado em 07/11/2026)

| # | Problema encontrado | Impacto |
|---|---|---|
| 1 | A landing só oferece "Entrar" e "Criar Conta" — não diz **quem** deve usar o quê | Voluntário e assistido se confundem; a tela de login diz "Portal Administrativo" para todo mundo |
| 2 | Um único login para 3 públicos; o redirecionamento por perfil só acontece depois de entrar | Sem contexto, sem mensagem personalizada |
| 3 | `/painel` serve assistido e voluntário na mesma tela de cabeçalho simples, sem navegação | Pouca orientação; nenhum resumo ("o que tenho hoje?") |
| 4 | Sidebar do admin tem link para `/portal/settings`, que **não existe** (404) | Quebra de confiança |
| 5 | Dashboard do admin usa dados fictícios (MOCK) e calendário sem lista do dia | Não serve para decisão |
| 6 | Telas CRUD repetem padrão, mas sem busca, filtros ou estados vazios amigáveis | Lista longa fica difícil de usar |
| 7 | Mensagens de sucesso/erro misturadas (texto com "✅" na tela, toasts em outros lugares) | Inconsistência |
| 8 | Sem títulos de página dinâmicos / `loading.tsx` / página 404 própria | Sensação de app inacabado |
| 9 | Acessibilidade: botões só com ícone/emoji (◀ ▶), formulários sem `autocomplete`/Enter para enviar | Uso por teclado e leitor de tela prejudicado |
| 10 | Usuários não sabem o que mudou no sistema nem o que depende de outras equipes | Dúvidas repetidas para a equipe |

## Princípios

1. **Cada pessoa vê só o que é dela.** Três portas de entrada, três experiências.
2. **Linguagem simples.** "Assistido", "Voluntário", "Administração" — nada de "cliente" ou "responsável" na tela.
3. **Primeiro o que importa hoje.** Cada painel abre com um resumo, não com uma lista crua.
4. **Mesmo visual, mesmos componentes.** Reaproveitar `components/ui` e padrões já existentes.
5. **Celular primeiro.** Assistidos e voluntários usam o celular na maior parte do tempo.

## Fases

### Fase 1 — Porta de entrada ✅ (esta entrega)
- [x] Landing com 3 portas: **Sou assistido · Sou voluntário · Administração**
- [x] Tela de login personalizada por perfil (`/auth?perfil=assistido|voluntario|admin`)
- [x] Aviso amigável quando a pessoa entra pelo perfil errado (ela é levada ao painel correto)
- [x] Cadastro disponível só para assistidos
- [x] Nova área **Atualizações** (Changelog + Integrações) no portal da administração
- [x] Remoção do link quebrado `/portal/settings` da sidebar

### Fase 2 — Painel do Assistido ✅ (esta entrega)
- [x] Cabeçalho com navegação (Início · Minhas inscrições · Explorar)
- [x] Resumo na abertura (próximas inscrições, presenças, quantidade disponível)
- [x] Explorar com filtro por tipo e busca
- [x] Cards com ação clara ("Inscrever-me" / "Cancelar") e confirmação sem `window.confirm`
- [x] Estados vazios e carregamento com *skeleton*

### Fase 3 — Portal do Voluntário (decisão: ver abaixo) ✅ base
- [x] Rótulo "Voluntário" na interface (o papel técnico continua `responsavel`)
- [x] Visão própria: "Meus compromissos" com atalho direto para registrar presença
- [ ] Lista de inscritos com busca e marcação rápida (hoje: página `painel/presenca`) — melhoria visual

### Fase 4 — Administração (próxima)
- [ ] Dashboard com dados reais (🔗 depende de consultas agregadas / views no Supabase)
- [ ] Busca, filtro e ordenação nas tabelas CRUD (`crud-table.tsx` serve às 5 telas — uma mudança, cinco ganhos)
- [ ] Sidebar reorganizada: *Visão geral · Programação (Eventos, Atividades, Oficinas) · Atendimento (Assistência, Centros) · Pessoas (Usuários) · Sistema (Atualizações)*
- [ ] Breadcrumbs e título dinâmico nas páginas de edição
- [ ] Confirmações de exclusão com diálogo próprio

### Fase 5 — Qualidade transversal
- [ ] `not-found.tsx`, `error.tsx` e `loading.tsx` globais
- [ ] Padronizar mensagens: só *toasts* (remover "✅" em texto)
- [ ] Acessibilidade: `aria-label` em botões de ícone, foco visível, `autocomplete` e Enter nos formulários
- [ ] Recuperação de senha ("Esqueci minha senha") 🔗 requer ajuste no Supabase Auth
- [ ] Revisão de contraste e tamanho de fonte no celular
- [ ] Mover `/admin-signup` para trás de convite 🔗 (hoje é rota aberta — ver TODO em `lib/services/auth.ts`)

## Decisão: portal dos voluntários

**Recomendação: mesmo aplicativo, mesmo login, portal separado por perfil** (não um sistema novo e não a tela do admin com menos botões).

| Opção | Prós | Contras |
|---|---|---|
| Sistema totalmente novo | Isolamento total | Dobra manutenção, deploy e login; sem equipe para isso |
| Compartilhar o portal do admin | Menos telas | Menu e linguagem pensados para gestão; risco de exibir algo indevido; mobile ruim |
| **Mesmo app, área própria por perfil** ✅ | Um login, um deploy, componentes reutilizados; interface enxuta e em linguagem de voluntário; permissões reais continuam no Supabase (RLS) | Precisa manter 3 layouts |

Estrutura de rotas:

```
/                 landing (3 portas)
/auth             login/cadastro, personalizado por ?perfil=
/portal/**        Administração  (role = admin)
/painel/**        Voluntário (role = responsavel) e Assistido (role = cliente)
```

> Importante: esconder telas no front-end é conforto, **não segurança**. A proteção real está nas políticas RLS do Supabase (`db/roles-presencas.sql`).

## Dúvidas que precisam de resposta da equipe 🔗
1. "Assistido" será o mesmo que o papel `cliente` ou existirá um **cadastro próprio** (CPF, família, necessidades)? Hoje o front usa `cliente`.
2. Voluntário poderá **criar** atividades ou só gerenciar presença das que lhe foram atribuídas?
3. O voluntário se cadastra sozinho (com aprovação do admin) ou é sempre criado pelo admin?
