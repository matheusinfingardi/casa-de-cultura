"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { chaveData } from "@/lib/formatar"
import { gradeDoMes, TIPO_AGENDA_INFO, type Ocorrencia, type TipoAgenda } from "@/lib/agenda"

/** Tira a última semana quando ela só tem dias do mês seguinte. */
function semanasDoMes(ano: number, mes: number) {
  const g = gradeDoMes(ano, mes)
  return g[35].doMes ? g : g.slice(0, 35)
}

const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export default function CalendarioMes({
  ano, mes, ocorrencias, selecionado, onSelecionar, onMudarMes, onHoje, tiposAtivos, onAlternarTipo,
}: {
  ano: number
  mes: number
  ocorrencias: Ocorrencia[]
  selecionado: string
  onSelecionar: (chave: string) => void
  onMudarMes: (delta: number) => void
  onHoje: () => void
  tiposAtivos: Set<TipoAgenda>
  onAlternarTipo: (t: TipoAgenda) => void
}) {
  const hoje = chaveData(new Date())
  const porDia = new Map<string, Ocorrencia[]>()
  for (const o of ocorrencias) {
    if (!tiposAtivos.has(o.tipo)) continue
    porDia.set(o.data, [...(porDia.get(o.data) ?? []), o])
  }
  const nomeMes = new Date(ano, mes, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  return (
    <section aria-label="Calendário" className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => onMudarMes(-1)} aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => onMudarMes(1)} aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></Button>
          <h2 className="ml-2 min-w-40 text-lg font-semibold first-letter:uppercase" aria-live="polite">{nomeMes}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(TIPO_AGENDA_INFO) as TipoAgenda[]).map((t) => {
            const on = tiposAtivos.has(t)
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => onAlternarTipo(t)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-opacity ${on ? "" : "opacity-50"}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${TIPO_AGENDA_INFO[t].ponto}`} aria-hidden />
                {TIPO_AGENDA_INFO[t].plural}
              </button>
            )
          })}
          <Button variant="outline" size="sm" onClick={onHoje}>Hoje</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground" aria-hidden>
        {SEMANA.map((d) => <div key={d} className="pb-2 text-base">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border bg-border">
        {semanasDoMes(ano, mes).map(({ data, doMes }) => {
          const k = chaveData(data)
          const itens = porDia.get(k) ?? []
          const ehHoje = k === hoje
          const sel = k === selecionado
          return (
            <button
              key={k}
              type="button"
              onClick={() => onSelecionar(k)}
              aria-pressed={sel}
              aria-label={`${data.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}${ehHoje ? ", hoje" : ""}, ${itens.length ? `${itens.length} compromisso${itens.length > 1 ? "s" : ""}` : "sem compromissos"}`}
              className={`flex min-h-14 flex-col items-stretch gap-1 bg-card p-1.5 text-left transition-colors hover:bg-muted sm:min-h-32 sm:p-2 xl:min-h-40 ${doMes ? "" : "bg-muted/40 text-muted-foreground"} ${sel ? "outline outline-2 -outline-offset-2 outline-primary" : ""}`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${ehHoje ? "bg-primary text-primary-foreground" : ""}`}>{data.getDate()}</span>
              {/* celular: pontos */}
              <span className="flex flex-wrap gap-0.5 sm:hidden" aria-hidden>
                {itens.slice(0, 4).map((o) => <span key={o.chave} className={`h-1.5 w-1.5 rounded-full ${TIPO_AGENDA_INFO[o.tipo].ponto}`} />)}
              </span>
              {/* computador: títulos */}
              <span className="hidden min-w-0 flex-col gap-0.5 sm:flex" aria-hidden>
                {itens.slice(0, 3).map((o) => (
                  <span key={o.chave} title={`${o.inicio.slice(0, 5)} ${o.titulo}`} className={`truncate rounded-md px-1.5 py-1 text-sm leading-tight ${TIPO_AGENDA_INFO[o.tipo].chip}`}>
                    {o.inicio && <span className="font-semibold">{o.inicio.slice(0, 5)} </span>}{o.titulo}
                  </span>
                ))}
                {itens.length > 3 && <span className="px-1.5 text-sm font-medium text-muted-foreground">+{itens.length - 3} mais</span>}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
