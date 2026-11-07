"use client"

import { useParams } from "next/navigation"
import CarregarItem from "@/components/portal/entidades/carregar-item"
import FormEvento from "@/components/portal/entidades/form-evento"
import { eventosApi } from "@/lib/services/entidades"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return (
    <CarregarItem buscar={() => eventosApi.buscar(id)} voltarHref="/portal/eventos" rotulo="Evento">
      {(item) => <FormEvento item={item} />}
    </CarregarItem>
  )
}
