"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { BadgeCheck, CircleHelp } from "lucide-react"
import PaginaSimples from "@/components/comum/pagina-simples"
import { supabase } from "@/lib/supabase"

export default function VerificarPage() {
  const { id } = useParams<{ id: string }>()
  const [r, setR] = useState<{ titulo?: string; pessoa_nome?: string } | null | undefined>(undefined)

  useEffect(() => {
    supabase.from("certificados").select("titulo, pessoa_nome").eq("id", decodeURIComponent(id)).maybeSingle().then(({ data }) => setR(data))
  }, [id])

  return (
    <PaginaSimples titulo="Verificar certificado">
      {r === undefined ? <p>Verificando…</p> : r ? (
        <p className="flex gap-2 rounded-xl bg-emerald-100 p-4 text-emerald-950"><BadgeCheck className="h-6 w-6 shrink-0" aria-hidden /> Certificado válido: {r.titulo}, em nome de {r.pessoa_nome}.</p>
      ) : (
        <p className="flex gap-2 rounded-xl bg-amber-100 p-4 text-amber-950"><CircleHelp className="h-6 w-6 shrink-0" aria-hidden /> Não foi possível confirmar este certificado.</p>
      )}
    </PaginaSimples>
  )
}
