import type { Perfil } from "@/lib/perfis"

export type Passo = { titulo: string; texto: string }
export type Pergunta = { p: string; r: string }
export type Tema = { id: string; titulo: string; perguntas: Pergunta[] }

export const PRIMEIROS_PASSOS: Record<Perfil, Passo[]> = {
  assistido: [
    { titulo: "Explore", texto: "Em Atividades da Casa, veja tudo o que é oferecido." },
    { titulo: "Inscreva-se", texto: "Toque em “Quero participar” no que gostar." },
    { titulo: "Compareça", texto: "Mostre seu QR Code ao voluntário e acompanhe sua presença." },
  ],
  voluntario: [
    { titulo: "Veja seus compromissos", texto: "Tudo o que foi atribuído a você aparece na tela inicial." },
    { titulo: "Abra a presença", texto: "Toque no compromisso do dia." },
    { titulo: "Marque quem veio", texto: "Toque em Presente ou Ausente, ou leia o QR Code de quem chegou." },
  ],
  admin: [
    { titulo: "Cadastre", texto: "Crie eventos, atividades, oficinas, centros e assistências." },
    { titulo: "Escolha voluntários", texto: "Em Suporte > Usuários, defina quem é voluntário e atribua os itens." },
    { titulo: "Acompanhe", texto: "Use a Visão geral no dia a dia e os Relatórios para prestar contas." },
  ],
}

export const TEMAS: Record<Perfil, Tema[]> = {
  assistido: [
    { id: "inscricoes", titulo: "Inscrições", perguntas: [
      { p: "Como me inscrevo?", r: "Em Atividades da Casa, toque em “Quero participar”. O item passa a aparecer em Minhas inscrições e na sua Agenda." },
      { p: "A turma está cheia. E agora?", r: "Toque em “Entrar na lista de espera”. Quando abrir uma vaga, você entra automaticamente e recebe um aviso no sino." },
      { p: "Como cancelo?", r: "Em Minhas inscrições, toque em “Cancelar inscrição” e confirme. Você pode se inscrever de novo depois." },
      { p: "O que significa Marcada, Presente e Ausente?", r: "Marcada: você está inscrito. Presente: o voluntário confirmou que você veio. Ausente: ele registrou que você faltou." },
    ] },
    { id: "dia", titulo: "No dia da atividade", perguntas: [
      { p: "O que é o meu QR Code?", r: "É o seu cartão digital. Mostre ao voluntário na chegada: ele lê o código e marca sua presença naquele dia. Fica em Início › Meu QR Code." },
      { p: "Como coloco na agenda do celular?", r: "Em Agenda, toque em “Baixar para o calendário” e abra o arquivo no celular." },
    ] },
    { id: "familia", titulo: "Dependentes e certificados", perguntas: [
      { p: "Posso cuidar das inscrições dos meus filhos?", r: "Sim. Em Dependentes, cadastre seus filhos, conte os cuidados de cada um, inscreva nas atividades e veja a frequência." },
      { p: "Como consigo meu certificado?", r: "Nem toda atividade emite certificado. Quando emite, o responsável libera no final e você recebe um aviso. Depois, em Minhas inscrições, toque em “Baixar certificado”. Dá para imprimir ou salvar em PDF." },
    ] },
    { id: "conta", titulo: "Minha conta", perguntas: [
      { p: "Esqueci minha senha.", r: "Na tela de entrada, toque em “Esqueci minha senha”. Você recebe um link por e-mail para criar outra." },
      { p: "As letras estão pequenas.", r: "Em Minha conta › Aparência, escolha “Grande” ou “Maior”. Lá também fica o tema escuro." },
      { p: "Posso ver ou apagar meus dados?", r: "Sim. Em Minha conta › Meus dados, baixe tudo o que guardamos ou peça a exclusão da conta." },
      { p: "Posso instalar no celular?", r: "Sim. No menu do navegador, toque em “Adicionar à tela inicial”. O sistema abre como um aplicativo." },
    ] },
  ],
  voluntario: [
    { id: "presenca", titulo: "Presença", perguntas: [
      { p: "Como registro a presença?", r: "Na tela inicial, abra o compromisso do dia. Para cada pessoa, toque em Presente ou Ausente. Salva na hora." },
      { p: "Posso marcar todos de uma vez?", r: "Sim. Use “Marcar os restantes como presentes” e depois corrija só quem faltou." },
      { p: "Como uso o QR Code?", r: "Abra o compromisso, escolha o dia e use “Check-in de quem chegou”: leia o QR Code do assistido ou digite o código. A presença é marcada naquela atividade e naquele dia." },
      { p: "A internet caiu. E agora?", r: "Continue marcando. Guardamos no aparelho e enviamos sozinhos quando a conexão voltar. Um aviso mostra quantas marcações estão pendentes." },
    ] },
    { id: "lista", titulo: "Lista de pessoas", perguntas: [
      { p: "Alguém veio, mas não estava na lista.", r: "Use “Adicionar assistido”, digite o nome ou e-mail e toque em Adicionar. A pessoa precisa ter cadastro." },
      { p: "Errei uma marcação.", r: "Toque de novo na opção certa. Para tirar alguém da lista, use a lixeira e confirme." },
    ] },
    { id: "rotina", titulo: "Minha rotina", perguntas: [
      { p: "Não aparece nenhum compromisso.", r: "A administração precisa escolher você como voluntário responsável no cadastro do item." },
      { p: "Como informo meus horários livres?", r: "Em Minha ficha, escolha os dias e informe o horário exato. Lá você também marca o que pode fazer e em quais atividades quer ajudar." },
      { p: "Como acompanho as pessoas das minhas atividades?", r: "Em Meus assistidos você vê quem está vindo, quem precisa de contato e o que ajuda a acolher cada pessoa. Em Minhas atividades, a frequência de cada dia." },
      { p: "Como libero os certificados?", r: "Se a atividade emite certificado, abra a chamada e, quando terminar, toque em “Liberar certificados”. Quem tem presença recebe um aviso e pode baixar o seu." },
      { p: "Eu também recebo certificado?", r: "Sim. Depois de liberar, abra Certificados e baixe o seu, com os encontros e as horas que você conduziu." },
      { p: "Quero criar uma atividade.", r: "A criação é feita pela administração. Envie sua sugestão pelo Suporte ou fale com a coordenação." },
    ] },
  ],
  admin: [
    { id: "cadastro", titulo: "Cadastros", perguntas: [
      { p: "Qual a diferença entre evento, atividade e oficina?", r: "Evento: acontece em uma data (festival, feira). Atividade: encontro que se repete (aula, treino). Oficina: turma com vagas limitadas num dia fixo." },
      { p: "Como crio um item?", r: "No menu, escolha o tipo e clique em “Novo”. Campos com * são obrigatórios. Se faltar algo, o campo fica vermelho e explica o que fazer." },
      { p: "Como copio um item para o próximo semestre?", r: "Abra a página do item e clique em “Duplicar”. Ajuste o que mudou e salve." },
      { p: "Toda atividade tem certificado?", r: "Não. No cadastro, responda se ela emite certificado. Se sim, o responsável ou a administração libera no final, em “Liberar certificados”, na página do item." },
      { p: "Excluí algo por engano.", r: "A exclusão é definitiva. Avise o T.I. o quanto antes: pode dar para recuperar do backup." },
    ] },
    { id: "pessoas", titulo: "Pessoas", perguntas: [
      { p: "Como torno alguém voluntário?", r: "Em Suporte > Usuários, mude o papel da pessoa para Voluntário. Depois escolha-a como responsável no cadastro do item." },
      { p: "Como respondo quem quer ser voluntário?", r: "Em Gestão > Voluntários, na aba Pedidos, clique em “Aprovar e convidar” ou “Recusar”." },
      { p: "Como é calculada a assiduidade?", r: "Presenças divididas pelos encontros em que houve chamada. Na página da pessoa, clique em uma barra para ver cada dia. Frequente é quem veio a 75% ou mais; irregular, de 50% a 74%; precisa de contato, quem veio a menos de 50% ou faltou 3 vezes seguidas." },
      { p: "Como inscrevo um dependente em uma atividade?", r: "Na página da pessoa, abra Dependentes e use “Inscrever em”. Ele entra na chamada e ocupa vaga." },
      { p: "Como vejo a ficha de alguém?", r: "Em Gestão > Assistidos, clique no nome. Você vê necessidades, dependentes, participação, assiduidade, relatório e o histórico de acompanhamento. Os dados pessoais ficam escondidos até você clicar em “Mostrar dados”." },
    ] },
    { id: "acompanhar", titulo: "Acompanhamento", perguntas: [
      { p: "O que é “Precisa de atenção”?", r: "Pendências encontradas pelo sistema: pedidos sem resposta, itens sem responsável e oficinas sem vagas." },
      { p: "Como gero um relatório?", r: "Em Relatórios, escolha período, área e unidade. Depois baixe a planilha ou salve em PDF." },
      { p: "Como aviso as pessoas?", r: "Em Comunicados, escolha quem recebe, escreva e envie. O aviso aparece no sino de cada pessoa." },
      { p: "Consigo saber quem alterou algo?", r: "Sim, em Histórico de ações: quem criou, alterou ou excluiu cada informação." },
    ] },
    { id: "seguranca", titulo: "Segurança", perguntas: [
      { p: "Como protejo minha conta?", r: "Em Minha conta, ative a verificação em duas etapas. Ao entrar, o sistema pede também um código do celular." },
      { p: "O sistema está fora do ar?", r: "Veja em Status do sistema. Se algo estiver com problema, abra um chamado pelo Suporte." },
    ] },
  ],
}
