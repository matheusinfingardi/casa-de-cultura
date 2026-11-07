"use client"

import { useMemo, useState } from "react"
import { Search, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import { CartaoItem, Carregando } from "@/components/painel/cartoes"
import { useAssistido } from "@/components/painel/use-assistido"
import { chaveData } from "@/lib/formatar"
import { ITEM_TIPO_LABELS, type ItemTipo } from "@/lib/services/presencas"

const TIPOS: ItemTipo[] = ["atividade", "oficina", "evento", "assistencia"]
const PLURAL: Record<ItemTipo, string> = { atividade: "Atividades", oficina: "Oficinas", evento: "Eventos", assistencia: "Assistência", centro: "Centros" }

export default function ExplorarPage() {
  const { itens, loading, inscrito, lotado, vagasLivres } = useAssistido()
  const [tipo, setTipo] = useState<ItemTipo | "todos">("todos")
  const [busca, setBusca] = useState("")

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    const hoje = chaveData(new Date())
    return itens.filter((i) => {
      if (i.tipo === "centro") return false
      if (i.tipo === "evento" && ((i.bruto as { data?: string }).data ?? "") < hoje) return false
      return (tipo === "todos" || i.tipo === tipo) && (!t || `${i.nome} ${i.local} ${i.descricao}`.toLowerCase().includes(t))
    })
  }, [itens, tipo, busca])

  return (
    <div className="space-y-6">
      <PageHeader titulo="Explorar" descricao="Encontre o que combina com você. Toque para ver os detalhes e se inscrever." />
      <div className="space-y-3">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-10" placeholder="Buscar por nome, local ou assunto" aria-label="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por tipo">
          {(["todos", ...TIPOS] as const).map((t) => (
            <Button key={t} size="sm" variant={tipo === t ? "default" : "outline"} aria-pressed={tipo === t} onClick={() => setTipo(t)} className="shrink-0">
              {t === "todos" ? "Tudo" : PLURAL[t]}
            </Button>
          ))}
        </div>
      </div>
      {loading ? <Carregando /> : filtrados.length === 0 ? (
        <EstadoVazio icon={SearchX} titulo="Nada encontrado" texto={`Tente outra busca ou veja outro tipo${tipo !== "todos" ? ` além de ${ITEM_TIPO_LABELS[tipo].toLowerCase()}` : ""}.`} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((i) => (
            <li key={`${i.tipo}-${i.id}`} className="flex"><div className="flex w-full"><CartaoItem i={i} inscrito={!!inscrito(i)} lotado={lotado(i)} vagas={vagasLivres(i)} /></div></li>
          ))}
        </ul>
      )}
    </div>
  )
}
