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

### v1.2 a v1.6 e parte da v2.0 ✅ protótipo (esta entrega)
Tudo abaixo funciona no **modo demonstração**. Os itens com 🔗 ainda precisam do back-end para funcionar com dados reais.

- **v1.2 Confiança e qualidade:** testes unitários e de ponta a ponta (rodam no computador; a integração contínua fica desligada e só roda se acionada à mão, para não gerar custo), auditoria de acessibilidade, tema escuro, tamanho de letra e página de status.
- **v1.3 Dia a dia:** check-in por QR Code, lista de espera 🔗, presença sem internet, aplicativo instalável, avisos 🔗, agenda em mês, semana e lista, arquivo de calendário, duplicar itens e apresentação inicial.
- **v1.4 Pessoas:** ficha 🔗, histórico, família 🔗, pedidos de voluntariado 🔗, disponibilidade 🔗, convites 🔗, minha conta e recuperação de senha.
- **v1.5 Gestão:** relatórios com planilha e PDF, metas 🔗, filtro por unidade 🔗 e histórico de ações 🔗.
- **v1.6 LGPD e segurança:** termos, privacidade, consentimento 🔗, baixar e excluir dados 🔗, verificação em duas etapas 🔗, limite de tentativas, dados sensíveis escondidos e cabeçalhos de segurança.
- **v2.0:** certificados com QR Code, fotos nos cadastros 🔗 e comunicados 🔗 (e-mail e WhatsApp simulados).

### v1.7 Cuidado e rotina ✅ protótipo (esta entrega)
- **Pessoas:** página do assistido com necessidades, saúde, condição social, família ligada, assiduidade e acompanhamento 🔗.
- **Voluntário:** compromissos dia a dia, chamada por data com check-in dentro da atividade 🔗, ficha com horários exatos e dados profissionais 🔗, Minhas atividades com página própria e Meus assistidos 🔗.
- **Certificados:** aba própria para gerar de uma atividade ou de um conjunto delas, por presença ou por conjunto de presenças, inclusive para o voluntário 🔗.
- **Calendário:** maior, em largura total, com o quadro do dia embaixo. Na administração, com resumo, filtro por responsável e atalho para a chamada.
- **Dependentes:** cadastro com cuidados e inscrição nas atividades, com chamada e assiduidade próprias 🔗.
- **Acompanhamento individual:** assiduidade clicável com histórico, participação em detalhes, linha do tempo e relatório individual 🔗.
- **Gestão:** Assistidos e Voluntários separados de Usuários; listas em tabela ou cartões; presença só no diário de cada dia.
- **Assistido:** Atividades da Casa com fotos, abas do que participa e do que pode se inscrever; certificado novo.
- **Administração:** quadro por tipo na Visão geral, relatórios com comparação e foto obrigatória 🔗.
- **Mapa** do endereço em cada item, sem custo.

### Fora do escopo do front-end
- **Site público:** responsabilidade da equipe do site.
- **API pública e webhooks:** responsabilidade do back-end.

### Ainda não feito
- Alertas de erro por serviço externo (exige contratar, por exemplo, o Sentry).
- Exportação em `.xlsx` (hoje a planilha sai em CSV).
- Catálogo de componentes (Storybook).

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
