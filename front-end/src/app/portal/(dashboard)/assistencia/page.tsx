"use client"

import { useRouter } from "next/navigation"
import CrudPage from "@/components/portal/crud/crud-page"

export default function AssistenciaPage() {
  const router = useRouter()

  const data = [
    {
      id: "1",
      nome: "Psicologia Infantil",
      tipo: "Psicologia",
      responsavel: "Dra. Ana",
      local: "Centro Sul",
    },
    {
      id: "2",
      nome: "Nutrição",
      tipo: "Saúde",
      responsavel: "Dr. Carlos",
      local: "Centro Norte",
    },
  ]

  const columns = [
    "nome",
    "tipo",
    "responsavel",
    "local",
  ]

  return (
    <CrudPage
      title="Assistência"
      data={data}
      columns={columns}
      onCreate={() => router.push("/portal/assistencia/novo")}
      onEdit={(item) => router.push(`/portal/assistencia/${item.id}`)}
      onDelete={(id) => console.log(id)}
    />
  )
}