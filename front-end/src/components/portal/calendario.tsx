"use client"

import { useMemo } from "react"

type Tipo = "evento" | "atividade" | "oficina" | "assistencia"

export type ItemAgenda = {
  id: string
  titulo: string
  data: string
  tipo: Tipo
}

type CalendarProps = {
  ano: number
  mes: number
  eventos: ItemAgenda[]
}

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

export function Calendar({
  ano,
  mes,
  eventos,
}: CalendarProps) {
  const dias = useMemo(
    () => gerarCalendario(ano, mes),
    [ano, mes]
  )

  function formatDate(d: Date) {
    return d.toISOString().split("T")[0]
  }

  function eventosDoDia(date: string) {
    return eventos.filter((e) => e.data === date)
  }

  return (
    <>
      {/* MOBILE */}
      <div className="flex flex-col gap-3 md:hidden">
        {dias.map((dia, i) => {
          if (!dia) return null

          const dateStr = formatDate(dia)
          const eventosDia = eventosDoDia(dateStr)

          return (
            <div
              key={dateStr}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">
                  Dia {dia.getDate()}
                </span>

                <span className="text-xs text-gray-400 capitalize">
                  {dia.toLocaleDateString("pt-BR", {
                    weekday: "short",
                  })}
                </span>
              </div>

              <div className="space-y-2">
                {eventosDia.length === 0 && (
                  <div className="text-sm text-gray-400">
                    Nenhum evento
                  </div>
                )}

                {eventosDia.map((ev) => (
                  <div
                    key={ev.id}
                    className={`
                      text-white
                      text-xs
                      px-3
                      py-2
                      rounded-lg
                      ${cor(ev.tipo)}
                    `}
                  >
                    {ev.titulo}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div
                key={d}
                className="text-center text-sm font-semibold text-gray-500"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dias.map((dia, i) => {
              if (!dia) {
                return <div key={i} />
              }

              const dateStr = formatDate(dia)
              const eventosDia = eventosDoDia(dateStr)

              return (
                <div
                  key={dateStr}
                  className="
                    border
                    rounded-xl
                    p-3
                    min-h-[130px]
                    bg-white
                    shadow-sm
                  "
                >
                  <div className="text-sm text-gray-500">
                    {dia.getDate()}
                  </div>

                  <div className="space-y-1 mt-2">
                    {eventosDia.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className={`
                          text-white
                          text-xs
                          px-2
                          py-1
                          rounded-md
                          truncate
                          ${cor(ev.tipo)}
                        `}
                      >
                        {ev.titulo}
                      </div>
                    ))}

                    {eventosDia.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{eventosDia.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}