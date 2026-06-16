"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import FormAssistencia from "@/components/portal/formularios/form-assistencia"

import {
  buscarAssistenciaPorId,
  atualizarAssistencia,
} from "@/lib/services/assistencia"

export default function EditarAssistenciaPage() {
  const params = useParams()
  const router = useRouter()

  const [assistencia, setAssistencia] = useState<any>(null)

  useEffect(() => {
    async function carregarAssistencia() {
      try {
        const data = await buscarAssistenciaPorId(
          params.id as string
        )

        setAssistencia(data)
      } catch (error) {
        console.error(
          "Erro ao carregar assistência:",
          error
        )
      }
    }

    carregarAssistencia()
  }, [params.id])

  async function handleSubmit(data: any) {
    try {
      await atualizarAssistencia(
        params.id as string,
        data
      )

      router.push("/portal/assistencia")
      router.refresh()
    } catch (error) {
      console.error(
        "Erro ao atualizar assistência:",
        error
      )

      // erro exibido via toast
    }
  }

  if (!assistencia) {
    return <p>Carregando...</p>
  }

  return (
    <FormAssistencia
      initialData={assistencia}
      onSubmit={handleSubmit}
    />
  )
}