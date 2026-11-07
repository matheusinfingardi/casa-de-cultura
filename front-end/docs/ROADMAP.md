# Roadmap do Front-end — Casa de Cultura Evailton Vilela

> Escopo: aplicação web (`front-end/`). Itens marcados com 🔗 dependem do back-end/banco.
> Legenda: ✅ entregue · 🚧 em andamento · 📅 planejado · 💡 ideia a validar

## Visão do produto

Ser o **sistema único** da Casa de Cultura: a pessoa assistida encontra e acompanha o que participa; o voluntário registra presença em segundos, pelo celular; a administração enxerga a operação inteira e decide com dados.

Três portais, um só aplicativo, um só login:

| Portal | Quem usa | Promessa |
|---|---|---|
| **Assistido** | Famílias e participantes | "Encontro, me inscrevo e acompanho em poucos toques" |
| **Voluntário** | Quem conduz atividades | "Registro a presença sem papel e sem complicação" |
| **Administração** | Coordenação | "Vejo tudo, resolvo pendências e presto contas" |

## Indicadores de sucesso (como saberemos que melhorou)

| Indicador | Meta |
|---|---|
| Tempo para uma pessoa nova se inscrever numa oficina | menos de 2 minutos |
| Tempo para o voluntário registrar a presença de uma turma de 20 | menos de 1 minuto |
| Tempo para a administração cadastrar uma atividade semanal | menos de 2 minutos |
| Chamados ao suporte por "não sei como fazer" | cair mais de 50% após os guias e a Ajuda |
| Acessibilidade (Lighthouse / axe) | nota ≥ 95 / zero violações críticas |
| Desempenho no celular (Lighthouse, 4G) | ≥ 90 |
| Cobertura de testes de fluxos críticos | 100% dos fluxos de cadastro, inscrição e presença |

---

## Versões

### v1.0 — Fundação ✅
- Landing, login/cadastro, portal administrativo com CRUD de eventos, atividades, oficinas, centros e assistência.
- Perfis de acesso (administrador, responsável, cliente) e inscrição/presença.

### v1.0.1 — Três portas ✅
- Landing com 3 portas (assistido, voluntário, administração) e login personalizado por perfil.
- Painel do assistido (Início, Minhas inscrições, Explorar com busca e filtros).
- Área **Atualizações** (Changelog + Integrações) para toda a equipe.

### v1.1 — Formulários, Visão geral e Ajuda ✅ (esta entrega)
- **Formulários refeitos** (5 entidades): seções, validação por campo, máscara de telefone, horários consistentes, aviso de alterações não salvas.
- **Listas refeitas**: busca, filtros, ordenação, confirmação de exclusão, estados vazios, inscritos/vagas.
- **Visão geral nova**: calendário real, agenda do dia, indicadores, situação das inscrições, vagas das oficinas e alertas de pendência.
- **Ajuda** por perfil + **Suporte Técnico** com relatório automático.
- **Gestão de presença** unificada (admin e voluntário), com marcação rápida e adição de pessoas.
- Usuários com busca, filtros e confirmação ao alterar administradores.
- Menu reorganizado, páginas 404/erro/carregando, camada de serviços isolada (pronta para trocar de back-end).
- Correções: atividade semanal gravava só um dia; formatos de recorrência divergentes; campos que nunca eram salvos.

### v1.2 — Confiança e qualidade 📅
Objetivo: tornar o que existe **robusto e verificável**.
- Testes automatizados: unitários (Vitest + Testing Library) para validação, agenda e hooks; end-to-end (Playwright) para cadastro, inscrição e presença.
- Integração contínua (GitHub Actions): lint, tipagem, testes e build a cada Pull Request; deploy de prévia por PR na Vercel.
- Monitoramento de erros (Sentry ou similar) e página de status do app.
- Auditoria de acessibilidade (axe + leitor de tela) e correções (foco, contraste, ordem de tabulação, anúncios `aria-live`).
- Orçamento de desempenho (Lighthouse CI): imagens otimizadas com `next/image`, divisão de código e *skeleton* em todas as telas.
- Tema claro/escuro e ajuste de tamanho de fonte.
- Decisão registrada (ADR) sobre estratégia de dados: Supabase × Postgres próprio 🔗.

### v1.3 — Operação do dia a dia 📅
Objetivo: **menos trabalho manual** para voluntários e administração.
- **Check-in por QR Code**: o voluntário abre a câmera e lê o código do assistido (ou o assistido lê o QR da atividade) 🔗.
- **Controle de vagas**: oficina lotada bloqueia nova inscrição e abre **lista de espera** com promoção automática 🔗.
- **Presença em lote offline**: o voluntário marca sem internet e o app sincroniza depois (PWA + fila local).
- **Aplicativo instalável (PWA)**: ícone na tela inicial, abre em tela cheia, carrega mais rápido.
- **Notificações dentro do app** (sino) para: inscrição confirmada, atividade alterada, vaga liberada 🔗.
- Duplicar atividade/oficina ("copiar para o próximo semestre").
- Calendário com visões **semana** e **lista**, e exportação `.ics` (Google/Outlook/iPhone).
- Tour guiado no primeiro acesso de cada perfil.

### v1.4 — Pessoas e atendimento 📅
Objetivo: conhecer melhor quem é atendido, com cuidado e segurança.
- **Ficha do assistido**: dados de contato, responsável legal, dependentes, necessidades, observações 🔗.
- **Histórico de atendimentos** por pessoa (assistências recebidas, oficinas, presenças).
- **Núcleo familiar**: um responsável gerencia inscrições dos filhos pela mesma conta 🔗.
- **Cadastro de voluntários** com disponibilidade e aprovação pela administração 🔗.
- **Convites**: a administração convida voluntários e novos administradores por e-mail (substitui a rota aberta `/admin-signup`) 🔗.
- Perfil do usuário: editar nome, telefone, senha; **"Esqueci minha senha"** 🔗.

### v1.5 — Relatórios e gestão 📅
Objetivo: **prestar contas e decidir com dados**.
- **Relatórios** com filtros (período, centro, tipo): frequência por turma, evasão, ocupação de vagas, público atendido.
- **Exportação** em PDF e planilha (CSV/XLSX) para prestação de contas a financiadores.
- **Metas** por trimestre (ex.: 200 atendimentos) com acompanhamento no painel.
- Gráficos de tendência na Visão geral (comparar mês a mês).
- **Filtro por centro** em todo o portal (visão por unidade).
- Trilha de auditoria: quem criou/alterou/excluiu o quê 🔗.

### v1.6 — LGPD e segurança 📅
- Termos de uso e política de privacidade; **consentimento** registrado no cadastro 🔗.
- "**Meus dados**": o usuário baixa ou pede a exclusão da própria conta 🔗.
- Autenticação em dois fatores para administradores 🔗.
- Proteção contra abuso (limite de tentativas, *captcha* no cadastro) 🔗.
- Mascaramento de dados sensíveis nas telas e nos relatórios conforme o perfil.
- Revisão de segurança do front (cabeçalhos CSP, dependências, segredos).

### v2.0 — Plataforma e comunidade 💡
- **Site público** da Casa de Cultura: agenda pública, página de cada evento, notícias, doações e "seja voluntário".
- **Integrações de comunicação**: lembretes por e-mail e WhatsApp 🔗.
- **Imagens e documentos**: fotos de eventos e oficinas, anexos em atendimentos (armazenamento de arquivos) 🔗.
- **Certificados** de participação em PDF com verificação por QR.
- **API pública/OpenAPI** e *webhooks* para parceiros 🔗.
- Multi-unidade completo (várias Casas de Cultura na mesma plataforma).

---

## Trilhas permanentes (acompanham todas as versões)

| Trilha | O que significa |
|---|---|
| **Design system** | Componentes documentados (Storybook), tokens de cor/espaçamento, padrões de formulário e tabela. |
| **Acessibilidade** | WCAG 2.2 AA como critério de aceite em toda tela nova. |
| **Qualidade** | Nenhuma tela entra sem estado vazio, carregando, erro e versão para celular. |
| **Documentação** | Guias por portal, changelog em linguagem simples e comunicados para a equipe a cada entrega. |
| **Dados** | Todo campo coletado precisa ser salvo, usado e justificado (sem "campo que vai para o nada"). |

## Dependências com o back-end 🔗 (resumo)

| Necessidade | Habilita | Versão |
|---|---|---|
| Recuperação de senha e e-mail transacional | Perfil, convites, lembretes | 1.4 |
| Contagem/agregações no servidor (`/dashboard/resumo`) | Visão geral mais rápida, relatórios | 1.5 |
| Regra de vagas e lista de espera | Controle de vagas | 1.3 |
| Cadastro de assistido, famílias e dependentes | Ficha e núcleo familiar | 1.4 |
| Armazenamento de arquivos | Fotos, anexos, certificados | 2.0 |
| Auditoria e consentimento | LGPD e prestação de contas | 1.5 / 1.6 |
| Contrato de API estável (OpenAPI) | Migração de back-end sem retrabalho no front | 1.2 |

## Decisões em aberto
1. "Assistido" é o papel `cliente` ou haverá **cadastro próprio** (CPF, família, necessidades)?
2. O voluntário poderá **criar** atividades ou apenas registrar presença do que lhe foi atribuído?
3. O voluntário se cadastra sozinho (com aprovação) ou é sempre criado pela administração?
4. Quais canais de aviso serão usados (e-mail, WhatsApp, ambos)?
5. Quais indicadores os financiadores exigem nos relatórios?
