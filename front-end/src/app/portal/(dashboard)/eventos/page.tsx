"use client"

import { useRouter } from "next/navigation"
import CrudTable from "@/components/portal/crud-table"

export default function EventsPage() {
  const router = useRouter()

  const data = [
    {
      id: "1",
      name: "Ação Social Centro Norte",
      date: "2025-05-10",
    },
  ]

  return (
    <CrudTable
      title="Eventos"
      columns={[
        { label: "Nome", key: "name" },
        { label: "Data", key: "date" },
      ]}
      data={data}
      onCreate={() => router.push("/portal/eventos/novo")}
      onEdit={(item) => router.push(`/portal/eventos/${item.id}`)}
      onDelete={(id) => console.log("delete", id)}
    />
  )
}