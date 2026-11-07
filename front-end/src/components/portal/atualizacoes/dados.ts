// Conteúdo da área "Atualizações". Para publicar uma novidade, basta
// acrescentar um item NO TOPO de CHANGELOG (linguagem simples, sem termos técnicos).

export type Novidade = {
  data: string // AAAA-MM-DD
  titulo: string
  itens: string[]
}

export const CHANGELOG: Novidade[] = [
  {
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
    data: "2026-06-15",
    titulo: "Cadastro de Assistência",
    itens: ["Criar, editar, consultar e excluir atendimentos de assistência."],
  },
  {
    data: "2026-06-14",
    titulo: "Atividades e Eventos",
    itens: [
      "Cadastro completo de atividades, com repetição semanal e responsável.",
      "Edição de eventos concluída.",
    ],
  },
  {
    data: "2026-06-09",
    titulo: "Centros e Oficinas",
    itens: [
      "Cadastro completo de centros (criar, editar e excluir).",
      "Cadastro e listagem de oficinas.",
      "Os dados passaram a ser guardados de forma permanente, não mais apenas na tela.",
    ],
  },
  {
    data: "2026-05-29",
    titulo: "Uso no celular",
    itens: ["O portal passou a se ajustar a telas pequenas, com menu próprio para celular."],
  },
  {
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
    nome: "Hospedagem do site",
    para: "Colocar o sistema no ar para o público.",
    status: "pendente",
    responsavel: "Equipe toda",
    precisa: [
      "Escolher onde publicar (por exemplo Vercel) e registrar as duas chaves do Supabase no ambiente de produção.",
      "Definir o endereço (domínio) oficial.",
    ],
  },
  {
    nome: "Imagens (fotos de oficinas e eventos)",
    para: "Exibir imagens nos cadastros.",
    status: "pendente",
    responsavel: "Back-end",
    precisa: [
      "Criar um espaço de armazenamento de arquivos (Storage) para envio de fotos. Hoje o sistema só aceita o endereço (link) de uma imagem.",
      "Definir limite de tamanho e quem pode enviar.",
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
  ativa: { label: "Funcionando", classe: "bg-green-100 text-green-800" },
  atencao: { label: "Funcionando, com pendências", classe: "bg-amber-100 text-amber-800" },
  pendente: { label: "Ainda não feita", classe: "bg-slate-100 text-slate-700" },
}
