"use client"

import { useParams } from "next/navigation"
import AuthGuard from "@/components/auth/auth-guard"
import PresencaPagina from "@/components/comum/presenca-pagina"
import { isItemTipo } from "@/lib/services/presencas"

export default function PresencaVoluntarioPage() {
  const { tipo, id } = useParams<{ tipo: string; id: string }>()
  if (!isItemTipo(tipo)) return <p className="text-sm text-muted-foreground">Tipo inválido.</p>
  return (
    <AuthGuard allow={["responsavel"]} redirectTo="/painel">
      <PresencaPagina tipo={tipo} itemId={id} voltarHref="/painel" voltarLabel="Meus compromissos" />
    </AuthGuard>
  )
}
