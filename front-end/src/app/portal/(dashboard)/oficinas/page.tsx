"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import CrudPage from "@/components/portal/crud/crud-page"

import {
  buscarOficinas,
  excluirOficina,
} from "@/lib/services/oficinas"

export default function OficinasPage() {
  const router = useRouter()

  const [data, setData] = useState<any[]>([])

  async function carregarOficinas() {
    const oficinas = await buscarOficinas()
    setData(oficinas)
  }

  useEffect(() => {
    carregarOficinas()
  }, [])

  async function handleDelete(id: string) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta oficina?"
    )

    if (!confirmar) return

    try {
      await excluirOficina(id)

      setData((prev) =>
        prev.filter((item) => item.id !== id)
      )
    } catch (error) {
      console.error("Erro ao excluir oficina:", error)
    }
  }

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
      onEdit={(item) =>
        router.push(`/portal/oficinas/${item.id}`)
      }
      onDelete={handleDelete}
    />
  )
}