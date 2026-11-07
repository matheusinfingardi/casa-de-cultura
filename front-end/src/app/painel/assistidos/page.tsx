"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { Carregando } from "@/components/painel/cartoes"
import { usePessoasInfo } from "@/hooks/use-pessoas-info"
import { listarAssistidosDoVoluntario, type AssistidoRelacionado } from "@/lib/assistidos-do-voluntario"
import { calcularAssiduidade, situacao } from "@/lib/assiduidade"
import { iniciais } from "@/lib/formatar"
import { listarFichas, type Ficha } from "@/lib/services/extras"

function Lista() {
  const { user } = useAuth()
  const [lista, setLista] = useState<AssistidoRelacionado[] | null>(null)
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [busca, setBusca] = useState("")
  const info = usePessoasInfo({ comSaude: false })
  const [filtro, setFiltro] = useState<"todos" | "contato" | "cuidado">("todos")

  useEffect(() => {
    if (user) listarAssistidosDoVoluntario(user.id).then(setLista)
    listarFichas().then(setFichas)
  }, [user])

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return (lista ?? [])
      .map((a) => ({ ...a, ass: calcularAssiduidade(a.registros), ficha: fichas.find((f) => f.id === a.pessoa.id) }))
      .filter((a) => {
        if (t && !(a.pessoa.nome ?? "").toLowerCase().includes(t)) return false
        if (filtro === "contato") return a.ass.faltasSeguidas >= 3 || (a.ass.taxa ?? 100) < 50
        if (filtro === "cuidado") return !!(a.ficha?.deficiencia || a.ficha?.acessibilidade || a.ficha?.alergias)
        return true
      })
      .sort((a, b) => (a.pessoa.nome ?? "").localeCompare(b.pessoa.nome ?? "", "pt-BR"))
  }, [lista, fichas, busca, filtro])

  if (lista === null) return <Carregando />
  if (!lista.length) return <EstadoVazio icon={Users} titulo="Ninguém por aqui ainda" texto="As pessoas inscritas nas suas atividades aparecem nesta página." />

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-10" placeholder="Buscar pelo nome" aria-label="Buscar assistido" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar assistidos">
          {([["todos", "Todos"], ["contato", "Precisam de contato"], ["cuidado", "Com cuidados especiais"]] as const).map(([v, r]) => (
            <Button key={v} size="sm" variant={filtro === v ? "default" : "outline"} aria-pressed={filtro === v} onClick={() => setFiltro(v)}>{r}</Button>
          ))}
        </div>
      </div>
      <p className="text-muted-foreground" aria-live="polite">{visiveis.length} {visiveis.length === 1 ? "pessoa" : "pessoas"}</p>
      {visiveis.length === 0 ? <EstadoVazio icon={Search} titulo="Ninguém encontrado" texto="Tente outra busca ou outro filtro." /> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visiveis.map((a) => {
            const st = situacao(a.ass)
            return (
              <li key={a.pessoa.id} className="flex">
                <Link href={`/painel/assistidos/${a.pessoa.id}`} className="flex w-full items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-primary">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary" aria-hidden>{iniciais(a.pessoa.nome)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{a.pessoa.nome}</span>
                    <span className="block text-sm text-muted-foreground">{a.itens.map((i) => i.nome).join(", ")}</span>
                    {info(a.pessoa.id).familia && <span className="mt-1 block text-sm font-medium">Dependentes: {info(a.pessoa.id).familia}</span>}
                    {a.ficha?.deficiencia && <span className="mt-1 block text-sm font-medium">{a.ficha.deficiencia}</span>}
                    <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-sm font-medium ${st.classe}`}>{a.ass.taxa !== null ? `${a.ass.taxa}% · ` : ""}{st.rotulo}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default function MeusAssistidosPage() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Meus assistidos" descricao="As pessoas inscritas nas suas atividades: quem está vindo, quem precisa de contato e o que ajuda a acolher cada uma." />
      <SoDemo><Lista /></SoDemo>
    </div>
  )
}
