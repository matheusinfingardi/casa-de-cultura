import type { Role } from "@/lib/services/usuarios"

// Os três "públicos" do app. O papel técnico (Role) continua o mesmo do banco;
// aqui só definimos como cada um aparece na interface e para onde vai ao entrar.
export type Perfil = "assistido" | "voluntario" | "admin"

export const PERFIS: Perfil[] = ["assistido", "voluntario", "admin"]

export const PERFIL_ROLE: Record<Perfil, Role> = {
  assistido: "cliente",
  voluntario: "responsavel",
  admin: "admin",
}

export const ROLE_PERFIL: Record<Role, Perfil> = {
  cliente: "assistido",
  responsavel: "voluntario",
  admin: "admin",
}

export const PERFIL_INFO: Record<
  Perfil,
  { titulo: string; entrada: string; descricao: string; boasVindas: string; podeCadastrar: boolean }
> = {
  assistido: {
    titulo: "Assistido",
    entrada: "Sou assistido",
    descricao: "Participe de atividades, oficinas e eventos e acompanhe seus atendimentos.",
    boasVindas: "Acesse sua área para ver suas inscrições e o que está disponível.",
    podeCadastrar: true,
  },
  voluntario: {
    titulo: "Voluntário",
    entrada: "Sou voluntário",
    descricao: "Veja o que está sob sua responsabilidade e registre a presença.",
    boasVindas: "Acesse sua área para ver seus compromissos e registrar presenças.",
    podeCadastrar: false,
  },
  admin: {
    titulo: "Administração",
    entrada: "Administração",
    descricao: "Gerencie programação, atendimentos, centros e usuários.",
    boasVindas: "Acesso restrito à equipe de administração.",
    podeCadastrar: false,
  },
}

export function isPerfil(value: string | null): value is Perfil {
  return !!value && (PERFIS as string[]).includes(value)
}

// Para onde cada papel vai depois de entrar.
export function rotaInicial(role: Role | null | undefined): string {
  return role === "admin" ? "/portal" : "/painel"
}
