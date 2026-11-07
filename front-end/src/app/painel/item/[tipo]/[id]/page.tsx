"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CalendarPlus, CheckCircle2, Hourglass, SearchX, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import CapaItem from "@/components/comum/capa-item"
import Confirmar from "@/components/comum/confirmar"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import { useAssistido } from "@/components/painel/use-assistido"
import { dataExtenso, faixaHorario } from "@/lib/formatar"
import { baixarIcs } from "@/lib/ics"
import { carregarItem, proximasDatas, type ItemView } from "@/lib/itens"
import { listarEspera } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, PRESENCA_LABELS, isItemTipo, type ItemTipo } from "@/lib/services/presencas"

export default function ItemAssistidoPage() {
  const { tipo, id } = useParams<{ tipo: string; id: string }>()
  const a = useAssistido()
  const [item, setItem] = useState<ItemView | null | undefined>(undefined)
  const [posicao, setPosicao] = useState<number | null>(null)
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    ;(isItemTipo(tipo) ? carregarItem(tipo as ItemTipo, id) : Promise.resolve(null)).then(setItem)
  }, [tipo, id])

  const minha = item ? a.inscrito(item) : undefined
  const fila = item ? a.naEspera(item) : undefined

  useEffect(() => {
    ;(fila && item ? listarEspera(item.tipo, item.id).then((l) => l.findIndex((e) => e.id === fila.id) + 1) : Promise.resolve(null)).then(setPosicao)
  }, [fila, item])

  if (item === undefined || a.loading) return <Skeleton className="h-96 rounded-2xl" />
  if (!item) return <EstadoVazio icon={SearchX} titulo="Item não encontrado" acao={<Button asChild variant="outline"><Link href="/painel/explorar">Voltar para Explorar</Link></Button>} />

  const datas = proximasDatas(item)
  const lotado = a.lotado(item)
  const vagas = a.vagasLivres(item)

  return (
    <div className="space-y-6">
      <PageHeader titulo={item.nome} migalhas={[{ label: "Explorar", href: "/painel/explorar" }, { label: item.nome }]} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <CapaItem tipo={item.tipo} imagem={item.imagem_url} />
            <div className="space-y-4 p-5">
              <Badge variant="secondary">{ITEM_TIPO_LABELS[item.tipo]}</Badge>
              {item.descricao && <p className="text-lg leading-relaxed">{item.descricao}</p>}
              <dl className="grid gap-4 sm:grid-cols-2">
                {item.fatos.filter((f) => f.valor && f.rotulo !== "Vagas").map((f) => <div key={f.rotulo}><dt className="text-sm text-muted-foreground">{f.rotulo}</dt><dd className="font-medium">{f.valor}</dd></div>)}
              </dl>
            </div>
          </section>

          {datas.length > 0 && (
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Próximas datas</h2>
                <Button size="sm" variant="outline" onClick={() => baixarIcs(`${item.nome}.ics`, datas)}><CalendarPlus className="h-4 w-4" aria-hidden /> Adicionar ao calendário</Button>
              </div>
              <ul className="divide-y">
                {datas.slice(0, 4).map((o) => <li key={o.chave} className="flex flex-wrap justify-between gap-2 py-2.5"><span className="font-medium first-letter:uppercase">{dataExtenso(o.data)}</span><span className="text-muted-foreground">{faixaHorario(o.inicio, o.fim)}</span></li>)}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-6">
          {minha ? (
            <>
              <p className="flex items-center gap-2 text-lg font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" aria-hidden /> Você está inscrito</p>
              <p className="text-muted-foreground">Situação: {PRESENCA_LABELS[minha.status]}</p>
              <Button variant="outline" className="w-full" onClick={() => setCancelando(true)}>Cancelar inscrição</Button>
            </>
          ) : fila ? (
            <>
              <p className="flex items-center gap-2 text-lg font-semibold"><Hourglass className="h-5 w-5" aria-hidden /> Na lista de espera</p>
              <p className="text-muted-foreground">Você é o {posicao}º da fila. Se abrir vaga, entra sozinho e recebe um aviso.</p>
              <Button variant="outline" className="w-full" onClick={() => a.sairFila(fila)}>Sair da lista</Button>
            </>
          ) : lotado ? (
            <>
              <p className="text-lg font-semibold">Turma lotada</p>
              <p className="text-muted-foreground">Entre na lista de espera para ser avisado quando abrir vaga.</p>
              <Button className="w-full" size="lg" disabled={!!a.acao} onClick={() => a.entrarFila(item)}>Entrar na lista de espera</Button>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">Quer participar?</p>
              {vagas !== null && <p className="font-medium text-emerald-700 dark:text-emerald-300">{vagas} {vagas === 1 ? "vaga livre" : "vagas livres"}</p>}
              <Button className="w-full" size="lg" disabled={!!a.acao} onClick={() => a.inscrever(item)}>Quero participar</Button>
            </>
          )}
          {item.responsavel && <p className="flex items-center gap-2 border-t pt-4 text-muted-foreground"><UserRound className="h-4 w-4 shrink-0" aria-hidden /> Com {item.responsavel}</p>}
        </aside>
      </div>

      {minha && (
        <Confirmar aberto={cancelando} onFechar={() => setCancelando(false)} titulo="Cancelar inscrição?" descricao={<>Você sairá de “{item.nome}”. Pode se inscrever de novo depois.</>} confirmarLabel="Cancelar inscrição" perigoso onConfirmar={() => a.cancelar(minha)} />
      )}
    </div>
  )
}
