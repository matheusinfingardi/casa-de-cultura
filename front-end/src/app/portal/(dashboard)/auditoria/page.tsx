"use client"

import { useEffect, useState } from "react"
import { History, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { listarAuditoria, type RegistroAuditoria } from "@/lib/services/extras"

const NOMES: Record<string, string> = {
  eventos: "Evento", atividades: "Atividade", oficinas: "Oficina", centros: "Centro", assistencia: "Assistência", presencas: "Presença",
  profiles: "Usuário", metas: "Meta", convites: "Convite", pedidos_voluntario: "Pedido de voluntário", mensagens: "Comunicado", fichas: "Ficha", dependentes: "Dependente", lista_espera: "Lista de espera", disponibilidade: "Disponibilidade",
}

function Lista() {
  const [itens, setItens] = useState<RegistroAuditoria[]>([])
  const [busca, setBusca] = useState("")
  useEffect(() => { listarAuditoria().then(setItens) }, [])
  const t = busca.toLowerCase()
  const lista = itens.filter((i) => `${i.usuario} ${i.acao} ${i.descricao} ${NOMES[i.tabela] ?? ""}`.toLowerCase().includes(t))
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input className="pl-10" placeholder="Buscar por pessoa ou item" aria-label="Buscar no histórico" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      {lista.length === 0 ? <EstadoVazio icon={History} titulo="Nada encontrado" /> : (
        <Card className="gap-0 divide-y p-0">
          {lista.slice(0, 60).map((i) => (
            <div key={i.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3">
              <p><span className="font-semibold">{i.usuario}</span> {i.acao} <span className="text-muted-foreground">{(NOMES[i.tabela] ?? i.tabela).toLowerCase()}:</span> {i.descricao}</p>
              <time className="text-sm text-muted-foreground">{new Date(i.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Histórico de ações" descricao="Quem criou, alterou ou excluiu cada informação." />
      <SoDemo perfil="admin" rota="/portal/auditoria"><Lista /></SoDemo>
    </div>
  )
}
