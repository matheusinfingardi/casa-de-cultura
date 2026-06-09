"use client"

import { useRouter } from "next/navigation"

import FormOficinas, {
  FormData,
} from "@/components/portal/formularios/form-oficinas"

import { criarOficina } from "@/lib/services/oficinas"

export default function NovaOficina() {
  const router = useRouter()

  async function handleSubmit(data: FormData) {
    try {
      await criarOficina({
        nome: data.nome,
        responsavel: data.responsavel,
        vagas: data.vagas,
        nivel: data.nivel,
        local: data.local,
        dia: data.dia,
        horarioInicio: data.horarioInicio,
        horarioFim: data.horarioFim,
      })

      router.push("/portal/oficinas")
    } catch (error) {
      console.error("Erro ao salvar oficina:", error)
      alert("Erro ao salvar oficina")
    }
  }

  return (
    <FormOficinas
      onSubmit={handleSubmit}
    />
  )
}