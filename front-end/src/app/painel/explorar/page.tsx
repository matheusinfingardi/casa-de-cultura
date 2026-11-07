"use client"

import { useMemo, useState } from "react"
import { Search, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import { CartaoItem, Carregando } from "@/components/painel/cartoes"
import { useAssistido } from "@/components/painel/use-assistido"
import { DIA_POR_INDICE, DIAS_SEMANA, chaveData, paraData } from "@/lib/formatar"
import { proximasDatas } from "@/lib/itens"
import type { ItemTipo } from "@/lib/services/presencas"

const TIPOS: ItemTipo[] = ["atividade", "oficina", "evento", "assistencia"]
const PLURAL: Record<ItemTipo, string> = { atividade: "Atividades", oficina: "Oficinas", evento: "Eventos", assistencia: "Assistência", centro: "Centros" }
type Aba = "todas" | "disponiveis" | "minhas"

export default function ExplorarPage() {
  const { role } = useAuth()
  const a = useAssistido()
  const { itens, loading } = a
  const [aba, setAba] = useState<Aba>("todas")
  const [tipo, setTipo] = useState<ItemTipo | "todos">("todos")
  const [dia, setDia] = useState("")
  const [busca, setBusca] = useState("")
  const voluntario = role === "responsavel"

  const vigentes = useMemo(() => {
    const hoje = chaveData(new Date())
    return itens.filter((i) => i.tipo !== "centro" && (i.tipo !== "evento" || ((i.bruto as { data?: string }).data ?? "") >= hoje))
  }, [itens])

  const contagem = {
    todas: vigentes.length,
    disponiveis: vigentes.filter((i) => !a.inscrito(i) && !a.lotado(i)).length,
    minhas: vigentes.filter((i) => a.inscrito(i) || a.naEspera(i)).length,
  }

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return vigentes.filter((i) => {
      if (aba === "disponiveis" && (a.inscrito(i) || a.lotado(i))) return false
      if (aba === "minhas" && !a.inscrito(i) && !a.naEspera(i)) return false
      if (tipo !== "todos" && i.tipo !== tipo) return false
      if (t && !`${i.nome} ${i.local} ${i.descricao}`.toLowerCase().includes(t)) return false
      if (dia && !proximasDatas(i, 14).some((o) => DIA_POR_INDICE[paraData(o.data).getDay()] === dia)) return false
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vigentes, aba, tipo, dia, busca, a.minhas, a.espera])

  const ABAS: [Aba, string][] = [["todas", "Tudo o que a Casa oferece"], ["disponiveis", "Posso me inscrever"], ["minhas", "Já participo"]]

  return (
    <div className="space-y-6">
      <PageHeader titulo="Atividades da Casa" descricao="Tudo o que a Casa de Cultura oferece: veja o que você já faz e no que ainda pode se inscrever." />

      {!voluntario && (
        <div className="flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="O que mostrar">
          {ABAS.map(([v, r]) => (
            <button key={v} type="button" role="tab" aria-selected={aba === v} onClick={() => setAba(v)} className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-medium ${aba === v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {r}<span className={`rounded-full px-2 text-sm ${aba === v ? "bg-primary/10" : "bg-muted"}`}>{contagem[v]}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-10" placeholder="Buscar por nome, local ou assunto" aria-label="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <select aria-label="Dia da semana" value={dia} onChange={(e) => setDia(e.target.value)} className="h-11 rounded-xl border bg-card px-3">
          <option value="">Qualquer dia</option>
          {DIAS_SEMANA.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por tipo">
        {(["todos", ...TIPOS] as const).map((t) => (
          <Button key={t} size="sm" variant={tipo === t ? "default" : "outline"} aria-pressed={tipo === t} onClick={() => setTipo(t)} className="shrink-0">
            {t === "todos" ? "Todos os tipos" : PLURAL[t]}
          </Button>
        ))}
      </div>

      {loading ? <Carregando /> : filtrados.length === 0 ? (
        <EstadoVazio icon={SearchX} titulo="Nada encontrado" texto="Tente outra busca, outro dia ou outro tipo." />
      ) : (
        <>
          <p className="text-muted-foreground" aria-live="polite">{filtrados.length} {filtrados.length === 1 ? "opção" : "opções"}</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((i) => <li key={`${i.tipo}-${i.id}`} className="flex"><CartaoItem i={i} assistido={a} /></li>)}
          </ul>
        </>
      )}
    </div>
  )
}
