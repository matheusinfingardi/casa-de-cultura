import { supabase } from "@/lib/supabase"
import { notify } from "@/lib/notify"

type Rotulos = { singular: string; plural: string }

/**
 * CRUD genérico de uma tabela. É AQUI (e em services/*) que o app conversa com o banco:
 * nenhum componente importa o cliente do Supabase diretamente. Para migrar para outro
 * back-end (Postgres próprio + API), basta reimplementar estas funções.
 */
export function criarServico<T extends { id: string }, I extends object>(tabela: string, r: Rotulos) {
  return {
    async listar(): Promise<T[]> {
      const { data, error } = await supabase.from(tabela).select("*")
      if (error) {
        console.error(`Erro ao listar ${r.plural}:`, error)
        notify.error(`Não foi possível carregar ${r.plural}`)
        return []
      }
      return (data ?? []) as T[]
    },

    async buscar(id: string): Promise<T | null> {
      const { data, error } = await supabase.from(tabela).select("*").eq("id", id).single()
      if (error) {
        console.error(`Erro ao buscar ${r.singular}:`, error)
        return null
      }
      return data as T
    },

    async criar(input: I): Promise<T> {
      const { data, error } = await supabase.from(tabela).insert([input]).select()
      if (error) {
        console.error(`Erro ao criar ${r.singular}:`, error)
        notify.error(`Não foi possível salvar ${r.singular}`)
        throw error
      }
      return (data?.[0] ?? null) as T
    },

    async atualizar(id: string, input: I): Promise<void> {
      const { error } = await supabase.from(tabela).update(input).eq("id", id)
      if (error) {
        console.error(`Erro ao atualizar ${r.singular}:`, error)
        notify.error(`Não foi possível salvar ${r.singular}`)
        throw error
      }
    },

    async excluir(id: string): Promise<void> {
      const { error } = await supabase.from(tabela).delete().eq("id", id)
      if (error) {
        console.error(`Erro ao excluir ${r.singular}:`, error)
        notify.error(`Não foi possível excluir ${r.singular}`)
        throw error
      }
    },
  }
}
