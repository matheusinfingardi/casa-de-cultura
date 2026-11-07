"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import EstadoVazio from "@/components/comum/estado-vazio"

/** Busca um item pelo id e entrega ao formulário de edição; trata carregando e "não encontrado". */
export default function CarregarItem<T>({
  buscar, voltarHref, rotulo, children,
}: {
  buscar: () => Promise<T | null>
  voltarHref: string
  rotulo: string
  children: (item: T) => React.ReactNode
}) {
  const [estado, setEstado] = useState<{ item: T | null } | null>(null)

  useEffect(() => {
    let ativo = true
    buscar().then((item) => ativo && setEstado({ item }))
    return () => { ativo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!estado) {
    return (
      <div className="mx-auto max-w-3xl space-y-4" aria-busy="true" aria-label="Carregando">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (!estado.item) {
    return (
      <div className="mx-auto max-w-3xl">
        <EstadoVazio
          icon={SearchX}
          titulo={`${rotulo} não encontrado`}
          texto="Ele pode ter sido excluído por outra pessoa."
          acao={<Button asChild variant="outline"><Link href={voltarHref}>Voltar para a lista</Link></Button>}
        />
      </div>
    )
  }

  return <>{children(estado.item)}</>
}
