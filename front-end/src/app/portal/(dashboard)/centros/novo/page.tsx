"use client"

import { useRouter } from "next/navigation"

import FormCentros from "@/components/portal/formularios/form-centros"
import { criarCentro } from "@/lib/services/centros"

type FormData = {
  nome: string
  endereco: string
  responsavel: string
  telefone: string
  descricao: string
  image: File | null
}

export default function NovaCentro() {
  const router = useRouter()

  async function handleSubmit(data: FormData) {
    try {
      await criarCentro({
        nome: data.nome,
        responsavel: data.responsavel,
        telefone: data.telefone,
        endereco: data.endereco,
      })

      router.push("/portal/centros")
    } catch (error) {
      console.error("Erro ao salvar centro:", error)
      alert("Erro ao salvar centro")
    }
  }

  return (
    <FormCentros onSubmit={handleSubmit} />
  )
}