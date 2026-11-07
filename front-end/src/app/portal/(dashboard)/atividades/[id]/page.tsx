"use client"

import { useParams } from "next/navigation"
import CarregarItem from "@/components/portal/entidades/carregar-item"
import FormAtividade from "@/components/portal/entidades/form-atividade"
import { atividadesApi } from "@/lib/services/entidades"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return (
    <CarregarItem buscar={() => atividadesApi.buscar(id)} voltarHref="/portal/atividades" rotulo="Atividade">
      {(item) => <FormAtividade item={item} />}
    </CarregarItem>
  )
}
