"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import CrudPage from "@/components/portal/crud/crud-page"
import { buscarCentros, excluirCentro } from "@/lib/services/centros"

export default function CentrosPage() {
  const router = useRouter()

  const [data, setData] = useState<any[]>([])

  async function carregarCentros() {
    const centros = await buscarCentros()
    setData(centros)
  }

  useEffect(() => {
    carregarCentros()
  }, [])

  async function handleDelete(id: string) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este centro?"
    )

    if (!confirmar) return

    try {
      await excluirCentro(id)

      setData((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Erro ao excluir centro:", error)
    }
  }

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
      onDelete={handleDelete}
    />
  )
}