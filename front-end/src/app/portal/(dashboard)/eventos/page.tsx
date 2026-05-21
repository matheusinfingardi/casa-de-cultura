"use client"

import { useRouter } from "next/navigation"
import CrudPage from "@/components/portal/crud/crud-page"

export default function EventosPage() {
  const router = useRouter()

  const data = [
    {
      id: "1",
      nome: "Evento Social",
      local: "Centro Norte",
      tipo: "social",
      data: "10/06/2026",
      horarioInicio: "12:00",
      horarioFim: "14:00",
    },
  ]

  const columns = [
  "nome",
  "local",
  "tipo",
  "data",
  "horarioInicio",
  "horarioFim",
]

  return (
    <CrudPage
      title="Eventos"
      data={data}
      columns={columns}
      onCreate={() => router.push("/portal/eventos/novo")}
      onEdit={(item) => router.push(`/portal/eventos/${item.id}`)}
      onDelete={(id) => console.log(id)}
    />
  )
}