"use client"

import { useRouter } from "next/navigation"

import FormCentros, {
  FormData,
} from "@/components/portal/formularios/form-centros"
import { criarCentro } from "@/lib/services/centros"

export default function NovaCentro() {
  const router = useRouter()

  async function handleSubmit(data: FormData) {
    try {
      await criarCentro({
        nome: data.nome,
        responsavel: data.responsavel,
        responsavel_id: data.responsavel_id ?? null,
        telefone: data.telefone,
        endereco: data.endereco,
      })

      router.push("/portal/centros")
    } catch (error) {
      console.error("Erro ao salvar centro:", error)
      // erro exibido via toast
    }
  }

  return (
    <FormCentros onSubmit={handleSubmit} />
  )
}