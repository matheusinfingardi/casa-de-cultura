"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

import FormCentros, {
  FormData,
} from "@/components/portal/formularios/form-centros"

import {
  buscarCentroPorId,
  atualizarCentro,
} from "@/lib/services/centros"

export default function EditarCentroPage() {
  const router = useRouter()
  const params = useParams()

  const [centro, setCentro] = useState<FormData | null>(null)

  useEffect(() => {
    async function carregarCentro() {
      try {
        const data = await buscarCentroPorId(
          params.id as string
        )

        setCentro({
          nome: data.nome || "",
          endereco: data.endereco || "",
          responsavel: data.responsavel || "",
          telefone: data.telefone || "",
          descricao: "",
          image: null,
        })
      } catch (error) {
        console.error(error)
      }
    }

    carregarCentro()
  }, [params.id])

  async function handleSubmit(data: FormData) {
    try {
      await atualizarCentro(params.id as string, {
        nome: data.nome,
        responsavel: data.responsavel,
        telefone: data.telefone,
        endereco: data.endereco,
      })

      router.push("/portal/centros")
    } catch (error) {
      console.error(error)
      alert("Erro ao atualizar centro")
    }
  }

  if (!centro) {
    return <div>Carregando...</div>
  }

  return (
    <FormCentros
      initialData={centro}
      onSubmit={handleSubmit}
    />
  )
}