import { supabase } from "@/lib/supabase"
import { notify } from "@/lib/notify"

export type PresencaStatus = "marcada" | "presente" | "ausente"

export const PRESENCA_STATUS: PresencaStatus[] = ["marcada", "presente", "ausente"]

export const PRESENCA_LABELS: Record<PresencaStatus, string> = {
  marcada: "Marcada",
  presente: "Presente",
  ausente: "Ausente",
}

// --- Tipos de item que aceitam presença --------------------------------------
export type ItemTipo = "atividade" | "evento" | "oficina" | "centro" | "assistencia"

export const ITEM_TIPOS: ItemTipo[] = [
  "atividade",
  "evento",
  "oficina",
  "centro",
  "assistencia",
]

export const ITEM_TIPO_LABELS: Record<ItemTipo, string> = {
  atividade: "Atividade",
  evento: "Evento",
  oficina: "Oficina",
  centro: "Centro",
  assistencia: "Assistência",
}

// Mapeia o tipo (singular) para o nome da tabela no Supabase.
export const ITEM_TIPO_TABLE: Record<ItemTipo, string> = {
  atividade: "atividades",
  evento: "eventos",
  oficina: "oficinas",
  centro: "centros",
  assistencia: "assistencia",
}

// Coluna que serve de "local" por tipo (centros usa 'endereco', sem coluna 'local').
export const ITEM_TIPO_LOCAL: Record<ItemTipo, string> = {
  atividade: "local",
  evento: "local",
  oficina: "local",
  centro: "endereco",
  assistencia: "local",
}

export function isItemTipo(value: string): value is ItemTipo {
  return (ITEM_TIPOS as string[]).includes(value)
}

async function meuId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

// --- Cliente: minhas presenças (nome do item denormalizado, sem join) --------
export type MinhaPresenca = {
  id: string
  status: PresencaStatus
  item_tipo: ItemTipo
  item_id: string
  item_nome: string | null
}

export async function listarMinhasPresencas(): Promise<MinhaPresenca[]> {
  const id = await meuId()
  if (!id) return []

  const { data, error } = await supabase
    .from("presencas")
    .select("id, status, item_tipo, item_id, item_nome")
    .eq("cliente_id", id)

  if (error) {
    console.error("Erro ao listar minhas presenças:", error)
    notify.error("Erro ao carregar suas inscrições")
    return []
  }

  return data as MinhaPresenca[]
}

// --- Responsável: itens sob sua responsabilidade (das 5 tabelas) -------------
export type ItemResponsavel = {
  tipo: ItemTipo
  id: string
  nome: string | null
  local: string | null
}

export async function listarItensDoResponsavel(): Promise<ItemResponsavel[]> {
  const id = await meuId()
  if (!id) return []

  let houveErro = false
  const results = await Promise.all(
    ITEM_TIPOS.map(async (tipo) => {
      const { data, error } = await supabase
        .from(ITEM_TIPO_TABLE[tipo])
        .select(`id, nome, local:${ITEM_TIPO_LOCAL[tipo]}`)
        .eq("responsavel_id", id)

      if (error) {
        console.error(`Erro ao listar ${tipo}:`, error)
        houveErro = true
        return []
      }

      return (data ?? []).map((item: any) => ({
        tipo,
        id: item.id,
        nome: item.nome ?? null,
        local: item.local ?? null,
      }))
    })
  )

  if (houveErro) notify.error("Erro ao carregar seus itens")
  return results.flat()
}

// --- Cliente: todos os itens disponíveis (das 5 tabelas) ---------------------
export async function listarTodosItens(): Promise<ItemResponsavel[]> {
  let houveErro = false
  const results = await Promise.all(
    ITEM_TIPOS.map(async (tipo) => {
      const { data, error } = await supabase
        .from(ITEM_TIPO_TABLE[tipo])
        .select(`id, nome, local:${ITEM_TIPO_LOCAL[tipo]}`)

      if (error) {
        console.error(`Erro ao listar ${tipo}:`, error)
        houveErro = true
        return []
      }

      return (data ?? []).map((item: any) => ({
        tipo,
        id: item.id,
        nome: item.nome ?? null,
        local: item.local ?? null,
      }))
    })
  )

  if (houveErro) notify.error("Erro ao carregar itens disponíveis")
  return results.flat()
}

// Cliente se inscreve em um item (cria a própria presença como 'marcada').
export async function inscreverMe(
  tipo: ItemTipo,
  itemId: string,
  itemNome: string | null
) {
  const id = await meuId()
  if (!id) throw new Error("Usuário não autenticado")

  const { error } = await supabase.from("presencas").insert([
    {
      item_tipo: tipo,
      item_id: itemId,
      item_nome: itemNome,
      cliente_id: id,
      status: "marcada",
    },
  ])

  if (error) {
    console.error("Erro ao se inscrever:", error)
    notify.error("Erro ao se inscrever")
    throw error
  }
}

// --- Detalhe de um item (para o título da tela de presença) ------------------
export async function buscarItem(
  tipo: ItemTipo,
  id: string
): Promise<{ nome: string | null; local: string | null } | null> {
  const { data, error } = await supabase
    .from(ITEM_TIPO_TABLE[tipo])
    .select(`nome, local:${ITEM_TIPO_LOCAL[tipo]}`)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar item:", error)
    notify.error("Erro ao carregar o item")
    return null
  }

  return data as unknown as { nome: string | null; local: string | null }
}

// --- Presenças de um item (com dados do cliente) -----------------------------
export type PresencaDoItem = {
  id: string
  status: PresencaStatus
  cliente_id: string
  profiles: {
    nome: string | null
    email: string | null
  } | null
}

export async function listarPresencasDoItem(
  tipo: ItemTipo,
  itemId: string
): Promise<PresencaDoItem[]> {
  const { data, error } = await supabase
    .from("presencas")
    .select("id, status, cliente_id, profiles(nome, email)")
    .eq("item_tipo", tipo)
    .eq("item_id", itemId)

  if (error) {
    console.error("Erro ao listar presenças do item:", error)
    notify.error("Erro ao carregar as presenças")
    return []
  }

  return data as unknown as PresencaDoItem[]
}

export async function matricularCliente(
  tipo: ItemTipo,
  itemId: string,
  itemNome: string | null,
  clienteId: string
) {
  const { error } = await supabase.from("presencas").insert([
    {
      item_tipo: tipo,
      item_id: itemId,
      item_nome: itemNome,
      cliente_id: clienteId,
      status: "marcada",
    },
  ])

  if (error) {
    console.error("Erro ao matricular cliente:", error)
    notify.error("Erro ao matricular cliente")
    throw error
  }
}

export async function atualizarStatusPresenca(id: string, status: PresencaStatus) {
  const { error } = await supabase
    .from("presencas")
    .update({ status })
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar status da presença:", error)
    notify.error("Erro ao atualizar presença")
    throw error
  }
}

export async function removerPresenca(id: string) {
  const { error } = await supabase
    .from("presencas")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Erro ao remover presença:", error)
    notify.error("Erro ao remover presença")
    throw error
  }
}
