"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, ClipboardX, Clock, MapPin, QrCode, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import AvisoOffline from "@/components/comum/aviso-offline"
import { Carregando, CartaoInscricao, VazioCard } from "@/components/painel/cartoes"
import { useAssistido } from "@/components/painel/use-assistido"
import { dataExtenso, chaveData, faixaHorario } from "@/lib/formatar"
import { carregarItem, proximasDatas, type ItemView } from "@/lib/itens"
import { ITEM_TIPO_LABELS, listarItensDoResponsavel, type ItemResponsavel } from "@/lib/services/presencas"
import type { Ocorrencia } from "@/lib/agenda"

function InicioAssistido({ nome }: { nome: string }) {
  const { minhas, itens, loading, acao, cancelar } = useAssistido()
  const presencas = minhas.filter((p) => p.status === "presente").length

  const proximo = useMemo(() => {
    const meus = itens.filter((i) => minhas.some((p) => p.item_tipo === i.tipo && p.item_id === i.id))
    return meus.flatMap(proximasDatas).sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio))[0]
  }, [itens, minhas])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Olá, {nome}!</h1>
        <p className="mt-1 text-muted-foreground">Veja o que vem por aí e descubra novidades.</p>
      </div>

      {loading ? <Carregando /> : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <section aria-label="Seu próximo compromisso" className="rounded-2xl bg-primary p-6 text-primary-foreground lg:col-span-2">
              {proximo ? (
                <>
                  <p className="text-sm font-medium opacity-90">Seu próximo compromisso</p>
                  <p className="mt-1 text-2xl font-bold">{proximo.titulo}</p>
                  <p className="mt-3 flex items-center gap-2 first-letter:uppercase"><CalendarDays className="h-4 w-4 shrink-0" aria-hidden /><span className="first-letter:uppercase">{dataExtenso(proximo.data)}</span></p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" aria-hidden />{faixaHorario(proximo.inicio, proximo.fim)}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{proximo.local}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold">Nada marcado por enquanto</p>
                  <p className="mt-1 opacity-90">Veja o que está disponível e escolha algo.</p>
                  <Button asChild variant="secondary" className="mt-4"><Link href="/painel/explorar"><Search className="h-4 w-4" aria-hidden /> Explorar</Link></Button>
                </>
              )}
            </section>
            <Link href="/painel/qr" className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-6 text-center shadow-sm transition-colors hover:border-primary">
              <QrCode className="h-10 w-10 text-primary" aria-hidden />
              <span className="text-lg font-semibold">Meu QR Code</span>
              <span className="text-sm text-muted-foreground">Mostre ao voluntário para registrar sua presença</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/painel/inscricoes" className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm hover:border-primary">
              <ClipboardList className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              <span><span className="block text-3xl font-bold">{minhas.length}</span><span className="text-muted-foreground">inscrições</span></span>
            </Link>
            <Link href="/painel/inscricoes" className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm hover:border-primary">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              <span><span className="block text-3xl font-bold">{presencas}</span><span className="text-muted-foreground">presenças</span></span>
            </Link>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Minhas inscrições</h2>
              <Link href="/painel/inscricoes" className="flex items-center gap-1 font-medium text-primary hover:underline">Ver todas <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            {minhas.length === 0 ? <VazioCard>Você ainda não se inscreveu em nada.</VazioCard> : (
              <div className="flex flex-col gap-3">
                {minhas.slice(0, 3).map((p) => <CartaoInscricao key={p.id} p={p} ocupado={acao === p.id} onCancelar={cancelar} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function InicioVoluntario({ nome }: { nome: string }) {
  const [itens, setItens] = useState<ItemResponsavel[] | null>(null)
  const [views, setViews] = useState<ItemView[]>([])

  useEffect(() => {
    listarItensDoResponsavel().then(async (d) => {
      setItens(d)
      const v = await Promise.all(d.map((i) => carregarItem(i.tipo, i.id)))
      setViews(v.filter(Boolean) as ItemView[])
    })
  }, [])

  const hojeK = chaveData(new Date())
  const datas: Ocorrencia[] = views.flatMap((v) => proximasDatas(v, 14))
  const hoje = datas.filter((o) => o.data === hojeK)
  const quando = (i: ItemResponsavel) => views.find((v) => v.tipo === i.tipo && v.id === i.id)?.quando

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Olá, {nome}!</h1>
        <p className="mt-1 text-muted-foreground">Abra um compromisso para registrar a presença.</p>
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
          <section aria-labelledby="hoje" className="rounded-2xl bg-primary p-6 text-primary-foreground">
            <h2 id="hoje" className="text-sm font-medium opacity-90">Hoje</h2>
            {hoje.length === 0 ? <p className="mt-1 text-xl font-semibold">Nada marcado para hoje</p> : (
              <ul className="mt-2 space-y-2">
                {hoje.map((o) => (
                  <li key={o.chave}>
                    <Link href={`/painel/presenca/${o.tipo}/${o.itemId}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/10 p-3 hover:bg-white/20">
                      <span className="text-lg font-semibold">{o.inicio.slice(0, 5)} · {o.titulo}</span>
                      <span className="flex items-center gap-1 font-medium">Registrar presença <ArrowRight className="h-4 w-4" aria-hidden /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Todos os meus compromissos</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {itens.map((i) => (
                <li key={`${i.tipo}-${i.id}`}>
                  <Link href={`/painel/presenca/${i.tipo}/${i.id}`} className="flex h-full flex-col gap-1 rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-primary">
                    <span className="text-sm text-muted-foreground">{ITEM_TIPO_LABELS[i.tipo]}</span>
                    <span className="text-lg font-semibold">{i.nome}</span>
                    {quando(i) && <span className="text-muted-foreground">{quando(i)}</span>}
                    {i.local && <span className="text-muted-foreground">{i.local}</span>}
                    <span className="mt-2 flex items-center gap-1 font-medium text-primary">Registrar presença <ArrowRight className="h-4 w-4" aria-hidden /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
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
