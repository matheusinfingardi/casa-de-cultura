import { supabase } from "@/lib/supabase"
import { notify } from "@/lib/notify"

export type Role = "cliente" | "responsavel" | "admin"

export const ROLES: Role[] = ["cliente", "responsavel", "admin"]

export const ROLE_LABELS: Record<Role, string> = {
  cliente: "Cliente",
  responsavel: "Responsável",
  admin: "Admin",
}

export type Usuario = {
  id: string
  nome: string | null
  email: string | null
  role: Role
  created_at: string
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("nome", { ascending: true })

  if (error) {
    console.error("Erro ao listar usuários:", error)
    notify.error("Erro ao carregar usuários")
    return []
  }

  return data as Usuario[]
}

export async function listarResponsaveis(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "responsavel")
    .order("nome", { ascending: true })

  if (error) {
    console.error("Erro ao listar responsáveis:", error)
    notify.error("Erro ao carregar responsáveis")
    return []
  }

  return data as Usuario[]
}

export async function listarClientes(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "cliente")
    .order("nome", { ascending: true })

  if (error) {
    console.error("Erro ao listar clientes:", error)
    notify.error("Erro ao carregar clientes")
    return []
  }

  return data as Usuario[]
}

export async function atualizarRole(id: string, role: Role) {
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar papel do usuário:", error)
    notify.error("Erro ao atualizar papel do usuário")
    throw error
  }
}

export async function buscarMeuPerfil(): Promise<Usuario | null> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Erro ao buscar perfil:", error)
    return null
  }

  return data as Usuario
}
