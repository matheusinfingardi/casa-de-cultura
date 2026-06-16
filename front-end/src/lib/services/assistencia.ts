import { supabase } from "@/lib/supabase"
import { notify } from "@/lib/notify"

export async function buscarAssistencias() {
  const { data, error } = await supabase
    .from("assistencia")
    .select("*")

  if (error) {
    console.error("Erro ao buscar assistências:", error)
    notify.error("Erro ao carregar assistências")
    return []
  }

  return data
}

export async function criarAssistencia(assistencia: {
  nome: string
  tipo: string
  responsavel: string
  responsavel_id?: string | null
  local: string
}) {
  const { data, error } = await supabase
    .from("assistencia")
    .insert([assistencia])
    .select()

  if (error) {
    console.error("Erro ao criar assistência:", error)
    notify.error("Erro ao salvar assistência")
    throw error
  }

  return data
}

export async function excluirAssistencia(id: string) {
  const { error } = await supabase
    .from("assistencia")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Erro ao excluir assistência:", error)
    notify.error("Erro ao excluir assistência")
    throw error
  }
}

export async function buscarAssistenciaPorId(id: string) {
  const { data, error } = await supabase
    .from("assistencia")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar assistência:", error)
    notify.error("Erro ao carregar assistência")
    throw error
  }

  return data
}

export async function atualizarAssistencia(
  id: string,
  assistencia: {
    nome: string
    tipo: string
    responsavel: string
    responsavel_id?: string | null
    local: string
  }
) {
  const { error } = await supabase
    .from("assistencia")
    .update(assistencia)
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar assistência:", error)
    notify.error("Erro ao salvar assistência")
    throw error
  }
}
