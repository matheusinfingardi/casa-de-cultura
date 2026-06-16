import { supabase } from "@/lib/supabase"
import { notify } from "@/lib/notify"

export async function buscarAtividades() {
  const { data, error } = await supabase
    .from("atividades")
    .select("*")

  if (error) {
    console.error("Erro ao buscar atividades:", error)
    notify.error("Erro ao carregar atividades")
    return []
  }

  return data
}

export async function criarAtividade(atividade: {
  nome: string
  responsavel: string
  responsavel_id?: string | null
  local: string
  recorrencia: any
}) {
  const { data, error } = await supabase
    .from("atividades")
    .insert([atividade])
    .select()

  if (error) {
    console.error("Erro ao criar atividade:", error)
    notify.error("Erro ao salvar atividade")
    throw error
  }

  return data
}

export async function excluirAtividade(id: string) {
  const { error } = await supabase
    .from("atividades")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Erro ao excluir atividade:", error)
    notify.error("Erro ao excluir atividade")
    throw error
  }
}

export async function buscarAtividadePorId(id: string) {
  const { data, error } = await supabase
    .from("atividades")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar atividade:", error)
    notify.error("Erro ao carregar atividade")
    throw error
  }

  return data
}

export async function atualizarAtividade(
  id: string,
  atividade: {
    nome: string
    responsavel: string
    responsavel_id?: string | null
    local: string
    recorrencia: any
  }
) {
  const { error } = await supabase
    .from("atividades")
    .update(atividade)
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar atividade:", error)
    notify.error("Erro ao salvar atividade")
    throw error
  }
}