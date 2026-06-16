"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import FormOficinas, {
  FormData,
} from "@/components/portal/formularios/form-oficinas"

import {
  buscarOficinaPorId,
  atualizarOficina,
} from "@/lib/services/oficinas"

export default function EditarOficina() {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [oficina, setOficina] = useState<FormData | null>(null)

  useEffect(() => {
    async function carregarOficina() {
      try {
        const data = await buscarOficinaPorId(
          params.id as string
        )

        setOficina(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    carregarOficina()
  }, [params.id])

  async function handleSubmit(data: FormData) {
    try {
      await atualizarOficina(
        params.id as string,
        data
      )

      router.push("/portal/oficinas")
    } catch (error) {
      console.error("Erro ao atualizar oficina:", error)
      // erro exibido via toast
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!oficina) {
    return <div>Oficina não encontrada</div>
  }

  return (
    <FormOficinas
      initialData={oficina}
      onSubmit={handleSubmit}
    />
  )
}