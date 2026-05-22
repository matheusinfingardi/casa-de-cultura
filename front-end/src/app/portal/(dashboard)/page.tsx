"use client"

import { useMemo, useState } from "react"

type Tipo = "evento" | "atividade" | "oficina" | "assistencia"

type ItemAgenda = {
  id: string
  titulo: string
  data: string
  tipo: Tipo
}

const MOCK: ItemAgenda[] = [
  { id: "1", titulo: "Aula de Música", data: "2026-05-21", tipo: "atividade" },
  { id: "2", titulo: "Evento Cultural", data: "2026-05-21", tipo: "evento" },
  { id: "3", titulo: "Oficina Pintura", data: "2026-05-23", tipo: "oficina" },
  { id: "4", titulo: "Assistência Social", data: "2026-05-24", tipo: "assistencia" },
]

function cor(tipo: Tipo) {
  switch (tipo) {
    case "evento":
      return "bg-blue-500"
    case "atividade":
      return "bg-green-500"
    case "oficina":
      return "bg-purple-500"
    case "assistencia":
      return "bg-orange-500"
  }
}

function gerarCalendario(ano: number, mes: number) {
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)

  const diasNoMes = ultimoDia.getDate()
  const inicioSemana = primeiroDia.getDay()

  const dias: (Date | null)[] = []

  for (let i = 0; i < inicioSemana; i++) {
    dias.push(null)
  }

  for (let d = 1; d <= diasNoMes; d++) {
    dias.push(new Date(ano, mes, d))
  }

  return dias
}

export default function PortalDashboard() {
  const hoje = new Date()

  const [dataAtual, setDataAtual] = useState({
    ano: hoje.getFullYear(),
    mes: hoje.getMonth(),
  })

  const dias = useMemo(
    () => gerarCalendario(dataAtual.ano, dataAtual.mes),
    [dataAtual]
  )

  function formatDate(d: Date) {
    return d.toISOString().split("T")[0]
  }

  function eventosDoDia(date: string) {
    return MOCK.filter((e) => e.data === date)
  }

  function mesAnterior() {
    setDataAtual((prev) => {
      const mes = prev.mes - 1
      if (mes < 0) {
        return { ano: prev.ano - 1, mes: 11 }
      }
      return { ...prev, mes }
    })
  }

  function proximoMes() {
    setDataAtual((prev) => {
      const mes = prev.mes + 1
      if (mes > 11) {
        return { ano: prev.ano + 1, mes: 0 }
      }
      return { ...prev, mes }
    })
  }

  const nomeMes = new Date(dataAtual.ano, dataAtual.mes).toLocaleString(
    "pt-BR",
    { month: "long" }
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Visão Geral
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={mesAnterior}
            className="px-3 py-1 border rounded"
          >
            ◀
          </button>

          <div className="font-semibold capitalize w-40 text-center">
            {nomeMes} {dataAtual.ano}
          </div>

          <button
            onClick={proximoMes}
            className="px-3 py-1 border rounded"
          >
            ▶
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-500">
            {d}
          </div>
        ))}
        {dias.map((dia, i) => {
          if (!dia) {
            return <div key={i} />
          }
          const dateStr = formatDate(dia)
          const eventos = eventosDoDia(dateStr)
          return (
            <div
              key={dateStr}
              className="border rounded-xl p-2 min-h-[90px] bg-white"
            >
              <div className="text-xs text-gray-500">
                {dia.getDate()}
              </div>
              <div className="space-y-1 mt-1">
                {eventos.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className={`text-white text-[10px] px-2 py-1 rounded ${cor(ev.tipo)}`}
                  >
                    {ev.titulo}
                  </div>
                ))}

                {eventos.length > 3 && (
                  <div className="text-[10px] text-gray-400">
                    +{eventos.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}