"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, ClipboardList, Search } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { useAssistido } from "@/components/painel/use-assistido"
import { Carregando, VazioCard, CartaoInscricao } from "@/components/painel/cartoes"
import {
  listarItensDoResponsavel,
  ITEM_TIPO_LABELS,
  type ItemResponsavel,
} from "@/lib/services/presencas"

function Resumo({
  icon: Icon,
  valor,
  titulo,
  href,
}: {
  icon: typeof Search
  valor: number
  titulo: string
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="p-4 flex items-center gap-4 hover:bg-muted/40 transition-colors">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-2xl font-bold leading-none">{valor}</p>
          <p className="text-sm text-muted-foreground mt-1">{titulo}</p>
        </div>
      </Card>
    </Link>
  )
}

// --- Assistido ---------------------------------------------------------------
function InicioAssistido({ nome }: { nome: string }) {
  const { minhas, disponiveis, loading, acao, cancelar } = useAssistido()
  const presencas = minhas.filter((p) => p.status === "presente").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Olá, {nome}!</h1>
        <p className="text-muted-foreground text-sm">
          Aqui você acompanha o que está inscrito e descobre novidades.
        </p>
      </div>

      {loading ? (
        <Carregando />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Resumo icon={ClipboardList} valor={minhas.length} titulo="Inscrições" href="/painel/inscricoes" />
            <Resumo icon={CheckCircle2} valor={presencas} titulo="Presenças confirmadas" href="/painel/inscricoes" />
            <Resumo icon={Search} valor={disponiveis.length} titulo="Disponíveis para você" href="/painel/explorar" />
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Minhas inscrições</h2>
              {minhas.length > 3 && (
                <Link href="/painel/inscricoes" className="text-sm text-primary font-medium hover:underline">
                  Ver todas
                </Link>
              )}
            </div>
            {!minhas.length ? (
              <VazioCard>
                Você ainda não está inscrito em nada.{" "}
                <Link href="/painel/explorar" className="text-primary font-medium hover:underline">
                  Ver o que está disponível
                </Link>
              </VazioCard>
            ) : (
              <div className="flex flex-col gap-3">
                {minhas.slice(0, 3).map((p) => (
                  <CartaoInscricao key={p.id} p={p} ocupado={acao === p.id} onCancelar={cancelar} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

// --- Voluntário --------------------------------------------------------------
function InicioVoluntario({ nome }: { nome: string }) {
  const [data, setData] = useState<ItemResponsavel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listarItensDoResponsavel().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {nome}!</h1>
        <p className="text-muted-foreground text-sm">
          Estes são os compromissos sob sua responsabilidade. Toque em um deles para registrar a presença.
        </p>
      </div>

      {loading ? (
        <Carregando />
      ) : !data.length ? (
        <VazioCard>
          Você ainda não foi designado para nenhuma atividade. Quando a administração
          atribuir algo a você, aparecerá aqui.
        </VazioCard>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <Link key={`${item.tipo}-${item.id}`} href={`/painel/presenca/${item.tipo}/${item.id}`}>
              <Card className="p-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.nome ?? "Item"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{ITEM_TIPO_LABELS[item.tipo]}</Badge>
                    {item.local && (
                      <span className="text-sm text-muted-foreground truncate">{item.local}</span>
                    )}
                  </div>
                </div>
                <span className="flex items-center gap-1 text-sm text-primary font-medium whitespace-nowrap">
                  Registrar presença <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Card>
            </Link>
          ))}
        </div>
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
