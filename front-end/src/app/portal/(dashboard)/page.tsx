"use client"

import { useState } from "react"

import {
  Calendar,
  ItemAgenda,
} from "@/components/portal/calendario"

const MOCK: ItemAgenda[] = [
  {
    id: "1",
    titulo: "Aula de Música",
    data: "2026-05-21",
    tipo: "atividade",
  },
  {
    id: "2",
    titulo: "Evento Cultural",
    data: "2026-05-21",
    tipo: "evento",
  },
  {
    id: "3",
    titulo: "Oficina Pintura",
    data: "2026-05-23",
    tipo: "oficina",
  },
  {
    id: "4",
    titulo: "Assistência Social",
    data: "2026-05-24",
    tipo: "assistencia",
  },
]

export default function PortalDashboard() {
  const hoje = new Date()

  const [dataAtual, setDataAtual] = useState({
    ano: hoje.getFullYear(),
    mes: hoje.getMonth(),
  })

  function mesAnterior() {
    setDataAtual((prev) => {
      const mes = prev.mes - 1

      if (mes < 0) {
        return {
          ano: prev.ano - 1,
          mes: 11,
        }
      }

      return {
        ...prev,
        mes,
      }
    })
  }

  function proximoMes() {
    setDataAtual((prev) => {
      const mes = prev.mes + 1

      if (mes > 11) {
        return {
          ano: prev.ano + 1,
          mes: 0,
        }
      }

      return {
        ...prev,
        mes,
      }
    })
  }

  const nomeMes = new Date(
    dataAtual.ano,
    dataAtual.mes
  ).toLocaleString("pt-BR", {
    month: "long",
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Visão Geral
        </h1>

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={mesAnterior}
            className="
              px-3
              py-2
              border
              rounded-lg
              hover:bg-gray-100
              transition
            "
          >
            ◀
          </button>

          <div className="font-semibold capitalize text-center min-w-[140px]">
            {nomeMes} {dataAtual.ano}
          </div>

          <button
            onClick={proximoMes}
            className="
              px-3
              py-2
              border
              rounded-lg
              hover:bg-gray-100
              transition
            "
          >
            ▶
          </button>
        </div>
      </div>

      {/* CALENDÁRIO */}
      <Calendar
        ano={dataAtual.ano}
        mes={dataAtual.mes}
        eventos={MOCK}
      />
    </div>
  )
}