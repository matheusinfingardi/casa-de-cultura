"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, Clock, Download, List, Rows3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import PageHeader, { type Migalha } from "@/components/comum/page-header"
import EstadoVazio from "@/components/comum/estado-vazio"
import { baixarIcs } from "@/lib/ics"
import { chaveData, dataExtenso, faixaHorario } from "@/lib/formatar"
import { ocorrenciasNoPeriodo, TIPO_AGENDA_INFO, type Ocorrencia, type TipoAgenda } from "@/lib/agenda"
import type { Atividade, Evento, Oficina } from "@/lib/tipos"
import AgendaDia from "@/components/portal/dashboard/agenda-dia"
import CalendarioMes from "@/components/portal/dashboard/calendario-mes"

export type Fontes = { eventos: Evento[]; atividades: Atividade[]; oficinas: Oficina[]; meusIds?: string[] }
type Visao = "mes" | "semana" | "lista"

function ListaDias({ itens }: { itens: Ocorrencia[] }) {
  const grupos = new Map<string, Ocorrencia[]>()
  for (const o of itens) grupos.set(o.data, [...(grupos.get(o.data) ?? []), o])
  if (!itens.length) return <EstadoVazio icon={CalendarDays} titulo="Nada neste período" texto="Tente outro período ou reative os filtros." />
  return (
    <div className="space-y-5">
      {[...grupos.entries()].map(([data, lista]) => (
        <section key={data}>
          <h3 className="mb-2 font-semibold first-letter:uppercase">{dataExtenso(data)}</h3>
          <ul className="space-y-2">
            {lista.map((o) => (
              <li key={o.chave}>
                <Link href={o.href} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border bg-card p-3 transition-colors hover:bg-muted">
                  <span className="flex w-28 items-center gap-1.5 text-sm font-medium"><Clock className="h-4 w-4 text-muted-foreground" aria-hidden />{o.inicio.slice(0, 5)}</span>
                  <span className="min-w-0 flex-1 font-medium">{o.titulo}</span>
                  <span className="text-sm text-muted-foreground">{o.local}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_AGENDA_INFO[o.tipo].chip}`}>{TIPO_AGENDA_INFO[o.tipo].label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Semana({ inicio, itens }: { inicio: Date; itens: Ocorrencia[] }) {
  const hoje = chaveData(new Date())
  return (
    <div className="grid gap-3 md:grid-cols-7">
      {Array.from({ length: 7 }, (_, i) => {
        const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
        const k = chaveData(d)
        const doDia = itens.filter((o) => o.data === k)
        return (
          <div key={k} className={`rounded-xl border bg-card p-2.5 ${k === hoje ? "border-primary ring-1 ring-primary" : ""}`}>
            <p className="mb-2 text-sm font-semibold first-letter:uppercase">{d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" })}</p>
            {doDia.length === 0 ? <p className="text-sm text-muted-foreground">Livre</p> : (
              <ul className="space-y-1.5">
                {doDia.map((o) => (
                  <li key={o.chave}>
                    <Link href={o.href} className={`block rounded-lg px-2 py-1.5 text-sm hover:opacity-80 ${TIPO_AGENDA_INFO[o.tipo].chip}`}>
                      <span className="block font-semibold">{faixaHorario(o.inicio, "")}</span>
                      {o.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Agenda em mês, semana ou lista, com filtros por tipo e exportação para o calendário do celular. */
export default function AgendaCompleta({
  titulo, descricao, migalhas, carregar, transformar,
}: {
  titulo: string
  descricao: string
  migalhas?: Migalha[]
  carregar: () => Promise<Fontes>
  transformar?: (o: Ocorrencia) => Ocorrencia
}) {
  const hoje = new Date()
  const [fontes, setFontes] = useState<Fontes | null>(null)
  const [visao, setVisao] = useState<Visao>("mes")
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [selecionado, setSelecionado] = useState(chaveData(hoje))
  const [tipos, setTipos] = useState<Set<TipoAgenda>>(new Set(["evento", "atividade", "oficina"]))
  const [escopo, setEscopo] = useState<"meus" | "todos">("meus")
  const [refSemana, setRefSemana] = useState(() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d })

  useEffect(() => {
    let ativo = true
    carregar().then((f) => ativo && setFontes(f))
    return () => { ativo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const noPeriodo = (de: Date, ate: Date) => {
    if (!fontes) return []
    const meus = fontes.meusIds
    const l = ocorrenciasNoPeriodo(fontes, de, ate).filter((o) => tipos.has(o.tipo) && (!meus || escopo === "todos" || meus.includes(o.itemId)))
    return transformar ? l.map(transformar) : l
  }
  const doMes = useMemo(() => noPeriodo(new Date(ano, mes, 1), new Date(ano, mes + 1, 0)), [fontes, ano, mes, tipos, escopo]) // eslint-disable-line react-hooks/exhaustive-deps
  const daSemana = useMemo(() => noPeriodo(refSemana, new Date(refSemana.getFullYear(), refSemana.getMonth(), refSemana.getDate() + 6)), [fontes, refSemana, tipos, escopo]) // eslint-disable-line react-hooks/exhaustive-deps
  const proximos = useMemo(() => { const a = new Date(); a.setDate(a.getDate() + 30); return noPeriodo(new Date(), a) }, [fontes, tipos, escopo]) // eslint-disable-line react-hooks/exhaustive-deps

  function mudarMes(delta: number) {
    const d = new Date(ano, mes + delta, 1)
    setAno(d.getFullYear()); setMes(d.getMonth())
    const a = new Date()
    setSelecionado(d.getFullYear() === a.getFullYear() && d.getMonth() === a.getMonth() ? chaveData(a) : chaveData(d))
  }

  const VISOES: [Visao, string, typeof List][] = [["mes", "Mês", CalendarDays], ["semana", "Semana", Rows3], ["lista", "Lista", List]]

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={titulo}
        descricao={descricao}
        migalhas={migalhas}
        acoes={<Button variant="outline" onClick={() => baixarIcs("agenda-casa-de-cultura.ics", proximos)}><Download className="h-4 w-4" aria-hidden /> Baixar para o calendário</Button>}
      />

      <div className="flex flex-wrap gap-3">
      {fontes?.meusIds && (
        <div className="inline-flex rounded-xl border bg-card p-1" role="group" aria-label="O que mostrar na agenda">
          {([["meus", "Só os meus"], ["todos", "Todos da Casa"]] as const).map(([v, r]) => (
            <button key={v} type="button" aria-pressed={escopo === v} onClick={() => setEscopo(v)} className={`rounded-lg px-4 py-2 text-sm font-medium ${escopo === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{r}</button>
          ))}
        </div>
      )}
      <div className="inline-flex rounded-xl border bg-card p-1" role="group" aria-label="Forma de ver a agenda">
        {VISOES.map(([v, r, I]) => (
          <button key={v} type="button" aria-pressed={visao === v} onClick={() => setVisao(v)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${visao === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
            <I className="h-4 w-4" aria-hidden />{r}
          </button>
        ))}
      </div>
      </div>

      {!fontes ? <Skeleton className="h-[32rem] rounded-2xl" /> : visao === "mes" ? (
        <div className="grid items-start gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <CalendarioMes
              ano={ano} mes={mes} ocorrencias={doMes} selecionado={selecionado} onSelecionar={setSelecionado}
              onMudarMes={mudarMes}
              onHoje={() => { const a = new Date(); setAno(a.getFullYear()); setMes(a.getMonth()); setSelecionado(chaveData(a)) }}
              tiposAtivos={tipos}
              onAlternarTipo={(t) => setTipos((p) => { const n = new Set(p); if (n.has(t)) n.delete(t); else n.add(t); return n })}
            />
          </div>
          <AgendaDia data={selecionado} itens={doMes.filter((o) => o.data === selecionado)} />
        </div>
      ) : visao === "semana" ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setRefSemana((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))}>Semana anterior</Button>
            <Button variant="outline" size="sm" onClick={() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); setRefSemana(d) }}>Esta semana</Button>
            <Button variant="outline" size="sm" onClick={() => setRefSemana((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))}>Próxima semana</Button>
          </div>
          <Semana inicio={refSemana} itens={daSemana} />
        </div>
      ) : (
        <ListaDias itens={proximos.slice(0, 40)} />
      )}
    </div>
  )
}
