"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { BadgeCheck, CircleHelp } from "lucide-react"
import PaginaSimples from "@/components/comum/pagina-simples"
import { supabase } from "@/lib/supabase"

export default function VerificarPage() {
  const { id } = useParams<{ id: string }>()
  const [r, setR] = useState<{ item_nome?: string; status?: string } | null | undefined>(undefined)

  useEffect(() => {
    const codigo = decodeURIComponent(id)
    // Certificado de voluntário: vol~tabela~item~pessoa
    if (codigo.startsWith("vol~")) {
      const [, tabela, itemId, pessoa] = codigo.split("~")
      supabase.from(tabela).select("nome, responsavel_id, certificado_liberado").eq("id", itemId).maybeSingle().then(({ data }) => {
        const d = data as { nome?: string; responsavel_id?: string; certificado_liberado?: boolean } | null
        setR(d?.responsavel_id === pessoa && d.certificado_liberado ? { item_nome: d.nome, status: "presente" } : null)
      })
      return
    }
    supabase.from("presencas").select("item_nome, status").eq("id", codigo).maybeSingle().then(({ data }) => setR(data))
  }, [id])

  const valido = r?.status === "presente"
  return (
    <PaginaSimples titulo="Verificar certificado">
      {r === undefined ? <p>Verificando…</p> : valido ? (
        <p className="flex gap-2 rounded-xl bg-emerald-100 p-4 text-emerald-950"><BadgeCheck className="h-6 w-6 shrink-0" aria-hidden /> Certificado válido: {r?.item_nome}.</p>
      ) : (
        <p className="flex gap-2 rounded-xl bg-amber-100 p-4 text-amber-950"><CircleHelp className="h-6 w-6 shrink-0" aria-hidden /> Não foi possível confirmar este certificado.</p>
      )}
    </PaginaSimples>
  )
}
