"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowRight, CalendarOff, CheckCircle2, Clock, MapPin, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/auth-provider"
import { useDemo } from "@/hooks/use-demo"
import { carregarDashboard, type DadosDashboard } from "@/lib/services/dashboard"
import { listarPedidos } from "@/lib/services/extras"
import { ocorrenciasNoPeriodo, TIPO_AGENDA_INFO, type Ocorrencia } from "@/lib/agenda"
import { chaveData } from "@/lib/formatar"
import { useUnidade } from "@/components/portal/unidade"

type Alerta = { texto: string; href: string; acao: string }

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"
}

function Numero({ valor, rotulo, href }: { valor: string; rotulo: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-primary">
      <p className="text-4xl font-bold tracking-tight">{valor}</p>
      <p className="mt-1 text-muted-foreground">{rotulo}</p>
    </Link>
  )
}

/** Linha do dia: o horário em destaque, depois o quê e onde. */
function LinhaAgenda({ o }: { o: Ocorrencia }) {
  return (
    <li>
      <Link href={o.href} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted">
        <span className="w-14 shrink-0 text-lg font-semibold tabular-nums">{o.inicio.slice(0, 5)}</span>
        <span className={`h-10 w-1 shrink-0 rounded-full ${TIPO_AGENDA_INFO[o.tipo].ponto}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{o.titulo}</span>
          <span className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden />até {o.fim.slice(0, 5)}</span>
            <span className="flex min-w-0 items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden /><span className="truncate">{o.local}</span></span>
          </span>
        </span>
        <span className="hidden text-sm text-muted-foreground sm:block">{TIPO_AGENDA_INFO[o.tipo].label}</span>
      </Link>
    </li>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const demo = useDemo()
  const { filtrar } = useUnidade()
  const [dados, setDados] = useState<DadosDashboard | null>(null)
  const [pedidos, setPedidos] = useState(0)
  const [dia, setDia] = useState(chaveData(new Date()))
  const hoje = new Date()

  useEffect(() => { carregarDashboard().then(setDados) }, [])
  useEffect(() => {
    if (demo) listarPedidos().then((l) => setPedidos(l.filter((p) => p.status === "pendente").length))
  }, [demo])

  const nome = ((user?.user_metadata?.nome as string | undefined) ?? "").split(" ")[0]

  const v = useMemo(() => {
    if (!dados) return null
    const eventos = filtrar(dados.eventos)
    const atividades = filtrar(dados.atividades)
    const oficinas = filtrar(dados.oficinas)
    const assistencias = filtrar(dados.assistencias)
    const de = new Date()
    const ate = new Date(); ate.setDate(ate.getDate() + 6)
    const semana = ocorrenciasNoPeriodo({ eventos, atividades, oficinas }, de, ate)

    const ids = new Set([...eventos, ...atividades, ...oficinas, ...assistencias].map((i) => i.id))
    const presencas = dados.presencas.filter((p) => ids.has(p.item_id))
    const presentes = presencas.filter((p) => p.status === "presente").length
    const ausentes = presencas.filter((p) => p.status === "ausente").length
    const avaliadas = presentes + ausentes
    const pessoas = new Set(presencas.map((p) => p.cliente_id)).size

    const porItem: Record<string, number> = {}
    for (const p of presencas) porItem[p.item_id] = (porItem[p.item_id] ?? 0) + 1
    const turmas = oficinas
      .map((o) => ({ id: o.id, nome: o.nome, vagas: o.vagas, inscritos: porItem[o.id] ?? 0 }))
      .sort((a, b) => b.inscritos / (b.vagas || 1) - a.inscritos / (a.vagas || 1))
    const vagasLivres = turmas.reduce((s, t) => s + Math.max(0, t.vagas - t.inscritos), 0)

    const semResp = [...eventos, ...atividades, ...oficinas, ...assistencias].filter((i) => !i.responsavel_id).length
    const lotadas = turmas.filter((t) => t.vagas > 0 && t.inscritos >= t.vagas)
    const alertas: Alerta[] = []
    if (pedidos) alertas.push({ texto: `${pedidos} ${pedidos === 1 ? "pedido" : "pedidos"} para ser voluntário aguardando resposta`, href: "/portal/usuarios?aba=pedidos", acao: "Responder" })
    if (semResp) alertas.push({ texto: `${semResp} ${semResp === 1 ? "item está" : "itens estão"} sem voluntário responsável`, href: "/portal/eventos", acao: "Resolver" })
    if (lotadas.length) alertas.push({ texto: `${lotadas[0].nome}${lotadas.length > 1 ? ` e mais ${lotadas.length - 1}` : ""} sem vagas`, href: `/portal/oficinas/${lotadas[0].id}`, acao: "Ver" })

    return { semana, pessoas, taxa: avaliadas ? Math.round((presentes / avaliadas) * 100) : null, vagasLivres, turmas: turmas.slice(0, 4), alertas }
  }, [dados, filtrar, pedidos])

  const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d })
  const doDia = v?.semana.filter((o) => o.data === dia) ?? []
  const hojeK = chaveData(hoje)
  const compromissosHoje = v?.semana.filter((o) => o.data === hojeK).length ?? 0

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{saudacao()}{nome ? `, ${nome}` : ""}</h1>
          <p className="mt-1 text-muted-foreground first-letter:uppercase">{hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <Button asChild size="lg"><Link href="/portal/eventos/novo"><Plus className="h-5 w-5" aria-hidden /> Novo evento</Link></Button>
      </header>

      {!v ? (
        <div className="space-y-6" aria-busy="true" aria-label="Carregando">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Numero valor={String(compromissosHoje)} rotulo={compromissosHoje === 1 ? "compromisso hoje" : "compromissos hoje"} href="/portal/agenda" />
            <Numero valor={String(v.pessoas)} rotulo="pessoas participando" href="/portal/usuarios" />
            <Numero valor={v.taxa === null ? "—" : `${v.taxa}%`} rotulo="de presença" href="/portal/relatorios" />
            <Numero valor={String(v.vagasLivres)} rotulo="vagas livres em oficinas" href="/portal/oficinas" />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-3">
            <section aria-labelledby="titulo-semana" className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="titulo-semana" className="text-xl font-semibold">Agenda da semana</h2>
                <Link href="/portal/agenda" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">Ver tudo <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              </div>
              <div className="mb-4 grid grid-cols-7 gap-1.5" role="group" aria-label="Escolher o dia">
                {dias.map((d) => {
                  const k = chaveData(d)
                  const ativo = k === dia
                  const qtd = v.semana.filter((o) => o.data === k).length
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={ativo}
                      aria-label={`${d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric" })}, ${qtd} compromissos`}
                      onClick={() => setDia(k)}
                      className={`rounded-xl px-1 py-2 text-center transition-colors ${ativo ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <span className="block text-sm first-letter:uppercase">{d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span>
                      <span className="block text-lg font-semibold">{d.getDate()}</span>
                    </button>
                  )
                })}
              </div>
              {doDia.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                  <CalendarOff className="h-8 w-8" aria-hidden />
                  Nada marcado para este dia.
                </div>
              ) : (
                <ul className="divide-y">{doDia.map((o) => <LinhaAgenda key={o.chave} o={o} />)}</ul>
              )}
            </section>

            <div className="space-y-6">
              <section aria-labelledby="titulo-atencao" className="rounded-2xl border bg-card p-5 shadow-sm">
                <h2 id="titulo-atencao" className="mb-3 text-xl font-semibold">Precisa de atenção</h2>
                {v.alertas.length === 0 ? (
                  <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" aria-hidden /> Tudo em ordem.</p>
                ) : (
                  <ul className="space-y-3">
                    {v.alertas.map((a) => (
                      <li key={a.texto} className="rounded-xl bg-amber-50 p-3 text-amber-950 dark:bg-amber-950 dark:text-amber-50">
                        <p className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0" aria-hidden />{a.texto}</p>
                        <Link href={a.href} className="ml-6 mt-1 inline-block font-semibold underline">{a.acao}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="titulo-turmas" className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 id="titulo-turmas" className="text-xl font-semibold">Oficinas</h2>
                  <Link href="/portal/oficinas" className="text-sm font-medium text-primary hover:underline">Ver todas</Link>
                </div>
                {v.turmas.length === 0 ? <p className="text-muted-foreground">Nenhuma oficina cadastrada.</p> : (
                  <ul className="space-y-3">
                    {v.turmas.map((t) => {
                      const pct = t.vagas ? Math.min(100, Math.round((t.inscritos / t.vagas) * 100)) : 0
                      return (
                        <li key={t.id}>
                          <div className="mb-1 flex justify-between gap-3"><span className="truncate">{t.nome}</span><span className="shrink-0 font-medium tabular-nums">{t.inscritos}/{t.vagas}</span></div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${pct}% das vagas preenchidas`}>
                            <div className={`h-full rounded-full ${pct >= 100 ? "bg-rose-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
