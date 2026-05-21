"use client"

import { useRouter } from "next/navigation"
import CrudTable from "@/components/portal/crud-table"

export default function WorkshopsPage() {
  const router = useRouter()

  const data = [
    { id: "1", name: "Oficina de Cabelo", duration: "2h" },
    { id: "2", name: "Oficina de Manicure", duration: "3h" },
  ]

  return (
    <CrudTable
      title="Oficinas"
      columns={[
        { label: "Nome", key: "name" },
        { label: "Duração", key: "duration" },
      ]}
      data={data}
      onCreate={() => router.push("/portal/oficinas/novo")}
      onEdit={(item) => router.push(`/portal/oficinas/${item.id}`)}
      onDelete={(id) => console.log("delete workshop", id)}
    />
  )
}