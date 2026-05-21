"use client"

import { useRouter } from "next/navigation"
import CrudTable from "@/components/portal/crud-table"

export default function CentersPage() {
  const router = useRouter()

  const data = [
    { id: "1", name: "Centro Norte", address: "Juiz de Fora - MG" },
    { id: "2", name: "Centro Sul", address: "Juiz de Fora - MG" },
  ]

  return (
    <CrudTable
      title="Centros"
      columns={[
        { label: "Nome", key: "name" },
        { label: "Endereço", key: "address" },
      ]}
      data={data}
      onCreate={() => router.push("/portal/centros/novo")}
      onEdit={(item) => router.push(`/portal/centros/${item.id}`)}
      onDelete={(id) => console.log("delete center", id)}
    />
  )
}