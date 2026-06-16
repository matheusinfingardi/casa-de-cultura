import { supabase } from "@/lib/supabase"
import { notify } from "@/lib/notify"

export async function buscarEventos() {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")

  if (error) {
    console.error("Erro ao buscar eventos:", error)
    notify.error("Erro ao carregar eventos")
    return []
  }

  return data
}

export async function criarEvento(evento: {
  nome: string
  local: string
  tipo: string
  data: string
  horarioInicio: string
  horarioFim: string
  responsavel?: string
  responsavel_id?: string | null
}) {
  const { data, error } = await supabase
    .from("eventos")
    .insert([evento])
    .select()

  if (error) {
    console.error("Erro ao criar evento:", error)
    notify.error("Erro ao salvar evento")
    throw error
  }

  return data
}

export async function excluirEvento(id: string) {
  const { error } = await supabase
    .from("eventos")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Erro ao excluir evento:", error)
    notify.error("Erro ao excluir evento")
    throw error
  }
}

export async function buscarEventoPorId(id: string) {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar evento:", error)
    notify.error("Erro ao carregar evento")
    throw error
  }

  return data
}

export async function atualizarEvento(
  id: string,
  evento: {
    nome: string
    local: string
    tipo: string
    data: string
    horarioInicio: string
    horarioFim: string
    responsavel?: string
    responsavel_id?: string | null
  }
) {
  const { error } = await supabase
    .from("eventos")
    .update(evento)
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar evento:", error)
    notify.error("Erro ao salvar evento")
    throw error
  }
}