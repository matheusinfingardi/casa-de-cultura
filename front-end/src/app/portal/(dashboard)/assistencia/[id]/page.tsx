"use client"

import { useParams } from "next/navigation"
import CarregarItem from "@/components/portal/entidades/carregar-item"
import FormAssistencia from "@/components/portal/entidades/form-assistencia"
import { assistenciaApi } from "@/lib/services/entidades"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return (
    <CarregarItem buscar={() => assistenciaApi.buscar(id)} voltarHref="/portal/assistencia" rotulo="Assistência">
      {(item) => <FormAssistencia item={item} />}
    </CarregarItem>
  )
}
