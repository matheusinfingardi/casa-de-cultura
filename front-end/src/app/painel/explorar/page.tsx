"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAssistido } from "@/components/painel/use-assistido"
import { Carregando, VazioCard, CartaoDisponivel } from "@/components/painel/cartoes"
import { ITEM_TIPOS, ITEM_TIPO_LABELS, type ItemTipo } from "@/lib/services/presencas"

export default function ExplorarPage() {
  const { disponiveis, loading, acao, inscrever } = useAssistido()
  const [tipo, setTipo] = useState<ItemTipo | "todos">("todos")
  const [busca, setBusca] = useState("")

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return disponiveis.filter(
      (i) =>
        (tipo === "todos" || i.tipo === tipo) &&
        (!termo || `${i.nome ?? ""} ${i.local ?? ""}`.toLowerCase().includes(termo))
    )
  }, [disponiveis, tipo, busca])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explorar</h1>
        <p className="text-muted-foreground text-sm">
          Atividades, oficinas, eventos e atendimentos em que você ainda pode se inscrever.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou local"
            aria-label="Buscar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por tipo">
          {(["todos", ...ITEM_TIPOS] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tipo === t ? "default" : "outline"}
              aria-pressed={tipo === t}
              onClick={() => setTipo(t)}
              className="shrink-0"
            >
              {t === "todos" ? "Todos" : ITEM_TIPO_LABELS[t]}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <Carregando />
      ) : !filtrados.length ? (
        <VazioCard>Nada encontrado com esses filtros.</VazioCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map((i) => (
            <CartaoDisponivel
              key={`${i.tipo}-${i.id}`}
              i={i}
              ocupado={acao === `${i.tipo}-${i.id}`}
              onInscrever={inscrever}
            />
          ))}
        </div>
      )}
    </div>
  )
}
