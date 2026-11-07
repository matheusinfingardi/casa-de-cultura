"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import CapaItem from "@/components/comum/capa-item"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import { Carregando } from "@/components/painel/cartoes"
import { useDemo } from "@/hooks/use-demo"
import { dataExtenso } from "@/lib/formatar"
import { listarItensView, proximasDatas, type ItemView } from "@/lib/itens"
import { listarRegistros, type Registro } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, contarInscritos, type ContagemItem } from "@/lib/services/presencas"

export default function MinhasAtividadesPage() {
  const { user } = useAuth()
  const demo = useDemo()
  const [itens, setItens] = useState<ItemView[] | null>(null)
  const [contagem, setContagem] = useState<Record<string, ContagemItem>>({})
  const [registros, setRegistros] = useState<Registro[]>([])

  useEffect(() => {
    if (!user) return
    listarItensView().then((l) => setItens(l.filter((i) => i.responsavel_id === user.id)))
    contarInscritos().then(setContagem)
  }, [user])
  useEffect(() => { if (demo) listarRegistros().then(setRegistros) }, [demo])

  return (
    <div className="space-y-6">
      <PageHeader titulo="Minhas atividades" descricao="Tudo o que está sob sua responsabilidade. Abra uma atividade para ver o diário de presença e as pessoas inscritas." />
      {itens === null ? <Carregando /> : itens.length === 0 ? (
        <EstadoVazio icon={ClipboardX} titulo="Nenhuma atividade ainda" texto="Quando a administração escolher você como responsável, ela aparece aqui." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((i) => {
            const feitos = new Set(registros.filter((r) => r.item_id === i.id).map((r) => r.data)).size
            const prox = proximasDatas(i, 30)[0]
            const inscritos = contagem[`${i.tipo}-${i.id}`]?.total ?? 0
            return (
              <li key={`${i.tipo}-${i.id}`} className="flex">
                <article className="flex w-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors hover:border-primary">
                  <CapaItem tipo={i.tipo} imagem={i.imagem_url} className="h-36" />
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <Badge variant="outline" className="w-fit">{ITEM_TIPO_LABELS[i.tipo]}</Badge>
                    <h2 className="text-lg font-semibold leading-snug"><Link href={`/painel/atividades/${i.tipo}/${i.id}`} className="hover:underline">{i.nome}</Link></h2>
                    {prox && <p className="text-sm text-muted-foreground">Próxima: <span className="first-letter:uppercase">{dataExtenso(prox.data)}</span>, {prox.inicio.slice(0, 5)}</p>}
                    <dl className="mt-auto grid grid-cols-2 gap-2 border-t pt-3 text-center">
                      <div><dd className="text-2xl font-bold">{inscritos}{i.vagas ? <span className="text-sm font-normal text-muted-foreground"> de {i.vagas}</span> : null}</dd><dt className="text-sm text-muted-foreground">inscritos</dt></div>
                      <div><dd className="text-2xl font-bold">{feitos}</dd><dt className="text-sm text-muted-foreground">encontros feitos</dt></div>
                    </dl>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
