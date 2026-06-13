"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import CrudPage from "@/components/portal/crud/crud-page"

import {
  buscarEventos,
  excluirEvento,
} from "@/lib/services/eventos"

export default function EventosPage() {
  const router = useRouter()

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function carregarEventos() {
      const eventos = await buscarEventos()
      setData(eventos)
    }

    carregarEventos()
  }, [])

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
      onDelete={async (id) => {
        try {
          await excluirEvento(id)

          const eventos = await buscarEventos()
          setData(eventos)
        } catch (error) {
          console.error("Erro ao excluir evento:", error)
          alert("Erro ao excluir evento")
        }
      }}
    />
  )
}