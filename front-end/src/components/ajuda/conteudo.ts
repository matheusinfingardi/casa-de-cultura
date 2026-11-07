import type { Perfil } from "@/lib/perfis"

export type Passo = { titulo: string; texto: string }
export type Pergunta = { p: string; r: string }

export const PRIMEIROS_PASSOS: Record<Perfil, Passo[]> = {
  assistido: [
    { titulo: "Explore", texto: "Abra a aba Explorar para ver atividades, oficinas, eventos e atendimentos disponíveis." },
    { titulo: "Inscreva-se", texto: "Toque em “Inscrever-me” no que for do seu interesse. Pode se inscrever em mais de um." },
    { titulo: "Acompanhe", texto: "Em Minhas inscrições você vê sua presença em cada item e pode cancelar se precisar." },
  ],
  voluntario: [
    { titulo: "Veja seus compromissos", texto: "Na tela inicial aparecem os itens que a administração atribuiu a você." },
    { titulo: "Abra a presença", texto: "Toque em “Registrar presença” no compromisso do dia." },
    { titulo: "Marque quem veio", texto: "Para cada pessoa, escolha Presente, Ausente ou Aguardando. Você também pode adicionar alguém que esqueceu de se inscrever." },
  ],
  admin: [
    { titulo: "Cadastre a programação", texto: "Em Programação e Atendimento, crie eventos, atividades, oficinas, centros e assistências." },
    { titulo: "Defina os voluntários", texto: "Em Pessoas › Usuários, mude o papel de quem vai ajudar para “Voluntário” e depois escolha-o como responsável nos cadastros." },
    { titulo: "Acompanhe na Visão geral", texto: "O calendário e os indicadores mostram a agenda do mês, inscrições e o que precisa de atenção." },
  ],
}

export const PERGUNTAS: Record<Perfil, Pergunta[]> = {
  assistido: [
    { p: "Como me inscrevo em uma atividade?", r: "Vá em Explorar, encontre a atividade (use a busca ou os filtros por tipo) e toque em “Inscrever-me”. Ela passa a aparecer em Minhas inscrições." },
    { p: "Como cancelo uma inscrição?", r: "Em Minhas inscrições, toque em “Cancelar inscrição” no item e confirme. Você pode se inscrever novamente depois." },
    { p: "O que significa “Marcada”, “Presente” e “Ausente”?", r: "Marcada: você está inscrito e ainda não houve registro. Presente: o voluntário confirmou que você participou. Ausente: o voluntário registrou que você não compareceu." },
    { p: "Esqueci minha senha. E agora?", r: "No momento a recuperação de senha automática ainda não está disponível. Use o botão de Suporte Técnico nesta página e informe o e-mail do seu cadastro; a equipe de T.I. ajudará." },
    { p: "Não vejo nada em Explorar.", r: "Pode ser que a Casa de Cultura ainda não tenha cadastrado itens, ou que você já esteja inscrito em todos. Se acredita que é um erro, fale com o Suporte Técnico." },
    { p: "Posso usar pelo celular?", r: "Sim. O sistema foi feito para funcionar bem em celulares, tablets e computadores." },
  ],
  voluntario: [
    { p: "Não aparece nenhum compromisso para mim.", r: "A administração precisa escolher você como “Voluntário responsável” no cadastro da atividade, oficina, evento, centro ou assistência. Peça que ela confira em Usuários que seu papel é “Voluntário”." },
    { p: "Como registro a presença?", r: "Na tela inicial, toque no compromisso e depois em “Registrar presença”. Para cada pessoa, toque em Presente, Ausente ou Aguardando. A alteração é salva na hora." },
    { p: "Uma pessoa veio, mas não estava na lista.", r: "Na tela de presença, use “Adicionar assistido”, digite o nome ou e-mail e toque em Adicionar. Depois marque como Presente. Ela precisa ter conta de assistido." },
    { p: "Posso marcar todos de uma vez?", r: "Sim: use “Marcar todos como presentes” e depois corrija só quem faltou." },
    { p: "Errei uma marcação. Como corrijo?", r: "Basta tocar de novo no status correto. Para tirar alguém da lista, use o ícone de lixeira e confirme." },
    { p: "Quero criar uma atividade nova.", r: "A criação de atividades é feita pela administração. Envie sua sugestão pelo Suporte Técnico ou diretamente à coordenação." },
  ],
  admin: [
    { p: "Como crio um evento, atividade ou oficina?", r: "No menu lateral escolha o tipo e clique em “Novo …”. Preencha os campos obrigatórios (marcados com *). Se algo estiver incorreto, os campos ficam em vermelho com a explicação." },
    { p: "Qual a diferença entre evento, atividade e oficina?", r: "Evento: acontece em uma data específica (festival, feira). Atividade: encontro que se repete toda semana ou ocorre uma vez (aula, treino). Oficina: turma com vagas limitadas em um dia fixo da semana." },
    { p: "Como torno alguém voluntário?", r: "Em Pessoas › Usuários, altere o papel da pessoa para “Voluntário”. Depois selecione-a em “Voluntário responsável” no cadastro do item." },
    { p: "Como vejo quem está inscrito?", r: "Nas listas, use o botão “Inscritos” do item. Lá você marca presença, adiciona ou remove pessoas." },
    { p: "O que são os alertas em “Precisa de atenção”?", r: "São pendências detectadas automaticamente: itens sem voluntário responsável, oficinas com vagas esgotadas e ausência de voluntários cadastrados." },
    { p: "Cadastrei algo e não aparece no calendário.", r: "Eventos precisam de data; atividades de data única também. Atividades semanais e oficinas aparecem nos dias da semana escolhidos. Confira também os filtros de tipo acima do calendário." },
    { p: "Posso excluir um cadastro por engano?", r: "A exclusão pede confirmação, mas é definitiva. Se excluir algo importante, avise o T.I. o quanto antes: pode ser possível recuperar do backup do banco de dados." },
    { p: "Onde vejo o que mudou no sistema?", r: "Em Suporte › Atualizações. A aba Changelog lista as novidades e a aba Integrações mostra o que falta para cada serviço externo." },
  ],
}
