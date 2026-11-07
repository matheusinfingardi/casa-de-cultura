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

// --- Ficha do assistido e família --------------------------------------------
export type Ficha = { id: string; telefone: string; nascimento: string; endereco: string; responsavel_legal: string; necessidades: string; observacoes: string }
export const FICHA_VAZIA = { telefone: "", nascimento: "", endereco: "", responsavel_legal: "", necessidades: "", observacoes: "" }

export async function buscarFicha(id: string): Promise<Ficha> {
  const { data } = await supabase.from("fichas").select("*").eq("id", id).maybeSingle()
  return (data as Ficha | null) ?? { id, ...FICHA_VAZIA }
}
export async function salvarFicha(f: Ficha) {
  const { error } = await supabase.from("fichas").upsert([f])
  if (error) { notify.error("Não foi possível salvar a ficha"); throw error }
}

export type Dependente = { id: string; responsavel_id: string; nome: string; nascimento: string; parentesco: string; atividade: string }
export async function listarDependentes(responsavelId: string): Promise<Dependente[]> {
  return (await lista<Dependente>("dependentes", { col: "nome" })).filter((d) => d.responsavel_id === responsavelId)
}
export async function salvarDependente(d: Omit<Dependente, "id">) {
  await supabase.from("dependentes").insert([d])
}
export async function removerDependente(id: string) {
  await supabase.from("dependentes").delete().eq("id", id)
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

export type Disponibilidade = { id: string; dias: string[]; periodo: string; observacoes: string }
export async function buscarDisponibilidade(id: string): Promise<Disponibilidade> {
  const { data } = await supabase.from("disponibilidade").select("*").eq("id", id).maybeSingle()
  return (data as Disponibilidade | null) ?? { id, dias: [], periodo: "", observacoes: "" }
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
