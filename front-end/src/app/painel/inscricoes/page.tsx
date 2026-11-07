"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, CheckCircle2, Hourglass, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import CapaItem from "@/components/comum/capa-item"
import Confirmar from "@/components/comum/confirmar"
import PageHeader from "@/components/comum/page-header"
import { Carregando, VazioCard } from "@/components/painel/cartoes"
import { useAssistido } from "@/components/painel/use-assistido"
import { useDemo } from "@/hooks/use-demo"
import { calcularAssiduidade } from "@/lib/assiduidade"
import { dataBR, dataExtenso } from "@/lib/formatar"
import { proximasDatas } from "@/lib/itens"
import { registrosDaPessoa, type Registro } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, type MinhaPresenca } from "@/lib/services/presencas"

export default function InscricoesPage() {
  const { user } = useAuth()
  const demo = useDemo()
  const a = useAssistido()
  const { minhas, espera, itens, loading, cancelar, sairFila } = a
  const [registros, setRegistros] = useState<Registro[]>([])
  const [cancelando, setCancelando] = useState<MinhaPresenca | null>(null)

  useEffect(() => { if (demo && user) registrosDaPessoa(user.id).then(setRegistros) }, [demo, user])

  const ultimos = useMemo(() => [...registros].sort((x, y) => y.data.localeCompare(x.data)).slice(0, 6), [registros])
  const nomeDe = (id: string) => minhas.find((m) => m.item_id === id)?.item_nome ?? "Item"

  return (
    <div className="space-y-6">
      <PageHeader titulo="Minhas inscrições" descricao="Veja a próxima data de cada item, e quantas vezes você compareceu. Os certificados ficam em Certificados." />
      {loading ? <Carregando /> : (
        <>
          {minhas.length === 0 ? (
            <VazioCard>
              Você ainda não se inscreveu em nada.{" "}
              <Link href="/painel/explorar" className="font-medium text-primary hover:underline">Ver o que está disponível</Link>
            </VazioCard>
          ) : (
            <ul className="space-y-3">
              {minhas.map((p) => {
                const item = itens.find((i) => i.tipo === p.item_tipo && i.id === p.item_id)
                const prox = item ? proximasDatas(item, 30)[0] : undefined
                const ass = calcularAssiduidade(registros.filter((r) => r.item_id === p.item_id))
                return (
                  <li key={p.id}>
                    <Card className="flex-row gap-0 overflow-hidden p-0">
                      <div className="hidden w-40 shrink-0 sm:block"><CapaItem tipo={p.item_tipo} imagem={item?.imagem_url} className="h-full min-h-32" /></div>
                      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/painel/item/${p.item_tipo}/${p.item_id}`} className="text-lg font-semibold hover:underline">{p.item_nome ?? "Item"}</Link>
                          <Badge variant="outline">{ITEM_TIPO_LABELS[p.item_tipo]}</Badge>
                        </div>
                        {prox && <p className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4 shrink-0" aria-hidden /><span>Próxima data: <span className="first-letter:uppercase">{dataExtenso(prox.data)}</span>, {prox.inicio.slice(0, 5)}</span></p>}
                        {ass.total > 0 && <p className="text-muted-foreground">Você veio a <strong className="text-foreground">{ass.presentes} de {ass.total}</strong> encontros</p>}
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setCancelando(p)}>Cancelar inscrição</Button>
                        </div>
                      </div>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}

          {espera.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Lista de espera</h2>
              {espera.map((e) => (
                <Card key={e.id} className="flex-row flex-wrap items-center justify-between gap-3 p-4">
                  <Link href={`/painel/item/${e.item_tipo}/${e.item_id}`} className="flex items-center gap-2 font-semibold hover:underline"><Hourglass className="h-4 w-4" aria-hidden />{e.item_nome}</Link>
                  <Button size="sm" variant="ghost" onClick={() => sairFila(e)}>Sair da lista</Button>
                </Card>
              ))}
            </section>
          )}

          {ultimos.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Minhas últimas presenças</h2>
              <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
                {ultimos.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-3.5">
                    <span className="flex items-center gap-2">
                      {r.status === "presente" ? <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" aria-hidden /> : <XCircle className="h-5 w-5 text-rose-700 dark:text-rose-300" aria-hidden />}
                      {nomeDe(r.item_id)}
                    </span>
                    <span className="text-muted-foreground">{dataBR(r.data)} · {r.status === "presente" ? "Presente" : "Ausente"}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
      {cancelando && (
        <Confirmar aberto onFechar={() => setCancelando(null)} titulo="Cancelar inscrição?" descricao={<>Você sairá de “{cancelando.item_nome}”. Pode se inscrever de novo depois.</>} confirmarLabel="Cancelar inscrição" perigoso onConfirmar={() => cancelar(cancelando)} />
      )}
    </div>
  )
}
