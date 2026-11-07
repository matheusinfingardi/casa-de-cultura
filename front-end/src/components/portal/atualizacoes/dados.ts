// Conteúdo da área "Atualizações". Para publicar uma novidade, basta
// acrescentar um item NO TOPO de CHANGELOG (linguagem simples, sem termos técnicos).

export type Novidade = {
  versao: string
  data: string // AAAA-MM-DD
  titulo: string
  itens: string[]
}

export const CHANGELOG: Novidade[] = [
  {
    versao: "1.6.0",
    data: "2026-11-07",
    titulo: "Protótipo completo com demonstração",
    itens: [
      "Agora dá para conhecer os três portais sem senha, com dados de exemplo, pela página inicial.",
      "Contas de teste no login: admin@admin.com, voluntario@voluntario.com e assistido@assistido.com (senha 12345678).",
      "Visão geral mais simples: o que acontece hoje, a semana e o que precisa de atenção.",
      "Nova Agenda com visão de mês, semana e lista, e arquivo para o calendário do celular.",
      "Cada evento, atividade, oficina, assistência e centro tem sua própria página.",
      "Usuários organizados por grupo, com ficha da pessoa, pedidos de voluntariado e convites.",
      "Ajuda e Atualizações mais largas e mais fáceis de ler; letras maiores em todo o sistema.",
      "Lista de espera: quando abre vaga, a primeira pessoa entra sozinha e recebe um aviso.",
      "Check-in por QR Code e presença que funciona sem internet.",
      "Relatórios com planilha e PDF, metas, histórico de ações e comunicados.",
      "Família, certificados, disponibilidade do voluntário e sino de avisos.",
      "Tema escuro, tamanho das letras e aplicativo instalável no celular.",
      "Termos de uso, privacidade, baixar ou excluir meus dados e verificação em duas etapas.",
    ],
  },
  {
    versao: "1.1.0",
    data: "2026-11-07",
    titulo: "Formulários novos, Visão geral, Ajuda e Suporte Técnico",
    itens: [
      "Formulários de eventos, atividades, oficinas, centros e assistência refeitos: mais simples, em seções, com avisos claros quando falta algo.",
      "Atividades semanais agora gravam todos os dias escolhidos (antes só um dia era salvo).",
      "Listas com busca, filtros, ordenação e confirmação antes de excluir.",
      "Visão geral nova: calendário de verdade, agenda do dia, indicadores e alertas do que precisa de atenção.",
      "Oficinas mostram quantas vagas já foram preenchidas e avisam quando lotam.",
      "Botão “Inscritos” em cada item para marcar presença e adicionar ou remover pessoas.",
      "Usuários com busca e filtro por papel; dar ou tirar administrador pede confirmação.",
      "Nova página Ajuda, com perguntas frequentes e o botão Falar com o Suporte Técnico (abre um e-mail pronto para o T.I.).",
      "Menu reorganizado por área: Programação, Atendimento, Pessoas e Suporte.",
      "Telas de “página não encontrada” e de erro mais amigáveis.",
    ],
  },
  {
    versao: "1.0.1",
    data: "2026-11-07",
    titulo: "Três portas de entrada e novo painel do assistido",
    itens: [
      "A página inicial agora pergunta como a pessoa quer entrar: assistido, voluntário ou administração.",
      "A tela de login mostra uma mensagem própria para cada tipo de acesso.",
      "Quem entrar pela porta errada é levado automaticamente para a área certa.",
      "Novo painel do assistido, com Início, Minhas inscrições e Explorar (com busca e filtro por tipo).",
      "Cancelar uma inscrição agora pede uma confirmação clara.",
      "Voluntários passam a ver o painel com seus compromissos e um atalho para registrar presença.",
      "Os nomes na tela ficaram mais simples: “Assistido” e “Voluntário”.",
      "Nova área Atualizações, onde você está agora.",
      "Removido um item de menu (Configurações) que levava a uma página inexistente.",
    ],
  },
  {
    versao: "1.0.0",
    data: "2026-06-16",
    titulo: "Login e painel para quem participa",
    itens: [
      "Agora é possível criar conta e entrar com e-mail e senha.",
      "Cada pessoa tem um tipo de acesso: administrador, responsável ou participante.",
      "Participantes podem se inscrever em atividades, eventos, oficinas, centros e assistências.",
      "Responsáveis conseguem registrar quem esteve presente.",
      "A administração ganhou a lista de usuários, com troca de tipo de acesso.",
    ],
  },
  {
    versao: "0.9.0",
    data: "2026-06-15",
    titulo: "Cadastro de Assistência",
    itens: ["Criar, editar, consultar e excluir atendimentos de assistência."],
  },
  {
    versao: "0.8.0",
    data: "2026-06-14",
    titulo: "Atividades e Eventos",
    itens: [
      "Cadastro completo de atividades, com repetição semanal e responsável.",
      "Edição de eventos concluída.",
    ],
  },
  {
    versao: "0.7.0",
    data: "2026-06-09",
    titulo: "Centros e Oficinas",
    itens: [
      "Cadastro completo de centros (criar, editar e excluir).",
      "Cadastro e listagem de oficinas.",
      "Os dados passaram a ser guardados de forma permanente, não mais apenas na tela.",
    ],
  },
  {
    versao: "0.6.0",
    data: "2026-05-29",
    titulo: "Uso no celular",
    itens: ["O portal passou a se ajustar a telas pequenas, com menu próprio para celular."],
  },
  {
    versao: "0.5.0",
    data: "2026-05-21",
    titulo: "Primeira versão",
    itens: [
      "Página inicial, telas de login e cadastro.",
      "Portal administrativo com calendário e formulários.",
    ],
  },
]

export type StatusIntegracao = "ativa" | "atencao" | "pendente"

export type Integracao = {
  nome: string
  para: string // para que serve, em linguagem simples
  status: StatusIntegracao
  responsavel: "Front-end" | "Back-end" | "Equipe toda"
  precisa: string[] // o que precisa ser feito
}

export const INTEGRACOES: Integracao[] = [
  {
    nome: "Supabase — Login",
    para: "Criar contas, entrar e sair do sistema.",
    status: "atencao",
    responsavel: "Back-end",
    precisa: [
      "Fechar a criação de administradores: hoje a página /admin-signup é aberta a qualquer pessoa. Deve virar convite feito pela administração.",
      "Ativar o fluxo “Esqueci minha senha” e configurar o texto do e-mail.",
      "Conferir a URL do site nas configurações do login para que o link do e-mail de confirmação funcione em produção.",
    ],
  },
  {
    nome: "Supabase — Banco de dados",
    para: "Guardar eventos, atividades, oficinas, centros, assistências, usuários e presenças.",
    status: "ativa",
    responsavel: "Back-end",
    precisa: [
      "Confirmar que as regras de segurança (RLS) do arquivo db/roles-presencas.sql estão aplicadas no banco de produção — são elas que realmente impedem acessos indevidos.",
      "Criar consultas prontas (contagens por mês, presenças por atividade) para o Dashboard deixar de usar dados de exemplo.",
      "Definir se o assistido terá cadastro próprio (CPF, família, necessidades) além do login.",
    ],
  },
  {
    nome: "Envio de e-mails",
    para: "Confirmação de conta, recuperação de senha e avisos.",
    status: "pendente",
    responsavel: "Back-end",
    precisa: [
      "Contratar/configurar um serviço de e-mail próprio. O envio padrão do Supabase tem limite baixo e pode cair em spam.",
      "Escolher o endereço remetente (por exemplo contato@ do domínio da Casa de Cultura).",
    ],
  },
  {
    nome: "Hospedagem do site (Vercel)",
    para: "Colocar o sistema no ar para o público.",
    status: "atencao",
    responsavel: "Equipe toda",
    precisa: [
      "Conferir que a pasta raiz do projeto na Vercel é front-end e que as chaves do banco estão cadastradas no ambiente de produção.",
      "Definir o endereço (domínio) oficial.",
    ],
  },
  {
    nome: "Suporte Técnico (e-mail do T.I.)",
    para: "Receber os chamados enviados pelo botão “Falar com o Suporte Técnico”.",
    status: "atencao",
    responsavel: "Equipe toda",
    precisa: [
      "O T.I. informar o e-mail oficial e cadastrar NEXT_PUBLIC_SUPORTE_EMAIL na Vercel (hoje usa um endereço de exemplo).",
      "(Opcional) cadastrar NEXT_PUBLIC_SUPORTE_WHATSAPP para exibir o botão de WhatsApp.",
      "No futuro, trocar o e-mail por um sistema de chamados com acompanhamento (depende do back-end).",
    ],
  },
  {
    nome: "Migração do banco (Supabase → Postgres próprio)",
    para: "A equipe de back-end quer sair do Supabase e criar um banco e uma API próprios.",
    status: "pendente",
    responsavel: "Back-end",
    precisa: [
      "Ler o PDF de orientações enviado à equipe de back-end.",
      "Publicar uma API de testes (staging) seguindo o contrato; o front-end então troca as chamadas em cerca de um dia.",
      "Migrar usuários preservando as senhas e normalizar os dados antigos de oficinas e atividades.",
    ],
  },
  {
    nome: "Imagens (fotos de oficinas e eventos)",
    para: "Exibir imagens nos cadastros.",
    status: "pendente",
    responsavel: "Back-end",
    precisa: [
      "Criar um espaço de armazenamento de arquivos (Storage) para envio de fotos e as colunas de imagem e descrição nas tabelas. Esses campos foram retirados dos formulários porque nunca eram salvos.",
      "Definir limite de tamanho e quem pode enviar.",
    ],
  },
  {
    nome: "Novas tabelas do banco",
    para: "Fazer funcionar na conta real o que hoje só funciona na demonstração.",
    status: "pendente",
    responsavel: "Back-end",
    precisa: [
      "Criar as tabelas de avisos, lista de espera, ficha, família, convites, pedidos de voluntariado, metas, histórico, comunicados e consentimento.",
      "Criar as colunas de descrição, foto e unidade nos cadastros.",
      "A lista completa está no PDF enviado à equipe de back-end.",
    ],
  },
  {
    nome: "Notificações e lembretes",
    para: "Avisar assistidos e voluntários por e-mail ou WhatsApp sobre atividades.",
    status: "pendente",
    responsavel: "Equipe toda",
    precisa: [
      "Decidir o canal (e-mail, WhatsApp, ambos).",
      "Back-end precisa criar o agendador de envios; o front-end então adiciona as preferências do usuário.",
    ],
  },
]

export const STATUS_INFO: Record<StatusIntegracao, { label: string; classe: string }> = {
  ativa: { label: "Funcionando", classe: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100" },
  atencao: { label: "Funcionando, com pendências", classe: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100" },
  pendente: { label: "Ainda não feita", classe: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100" },
}
