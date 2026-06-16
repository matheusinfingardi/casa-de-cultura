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
