"use client"

import { useRouter } from "next/navigation"
import CrudPage from "@/components/portal/crud/crud-page"

export default function CentrosPage() {
  const router = useRouter()

  const data = [
    {
      id: "1",
      nome: "Centro Norte",
      responsavel: "Carlos",
      telefone: "(32) 99999-0000",
      endereco: "Rua A, 123",
    },
  ]
  
  const columns = [
  "nome",
  "responsavel",
  "telefone",
  "endereco",
]

  return (
    <CrudPage
      title="Centros"
      data={data}
      columns={columns}
      onCreate={() => router.push("/portal/centros/novo")}
      onEdit={(item) => router.push(`/portal/centros/${item.id}`)}
      onDelete={(id) => console.log(id)}
    />
  )
}