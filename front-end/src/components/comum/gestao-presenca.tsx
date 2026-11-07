"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Trash2, UserPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { notify } from "@/lib/notify"
import { iniciais } from "@/lib/formatar"
import { listarClientes, type Usuario } from "@/lib/services/usuarios"
import {
  buscarItem, ITEM_TIPO_LABELS, listarPresencasDoItem, matricularCliente,
  PRESENCA_LABELS, PRESENCA_STATUS, removerPresenca,
  type ItemTipo, type PresencaDoItem, type PresencaStatus,
} from "@/lib/services/presencas"
import { ehDemo } from "@/lib/demo/modo"
import { marcarPresenca } from "@/lib/fila-offline"
import { promoverDaEspera } from "@/lib/services/extras"
import AvisoOffline from "./aviso-offline"
import PageHeader from "./page-header"
import EstadoVazio from "./estado-vazio"
import Confirmar from "./confirmar"

const COR: Record<PresencaStatus, string> = {
  presente: "bg-emerald-700 text-white border-emerald-700",
  marcada: "bg-sky-700 text-white border-sky-700",
  ausente: "bg-rose-700 text-white border-rose-700",
}

export default function GestaoPresenca({
  tipo, itemId, voltarHref, voltarLabel,
}: {
  tipo: ItemTipo
  itemId: string
  voltarHref: string
  voltarLabel: string
}) {
  const [item, setItem] = useState<{ nome: string | null; local: string | null } | null>(null)
  const [presencas, setPresencas] = useState<PresencaDoItem[] | null>(null)
  const [clientes, setClientes] = useState<Usuario[]>([])
  const [busca, setBusca] = useState("")
  const [buscaNova, setBuscaNova] = useState("")
  const [remover, setRemover] = useState<PresencaDoItem | null>(null)

  const buscarTudo = () => Promise.all([buscarItem(tipo, itemId), listarPresencasDoItem(tipo, itemId), listarClientes()])
  function aplicar([itm, pres, cli]: Awaited<ReturnType<typeof buscarTudo>>) {
    setItem(itm); setPresencas(pres); setClientes(cli)
  }
  async function carregar() { aplicar(await buscarTudo()) }
  useEffect(() => {
    let ativo = true
    buscarTudo().then((r) => ativo && aplicar(r))
    return () => { ativo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, itemId])

  const lista = presencas ?? []
  const matriculados = new Set(lista.map((p) => p.cliente_id))
  const sugestoes = useMemo(() => {
    const t = buscaNova.trim().toLowerCase()
    if (!t) return []
    return clientes.filter((c) => !matriculados.has(c.id) && `${c.nome ?? ""} ${c.email ?? ""}`.toLowerCase().includes(t)).slice(0, 6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaNova, clientes, presencas])

  const contagem = { total: lista.length, presente: lista.filter((p) => p.status === "presente").length, marcada: lista.filter((p) => p.status === "marcada").length, ausente: lista.filter((p) => p.status === "ausente").length }
  const filtradas = lista
    .filter((p) => `${p.profiles?.nome ?? ""} ${p.profiles?.email ?? ""}`.toLowerCase().includes(busca.trim().toLowerCase()))
    .sort((a, b) => (a.profiles?.nome ?? "").localeCompare(b.profiles?.nome ?? "", "pt-BR"))

  async function adicionar(c: Usuario) {
    try {
      await matricularCliente(tipo, itemId, item?.nome ?? null, c.id)
      setBuscaNova("")
      notify.success(`${c.nome ?? c.email} adicionado(a)`)
      await carregar()
    } catch { /* toast no serviço */ }
  }

  async function mudarStatus(id: string, status: PresencaStatus) {
    const anterior = presencas
    setPresencas((prev) => prev?.map((p) => (p.id === id ? { ...p, status } : p)) ?? prev)
    try {
      const r = await marcarPresenca(id, status)
      if (r === "guardado") notify.success("Guardado. Enviamos quando a internet voltar.")
    } catch { setPresencas(anterior) }
  }

  async function confirmarRemocao() {
    if (!remover) return
    await removerPresenca(remover.id)
    notify.success("Pessoa removida da lista")
    if (ehDemo() && tipo === "oficina") {
      const promovido = await promoverDaEspera(tipo, itemId)
      if (promovido) notify.success("Vaga liberada: a primeira pessoa da lista de espera entrou")
    }
    await carregar()
  }

  async function marcarTodos(status: PresencaStatus) {
    const anterior = presencas
    setPresencas((prev) => prev?.map((p) => ({ ...p, status })) ?? prev)
    try { await Promise.all(lista.map((p) => marcarPresenca(p.id, status))) } catch { setPresencas(anterior) }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={item?.nome ?? "Presença"}
        descricao={item ? `${ITEM_TIPO_LABELS[tipo]}${item.local ? ` · ${item.local}` : ""}. Marque quem participou e adicione novas pessoas.` : undefined}
        migalhas={[{ label: voltarLabel, href: voltarHref }, { label: "Presença" }]}
      />

      <AvisoOffline aoEnviar={carregar} />

      {presencas === null ? (
        <div className="space-y-3" aria-busy="true"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
      ) : (
        <>
          <ul className="grid grid-cols-4 gap-2 sm:gap-3">
            {([["Inscritos", contagem.total], ["Presentes", contagem.presente], ["Marcadas", contagem.marcada], ["Ausentes", contagem.ausente]] as const).map(([r, v]) => (
              <li key={r} className="min-w-0 rounded-2xl border bg-card p-2.5 text-center shadow-sm sm:p-4 sm:text-left"><p className="text-2xl font-bold">{v}</p><p className="truncate text-xs text-muted-foreground sm:text-sm">{r}</p></li>
            ))}
          </ul>

          {lista.length === 0 ? (
            <EstadoVazio icon={Users} titulo="Ninguém inscrito ainda" texto="Quando alguém se inscrever pelo painel, ou for adicionado acima, aparecerá aqui." />
          ) : (
            <section className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input className="pl-10" placeholder="Buscar na lista" aria-label="Buscar na lista de inscritos" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>
                <Button variant="outline" size="sm" onClick={() => marcarTodos("presente")}>Marcar todos como presentes</Button>
              </div>
              <ul className="space-y-2">
                {filtradas.map((p) => (
                  <li key={p.id}>
                    <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden>{iniciais(p.profiles?.nome)}</span>
                        <div className="min-w-0"><p className="truncate text-sm font-medium">{p.profiles?.nome ?? "Sem nome"}</p><p className="truncate text-xs text-muted-foreground">{p.profiles?.email}</p></div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex overflow-hidden rounded-lg border" role="group" aria-label={`Situação de ${p.profiles?.nome ?? "inscrito"}`}>
                          {PRESENCA_STATUS.map((s) => (
                            <button key={s} type="button" aria-pressed={p.status === s} onClick={() => mudarStatus(p.id, s)}
                              className={`border-r px-3.5 py-2 text-sm font-medium last:border-r-0 ${p.status === s ? COR[s] : "bg-background hover:bg-muted"}`}>
                              {PRESENCA_LABELS[s]}
                            </button>
                          ))}
                        </div>
                        <Button size="icon-sm" variant="ghost" className="text-red-700 dark:text-red-300" onClick={() => setRemover(p)} aria-label={`Remover ${p.profiles?.nome ?? "inscrito"}`}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <Card className="space-y-3 p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold"><UserPlus className="h-4 w-4" aria-hidden /> Adicionar assistido</h2>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input className="pl-10" placeholder="Digite o nome ou e-mail" aria-label="Buscar assistido para adicionar" value={buscaNova} onChange={(e) => setBuscaNova(e.target.value)} />
            </div>
            {buscaNova.trim() && (
              sugestoes.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum assistido encontrado (ou ele já está na lista).</p> : (
                <ul className="divide-y rounded-xl border">
                  {sugestoes.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0"><p className="truncate text-sm font-medium">{c.nome ?? "Sem nome"}</p><p className="truncate text-xs text-muted-foreground">{c.email}</p></div>
                      <Button size="sm" onClick={() => adicionar(c)}>Adicionar</Button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </Card>

        </>
      )}

      <Confirmar aberto={!!remover} onFechar={() => setRemover(null)} titulo="Remover da lista?" perigoso confirmarLabel="Remover"
        descricao={<>{remover?.profiles?.nome ?? "Esta pessoa"} deixará de constar como inscrita. Você pode adicioná-la de novo depois.</>}
        onConfirmar={confirmarRemocao} />
    </div>
  )
}
