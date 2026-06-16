"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import FormAtividades from "@/components/portal/formularios/form-atividades"

import {
  buscarAtividadePorId,
  atualizarAtividade,
} from "@/lib/services/atividades"

export default function EditarAtividadePage() {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [atividade, setAtividade] = useState<any>(null)

  useEffect(() => {
    async function carregarAtividade() {
      try {
        const data = await buscarAtividadePorId(
          params.id as string
        )

        setAtividade(data)
      } catch (error) {
        console.error(
          "Erro ao carregar atividade:",
          error
        )
      } finally {
        setLoading(false)
      }
    }

    carregarAtividade()
  }, [params.id])

  async function handleSubmit(data: any) {
    try {
      await atualizarAtividade(
        params.id as string,
        {
          nome: data.nome,
          responsavel: data.responsavel,
          responsavel_id: data.responsavel_id ?? null,
          local: data.local,
          recorrencia: data.recorrencia,
        }
      )

      router.push("/portal/atividades")
    } catch (error) {
      console.error(
        "Erro ao atualizar atividade:",
        error
      )

      // erro exibido via toast
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!atividade) {
    return <div>Atividade não encontrada</div>
  }

  return (
    <FormAtividades
      initialData={atividade}
      onSubmit={handleSubmit}
    />
  )
}