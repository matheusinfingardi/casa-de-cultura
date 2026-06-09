"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import CrudPage from "@/components/portal/crud/crud-page"
import { buscarOficinas } from "@/lib/services/oficinas"

export default function OficinasPage() {
  const router = useRouter()

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function carregarOficinas() {
      const oficinas = await buscarOficinas()
      setData(oficinas)
    }

    carregarOficinas()
  }, [])

  const columns = [
    "nome",
    "responsavel",
    "vagas",
    "nivel",
    "local",
    "dia",
    "horarioInicio",
    "horarioFim",
  ]

  return (
    <CrudPage
      title="Oficinas"
      data={data}
      columns={columns}
      onCreate={() => router.push("/portal/oficinas/novo")}
      onEdit={(item) => router.push(`/portal/oficinas/${item.id}`)}
      onDelete={(id) => console.log(id)}
    />
  )
}