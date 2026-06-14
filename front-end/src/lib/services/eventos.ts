import { supabase } from "@/lib/supabase"

export async function buscarEventos() {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")

  if (error) {
    console.error("Erro ao buscar eventos:", error)
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
}) {
  const { data, error } = await supabase
    .from("eventos")
    .insert([evento])
    .select()

  if (error) {
    console.error("Erro ao criar evento:", error)
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
  }
) {
  const { error } = await supabase
    .from("eventos")
    .update(evento)
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar evento:", error)
    throw error
  }
}