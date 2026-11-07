"use client"

import { useParams } from "next/navigation"
import CarregarItem from "@/components/portal/entidades/carregar-item"
import FormCentro from "@/components/portal/entidades/form-centro"
import { centrosApi } from "@/lib/services/entidades"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return (
    <CarregarItem buscar={() => centrosApi.buscar(id)} voltarHref="/portal/centros" rotulo="Centro">
      {(item) => <FormCentro item={item} />}
    </CarregarItem>
  )
}
