import { supabase } from "@/lib/supabase"
import { notify } from "@/lib/notify"

export type ItemDoCertificado = { tipo: string; id: string; nome: string }
export type CertificadoEmitido = {
  id: string
  pessoa_id: string
  pessoa_nome: string
  /** Quem cuida do dependente, para ele ver o certificado. */
  responsavel_id?: string | null
  papel: "participante" | "voluntario"
  titulo: string
  itens: ItemDoCertificado[]
  /** Datas das presenças que o certificado cobre. */
  datas: string[]
  horas: number
  emitido_por: string
  created_at: string
}

export async function listarCertificados(): Promise<CertificadoEmitido[]> {
  const { data, error } = await supabase.from("certificados").select("*").order("created_at", { ascending: false })
  if (error) return []
  return data as CertificadoEmitido[]
}
export const certificadosDaPessoa = async (id: string) => (await listarCertificados()).filter((c) => c.pessoa_id === id || c.responsavel_id === id)
export async function emitirCertificados(lista: Omit<CertificadoEmitido, "id" | "created_at">[]) {
  const { error } = await supabase.from("certificados").insert(lista)
  if (error) { notify.error("Não foi possível gerar os certificados"); throw error }
}
export async function cancelarCertificado(id: string) {
  await supabase.from("certificados").delete().eq("id", id)
}
