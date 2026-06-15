"use client"

import { useRouter } from "next/navigation"

import FormAssistencia, {
  FormData,
} from "@/components/portal/formularios/form-assistencia"

import { criarAssistencia } from "@/lib/services/assistencia"

export default function NovaAssistencia() {
  const router = useRouter()

  async function handleSubmit(data: any) {
  console.log("CHEGOU NA PAGINA", data)

  try {
    console.log("ANTES DO INSERT")

    const resultado = await criarAssistencia(data)

    console.log("DEPOIS DO INSERT", resultado)

    router.push("/portal/assistencia")
    router.refresh()

  } catch (error) {
    console.error("ERRO COMPLETO:", error)
    alert("Erro ao criar assistência")
  }
}

  return (
    <FormAssistencia
      onSubmit={handleSubmit}
    />
  )
}