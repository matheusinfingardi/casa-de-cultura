"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import CrudPage from "@/components/portal/crud/crud-page"

import {
  buscarAtividades,
  excluirAtividade,
} from "@/lib/services/atividades"

function expandRecorrencia(data: any[]) {
  return data.flatMap((item) => {
    const rec = item.recorrencia

    const base = {
      id: item.id,
      nome: item.nome,
      responsavel: item.responsavel,
      local: item.local,
    }

    if (rec?.tipo === "Unica") {
      return [
        {
          ...base,
          recorrencia: "Única",
          dia: rec.data,
          horarioInicio: rec.horarioInicio,
          horarioFim: rec.horarioFim,
        },
      ]
    }

    if (rec?.tipo === "Semanal") {
      return Object.entries(rec.horarios || {}).map(
        ([dia, h]: any) => ({
          ...base,
          recorrencia: "Semanal",
          dia,
          horarioInicio: h.horarioInicio,
          horarioFim: h.horarioFim,
        })
      )
    }

    return [
      {
        ...base,
        recorrencia: "Não especificada",
      },
    ]
  })
}

export default function AtividadesPage() {
  const router = useRouter()

  const [data, setData] = useState<any[]>([])

  async function carregarAtividades() {
    const atividades = await buscarAtividades()
    const expanded = expandRecorrencia(atividades)

    setData(expanded)
  }

  useEffect(() => {
    carregarAtividades()
  }, [])

  const columns = [
    "nome",
    "responsavel",
    "local",
    "recorrencia",
    "dia",
    "horarioInicio",
    "horarioFim",
  ]

  return (
    <CrudPage
      title="Atividades"
      data={data}
      columns={columns}
      onCreate={() =>
        router.push("/portal/atividades/novo")
      }
      onEdit={(item) =>
        router.push(`/portal/atividades/${item.id}`)
      }
      onDelete={async (id) => {
        try {
          await excluirAtividade(id)

          const atividades =
            await buscarAtividades()

          const expanded =
            expandRecorrencia(atividades)

          setData(expanded)
        } catch (error) {
          console.error("Erro ao excluir atividade:", error)
        }
      }}
    />
  )
}