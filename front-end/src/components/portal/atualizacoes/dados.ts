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
    versao: "1.7.0",
    data: "2026-11-07",
    titulo: "Cuidado com cada pessoa, chamada por dia e fotos",
    itens: [
      "Gestão agora tem Assistidos e Voluntários. As contas de acesso ficam em Suporte, na opção Usuários.",
      "Dependentes: filhos e outros familiares podem ser inscritos nas atividades, entram na chamada e têm a própria assiduidade.",
      "Assiduidade clicável: cada barra mostra os dias, a página mostra a conta e o histórico completo.",
      "Relatório individual de cada assistido, para imprimir, com o que vai bem e onde dá para ajudar.",
      "Participação em detalhes, linha do tempo de acompanhamento e campos melhores de necessidades e acessibilidade.",
      "Presença sempre no diário de cada dia. O quadro de inscritos mostra quem é cada pessoa e seus cuidados.",
      "Eventos, atividades, oficinas, assistência e centros podem ser vistos em tabela ou cartões.",
      "Agenda da administração com resumo, filtro por responsável, inscritos e atalho para a chamada.",
      "Relatórios com “O que está indo bem” e pessoas frequentes, irregulares e que precisam de contato.",
      "Fotos de exemplo novas, em sua maioria do Brasil.",
      "Cada assistido tem uma página com necessidades, saúde, condição social, família, assiduidade e histórico de acompanhamento.",
      "Familiares podem ser ligados entre si: dá para ir da ficha de uma pessoa à de um parente.",
      "A lista de assistidos mostra quem precisa de contato, quem tem deficiência e quem recebe benefício.",
      "Ficha do voluntário: horário exato de cada dia, coisas que pode fazer, atividades em que quer ajudar e dados pessoais e profissionais.",
      "Voluntário ganhou Minhas atividades, com uma página para cada uma, e Meus assistidos, para acompanhar quem está nas atividades dele.",
      "Chamada por dia: o voluntário escolhe uma data que existe de fato e marca quem veio naquele dia.",
      "O check-in por QR Code agora fica dentro da chamada de cada atividade e dia.",
      "Compromissos do voluntário organizados dia a dia, com aviso de chamadas pendentes.",
      "Agenda com a opção de ver só os meus compromissos ou todos da Casa.",
      "Atividades da Casa: o assistido vê o que já faz e no que pode se inscrever, com fotos e filtro por dia.",
      "Toda atividade agora tem foto obrigatória e mapa com o endereço.",
      "Visão geral com quadro de eventos, atividades, oficinas e assistência; “Precisa de atenção” fica no final.",
      "Relatórios com comparação ao período anterior, destaques, quem precisa de contato e perfil do público.",
      "Novo certificado, em formato de paisagem, com encontros e horas. Quem cadastra escolhe se a atividade emite certificado, e o responsável libera no final.",
      "Voluntários também recebem certificado pelo trabalho que conduziram.",
      "Calendário maior, em largura total, com o quadro do dia embaixo.",
    ],
  },
  {
    versao: "1.6.0",
    data: "2026-11-07",
    titulo: "Agenda, páginas de cada item e novas áreas de gestão",
    itens: [
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
    para: "Fazer funcionar com dados reais as telas que ainda aparecem como “Em breve”.",
    status: "pendente",
    responsavel: "Back-end",
    precisa: [
      "Criar as tabelas de presença por dia, avisos, lista de espera, ficha, família, acompanhamento, convites, pedidos de voluntariado, metas, histórico, comunicados e consentimento.",
      "Criar as colunas de descrição, foto, unidade e endereço do mapa nos cadastros, e um lugar para guardar as fotos.",
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
