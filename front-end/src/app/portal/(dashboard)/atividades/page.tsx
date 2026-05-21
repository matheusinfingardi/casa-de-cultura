"use client"

import { useRouter } from "next/navigation"
import CrudTable from "@/components/portal/crud-table"

export default function ActivitiesPage() {
  const router = useRouter()

  const data = [
    { id: "1", name: "Aula de Reforço Escolar", type: "Educação" },
    { id: "2", name: "Aula de Música", type: "Cultural" },
  ]

  return (
    <CrudTable
      title="Atividades"
      columns={[
        { label: "Nome", key: "name" },
        { label: "Tipo", key: "type" },
      ]}
      data={data}
      onCreate={() => router.push("/portal/atividades/novo")}
      onEdit={(item) => router.push(`/portal/atividades/${item.id}`)}
      onDelete={(id) => console.log("delete activity", id)}
    />
  )
}