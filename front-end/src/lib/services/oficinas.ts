import { supabase } from "@/lib/supabase"

export async function buscarOficinas() {
  const { data, error } = await supabase
    .from("oficinas")
    .select("*")

  if (error) {
    console.error("Erro ao buscar oficinas:", error)
    return []
  }

  return data
}

export async function criarOficina(oficina: {
  nome: string
  responsavel: string
  vagas: number
  nivel: string
  local: string
  dia: string
  horarioInicio: string
  horarioFim: string
}) {
  const { data, error } = await supabase
    .from("oficinas")
    .insert([oficina])
    .select()

  console.log("DATA:", data)
  console.log("ERROR:", error)

  if (error) {
    console.error("Erro ao criar oficina:", error)
    throw error
  }

  return data
}

export async function excluirOficina(id: string) {
  const { error } = await supabase
    .from("oficinas")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Erro ao excluir oficina:", error)
    throw error
  }
}

export async function buscarOficinaPorId(id: string) {
  const { data, error } = await supabase
    .from("oficinas")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar oficina:", error)
    throw error
  }

  return data
}

export async function atualizarOficina(
  id: string,
  oficina: {
    nome: string
    responsavel: string
    vagas: number
    nivel: string
    local: string
    dia: string
    horarioInicio: string
    horarioFim: string
  }
) {
  const { error } = await supabase
    .from("oficinas")
    .update(oficina)
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar oficina:", error)
    throw error
  }
}