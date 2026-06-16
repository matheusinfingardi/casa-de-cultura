"use client"

import { useRouter } from "next/navigation"

import FormAssistencia, {
  FormData,
} from "@/components/portal/formularios/form-assistencia"

import { criarAssistencia } from "@/lib/services/assistencia"

export default function NovaAssistencia() {
  const router = useRouter()

  async function handleSubmit(data: any) {
    try {
      await criarAssistencia(data)
      router.push("/portal/assistencia")
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar assistência:", error)
    }
  }

  return (
    <FormAssistencia
      onSubmit={handleSubmit}
    />
  )
}