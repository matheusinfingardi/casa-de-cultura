"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, ClipboardX, Clock, Hourglass, MapPin, QrCode, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import AvisoOffline from "@/components/comum/aviso-offline"
import { Carregando, CartaoItem } from "@/components/painel/cartoes"
import { useAssistido } from "@/components/painel/use-assistido"
import { dataExtenso, chaveData, faixaHorario, paraData } from "@/lib/formatar"
import { carregarItem, datasDoItem, proximasDatas, type ItemView } from "@/lib/itens"
import { useDemo } from "@/hooks/use-demo"
import { listarRegistros, type Registro } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, contarInscritos, listarItensDoResponsavel, type ContagemItem, type ItemResponsavel } from "@/lib/services/presencas"
import type { Ocorrencia } from "@/lib/agenda"

function InicioAssistido({ nome }: { nome: string }) {
  const a = useAssistido()
  const { minhas, itens, loading } = a
  const presencas = minhas.filter((p) => p.status === "presente").length

  const meus = useMemo(() => itens.filter((i) => minhas.some((p) => p.item_tipo === i.tipo && p.item_id === i.id)), [itens, minhas])
  const datas = useMemo(() => meus.flatMap((i) => proximasDatas(i, 21)).sort((x, y) => (x.data + x.inicio).localeCompare(y.data + y.inicio)), [meus])
  const proximo = datas[0]
  const seguintes = datas.slice(1, 5)
  const hoje = chaveData(new Date())
  const sugestoes = useMemo(() => itens.filter((i) => i.tipo !== "centro" && !a.inscrito(i) && !a.lotado(i) && (i.tipo !== "evento" || ((i.bruto as { data?: string }).data ?? "") >= hoje)).slice(0, 3), [itens, a, hoje])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Olá, {nome}!</h1>
        <p className="mt-1 text-muted-foreground">Veja o que você tem pela frente e o que mais a Casa de Cultura oferece.</p>
      </div>

      {loading ? <Carregando /> : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <section aria-label="Seu próximo compromisso" className="rounded-2xl bg-primary p-6 text-primary-foreground lg:col-span-2">
              {proximo ? (
                <>
                  <p className="text-sm font-medium opacity-90">Seu próximo compromisso</p>
                  <Link href={`/painel/item/${proximo.tipo}/${proximo.itemId}`} className="mt-1 block text-2xl font-bold hover:underline">{proximo.titulo}</Link>
                  <p className="mt-3 flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" aria-hidden /><span className="first-letter:uppercase">{dataExtenso(proximo.data)}</span></p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" aria-hidden />{faixaHorario(proximo.inicio, proximo.fim)}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{proximo.local}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold">Nada marcado por enquanto</p>
                  <p className="mt-1 opacity-90">Veja o que está disponível e escolha algo.</p>
                  <Button asChild variant="secondary" className="mt-4"><Link href="/painel/explorar"><Search className="h-4 w-4" aria-hidden /> Ver atividades</Link></Button>
                </>
              )}
            </section>
            <Link href="/painel/qr" className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-6 text-center shadow-sm transition-colors hover:border-primary">
              <QrCode className="h-10 w-10 text-primary" aria-hidden />
              <span className="text-lg font-semibold">Meu QR Code</span>
              <span className="text-sm text-muted-foreground">Mostre na chegada para marcar sua presença</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[[minhas.length, "inscrições", "/painel/inscricoes", ClipboardList], [presencas, "presenças", "/painel/inscricoes", CheckCircle2], [a.espera.length, "na lista de espera", "/painel/inscricoes", Hourglass]].map(([n, r, h, I]) => {
              const Icone = I as typeof ClipboardList
              return (
                <Link key={r as string} href={h as string} className="flex flex-col gap-1 rounded-2xl border bg-card p-4 shadow-sm hover:border-primary sm:flex-row sm:items-center sm:gap-4">
                  <Icone className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                  <span><span className="block text-3xl font-bold">{n as number}</span><span className="text-sm text-muted-foreground sm:text-base">{r as string}</span></span>
                </Link>
              )
            })}
          </div>

          {seguintes.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Depois disso</h2>
                <Link href="/painel/agenda" className="flex items-center gap-1 font-medium text-primary hover:underline">Ver minha agenda <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              </div>
              <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
                {seguintes.map((o) => (
                  <li key={o.chave}>
                    <Link href={`/painel/item/${o.tipo}/${o.itemId}`} className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-muted/40">
                      <span className="font-medium">{o.titulo}</span>
                      <span className="text-muted-foreground first-letter:uppercase">{dataExtenso(o.data)}, {o.inicio.slice(0, 5)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sugestoes.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Você também pode participar</h2>
                <Link href="/painel/explorar" className="flex items-center gap-1 font-medium text-primary hover:underline">Ver tudo <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sugestoes.map((i) => <li key={`${i.tipo}-${i.id}`} className="flex"><CartaoItem i={i} assistido={a} /></li>)}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function LinhaCompromisso({ o, inscritos, pendente }: { o: Ocorrencia; inscritos?: number; pendente?: boolean }) {
  return (
    <li>
      <Link href={`/painel/presenca/${o.tipo}/${o.itemId}?data=${o.data}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border bg-card p-3 shadow-sm transition-colors hover:border-primary">
        <span className="w-14 text-lg font-semibold tabular-nums">{o.inicio.slice(0, 5)}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{o.titulo}</span>
          <span className="block text-sm text-muted-foreground">{pendente ? `${paraData(o.data).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} · ` : ""}{o.local}{inscritos !== undefined ? ` · ${inscritos} inscritos` : ""}</span>
        </span>
        <span className={`flex items-center gap-1 font-medium ${pendente ? "text-amber-800 dark:text-amber-300" : "text-primary"}`}>{pendente ? "Fazer chamada" : "Abrir chamada"} <ArrowRight className="h-4 w-4" aria-hidden /></span>
      </Link>
    </li>
  )
}

function InicioVoluntario({ nome }: { nome: string }) {
  const demo = useDemo()
  const [itens, setItens] = useState<ItemResponsavel[] | null>(null)
  const [views, setViews] = useState<ItemView[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [contagem, setContagem] = useState<Record<string, ContagemItem>>({})
  const [visao, setVisao] = useState<"dia" | "atividade">("dia")

  useEffect(() => {
    listarItensDoResponsavel().then(async (d) => {
      setItens(d)
      const v = await Promise.all(d.map((i) => carregarItem(i.tipo, i.id)))
      setViews(v.filter(Boolean) as ItemView[])
    })
    contarInscritos().then(setContagem)
  }, [])
  useEffect(() => { if (demo) listarRegistros().then(setRegistros) }, [demo])

  const hojeK = chaveData(new Date())
  const datas = useMemo(() => views.flatMap((v) => datasDoItem(v, 14, 14)).sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio)), [views])
  const feitas = useMemo(() => new Set(registros.map((r) => `${r.item_id}|${r.data}`)), [registros])
  const pendentes = demo ? datas.filter((o) => o.data < hojeK && !feitas.has(`${o.itemId}|${o.data}`)) : []
  const hoje = datas.filter((o) => o.data === hojeK)
  const proximas = datas.filter((o) => o.data > hojeK)
  const porDia = new Map<string, Ocorrencia[]>()
  for (const o of proximas) porDia.set(o.data, [...(porDia.get(o.data) ?? []), o])
  const qtd = (o: Ocorrencia) => contagem[`${o.tipo}-${o.itemId}`]?.total
  const quando = (i: ItemResponsavel) => views.find((v) => v.tipo === i.tipo && v.id === i.id)?.quando

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Olá, {nome}!</h1>
        <p className="mt-1 text-muted-foreground">Veja seus compromissos dia a dia e faça a chamada de quem está inscrito.</p>
      </div>

      <AvisoOffline />

      {itens === null ? <Carregando /> : itens.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <ClipboardX className="h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="text-lg font-semibold">Nenhum compromisso ainda</p>
          <p className="max-w-md text-muted-foreground">Quando a administração escolher você como responsável por um item, ele aparece aqui.</p>
        </Card>
      ) : (
        <>
          <div className="inline-flex rounded-xl border bg-card p-1" role="group" aria-label="Forma de ver os compromissos">
            {([["dia", "Dia a dia"], ["atividade", "Por atividade"]] as const).map(([v, r]) => (
              <button key={v} type="button" aria-pressed={visao === v} onClick={() => setVisao(v)} className={`rounded-lg px-4 py-2 text-sm font-medium ${visao === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{r}</button>
            ))}
          </div>

          {visao === "dia" ? (
            <div className="space-y-6">
              {pendentes.length > 0 && (
                <section aria-labelledby="pendentes" className="space-y-2 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950">
                  <h2 id="pendentes" className="text-lg font-semibold">Chamadas pendentes ({pendentes.length})</h2>
                  <p className="text-sm">Estes dias já passaram e ainda não têm presença marcada.</p>
                  <ul className="space-y-2">
                    {pendentes.slice(-3).reverse().map((o) => <LinhaCompromisso key={o.chave} o={o} inscritos={qtd(o)} pendente />)}
                  </ul>
                </section>
              )}
              <section aria-labelledby="hoje" className="space-y-2">
                <h2 id="hoje" className="text-xl font-semibold first-letter:uppercase">Hoje, {dataExtenso(hojeK)}</h2>
                {hoje.length === 0 ? <p className="rounded-xl border bg-card p-4 text-muted-foreground">Nenhum compromisso seu hoje.</p> : <ul className="space-y-2">{hoje.map((o) => <LinhaCompromisso key={o.chave} o={o} inscritos={qtd(o)} />)}</ul>}
              </section>
              {[...porDia.entries()].map(([data, l]) => (
                <section key={data} className="space-y-2">
                  <h2 className="font-semibold first-letter:uppercase">{dataExtenso(data)}</h2>
                  <ul className="space-y-2">{l.map((o) => <LinhaCompromisso key={o.chave} o={o} inscritos={qtd(o)} />)}</ul>
                </section>
              ))}
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {itens.map((i) => (
                <li key={`${i.tipo}-${i.id}`}>
                  <Link href={`/painel/presenca/${i.tipo}/${i.id}`} className="flex h-full flex-col gap-1 rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-primary">
                    <span className="text-sm text-muted-foreground">{ITEM_TIPO_LABELS[i.tipo]}</span>
                    <span className="text-lg font-semibold">{i.nome}</span>
                    {quando(i) && <span className="text-muted-foreground">{quando(i)}</span>}
                    {i.local && <span className="text-muted-foreground">{i.local}</span>}
                    <span className="mt-2 flex items-center gap-1 font-medium text-primary">Abrir chamada <ArrowRight className="h-4 w-4" aria-hidden /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export default function PainelPage() {
  const { role, user } = useAuth()
  const completo = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? ""
  const nome = completo.split(" ")[0] || "bem-vindo"
  return role === "responsavel" ? <InicioVoluntario nome={nome} /> : <InicioAssistido nome={nome} />
}
