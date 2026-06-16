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
