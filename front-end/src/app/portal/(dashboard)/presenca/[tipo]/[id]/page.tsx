"use client"

import { useParams } from "next/navigation"
import GestaoPresenca from "@/components/comum/gestao-presenca"
import { isItemTipo, ITEM_TIPO_TABLE } from "@/lib/services/presencas"

export default function PresencaAdminPage() {
  const { tipo, id } = useParams<{ tipo: string; id: string }>()
  if (!isItemTipo(tipo)) return <p className="text-sm text-muted-foreground">Tipo inválido.</p>
  return <GestaoPresenca tipo={tipo} itemId={id} voltarHref={`/portal/${ITEM_TIPO_TABLE[tipo]}`} voltarLabel="Voltar para a lista" />
}
