"use client"

import { Suspense } from "react"
import { useDemo } from "@/hooks/use-demo"
import type { ItemTipo } from "@/lib/services/presencas"
import Chamada from "./chamada"
import GestaoPresenca from "./gestao-presenca"

/** Na demonstração: chamada por dia. Na conta real, enquanto não existir a tabela de presença por dia: presença geral. */
export default function PresencaPagina(p: { tipo: ItemTipo; itemId: string; voltarHref: string; voltarLabel: string }) {
  const demo = useDemo()
  return demo ? <Suspense><Chamada {...p} /></Suspense> : <GestaoPresenca {...p} />
}
