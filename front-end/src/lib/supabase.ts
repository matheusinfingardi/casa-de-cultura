import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { clienteDemo } from "@/lib/demo/cliente"
import { ehDemo } from "@/lib/demo/modo"

let real: SupabaseClient | null = null

function clienteReal(): SupabaseClient {
  real ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sem-chave"
  )
  return real
}

/**
 * Usa o banco real ou, no modo demonstração, o cliente local. A escolha é feita a cada acesso;
 * os serviços não precisam saber qual está ativo.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_alvo, prop) {
    const alvo = (ehDemo() ? clienteDemo : clienteReal()) as unknown as Record<string | symbol, unknown>
    const v = alvo[prop]
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(alvo) : v
  },
})
