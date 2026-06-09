import { supabase } from "@/lib/supabase";

export async function buscarCentros() {
  const { data, error } = await supabase
    .from("centros")
    .select("*");

  if (error) {
    console.error("Erro ao buscar centros:", error);
    return [];
  }

  return data;
}

export async function criarCentro(centro: {
  nome: string;
  responsavel: string;
  telefone: string;
  endereco: string;
}) {
  const { data, error } = await supabase
    .from("centros")
    .insert([centro])
    .select();

  if (error) {
    console.error("Erro ao criar centro:", error);
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
    throw error
  }
}