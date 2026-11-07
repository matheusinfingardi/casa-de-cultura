// Recursos novos (notificações, lista de espera, ficha, convites, metas, auditoria…).
// Usam as mesmas chamadas do banco real, mas dependem de tabelas que o back-end ainda vai criar.
// Enquanto isso, funcionam no modo demonstração.
import { supabase } from "@/lib/supabase"
import { notify } from "@/lib/notify"
import type { ItemTipo } from "./presencas"

async function lista<T>(tabela: string, ordem?: { col: string; asc?: boolean }): Promise<T[]> {
  let q = supabase.from(tabela).select("*")
  if (ordem) q = q.order(ordem.col, { ascending: ordem.asc ?? true })
  const { data, error } = await q
  if (error) {
    console.error(`Erro em ${tabela}:`, error)
    return []
  }
  return (data ?? []) as T[]
}

async function meuId() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

// --- Notificações -------------------------------------------------------------
export type Notificacao = { id: string; usuario_id: string; titulo: string; texto: string; href?: string; lida: boolean; created_at: string }

export async function listarNotificacoes(): Promise<Notificacao[]> {
  const id = await meuId()
  const todas = await lista<Notificacao>("notificacoes", { col: "created_at", asc: false })
  return todas.filter((n) => n.usuario_id === id)
}
export async function marcarNotificacoesLidas() {
  const id = await meuId()
  if (id) await supabase.from("notificacoes").update({ lida: true }).eq("usuario_id", id)
}
export async function notificar(usuario_id: string, titulo: string, texto: string, href?: string) {
  await supabase.from("notificacoes").insert([{ usuario_id, titulo, texto, href, lida: false }])
}

// --- Lista de espera ----------------------------------------------------------
export type Espera = { id: string; item_tipo: ItemTipo; item_id: string; item_nome: string | null; cliente_id: string; created_at: string }

export async function listarEspera(tipo: ItemTipo, itemId: string): Promise<Espera[]> {
  const todas = await lista<Espera>("lista_espera", { col: "created_at" })
  return todas.filter((e) => e.item_tipo === tipo && e.item_id === itemId)
}
export async function minhaEspera(): Promise<Espera[]> {
  const id = await meuId()
  return (await lista<Espera>("lista_espera", { col: "created_at" })).filter((e) => e.cliente_id === id)
}
export async function entrarNaEspera(tipo: ItemTipo, itemId: string, itemNome: string | null) {
  const id = await meuId()
  if (!id) return
  await supabase.from("lista_espera").insert([{ item_tipo: tipo, item_id: itemId, item_nome: itemNome, cliente_id: id }])
}
export async function sairDaEspera(esperaId: string) {
  await supabase.from("lista_espera").delete().eq("id", esperaId)
}
/** Quando abre uma vaga, a primeira pessoa da fila entra na turma e é avisada. */
export async function promoverDaEspera(tipo: ItemTipo, itemId: string): Promise<string | null> {
  const fila = await listarEspera(tipo, itemId)
  const primeira = fila[0]
  if (!primeira) return null
  await supabase.from("presencas").insert([{ item_tipo: tipo, item_id: itemId, item_nome: primeira.item_nome, cliente_id: primeira.cliente_id, status: "marcada" }])
  await sairDaEspera(primeira.id)
  await notificar(primeira.cliente_id, "Sua vaga foi liberada!", `Você saiu da lista de espera e já está inscrito em ${primeira.item_nome}.`, "/painel/inscricoes")
  return primeira.cliente_id
}

// --- Presença dia a dia --------------------------------------------------------
export type StatusDia = "presente" | "ausente"
export type Registro = { id: string; item_tipo: ItemTipo; item_id: string; data: string; cliente_id: string; status: StatusDia }

export const listarRegistros = () => lista<Registro>("registros")
export async function registrosDoItem(tipo: ItemTipo, itemId: string): Promise<Registro[]> {
  return (await listarRegistros()).filter((r) => r.item_tipo === tipo && r.item_id === itemId)
}
export async function registrosDaPessoa(id: string): Promise<Registro[]> {
  return (await listarRegistros()).filter((r) => r.cliente_id === id)
}
/** Marca presença ou falta de uma pessoa em um dia. `null` apaga a marcação. */
export async function marcarDia(tipo: ItemTipo, itemId: string, data: string, clienteId: string, status: StatusDia | null) {
  const atuais = (await registrosDoItem(tipo, itemId)).filter((r) => r.data === data && r.cliente_id === clienteId)
  await Promise.all(atuais.map((r) => supabase.from("registros").delete().eq("id", r.id)))
  if (status) await supabase.from("registros").insert([{ item_tipo: tipo, item_id: itemId, data, cliente_id: clienteId, status }])
  // A situação geral da inscrição acompanha a última marcação.
  if (status) await supabase.from("presencas").update({ status }).eq("item_id", itemId).eq("cliente_id", clienteId)
}

// --- Ficha da pessoa e família --------------------------------------------------
export type Ficha = {
  id: string; telefone: string; nascimento: string; endereco: string; bairro: string; responsavel_legal: string; contato_emergencia: string; autoriza_imagem: boolean
  deficiencia: string; necessidades: string; evitar?: string; saude: string; medicamentos: string; alergias: string; acessibilidade: string
  beneficios: string[]; renda: string; moradia: string; escolaridade: string; trabalho: string; transporte: string; observacoes: string
}
export const FICHA_VAZIA: Omit<Ficha, "id"> = {
  telefone: "", nascimento: "", endereco: "", bairro: "", responsavel_legal: "", contato_emergencia: "", autoriza_imagem: false,
  deficiencia: "", necessidades: "", saude: "", medicamentos: "", alergias: "", acessibilidade: "",
  beneficios: [], renda: "", moradia: "", escolaridade: "", trabalho: "", transporte: "", observacoes: "",
}

export async function buscarFicha(id: string): Promise<Ficha> {
  const { data } = await supabase.from("fichas").select("*").eq("id", id).maybeSingle()
  return { id, ...FICHA_VAZIA, ...((data as Partial<Ficha> | null) ?? {}) }
}
export const listarFichas = () => lista<Ficha>("fichas")
export async function salvarFicha(f: Ficha) {
  const { error } = await supabase.from("fichas").upsert([f])
  if (error) { notify.error("Não foi possível salvar a ficha"); throw error }
}

export type Dependente = { id: string; responsavel_id: string; nome: string; nascimento: string; parentesco: string; atividade: string; mora_junto?: boolean; parente_id?: string | null; telefone?: string; deficiencia?: string; cuidados?: string; escola?: string }
export async function listarDependentes(responsavelId: string): Promise<Dependente[]> {
  return (await lista<Dependente>("dependentes", { col: "nome" })).filter((d) => d.responsavel_id === responsavelId)
}
export const listarTodosDependentes = () => lista<Dependente>("dependentes", { col: "nome" })
export async function atualizarDependente(id: string, d: Partial<Dependente>) {
  await supabase.from("dependentes").update(d).eq("id", id)
}
export async function salvarDependente(d: Omit<Dependente, "id">) {
  await supabase.from("dependentes").insert([d])
}
export async function removerDependente(id: string) {
  await supabase.from("dependentes").delete().eq("id", id)
}

// --- Acompanhamento pela equipe ---------------------------------------------------
export type NotaAcompanhamento = { id: string; pessoa_id: string; autor: string; tipo: string; texto: string; proximo_passo: string; created_at: string; passo_feito?: boolean }
export async function listarAcompanhamento(pessoaId: string): Promise<NotaAcompanhamento[]> {
  return (await lista<NotaAcompanhamento>("acompanhamento", { col: "created_at", asc: false })).filter((n) => n.pessoa_id === pessoaId)
}
export async function atualizarNota(id: string, n: Partial<NotaAcompanhamento>) {
  await supabase.from("acompanhamento").update(n).eq("id", id)
}
export async function salvarNota(n: Omit<NotaAcompanhamento, "id" | "created_at">) {
  await supabase.from("acompanhamento").insert([n])
}

// --- Convites e pedidos de voluntariado --------------------------------------
export type Convite = { id: string; email: string; role: string; status: "pendente" | "aceito" | "cancelado"; created_at: string }
export const listarConvites = () => lista<Convite>("convites", { col: "created_at", asc: false })
export async function criarConvite(email: string, role: string) {
  await supabase.from("convites").insert([{ email, role, status: "pendente" }])
}
export async function cancelarConvite(id: string) {
  await supabase.from("convites").update({ status: "cancelado" }).eq("id", id)
}

export type PedidoVoluntario = { id: string; nome: string; email: string; telefone: string; area: string; disponibilidade: string; status: "pendente" | "aprovado" | "recusado"; created_at: string }
export const listarPedidos = () => lista<PedidoVoluntario>("pedidos_voluntario", { col: "created_at", asc: false })
export async function criarPedido(p: Omit<PedidoVoluntario, "id" | "status" | "created_at">) {
  await supabase.from("pedidos_voluntario").insert([{ ...p, status: "pendente" }])
}
export async function responderPedido(p: PedidoVoluntario, aprovado: boolean) {
  await supabase.from("pedidos_voluntario").update({ status: aprovado ? "aprovado" : "recusado" }).eq("id", p.id)
  if (aprovado) await criarConvite(p.email, "responsavel")
}

export const AREAS_AJUDA = ["Música", "Artes", "Esporte", "Educação", "Informática", "Cozinha", "Psicologia", "Assistência social", "Saúde", "Jurídico", "Fotografia", "Eventos", "Transporte", "Comunicação", "Administração"]
/** Sugestões de tarefas concretas. A pessoa também pode escrever as suas. */
export const SUGESTOES_TAREFAS = [
  "Dar aulas ou conduzir oficinas", "Ajudar um professor em sala", "Reforço escolar", "Acolher quem chega", "Fazer a chamada das atividades",
  "Ajudar na organização de eventos", "Arrecadar e separar doações", "Montar e entregar cestas", "Transportar pessoas ou doações", "Cozinhar ou servir lanches",
  "Tirar fotos e gravar vídeos", "Cuidar das redes sociais", "Dar apoio em computadores", "Pequenos consertos e manutenção", "Orientação jurídica ou de saúde", "Traduzir para Libras",
]
export type FaixaHorario = { inicio: string; fim: string }
export type Disponibilidade = {
  id: string
  // Pessoal
  telefone: string; whatsapp: boolean; nascimento: string; bairro: string; cidade: string; contato_emergencia: string; autoriza_imagem: boolean
  // Profissional
  profissao: string; local_trabalho: string; formacao: string; escolaridade: string; registro_profissional: string; idiomas: string; habilidades: string; experiencia: string
  // Disponibilidade
  horarios: Record<string, FaixaHorario[]>; frequencia: string; unidades: string[]; tem_transporte: boolean; observacoes: string
  // Como pode ajudar
  areas: string[]; tarefas: string[]; outras_ideias: string; interesses: string[]
}
export const VOLUNTARIO_VAZIO: Omit<Disponibilidade, "id"> = {
  telefone: "", whatsapp: true, nascimento: "", bairro: "", cidade: "Juiz de Fora", contato_emergencia: "", autoriza_imagem: false,
  profissao: "", local_trabalho: "", formacao: "", escolaridade: "", registro_profissional: "", idiomas: "", habilidades: "", experiencia: "",
  horarios: {}, frequencia: "", unidades: [], tem_transporte: false, observacoes: "",
  areas: [], tarefas: [], outras_ideias: "", interesses: [],
}
export const listarDisponibilidades = () => lista<Disponibilidade>("disponibilidade")
export async function buscarDisponibilidade(id: string): Promise<Disponibilidade> {
  const { data } = await supabase.from("disponibilidade").select("*").eq("id", id).maybeSingle()
  return { id, ...VOLUNTARIO_VAZIO, ...((data as Partial<Disponibilidade> | null) ?? {}) }
}
export async function salvarDisponibilidade(d: Disponibilidade) {
  await supabase.from("disponibilidade").upsert([d])
}

// --- Metas, auditoria e comunicação ------------------------------------------
export type Meta = { id: string; titulo: string; alvo: number; indicador: "assistidos" | "inscricoes" | "presenca" }
export const listarMetas = () => lista<Meta>("metas")
export async function salvarMeta(id: string, alvo: number) {
  await supabase.from("metas").update({ alvo }).eq("id", id)
}

export type RegistroAuditoria = { id: string; usuario: string; acao: string; tabela: string; descricao: string; created_at: string }
export const listarAuditoria = () => lista<RegistroAuditoria>("auditoria", { col: "created_at", asc: false })

export type Mensagem = { id: string; assunto: string; texto: string; canal: "email" | "whatsapp" | "app"; publico: string; enviados: number; autor: string; created_at: string }
export const listarMensagens = () => lista<Mensagem>("mensagens", { col: "created_at", asc: false })
export async function enviarMensagem(m: Omit<Mensagem, "id" | "created_at">, destinatarios: string[]) {
  await supabase.from("mensagens").insert([m])
  await Promise.all(destinatarios.map((id) => notificar(id, m.assunto, m.texto)))
}

// --- LGPD e segurança ---------------------------------------------------------
export async function registrarConsentimento(id: string, versao = "1.0") {
  await supabase.from("consentimentos").upsert([{ id, versao, aceito_em: new Date().toISOString() }])
}
export async function buscarConsentimento(id: string): Promise<{ versao: string; aceito_em: string } | null> {
  const { data } = await supabase.from("consentimentos").select("*").eq("id", id).maybeSingle()
  return (data as { versao: string; aceito_em: string } | null) ?? null
}
export type Seguranca = { id: string; totp_segredo: string | null }
export async function buscarSeguranca(id: string): Promise<Seguranca> {
  const { data } = await supabase.from("seguranca").select("*").eq("id", id).maybeSingle()
  return (data as Seguranca | null) ?? { id, totp_segredo: null }
}
export async function salvarSeguranca(s: Seguranca) {
  await supabase.from("seguranca").upsert([s])
}

/** Tudo o que o sistema guarda sobre a pessoa, para ela baixar. */
export async function exportarMeusDados(id: string) {
  const buscar = async (tabela: string, col: string) => {
    const { data } = await supabase.from(tabela).select("*").eq(col, id)
    return data ?? []
  }
  return {
    gerado_em: new Date().toISOString(),
    perfil: await buscar("profiles", "id"),
    ficha: await buscar("fichas", "id"),
    dependentes: await buscar("dependentes", "responsavel_id"),
    inscricoes: await buscar("presencas", "cliente_id"),
    lista_de_espera: await buscar("lista_espera", "cliente_id"),
    consentimento: await buscar("consentimentos", "id"),
  }
}
export async function excluirMinhaConta(id: string) {
  await Promise.all([
    supabase.from("presencas").delete().eq("cliente_id", id),
    supabase.from("lista_espera").delete().eq("cliente_id", id),
    supabase.from("dependentes").delete().eq("responsavel_id", id),
    supabase.from("fichas").delete().eq("id", id),
  ])
  await supabase.from("profiles").delete().eq("id", id)
}
