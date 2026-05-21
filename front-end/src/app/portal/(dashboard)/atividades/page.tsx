"use client"

import { useRouter } from "next/navigation"
import CrudPage from "@/components/portal/crud/crud-page"

function expandRecorrencia(data: any[]) {
  return data.flatMap((item) => {
    const rec = item.recorrente

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
      return Object.entries(rec.horarios || {}).map(([dia, h]: any) => ({
        ...base,
        recorrencia: "Semanal",
        dia,
        horarioInicio: h.horarioInicio,
        horarioFim: h.horarioFim,
      }))
    }

    return []
  })
}


export default function AtividadesPage() {
  const router = useRouter()

  const rawData = [
    {
      id: "1",
      nome: "Aula de Música",
      responsavel: "João Silva",
      local: "Centro Norte",
      recorrente: {
        tipo: "Unica",
        data: "10/06/2026",
        horarioInicio: "12:00",
        horarioFim: "14:00",
      },
    },
    {
      id: "2",
      nome: "Aula de Dança",
      responsavel: "Maria",
      local: "Centro Sul",
      recorrente: {
        tipo: "Semanal",
        horarios: {
          Segunda: { horarioInicio: "12:00", horarioFim: "14:00" },
          Quarta: { horarioInicio: "18:00", horarioFim: "20:00" },
        },
      },
    },
  ]

  const data = expandRecorrencia(rawData)

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
      onCreate={() => router.push("/portal/atividades/novo")}
      onEdit={(item) => router.push(`/portal/atividades/${item.id}`)}
      onDelete={(id) => console.log(id)}
    />
  )
}