"use client"

import { useRouter } from "next/navigation"
import CrudTable from "@/components/portal/crud-table"

export default function AssistancePage() {
  const router = useRouter()

  const data = [
    { id: "1", name: "Psicologia", professional: "Dr. João" },
    { id: "2", name: "Fonoaudiologia", professional: "Dra. Maria" },
  ]

  return (
    <CrudTable
      title="Assistência"
      columns={[
        { label: "Serviço", key: "name" },
        { label: "Profissional", key: "professional" },
      ]}
      data={data}
      onCreate={() => router.push("/portal/assistencia/novo")}
      onEdit={(item) => router.push(`/portal/assitencia/${item.id}`)}
      onDelete={(id) => console.log("delete assistencia", id)}
    />
  )
}