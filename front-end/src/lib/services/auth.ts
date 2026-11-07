import { CONTAS_TESTE, SENHA_TESTE } from "@/lib/demo/dados";
import { iniciarSessaoDemo } from "@/lib/demo/cliente";
import { supabase } from "@/lib/supabase";

export async function cadastrar(nome: string, email: string, senha: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome },
      emailRedirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth?mode=login`
          : undefined,
    },
  });

  return { data, error };
}

// ⚠️ TODO segurança: cria um admin a partir da rota aberta /admin-signup, enviando
// role='admin' no metadata (o trigger handle_new_user grava o papel). Como o signup é
// público, isso é forjável — intencional por enquanto. Travar depois (Edge Function
// com service_role) e remover esta função / o honra-role do trigger.
export async function cadastrarAdmin(nome: string, email: string, senha: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome, role: "admin" },
      emailRedirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth?mode=login`
          : undefined,
    },
  });

  return { data, error };
}

export async function entrar(email: string, senha: string) {
  // Contas de teste abrem a demonstração, sem tocar no banco real.
  const perfilTeste = CONTAS_TESTE[email.trim().toLowerCase()]
  if (perfilTeste && senha === SENHA_TESTE) {
    iniciarSessaoDemo(perfilTeste)
    const usuario = await supabase.auth.getUser()
    return { data: usuario.data, error: null, demonstracao: true }
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  return { data, error };
}

export async function sair() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/** Usuário da sessão atual (ou null). */
export async function obterSessaoUsuario() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

/** Avisa quando o usuário entra, sai ou a sessão expira. Retorna a função para cancelar. */
export function aoMudarSessao(cb: (user: import("@supabase/supabase-js").User | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_evento, session) => cb(session?.user ?? null))
  return () => data.subscription.unsubscribe()
}

export async function pedirRecuperacaoSenha(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/redefinir` : undefined,
  })
}

export async function alterarSenha(senha: string) {
  return supabase.auth.updateUser({ password: senha })
}

export async function alterarNome(nome: string) {
  return supabase.auth.updateUser({ data: { nome } })
}
