"use client"

import { useParams } from "next/navigation"
import CarregarItem from "@/components/portal/entidades/carregar-item"
import FormOficina from "@/components/portal/entidades/form-oficina"
import { oficinasApi } from "@/lib/services/entidades"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return (
    <CarregarItem buscar={() => oficinasApi.buscar(id)} voltarHref="/portal/oficinas" rotulo="Oficina">
      {(item) => <FormOficina item={item} />}
    </CarregarItem>
  )
}
