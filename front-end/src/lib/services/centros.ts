import { supabase } from "@/lib/supabase";
import { notify } from "@/lib/notify";

export async function buscarCentros() {
  const { data, error } = await supabase
    .from("centros")
    .select("*");

  if (error) {
    console.error("Erro ao buscar centros:", error);
    notify.error("Erro ao carregar centros");
    return [];
  }

  return data;
}

export async function criarCentro(centro: {
  nome: string;
  responsavel: string;
  responsavel_id?: string | null;
  telefone: string;
  endereco: string;
}) {
  const { data, error } = await supabase
    .from("centros")
    .insert([centro])
    .select();

  if (error) {
    console.error("Erro ao criar centro:", error);
    notify.error("Erro ao salvar centro");
    throw error;
  }

  return data;
}

export async function excluirCentro(id: string) {
  const { error } = await supabase
    .from("centros")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Erro ao excluir centro:", error)
    notify.error("Erro ao excluir centro")
    throw error
  }
}

export async function buscarCentroPorId(id: string) {
  const { data, error } = await supabase
    .from("centros")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar centro:", error)
    notify.error("Erro ao carregar centro")
    throw error
  }

  return data
}

export async function atualizarCentro(
  id: string,
  centro: {
    nome: string
    responsavel: string
    responsavel_id?: string | null
    telefone: string
    endereco: string
  }
) {
  const { error } = await supabase
    .from("centros")
    .update(centro)
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar centro:", error)
    notify.error("Erro ao salvar centro")
    throw error
  }
}
