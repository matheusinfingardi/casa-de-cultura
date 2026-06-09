"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import CrudPage from "@/components/portal/crud/crud-page"
import { buscarCentros } from "@/lib/services/centros"

export default function CentrosPage() {
  const router = useRouter()

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function carregarCentros() {
      const centros = await buscarCentros()
      setData(centros)
    }

    carregarCentros()
  }, [])

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