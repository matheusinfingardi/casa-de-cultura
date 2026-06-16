"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import CrudPage from "@/components/portal/crud/crud-page"

import {
  buscarAssistencias,
  excluirAssistencia,
} from "@/lib/services/assistencia"

export default function AssistenciaPage() {
  const router = useRouter()

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    carregarAssistencias()
  }, [])

  async function carregarAssistencias() {
    const assistencias = await buscarAssistencias()
    setData(assistencias)
  }

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
      onEdit={(item) =>
        router.push(`/portal/assistencia/${item.id}`)
      }
      onDelete={async (id) => {
        try {
          await excluirAssistencia(id)

          const assistencias =
            await buscarAssistencias()

          setData(assistencias)
        } catch (error) {
          console.error("Erro ao excluir assistência:", error)
        }
      }}
    />
  )
}