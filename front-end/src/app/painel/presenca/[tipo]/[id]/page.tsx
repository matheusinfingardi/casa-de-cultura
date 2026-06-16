"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AuthGuard from "@/components/auth/auth-guard"
import { listarClientes, type Usuario } from "@/lib/services/usuarios"
import {
  buscarItem,
  listarPresencasDoItem,
  matricularCliente,
  atualizarStatusPresenca,
  removerPresenca,
  isItemTipo,
  PRESENCA_STATUS,
  PRESENCA_LABELS,
  ITEM_TIPO_LABELS,
  type ItemTipo,
  type PresencaDoItem,
  type PresencaStatus,
} from "@/lib/services/presencas"

function GerenciarPresenca({ tipo, itemId }: { tipo: ItemTipo; itemId: string }) {
  const router = useRouter()

  const [item, setItem] = useState<{ nome: string | null; local: string | null } | null>(null)
  const [presencas, setPresencas] = useState<PresencaDoItem[]>([])
  const [clientes, setClientes] = useState<Usuario[]>([])
  const [novoClienteId, setNovoClienteId] = useState("")
  const [loading, setLoading] = useState(true)

  async function carregar() {
    const [itm, pres, cli] = await Promise.all([
      buscarItem(tipo, itemId),
      listarPresencasDoItem(tipo, itemId),
      listarClientes(),
    ])
    setItem(itm)
    setPresencas(pres)
    setClientes(cli)
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, itemId])

  const matriculados = new Set(presencas.map((p) => p.cliente_id))
  const disponiveis = clientes.filter((c) => !matriculados.has(c.id))

  async function handleMatricular() {
    if (!novoClienteId) return
    try {
      await matricularCliente(tipo, itemId, item?.nome ?? null, novoClienteId)
      setNovoClienteId("")
      await carregar()
    } catch {
      // erro exibido via toast
    }
  }

  async function handleStatus(id: string, status: PresencaStatus) {
    const anterior = presencas
    setPresencas((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
    try {
      await atualizarStatusPresenca(id, status)
    } catch {
      // erro exibido via toast
      setPresencas(anterior)
    }
  }

  async function handleRemover(id: string) {
    if (!window.confirm("Remover este cliente?")) return
    try {
      await removerPresenca(id)
      setPresencas((prev) => prev.filter((p) => p.id !== id))
    } catch {
      // erro exibido via toast
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/painel")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{item?.nome ?? "Item"}</h1>
          <Badge variant="outline">{ITEM_TIPO_LABELS[tipo]}</Badge>
        </div>
        {item?.local && <p className="text-muted-foreground text-sm">{item.local}</p>}
      </div>

      {/* Matricular novo cliente */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold">Matricular cliente</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={novoClienteId} onValueChange={setNovoClienteId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {disponiveis.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome ?? c.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleMatricular} disabled={!novoClienteId}>
            Matricular
          </Button>
        </div>
        {disponiveis.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Nenhum cliente disponível para matricular.
          </p>
        )}
      </Card>

      {/* Lista de presenças */}
      {!presencas.length ? (
        <Card className="p-6 text-center text-muted-foreground">
          Nenhum cliente matriculado ainda.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {presencas.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.profiles?.nome ?? "Cliente"}</p>
                {p.profiles?.email && (
                  <p className="text-xs text-muted-foreground truncate">{p.profiles.email}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={p.status}
                  onValueChange={(v) => handleStatus(p.id, v as PresencaStatus)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESENCA_STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {PRESENCA_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemover(p.id)}
                  aria-label="Remover"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function GerenciarPresencaPage() {
  const params = useParams()
  const router = useRouter()
  const tipo = params.tipo as string
  const itemId = params.id as string

  useEffect(() => {
    if (!isItemTipo(tipo)) router.replace("/painel")
  }, [tipo, router])

  if (!isItemTipo(tipo)) {
    return null
  }

  return (
    <AuthGuard allow={["responsavel", "admin"]} redirectTo="/painel">
      <GerenciarPresenca tipo={tipo} itemId={itemId} />
    </AuthGuard>
  )
}
