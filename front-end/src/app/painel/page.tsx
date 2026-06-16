"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import {
  listarMinhasPresencas,
  listarItensDoResponsavel,
  listarTodosItens,
  inscreverMe,
  removerPresenca,
  PRESENCA_LABELS,
  ITEM_TIPO_LABELS,
  type MinhaPresenca,
  type ItemResponsavel,
  type PresencaStatus,
} from "@/lib/services/presencas"

const STATUS_BADGE: Record<PresencaStatus, "default" | "secondary" | "outline" | "destructive"> = {
  presente: "default",
  marcada: "secondary",
  ausente: "destructive",
}

// --- Cliente -----------------------------------------------------------------
function PainelCliente() {
  const [minhas, setMinhas] = useState<MinhaPresenca[]>([])
  const [itens, setItens] = useState<ItemResponsavel[]>([])
  const [loading, setLoading] = useState(true)
  const [acao, setAcao] = useState<string | null>(null)

  async function carregar() {
    const [m, i] = await Promise.all([listarMinhasPresencas(), listarTodosItens()])
    setMinhas(m)
    setItens(i)
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  const inscritos = new Set(minhas.map((p) => `${p.item_tipo}-${p.item_id}`))
  const disponiveis = itens.filter((i) => !inscritos.has(`${i.tipo}-${i.id}`))

  async function handleInscrever(i: ItemResponsavel) {
    setAcao(`${i.tipo}-${i.id}`)
    try {
      await inscreverMe(i.tipo, i.id, i.nome)
      await carregar()
    } catch {
      // erro exibido via toast
    } finally {
      setAcao(null)
    }
  }

  async function handleCancelar(p: MinhaPresenca) {
    if (!window.confirm("Cancelar esta inscrição?")) return
    setAcao(p.id)
    try {
      await removerPresenca(p.id)
      setMinhas((prev) => prev.filter((x) => x.id !== p.id))
    } catch {
      // erro exibido via toast
    } finally {
      setAcao(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>
  }

  return (
    <div className="space-y-8">
      {/* Minhas inscrições */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Minhas inscrições</h2>
        {!minhas.length ? (
          <Card className="p-6 text-center text-muted-foreground">
            Você ainda não está inscrito em nada.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {minhas.map((p) => (
              <Card key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.item_nome ?? "Item"}</p>
                  <Badge variant="outline" className="mt-1">
                    {ITEM_TIPO_LABELS[p.item_tipo]}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_BADGE[p.status]}>{PRESENCA_LABELS[p.status]}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelar(p)}
                    disabled={acao === p.id}
                  >
                    Cancelar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Disponíveis para inscrição */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Disponíveis para inscrição</h2>
        {!disponiveis.length ? (
          <Card className="p-6 text-center text-muted-foreground">
            Nenhum item disponível no momento.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {disponiveis.map((i) => (
              <Card
                key={`${i.tipo}-${i.id}`}
                className="p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{i.nome ?? "Item"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{ITEM_TIPO_LABELS[i.tipo]}</Badge>
                    {i.local && (
                      <span className="text-sm text-muted-foreground truncate">{i.local}</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleInscrever(i)}
                  disabled={acao === `${i.tipo}-${i.id}`}
                >
                  Inscrever-se
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// --- Responsável -------------------------------------------------------------
function MeusItens() {
  const [data, setData] = useState<ItemResponsavel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listarItensDoResponsavel().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>
  }

  if (!data.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Você ainda não é responsável por nada.
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((item) => (
        <Link key={`${item.tipo}-${item.id}`} href={`/painel/presenca/${item.tipo}/${item.id}`}>
          <Card className="p-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors cursor-pointer">
            <div className="min-w-0">
              <p className="font-medium truncate">{item.nome ?? "Item"}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{ITEM_TIPO_LABELS[item.tipo]}</Badge>
                {item.local && (
                  <span className="text-sm text-muted-foreground truncate">{item.local}</span>
                )}
              </div>
            </div>
            <span className="text-sm text-blue-600 font-medium whitespace-nowrap">
              Gerenciar presença →
            </span>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default function PainelPage() {
  const { role } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {role === "responsavel" ? "Sob minha responsabilidade" : "Meu Painel"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {role === "responsavel"
            ? "Atividades, eventos, oficinas, centros e assistências que você ministra. Clique para registrar a presença."
            : "Inscreva-se nas atividades, eventos, oficinas, centros e assistências e acompanhe sua presença."}
        </p>
      </div>

      {role === "responsavel" ? <MeusItens /> : <PainelCliente />}
    </div>
  )
}
