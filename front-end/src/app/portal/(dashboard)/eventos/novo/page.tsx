"use client"

import { useRouter } from "next/navigation"

import FormEvento from "@/components/portal/formularios/form-evento"
import { criarEvento } from "@/lib/services/eventos"

export default function NewEventPage() {
  const router = useRouter()

  async function handleSubmit(data: any) {
    try {
      await criarEvento({
        nome: data.nome,
        local: data.local,
        tipo: data.tipo,
        data: data.data,
        horarioInicio: data.horarioInicio,
        horarioFim: data.horarioFim,
        responsavel: data.responsavel,
        responsavel_id: data.responsavel_id ?? null,
      })

      router.push("/portal/eventos")
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
      // erro exibido via toast
    }
  }

  return <FormEvento onSubmit={handleSubmit} />
}