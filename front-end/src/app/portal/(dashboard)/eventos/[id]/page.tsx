"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import FormEvento from "@/components/portal/formularios/form-evento"

import {
  buscarEventoPorId,
  atualizarEvento,
} from "@/lib/services/eventos"

export default function EditarEvento() {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [evento, setEvento] = useState<any>(null)

  useEffect(() => {
    async function carregarEvento() {
      try {
        const data = await buscarEventoPorId(
          params.id as string
        )

        setEvento(data)
      } catch (error) {
        console.error("Erro ao carregar evento:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarEvento()
  }, [params.id])

  async function handleSubmit(data: any) {
    try {
      await atualizarEvento(
        params.id as string,
        {
          nome: data.nome,
          local: data.local,
          tipo: data.tipo,
          data: data.data,
          horarioInicio: data.horarioInicio,
          horarioFim: data.horarioFim,
          responsavel: data.responsavel,
          responsavel_id: data.responsavel_id ?? null,
        }
      )

      router.push("/portal/eventos")
    } catch (error) {
      console.error("Erro ao atualizar evento:", error)
      // erro exibido via toast
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!evento) {
    return <div>Evento não encontrado</div>
  }

  return (
    <FormEvento
      initialData={evento}
      onSubmit={handleSubmit}
    />
  )
}