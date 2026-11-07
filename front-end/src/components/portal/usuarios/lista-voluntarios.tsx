"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { HandHeart, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import { useDemo } from "@/hooks/use-demo"
import { iniciais } from "@/lib/formatar"
import { listarItensView, type ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { listarDisponibilidades, listarPedidos, responderPedido, type Disponibilidade, type PedidoVoluntario } from "@/lib/services/extras"
import { contarInscritos, type ContagemItem } from "@/lib/services/presencas"
import { listarUsuarios, type Usuario } from "@/lib/services/usuarios"

const abrev = (d: string) => d.slice(0, 3)

/** Gestão de quem ajuda: o que cada voluntário conduz, quando pode e os pedidos de quem quer entrar. */
export default function ListaVoluntarios() {
  const demo = useDemo()
  const router = useRouter()
  const params = useSearchParams()
  const aba = params.get("aba") === "pedidos" ? "pedidos" : "voluntarios"
  const [pessoas, setPessoas] = useState<Usuario[] | null>(null)
  const [itens, setItens] = useState<ItemView[]>([])
  const [contagem, setContagem] = useState<Record<string, ContagemItem>>({})
  const [disp, setDisp] = useState<Disponibilidade[]>([])
  const [pedidos, setPedidos] = useState<PedidoVoluntario[]>([])
  const [busca, setBusca] = useState("")

  useEffect(() => {
    listarUsuarios().then((l) => setPessoas(l.filter((u) => u.role === "responsavel")))
    listarItensView().then(setItens)
    contarInscritos().then(setContagem)
  }, [])
  useEffect(() => {
    if (!demo) return
    listarDisponibilidades().then(setDisp)
    listarPedidos().then(setPedidos)
  }, [demo])

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return (pessoas ?? []).filter((u) => !t || `${u.nome ?? ""} ${u.email ?? ""}`.toLowerCase().includes(t)).sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR"))
  }, [pessoas, busca])
  const aguardando = pedidos.filter((p) => p.status === "pendente").length

  async function responder(p: PedidoVoluntario, aprovado: boolean) {
    await responderPedido(p, aprovado)
    setPedidos(await listarPedidos())
    notify.success(aprovado ? `Convite enviado para ${p.email}` : "Pedido recusado")
  }

  return (
    <div className="space-y-6">
      <PageHeader titulo="Voluntários" descricao="Quem conduz cada atividade, quando pode ajudar e quem pediu para entrar." migalhas={[{ label: "Gestão" }, { label: "Voluntários" }]} />
      {demo && (
        <div className="flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="Voluntários">
          {([["voluntarios", "Voluntários", pessoas?.length ?? 0], ["pedidos", "Pedidos", aguardando]] as const).map(([v, r, n]) => (
            <button key={v} type="button" role="tab" aria-selected={aba === v} onClick={() => router.replace(`/portal/voluntarios${v === "pedidos" ? "?aba=pedidos" : ""}`, { scroll: false })} className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-medium ${aba === v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {r}<span className={`rounded-full px-2 text-sm ${aba === v ? "bg-primary/10" : "bg-muted"}`}>{n}</span>
            </button>
          ))}
        </div>
      )}

      {aba === "pedidos" ? (
        pedidos.length === 0 ? <EstadoVazio icon={HandHeart} titulo="Nenhum pedido" /> : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {pedidos.map((p) => (
              <li key={p.id} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="font-semibold">{p.nome}</p><p className="truncate text-sm text-muted-foreground">{p.email} · {p.telefone}</p></div>
                  <Badge variant={p.status === "pendente" ? "secondary" : "outline"}>{p.status === "pendente" ? "Aguardando" : p.status === "aprovado" ? "Aprovado" : "Recusado"}</Badge>
                </div>
                <dl className="grid gap-2 sm:grid-cols-2">
                  <div><dt className="text-sm text-muted-foreground">Quer ajudar com</dt><dd>{p.area}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Disponibilidade</dt><dd>{p.disponibilidade}</dd></div>
                </dl>
                {p.status === "pendente" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => responder(p, true)}>Aprovar e convidar</Button>
                    <Button size="sm" variant="outline" onClick={() => responder(p, false)}>Recusar</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input className="pl-10" placeholder="Buscar por nome ou e-mail" aria-label="Buscar voluntário" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          {pessoas === null ? <Skeleton className="h-64 rounded-2xl" /> : visiveis.length === 0 ? <EstadoVazio icon={HandHeart} titulo="Ninguém encontrado" /> : (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visiveis.map((u) => {
                const meus = itens.filter((i) => i.responsavel_id === u.id)
                const inscritos = meus.reduce((t, i) => t + (contagem[`${i.tipo}-${i.id}`]?.total ?? 0), 0)
                const d = disp.find((x) => x.id === u.id)
                const dias = Object.keys(d?.horarios ?? {}).filter((x) => d?.horarios[x]?.length)
                return (
                  <li key={u.id} className="flex">
                    <Link href={`/portal/voluntarios/${u.id}`} className="flex w-full flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-primary">
                      <span className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary" aria-hidden>{iniciais(u.nome)}</span>
                        <span className="min-w-0"><span className="block truncate font-semibold">{u.nome}</span><span className="block truncate text-sm text-muted-foreground">{u.email}</span></span>
                      </span>
                      <span className="block text-sm"><span className="font-medium">Conduz: </span>{meus.length ? meus.map((i) => i.nome).join(", ") : "nada ainda"}</span>
                      {dias.length > 0 && <span className="block text-sm"><span className="font-medium">Pode ajudar: </span>{dias.map(abrev).join(", ")}</span>}
                      <span className="mt-auto flex flex-wrap gap-1.5 border-t pt-3">
                        <Badge variant="secondary">{inscritos} {inscritos === 1 ? "inscrito" : "inscritos"}</Badge>
                        {d?.areas.slice(0, 2).map((a) => <Badge key={a} variant="outline">{a}</Badge>)}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
