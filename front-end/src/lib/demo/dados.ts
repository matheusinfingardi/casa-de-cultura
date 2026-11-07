// Dados fictícios da demonstração. Nomes, telefones, e-mails e situações são inventados.
import { ocorrenciasNoPeriodo } from "@/lib/agenda"
import type { Atividade, Evento, Oficina } from "@/lib/tipos"

const p2 = (n: number) => String(n).padStart(2, "0")
const emDias = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
}
const haMeses = (m: number, dia: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() - m, Math.min(dia, 28))
  // Nunca no futuro: se cair depois de hoje, volta um mês.
  if (d.getTime() > Date.now()) d.setMonth(d.getMonth() - 1)
  return d.toISOString()
}

/**
 * Contas de teste: no formulário de login, abrem a demonstração com o perfil correspondente.
 * Não existem no banco real, por isso a senha simples não expõe nada.
 */
export const CONTAS_TESTE: Record<string, "admin" | "voluntario" | "assistido"> = {
  "admin@admin.com": "admin",
  "voluntario@voluntario.com": "voluntario",
  "assistido@assistido.com": "assistido",
}
export const SENHA_TESTE = "12345678"

export const USUARIOS_DEMO = {
  admin: "usr-marina",
  voluntario: "usr-carlos",
  assistido: "usr-ana",
} as const

type Linha = Record<string, unknown>
export type BancoDemo = Record<string, Linha[]>

export function criarBanco(): BancoDemo {
  const email = (nome: string, dominio = "email.com") =>
    `${nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/ /g, ".")}@${dominio}`
  const equipe = "casadecultura.org.br"

  const profiles: Linha[] = [
    { id: "usr-marina", nome: "Matheus", email: "admin@admin.com", role: "admin", created_at: haMeses(11, 3) },
    { id: "usr-roberto", nome: "José Roberto", email: email("José Roberto", equipe), role: "admin", created_at: haMeses(10, 12) },
    { id: "usr-carlos", nome: "Vitor Leal", email: "voluntario@voluntario.com", role: "responsavel", created_at: haMeses(9, 5) },
    { id: "usr-juliana", nome: "Juliana", email: email("Juliana", equipe), role: "responsavel", created_at: haMeses(9, 18) },
    { id: "usr-paulo", nome: "Samuel", email: email("Samuel", equipe), role: "responsavel", created_at: haMeses(8, 2) },
    { id: "usr-tereza", nome: "Anna Julia", email: email("Anna Julia", equipe), role: "responsavel", created_at: haMeses(7, 22) },
    { id: "usr-andre", nome: "Thiago", email: email("Thiago", equipe), role: "responsavel", created_at: haMeses(5, 9) },
    { id: "usr-stephen", nome: "Stephen", email: email("Stephen", equipe), role: "responsavel", created_at: haMeses(4, 14) },
    { id: "usr-ana", nome: "Ana Souza", email: "assistido@assistido.com", role: "cliente", created_at: haMeses(6, 1) },
  ]
  const nomes = ["Beatriz Lima", "Diego Santos", "Fernanda Costa", "Gustavo Pereira", "Helena Martins", "Igor Barbosa", "Joana Dias", "Lucas Ferreira", "Mariana Teixeira", "Nicolas Araújo", "Olívia Cardoso", "Pedro Henrique Moura", "Raquel Gomes", "Sérgio Duarte", "Tainá Oliveira", "Ulisses Prado", "Vanessa Reis", "Wesley Tavares", "Yasmin Freitas", "Zilda Fonseca", "Antônio Batista", "Cláudia Monteiro", "Eduardo Paiva", "Giovana Ramos", "Márcia Assis", "Renato Siqueira"]
  nomes.forEach((nome, i) =>
    profiles.push({ id: `usr-a${i}`, nome, email: email(nome), role: "cliente", created_at: haMeses(5 - (i % 6), 2 + i) })
  )
  const assistidos = profiles.filter((p) => p.role === "cliente")

  const resp = (id: string) => {
    const p = profiles.find((x) => x.id === id)!
    return { responsavel: p.nome as string, responsavel_id: id }
  }
  const semResp = { responsavel: "", responsavel_id: null }

  const centros: Linha[] = [
    { id: "cen-sede", nome: "Casa de Cultura — Sede", telefone: "(32) 3215-4400", endereco: "Rua Halfeld, 820 — Centro, Juiz de Fora", descricao: "Unidade principal, com auditório, biblioteca, ateliê e laboratório de informática.", ...resp("usr-paulo") },
    { id: "cen-norte", nome: "Núcleo Benfica", telefone: "(32) 3215-4411", endereco: "Av. Juscelino Kubitschek, 1540 — Benfica, Juiz de Fora", descricao: "Núcleo comunitário da Zona Norte, com quadra coberta e salas de reforço escolar.", ...resp("usr-tereza") },
    { id: "cen-leste", nome: "Núcleo Linhares", telefone: "(32) 3215-4422", endereco: "Rua José Lourenço Kelmer, 210 — Linhares, Juiz de Fora", descricao: "Atende famílias da Zona Leste com assistência social e oficinas de geração de renda.", ...resp("usr-juliana") },
  ]

  const eventos: Linha[] = [
    { id: "evt-festival", nome: "Festival de Cultura Popular", tipo: "cultural", data: emDias(6), horarioInicio: "14:00", horarioFim: "20:00", local: "Parque Halfeld", endereco_mapa: "Parque Halfeld, Juiz de Fora - MG", centro_id: "cen-sede", descricao: "Apresentações de capoeira, congado, música e dança, com feira de artesanato das oficinas.", ...resp("usr-carlos") },
    { id: "evt-saude", nome: "Feira de Saúde da Família", tipo: "saude", data: emDias(11), horarioInicio: "08:00", horarioFim: "13:00", local: "Núcleo Benfica", centro_id: "cen-norte", descricao: "Aferição de pressão, orientação nutricional, vacinação e encaminhamentos com a UBS do bairro.", ...resp("usr-juliana") },
    { id: "evt-sarau", nome: "Sarau de Poesia e Música", tipo: "cultural", data: emDias(2), horarioInicio: "19:00", horarioFim: "21:30", local: "Auditório da Sede", centro_id: "cen-sede", descricao: "Noite aberta para leitura de poemas autorais e música ao vivo.", ...resp("usr-andre") },
    { id: "evt-agasalho", nome: "Campanha do Agasalho", tipo: "social", data: emDias(18), horarioInicio: "09:00", horarioFim: "17:00", local: "Núcleo Linhares", centro_id: "cen-leste", descricao: "Arrecadação e distribuição de roupas de frio para as famílias atendidas.", ...semResp },
    { id: "evt-educacao", nome: "Encontro de Pais e Educadores", tipo: "educacao", data: emDias(25), horarioInicio: "18:30", horarioFim: "20:30", local: "Auditório da Sede", centro_id: "cen-sede", descricao: "Conversa sobre acompanhamento escolar e participação da família.", ...resp("usr-tereza") },
    { id: "evt-natal", nome: "Natal Solidário", tipo: "social", data: emDias(38), horarioInicio: "15:00", horarioFim: "19:00", local: "Parque Halfeld", endereco_mapa: "Parque Halfeld, Juiz de Fora - MG", centro_id: "cen-sede", descricao: "Entrega de brinquedos, apresentação do coral infantil e lanche comunitário.", ...resp("usr-marina") },
    { id: "evt-mostra", nome: "Mostra das Oficinas de Arte", tipo: "cultural", data: emDias(-9), horarioInicio: "16:00", horarioFim: "19:00", local: "Ateliê da Sede", centro_id: "cen-sede", descricao: "Exposição dos trabalhos produzidos no semestre.", ...resp("usr-juliana") },
    { id: "evt-profissao", nome: "Dia de Orientação Profissional", tipo: "educacao", data: emDias(-22), horarioInicio: "09:00", horarioFim: "12:00", local: "Núcleo Benfica", centro_id: "cen-norte", descricao: "Currículo, entrevista de emprego e encaminhamento para vagas.", ...resp("usr-paulo") },
  ]

  const h = (i: string, f: string) => ({ horarioInicio: i, horarioFim: f })
  const atividades: Linha[] = [
    { id: "atv-violao", nome: "Aula de Violão", local: "Sala de Música — Sede", centro_id: "cen-sede", descricao: "Do primeiro acorde às primeiras músicas. Instrumentos disponíveis para quem não tem.", recorrencia: { tipo: "Semanal", horarios: { Segunda: h("18:00", "19:30"), Quarta: h("18:00", "19:30") } }, ...resp("usr-carlos") },
    { id: "atv-capoeira", nome: "Capoeira Infantil", local: "Quadra Coberta — Benfica", centro_id: "cen-norte", descricao: "Para crianças de 6 a 12 anos. Movimento, música e roda.", recorrencia: { tipo: "Semanal", horarios: { Sábado: h("09:00", "10:30") } }, ...resp("usr-paulo") },
    { id: "atv-reforco", nome: "Reforço Escolar", local: "Salas 1 e 2 — Benfica", centro_id: "cen-norte", descricao: "Apoio em português e matemática para o ensino fundamental.", recorrencia: { tipo: "Semanal", horarios: { Segunda: h("14:00", "16:00"), Terça: h("14:00", "16:00"), Quinta: h("14:00", "16:00"), Sexta: h("14:00", "16:00") } }, ...resp("usr-tereza") },
    { id: "atv-yoga", nome: "Yoga para a Melhor Idade", local: "Auditório da Sede", centro_id: "cen-sede", descricao: "Alongamento e respiração em ritmo tranquilo, a partir de 60 anos.", recorrencia: { tipo: "Semanal", horarios: { Terça: h("08:30", "09:30"), Quinta: h("08:30", "09:30") } }, ...resp("usr-juliana") },
    { id: "atv-coral", nome: "Coral Comunitário", local: "Auditório da Sede", centro_id: "cen-sede", descricao: "Ensaio aberto para todas as idades, sem necessidade de experiência.", recorrencia: { tipo: "Semanal", horarios: { Quarta: h("19:30", "21:00") } }, ...resp("usr-andre") },
    { id: "atv-samba", nome: "Roda de Samba da Comunidade", local: "Pátio — Núcleo Linhares", centro_id: "cen-leste", descricao: "Encontro dominical com músicos da região.", recorrencia: { tipo: "Semanal", horarios: { Domingo: h("16:00", "18:00") } }, ...semResp },
    { id: "atv-leitura", nome: "Roda de Leitura", local: "Biblioteca da Sede", centro_id: "cen-sede", descricao: "Encontro especial com autores de Juiz de Fora.", recorrencia: { tipo: "Unica", data: emDias(4), horarioInicio: "15:00", horarioFim: "16:30" }, ...resp("usr-andre") },
  ]

  const oficinas: Linha[] = [
    { id: "ofi-pintura", nome: "Pintura em Tela", vagas: 15, nivel: "iniciante", dia: "Terça", horarioInicio: "14:00", horarioFim: "16:00", local: "Ateliê da Sede", centro_id: "cen-sede", descricao: "Técnicas básicas de tinta acrílica. Material incluso.", ...resp("usr-juliana") },
    { id: "ofi-info", nome: "Informática Básica", vagas: 12, nivel: "iniciante", dia: "Quinta", horarioInicio: "09:00", horarioFim: "11:00", local: "Laboratório da Sede", centro_id: "cen-sede", descricao: "Computador, internet, e-mail e serviços públicos on-line.", ...resp("usr-carlos") },
    { id: "ofi-teatro", nome: "Teatro Comunitário", vagas: 20, nivel: "intermediario", dia: "Sexta", horarioInicio: "19:00", horarioFim: "21:00", local: "Auditório da Sede", centro_id: "cen-sede", descricao: "Jogos teatrais e montagem de uma peça ao fim do semestre.", ...semResp },
    { id: "ofi-costura", nome: "Corte e Costura", vagas: 10, nivel: "iniciante", dia: "Quarta", horarioInicio: "14:00", horarioFim: "17:00", local: "Núcleo Linhares", centro_id: "cen-leste", descricao: "Geração de renda: ajustes, consertos e peças simples.", ...resp("usr-tereza") },
    { id: "ofi-panificacao", nome: "Panificação Artesanal", vagas: 8, nivel: "iniciante", dia: "Sábado", horarioInicio: "08:00", horarioFim: "11:00", local: "Cozinha — Núcleo Linhares", centro_id: "cen-leste", descricao: "Pães e bolos para consumo e venda.", ...resp("usr-paulo") },
    { id: "ofi-foto", nome: "Fotografia com Celular", vagas: 15, nivel: "avancado", dia: "Segunda", horarioInicio: "16:00", horarioFim: "18:00", local: "Núcleo Benfica", centro_id: "cen-norte", descricao: "Composição, luz e edição usando o próprio celular.", ...resp("usr-stephen") },
  ]

  const assistencia: Linha[] = [
    { id: "ass-psico", nome: "Atendimento Psicológico", tipo: "Psicológica", local: "Sala 3 — Sede", centro_id: "cen-sede", descricao: "Escuta e acompanhamento individual, com agendamento.", ...resp("usr-juliana") },
    { id: "ass-juridica", nome: "Orientação Jurídica", tipo: "Jurídica", local: "Sala 5 — Sede", centro_id: "cen-sede", descricao: "Plantão gratuito sobre direitos, documentos e benefícios.", ...semResp },
    { id: "ass-cesta", nome: "Cesta Básica", tipo: "Alimentar", local: "Almoxarifado — Linhares", centro_id: "cen-leste", descricao: "Entrega mensal às famílias cadastradas.", ...resp("usr-paulo") },
    { id: "ass-social", nome: "Acompanhamento Social", tipo: "Social", local: "Sala 1 — Benfica", centro_id: "cen-norte", descricao: "Orientação sobre CadÚnico, benefícios e rede de apoio.", ...resp("usr-tereza") },
    { id: "ass-saude", nome: "Encaminhamento de Saúde", tipo: "Saúde", local: "Sala 2 — Benfica", centro_id: "cen-norte", descricao: "Apoio para marcar consultas e exames na rede pública.", ...resp("usr-juliana") },
    { id: "ass-escolar", nome: "Apoio à Matrícula Escolar", tipo: "Educacional", local: "Sala 2 — Sede", centro_id: "cen-sede", descricao: "Ajuda com vagas, transferências e documentos escolares.", ...resp("usr-tereza") },
  ]

  // Inscrições: distribuídas de forma determinística para os números fazerem sentido.
  const presencas: Linha[] = []
  let n = 0
  const nomeDe = (lista: Linha[], id: string) => lista.find((x) => x.id === id)?.nome
  const inscrever = (tipo: string, lista: Linha[], itemId: string, cliente: Linha, status: string, mes: number) =>
    presencas.push({ id: `pre-${++n}`, item_tipo: tipo, item_id: itemId, item_nome: nomeDe(lista, itemId), cliente_id: cliente.id, status, created_at: haMeses(mes, 3 + (n % 24)) })

  const situacao = (i: number) => (i % 7 === 0 ? "ausente" : i % 3 === 0 ? "marcada" : "presente")
  const planos: [string, Linha[], string, number][] = [
    ["atividade", atividades, "atv-violao", 14], ["atividade", atividades, "atv-capoeira", 11], ["atividade", atividades, "atv-reforco", 16],
    ["atividade", atividades, "atv-yoga", 9], ["atividade", atividades, "atv-coral", 12], ["atividade", atividades, "atv-leitura", 6],
    ["oficina", oficinas, "ofi-pintura", 11], ["oficina", oficinas, "ofi-info", 12], ["oficina", oficinas, "ofi-teatro", 7],
    ["oficina", oficinas, "ofi-costura", 8], ["oficina", oficinas, "ofi-panificacao", 8], ["oficina", oficinas, "ofi-foto", 5],
    ["evento", eventos, "evt-festival", 13], ["evento", eventos, "evt-saude", 8], ["evento", eventos, "evt-sarau", 7], ["evento", eventos, "evt-mostra", 12], ["evento", eventos, "evt-profissao", 9],
    ["assistencia", assistencia, "ass-psico", 6], ["assistencia", assistencia, "ass-cesta", 10], ["assistencia", assistencia, "ass-social", 7], ["assistencia", assistencia, "ass-juridica", 4],
  ]
  const semAna = assistidos.filter((a) => a.id !== "usr-ana")
  planos.forEach(([tipo, lista, id, qtd], p) => {
    for (let i = 0; i < qtd; i++) inscrever(tipo, lista, id, semAna[(i * 2 + p * 3) % semAna.length], situacao(i + p), (i + p) % 6)
  })
  // Sem repetição (mesma pessoa no mesmo item).
  const vistos = new Set<string>()
  const unicas = presencas.filter((x) => {
    const k = `${x.item_tipo}-${x.item_id}-${x.cliente_id}`
    if (vistos.has(k)) return false
    vistos.add(k)
    return true
  })
  presencas.length = 0
  presencas.push(...unicas)

  const ana = assistidos.find((a) => a.id === "usr-ana")!
  inscrever("atividade", atividades, "atv-violao", ana, "presente", 4)
  inscrever("oficina", oficinas, "ofi-pintura", ana, "presente", 3)
  inscrever("evento", eventos, "evt-mostra", ana, "presente", 2)
  inscrever("assistencia", assistencia, "ass-social", ana, "marcada", 1)
  inscrever("evento", eventos, "evt-festival", ana, "marcada", 0)

  // Completa "Informática Básica" para demonstrar turma lotada e lista de espera.
  const naInfo = () => presencas.filter((x) => x.item_id === "ofi-info").map((x) => x.cliente_id)
  for (const a of semAna) {
    if (naInfo().length >= 12) break
    if (!naInfo().includes(a.id)) inscrever("oficina", oficinas, "ofi-info", a, "marcada", 1)
  }
  const fora = semAna.filter((a) => !naInfo().includes(a.id))

  // Fotos de exemplo (licença livre; ver public/demo/CREDITOS.md).
  for (const l of [eventos, atividades, oficinas, centros, assistencia]) for (const i of l) i.imagem_url = `/demo/${i.id}.jpg`

  // Nem tudo emite certificado. Quando emite, o responsável libera no final.
  const COM_CERTIFICADO = ["evt-mostra", "evt-profissao", "evt-festival", "atv-violao", "atv-reforco", "atv-capoeira", ...oficinas.map((o) => o.id as string)]
  const LIBERADOS = ["evt-mostra", "evt-profissao", "atv-violao", "ofi-pintura"]
  for (const l of [eventos, atividades, oficinas, assistencia]) {
    for (const i of l) {
      i.tem_certificado = COM_CERTIFICADO.includes(i.id as string)
      i.certificado_liberado = LIBERADOS.includes(i.id as string)
    }
  }

  // --- Presença dia a dia -----------------------------------------------------
  // Cada pessoa tem um padrão de frequência, para os relatórios contarem uma história coerente.
  const padrao = (id: string) => {
    if (id === "usr-ana") return { taxa: 0.82, sumiu: false }
    const n = [...id].reduce((t, c) => t + c.charCodeAt(0), 0)
    return { taxa: [0.95, 0.88, 0.8, 0.65, 0.92, 0.45][n % 6], sumiu: n % 9 === 0 }
  }
  const sorteio = (t: string) => ([...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 100) / 100
  const registros: Linha[] = []
  const ate = new Date(); ate.setDate(ate.getDate() - 1)
  const de = new Date(); de.setDate(de.getDate() - 182)
  const passadas = ocorrenciasNoPeriodo(
    { eventos: eventos as unknown as Evento[], atividades: atividades as unknown as Atividade[], oficinas: oficinas as unknown as Oficina[] },
    de, ate
  ).map((o) => ({ tipo: o.tipo as string, id: o.itemId, data: o.data }))
  // Assistências não têm dia fixo: atendimentos nas últimas quartas-feiras.
  for (const item of assistencia) {
    for (let d = new Date(de); d <= ate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 3) passadas.push({ tipo: "assistencia", id: item.id as string, data: `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` })
    }
  }
  const limiteSumico = emDias(-16)
  // Uma chamada de propósito sem fazer, para o voluntário ver o aviso de pendência.
  const ultimaViolao = passadas.filter((o) => o.id === "atv-violao").map((o) => o.data).sort().pop()
  for (const o of passadas) {
    if (o.id === "atv-violao" && o.data === ultimaViolao) continue
    for (const ins of presencas.filter((x) => x.item_id === o.id)) {
      const c = ins.cliente_id as string
      // Ninguém tem presença antes de chegar à Casa.
      if (o.data < String(profiles.find((u) => u.id === c)?.created_at ?? "").slice(0, 10)) continue
      const { taxa, sumiu } = padrao(c)
      const veio = sumiu && o.data >= limiteSumico ? false : sorteio(`${c}${o.id}${o.data}`) < taxa
      registros.push({ id: `reg-${registros.length}`, item_tipo: o.tipo, item_id: o.id, data: o.data, cliente_id: c, status: veio ? "presente" : "ausente" })
    }
  }

  // --- Fichas -----------------------------------------------------------------
  const BAIRROS = ["Centro", "Benfica", "Linhares", "São Pedro", "Santa Luzia", "Vitorino Braga", "Bairu", "Grama"]
  const SEM_CONDICAO = { deficiencia: "", necessidades: "", saude: "", medicamentos: "", alergias: "", acessibilidade: "" }
  const CONDICOES = [
    SEM_CONDICAO, SEM_CONDICAO, SEM_CONDICAO, SEM_CONDICAO,
    { deficiencia: "Deficiência visual", necessidades: "Tem baixa visão: prefere materiais com letras grandes.", evitar: "Mudar os móveis de lugar sem avisar.", saude: "", medicamentos: "", alergias: "", acessibilidade: "Letras ampliadas, Lugar perto da frente" },
    { deficiencia: "", necessidades: "Cuida da mãe idosa; precisa de horários pela manhã.", saude: "Hipertensão", medicamentos: "Losartana", alergias: "", acessibilidade: "" },
    SEM_CONDICAO, SEM_CONDICAO,
    { deficiencia: "Mobilidade reduzida", necessidades: "Usa muletas e precisa de sala no térreo.", saude: "", medicamentos: "", alergias: "", acessibilidade: "Rampa e sala no térreo" },
    { deficiencia: "", necessidades: "", saude: "Asma", medicamentos: "Bombinha em caso de crise", alergias: "Poeira", acessibilidade: "" },
    SEM_CONDICAO, SEM_CONDICAO,
    { deficiencia: "Transtorno do espectro autista", necessidades: "Funciona melhor em grupos pequenos e com a rotina avisada com antecedência.", evitar: "Mudanças de última hora e muito barulho.", saude: "", medicamentos: "", alergias: "", acessibilidade: "Ambiente com pouco barulho" },
    { deficiencia: "", necessidades: "Procura orientação para voltar ao mercado de trabalho.", saude: "", medicamentos: "", alergias: "Dipirona", acessibilidade: "" },
    { deficiencia: "Deficiência auditiva", necessidades: "Comunica-se melhor com contato visual; conhece Libras.", saude: "", medicamentos: "", alergias: "", acessibilidade: "Intérprete de Libras" },
  ]
  const SOCIAL = [
    { beneficios: ["Bolsa Família", "CadÚnico"], renda: "Até 1 salário mínimo", moradia: "Alugada", escolaridade: "Ensino fundamental incompleto", trabalho: "Trabalho informal", transporte: "A pé" },
    { beneficios: ["BPC"], renda: "1 salário mínimo", moradia: "Própria", escolaridade: "Ensino fundamental completo", trabalho: "Aposentado(a)", transporte: "Ônibus" },
    { beneficios: ["CadÚnico"], renda: "Até 2 salários mínimos", moradia: "Cedida por familiar", escolaridade: "Ensino médio completo", trabalho: "Desempregado(a)", transporte: "Ônibus" },
    { beneficios: [], renda: "Até 1 salário mínimo", moradia: "Alugada", escolaridade: "Ensino médio incompleto", trabalho: "Autônomo(a)", transporte: "Bicicleta" },
  ]
  const fichas: Linha[] = assistidos.map((a, i) => ({
    id: a.id,
    telefone: `(32) 9${String(8100 + i * 37).padStart(4, "0")}-${String(1200 + i * 53).padStart(4, "0")}`,
    nascimento: `${1958 + ((i * 7) % 52)}-${p2((i % 12) + 1)}-${p2((i % 27) + 1)}`,
    endereco: `Rua ${["das Flores", "Marechal Deodoro", "São Mateus", "Benjamin Constant", "Santa Rita", "Espírito Santo"][i % 6]}, ${100 + i * 13}`,
    bairro: BAIRROS[i % BAIRROS.length],
    responsavel_legal: "",
    contato_emergencia: `${["Rosa", "João", "Maria", "Sebastião"][i % 4]} (familiar): (32) 9${String(7100 + i * 19).padStart(4, "0")}-${String(4400 + i * 11).padStart(4, "0")}`,
    autoriza_imagem: i % 3 !== 0,
    observacoes: "",
    ...CONDICOES[i % CONDICOES.length],
    ...SOCIAL[i % SOCIAL.length],
  }))
  const fichaAna = fichas.find((f) => f.id === "usr-ana")!
  Object.assign(fichaAna, {
    telefone: "(32) 99911-2233", nascimento: "1986-04-12", endereco: "Rua Benjamin Constant, 340", bairro: "Centro",
    deficiencia: "", necessidades: "Mãe solo de dois filhos; prefere atividades à tarde, depois da escola das crianças.",
    saude: "", medicamentos: "", alergias: "", acessibilidade: "",
    beneficios: ["Bolsa Família", "CadÚnico"], renda: "Até 1 salário mínimo", moradia: "Alugada", escolaridade: "Ensino médio completo", trabalho: "Diarista", transporte: "Ônibus",
    contato_emergencia: "Rosa Souza (mãe): (32) 98844-1020", autoriza_imagem: true,
  })

  // --- Família ----------------------------------------------------------------
  const dependentes: Linha[] = [
    { id: "dep-1", responsavel_id: "usr-ana", nome: "Pedro Souza", nascimento: "2016-02-20", parentesco: "Filho", atividade: "Capoeira Infantil", mora_junto: true, parente_id: null, telefone: "" },
    { id: "dep-2", responsavel_id: "usr-ana", nome: "Laura Souza", nascimento: "2013-08-05", parentesco: "Filha", atividade: "Reforço Escolar", mora_junto: true, parente_id: null, telefone: "" },
    { id: "dep-3", responsavel_id: "usr-ana", nome: "Beatriz Lima", nascimento: "1990-01-15", parentesco: "Irmã", atividade: "", mora_junto: false, parente_id: "usr-a0", telefone: "(32) 99822-1100" },
    { id: "dep-4", responsavel_id: "usr-a0", nome: "Ana Souza", nascimento: "1986-04-12", parentesco: "Irmã", atividade: "", mora_junto: false, parente_id: "usr-ana", telefone: "(32) 99911-2233" },
    { id: "dep-5", responsavel_id: "usr-a1", nome: "Fernanda Costa", nascimento: "1975-05-03", parentesco: "Mãe", atividade: "", mora_junto: true, parente_id: "usr-a2", telefone: "" },
    { id: "dep-6", responsavel_id: "usr-a2", nome: "Diego Santos", nascimento: "2004-09-14", parentesco: "Filho", atividade: "", mora_junto: true, parente_id: "usr-a1", telefone: "" },
    { id: "dep-7", responsavel_id: "usr-a4", nome: "Miguel Martins", nascimento: "2017-03-11", parentesco: "Neto", atividade: "Capoeira Infantil", mora_junto: true, parente_id: null, telefone: "" },
  ]

  // Idades coerentes com o parentesco acima.
  const nascer = (id: string, nascimento: string) => { fichas.find((f) => f.id === id)!.nascimento = nascimento }
  nascer("usr-a0", "1990-01-15"); nascer("usr-a1", "2004-09-14"); nascer("usr-a2", "1975-05-03"); nascer("usr-a4", "1961-07-22")
  Object.assign(dependentes[0], { cuidados: "Tem asma: leva a bombinha nas atividades.", escola: "E.M. Santos Dumont" })
  Object.assign(dependentes[1], { escola: "E.E. Delfim Moreira" })
  Object.assign(dependentes[6], { deficiencia: "Transtorno do espectro autista", cuidados: "Grupos pequenos e rotina avisada com antecedência." })

  // Mais famílias: mães, pais e avós que cuidam de crianças. Alguns dos pequenos têm cuidados especiais.
  const CRIANCAS = ["Davi", "Alice", "Theo", "Helena", "Samuel", "Cecília", "Benício", "Lívia", "Gael", "Maitê"]
  const FEMININO = new Set(["Alice", "Helena", "Cecília", "Lívia", "Maitê"])
  const CUIDADOS_CRIANCA: Linha[] = [
    {},
    { deficiencia: "Deficiência auditiva", cuidados: "Usa aparelho auditivo; ajuda falar de frente, olhando nos olhos." },
    {},
    { cuidados: "Alergia a amendoim: conferir os lanches." },
    { deficiencia: "TDAH", cuidados: "Atividades curtas e lugar perto do professor." },
  ]
  let crianca = 0
  fichas.forEach((f, i) => {
    const id = f.id as string
    if (dependentes.some((d) => d.responsavel_id === id)) return
    const anos = new Date().getFullYear() - Number(String(f.nascimento).slice(0, 4))
    const pessoa = assistidos.find((a) => a.id === id)!
    const sobrenome = String(pessoa.nome).split(" ").pop()
    const eFilho = anos >= 26 && anos <= 52 && i % 2 === 0
    const eNeto = anos > 55 && i % 3 === 0
    if (!eFilho && !eNeto) return
    for (let k = 0; k < (i % 3 === 0 ? 2 : 1); k++) {
      const nome = CRIANCAS[crianca % CRIANCAS.length]
      const fem = FEMININO.has(nome)
      dependentes.push({
        id: `dep-g${crianca}`, responsavel_id: id, nome: `${nome} ${sobrenome}`, nascimento: `${2011 + (crianca * 3) % 11}-${p2((crianca % 12) + 1)}-${p2((crianca % 27) + 1)}`,
        parentesco: eFilho ? (fem ? "Filha" : "Filho") : (fem ? "Neta" : "Neto"), atividade: ["Capoeira Infantil", "Reforço Escolar", ""][crianca % 3], mora_junto: true, parente_id: null, telefone: "",
        ...CUIDADOS_CRIANCA[crianca % CUIDADOS_CRIANCA.length],
      })
      crianca++
    }
  })

  // A atividade de cada dependente vira inscrição de verdade: entra na chamada e ocupa vaga.
  for (const d of dependentes) {
    const nomeItem = d.atividade as string
    d.atividade = ""
    if (!nomeItem) continue
    const lugar = ([["atividade", atividades], ["oficina", oficinas]] as const).flatMap(([tipo, l]) => l.filter((x) => x.nome === nomeItem).map((x) => ({ tipo, id: x.id as string })))[0]
    if (!lugar) continue
    presencas.push({ id: `pre-${d.id}`, item_tipo: lugar.tipo, item_id: lugar.id, item_nome: nomeItem, cliente_id: d.id, status: "marcada", created_at: haMeses(2, 1) })
    const taxa = Math.max(0.78, padrao(d.id as string).taxa)
    for (const o of passadas) {
      if (o.id !== lugar.id || o.data < haMeses(2, 1).slice(0, 10) || o.data === ultimaViolao) continue
      registros.push({ id: `reg-${registros.length}`, item_tipo: o.tipo, item_id: o.id, data: o.data, cliente_id: d.id, status: sorteio(`${d.id}${o.data}`) < taxa ? "presente" : "ausente" })
    }
  }

  // --- Acompanhamento da equipe -----------------------------------------------
  const acompanhamento: Linha[] = [
    { id: "aco-1", pessoa_id: "usr-ana", autor: "Matheus", tipo: "Atendimento", texto: "Conversamos sobre a rotina com os filhos. Ana quer concluir um curso de informática para buscar outro trabalho.", proximo_passo: "Avisar quando abrir vaga em Informática Básica.", created_at: haMeses(1, 12) },
    { id: "aco-2", pessoa_id: "usr-ana", autor: "Juliana", tipo: "Encaminhamento", texto: "Encaminhada ao Acompanhamento Social para atualizar o CadÚnico.", proximo_passo: "Confirmar a atualização no próximo encontro.", created_at: haMeses(0, 2) },
    ...assistidos.filter((a) => a.id !== "usr-ana").slice(0, 12).map((a, i) => ({
      id: `aco-g${i}`, pessoa_id: a.id, autor: ["Matheus", "Juliana", "Anna Julia"][i % 3], tipo: ["Ligação", "Atendimento", "Visita"][i % 3],
      texto: ["Ligamos para saber como está e reforçar o convite para as atividades.", "Atendimento de acolhimento; pessoa relatou boa adaptação ao grupo.", "Visita à família para entender as dificuldades de transporte."][i % 3],
      proximo_passo: ["", "Acompanhar a frequência no próximo mês.", "Verificar auxílio-transporte."][i % 3], created_at: haMeses(i % 4, 4 + i),
    })),
  ]

  // --- Voluntários -------------------------------------------------------------
  const G = (dias: string[], inicio: string, fim: string) => Object.fromEntries(dias.map((d) => [d, [{ inicio, fim }]]))
  // Nomes reais da equipe do projeto: só disponibilidade e áreas fictícias, sem dados pessoais nem biografia.
  const voluntario = (id: string, horarios: unknown, areas: string[], tarefas: string[], interesses: string[], unidades: string[], experiencia: string, frequencia: string) => ({
    id, horarios, areas, tarefas, interesses, unidades, experiencia, frequencia, cidade: "Juiz de Fora", whatsapp: true,
    telefone: "", nascimento: "", bairro: "", contato_emergencia: "", autoriza_imagem: true, profissao: "", local_trabalho: "", formacao: "", escolaridade: "", registro_profissional: "", idiomas: "", habilidades: "", tem_transporte: false, observacoes: "", outras_ideias: "",
  })
  const disponibilidade: Linha[] = [
    voluntario("usr-carlos", G(["Segunda", "Quarta"], "17:30", "21:00"), ["Música", "Informática"], ["Dar aulas ou conduzir oficinas", "Dar apoio em computadores"], ["atv-violao", "ofi-info", "atv-coral"], ["cen-sede"], "Ajuda nas aulas de violão e no laboratório de informática.", "Toda semana"),
    voluntario("usr-juliana", G(["Terça", "Quinta"], "08:00", "16:30"), ["Artes", "Assistência social"], ["Acolher quem chega", "Dar aulas ou conduzir oficinas"], ["ofi-pintura", "atv-yoga", "ass-saude"], ["cen-sede", "cen-leste"], "Acompanha as oficinas de arte e os atendimentos.", "Toda semana"),
    voluntario("usr-paulo", G(["Sábado"], "08:00", "12:00"), ["Esporte", "Cozinha", "Eventos"], ["Ajudar na organização de eventos", "Cozinhar ou servir lanches"], ["atv-capoeira", "ofi-panificacao", "evt-festival"], ["cen-norte", "cen-leste"], "Ajuda na capoeira e na organização de eventos.", "Toda semana"),
    voluntario("usr-tereza", G(["Segunda", "Terça", "Quinta", "Sexta"], "13:30", "17:00"), ["Educação", "Assistência social"], ["Reforço escolar", "Ajudar um professor em sala"], ["atv-reforco", "ass-escolar"], ["cen-norte"], "Acompanha o reforço escolar.", "Toda semana"),
    voluntario("usr-andre", G(["Quarta", "Sexta"], "19:00", "21:30"), ["Música", "Eventos"], ["Ajudar na organização de eventos", "Fazer a chamada das atividades"], ["atv-coral", "evt-sarau", "ofi-teatro"], ["cen-sede"], "Ajuda no coral e nos saraus.", "Duas vezes por mês"),
    voluntario("usr-stephen", G(["Segunda", "Sábado"], "14:00", "18:00"), ["Fotografia", "Informática"], ["Tirar fotos e gravar vídeos", "Cuidar das redes sociais"], ["ofi-foto", "evt-festival"], ["cen-norte"], "Conduz a oficina de fotografia e registra os eventos.", "Quando houver eventos"),
  ]

  return {
    profiles, eventos, atividades, oficinas, centros, assistencia, presencas, registros, fichas, dependentes, acompanhamento, disponibilidade,
    lista_espera: fora.slice(0, 3).map((a, i) => ({ id: `esp-${i}`, item_tipo: "oficina", item_id: "ofi-info", item_nome: "Informática Básica", cliente_id: a.id, created_at: haMeses(0, 1 + i) })),
    notificacoes: [
      { id: "not-1", usuario_id: "usr-ana", titulo: "Festival confirmado", texto: "Sua inscrição no Festival de Cultura Popular foi confirmada.", href: "/painel/inscricoes", lida: false, created_at: haMeses(0, 1) },
      { id: "not-2", usuario_id: "usr-ana", titulo: "Lembrete", texto: "A Aula de Violão começa às 18:00 de segunda.", href: "/painel/agenda", lida: true, created_at: haMeses(0, 1) },
      { id: "not-3", usuario_id: "usr-carlos", titulo: "Nova atribuição", texto: "Você agora é responsável pela Informática Básica.", href: "/painel", lida: false, created_at: haMeses(0, 1) },
      { id: "not-4", usuario_id: "usr-marina", titulo: "Pedido de voluntariado", texto: "Luciana Prates pediu para ser voluntária.", href: "/portal/voluntarios?aba=pedidos", lida: false, created_at: haMeses(0, 1) },
      { id: "not-5", usuario_id: "usr-marina", titulo: "Oficina lotada", texto: "Informática Básica atingiu o limite de vagas.", href: "/portal/oficinas/ofi-info", lida: false, created_at: haMeses(0, 1) },
    ],
    convites: [
      { id: "con-1", email: "beatriz.alencar@email.com", role: "responsavel", status: "pendente", created_at: haMeses(0, 2) },
      { id: "con-2", email: "henrique.dutra@email.com", role: "admin", status: "aceito", created_at: haMeses(1, 8) },
    ],
    pedidos_voluntario: [
      { id: "ped-1", nome: "Luciana Prates", email: "luciana.prates@email.com", telefone: "(32) 99100-4455", area: "Reforço escolar", disponibilidade: "Terças e quintas, à tarde", status: "pendente", created_at: haMeses(0, 3) },
      { id: "ped-2", nome: "Marcos Vinícius", email: "marcos.vinicius@email.com", telefone: "(32) 98877-1212", area: "Música", disponibilidade: "Sábados de manhã", status: "pendente", created_at: haMeses(0, 5) },
    ],
    metas: [
      { id: "met-1", titulo: "Pessoas atendidas no trimestre", alvo: 40, indicador: "assistidos" },
      { id: "met-2", titulo: "Inscrições no trimestre", alvo: 220, indicador: "inscricoes" },
      { id: "met-3", titulo: "Taxa de presença", alvo: 80, indicador: "presenca" },
    ],
    auditoria: [
      { id: "aud-1", usuario: "Matheus", acao: "criou", tabela: "eventos", descricao: "Festival de Cultura Popular", created_at: haMeses(0, 2) },
      { id: "aud-2", usuario: "José Roberto", acao: "alterou", tabela: "oficinas", descricao: "Informática Básica", created_at: haMeses(0, 4) },
      { id: "aud-3", usuario: "Vitor Leal", acao: "alterou", tabela: "presencas", descricao: "Presença em Aula de Violão", created_at: haMeses(0, 6) },
    ],
    mensagens: [
      { id: "msg-1", assunto: "Lembrete do Festival", texto: "O Festival de Cultura Popular está chegando. Contamos com você!", canal: "email", publico: "Inscritos no Festival de Cultura Popular", enviados: 13, autor: "Matheus", created_at: haMeses(0, 2) },
    ],
    consentimentos: [{ id: "usr-ana", versao: "1.0", aceito_em: haMeses(6, 1) }],
    seguranca: [],
  }
}
