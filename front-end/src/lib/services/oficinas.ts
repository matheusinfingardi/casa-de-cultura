import { supabase } from "@/lib/supabase"
import { notify } from "@/lib/notify"

export async function buscarOficinas() {
  const { data, error } = await supabase
    .from("oficinas")
    .select("*")

  if (error) {
    console.error("Erro ao buscar oficinas:", error)
    notify.error("Erro ao carregar oficinas")
    return []
  }

  return data
}

export async function criarOficina(oficina: {
  nome: string
  responsavel: string
  responsavel_id?: string | null
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

  if (error) {
    console.error("Erro ao criar oficina:", error)
    notify.error("Erro ao salvar oficina")
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
    notify.error("Erro ao excluir oficina")
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
    notify.error("Erro ao carregar oficina")
    throw error
  }

  return data
}

export async function atualizarOficina(
  id: string,
  oficina: {
    nome: string
    responsavel: string
    responsavel_id?: string | null
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
    notify.error("Erro ao salvar oficina")
    throw error
  }
}
