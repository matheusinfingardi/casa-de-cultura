"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, CircleAlert, Clock, MapPin, QrCode, Search, UserPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { lerCodigo } from "@/lib/checkin"
import { marcarPresencaDia } from "@/lib/fila-offline"
import { chaveData, dataExtenso, faixaHorario, iniciais, paraData } from "@/lib/formatar"
import { carregarItem, datasDoItem, type ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { promoverDaEspera, registrosDoItem, type Registro, type StatusDia } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, listarPresencasDoItem, matricularCliente, removerPresenca, type ItemTipo, type PresencaDoItem } from "@/lib/services/presencas"
import { listarClientes, type Usuario } from "@/lib/services/usuarios"
import AvisoOffline from "./aviso-offline"
import Confirmar from "./confirmar"
import EstadoVazio from "./estado-vazio"
import LeitorQr from "./leitor-qr"
import PageHeader from "./page-header"

type Dia = { data: string; inicio: string; fim: string }
type Retorno = { ok: boolean; texto: string; adicionar?: Usuario } | null

const curto = (d: string) => paraData(d).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "")

/** Chamada de um dia específico: a lista de inscritos, o check-in por QR Code e os dias que existem de fato. */
export default function Chamada({ tipo, itemId, voltarHref, voltarLabel }: { tipo: ItemTipo; itemId: string; voltarHref: string; voltarLabel: string }) {
  const params = useSearchParams()
  const hoje = chaveData(new Date())
  const [item, setItem] = useState<ItemView | null>(null)
  const [inscritos, setInscritos] = useState<PresencaDoItem[] | null>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [clientes, setClientes] = useState<Usuario[]>([])
  const [dia, setDia] = useState<string | null>(params.get("data"))
  const [busca, setBusca] = useState("")
  const [buscaNova, setBuscaNova] = useState("")
  const [codigo, setCodigo] = useState("")
  const [retorno, setRetorno] = useState<Retorno>(null)
  const [remover, setRemover] = useState<PresencaDoItem | null>(null)
  const seletor = useRef<HTMLDivElement>(null)

  const buscarTudo = useCallback(() => Promise.all([carregarItem(tipo, itemId), listarPresencasDoItem(tipo, itemId), registrosDoItem(tipo, itemId), listarClientes()]), [tipo, itemId])
  const aplicar = useCallback(([i, p, r, c]: Awaited<ReturnType<typeof buscarTudo>>) => { setItem(i); setInscritos(p); setRegistros(r); setClientes(c) }, [])
  const carregar = useCallback(async () => aplicar(await buscarTudo()), [aplicar, buscarTudo])

  useEffect(() => {
    let ativo = true
    buscarTudo().then((r) => ativo && aplicar(r))
    return () => { ativo = false }
  }, [buscarTudo, aplicar])

  // Dias reais do item. Sem dia fixo (assistência, centro): os dias já atendidos e hoje.
  const dias = useMemo<Dia[]>(() => {
    if (!item) return []
    const reais = datasDoItem(item).map((o) => ({ data: o.data, inicio: o.inicio, fim: o.fim }))
    if (reais.length) return reais
    const conhecidos = new Set([...registros.map((r) => r.data), hoje])
    return [...conhecidos].sort().map((data) => ({ data, inicio: "", fim: "" }))
  }, [item, registros, hoje])

  // Abre no dia pedido; senão hoje, o próximo dia ou o último que passou.
  const padrao = useMemo(() => {
    if (!dias.length) return null
    return dias.find((d) => d.data >= hoje)?.data ?? dias[dias.length - 1].data
  }, [dias, hoje])
  const atual = dia && dias.some((d) => d.data === dia) ? dia : padrao
  const infoDia = dias.find((d) => d.data === atual)
  const futuro = !!atual && atual > hoje

  useEffect(() => {
    seletor.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ inline: "center", block: "nearest" })
  }, [atual])

  const lista = useMemo(() => inscritos ?? [], [inscritos])
  const doDia = useMemo(() => new Map(registros.filter((r) => r.data === atual).map((r) => [r.cliente_id, r.status])), [registros, atual])
  const presentes = lista.filter((p) => doDia.get(p.cliente_id) === "presente").length
  const ausentes = lista.filter((p) => doDia.get(p.cliente_id) === "ausente").length
  const semMarcar = lista.length - presentes - ausentes

  const filtradas = lista
    .filter((p) => `${p.profiles?.nome ?? ""} ${p.profiles?.email ?? ""}`.toLowerCase().includes(busca.trim().toLowerCase()))
    .sort((a, b) => (a.profiles?.nome ?? "").localeCompare(b.profiles?.nome ?? "", "pt-BR"))

  const matriculados = new Set(lista.map((p) => p.cliente_id))
  const sugestoes = buscaNova.trim()
    ? clientes.filter((c) => !matriculados.has(c.id) && `${c.nome ?? ""} ${c.email ?? ""}`.toLowerCase().includes(buscaNova.trim().toLowerCase())).slice(0, 6)
    : []

  /** Atualiza na tela na hora; se não houver internet, a marcação fica guardada. */
  async function marcar(clienteId: string, status: StatusDia | null) {
    if (!atual) return
    const dataAtual = atual
    setRegistros((prev) => {
      const resto = prev.filter((r) => !(r.data === dataAtual && r.cliente_id === clienteId))
      return status ? [...resto, { id: `tmp-${clienteId}`, item_tipo: tipo, item_id: itemId, data: dataAtual, cliente_id: clienteId, status }] : resto
    })
    const r = await marcarPresencaDia(tipo, itemId, dataAtual, clienteId, status)
    if (r === "guardado") notify.success("Guardado. Enviamos quando a internet voltar.")
  }

  async function marcarRestantes() {
    await Promise.all(lista.filter((p) => !doDia.has(p.cliente_id)).map((p) => marcar(p.cliente_id, "presente")))
    notify.success("Quem faltava foi marcado como presente")
  }

  async function checkin(texto: string) {
    if (!item || !atual) return
    if (futuro) return setRetorno({ ok: false, texto: "Este dia ainda não chegou. Escolha o dia de hoje para fazer o check-in." })
    const id = lerCodigo(texto)
    const pessoa = clientes.find((c) => c.id === id)
    if (!pessoa) return setRetorno({ ok: false, texto: "Código não encontrado. Confira e tente de novo." })
    if (!matriculados.has(id)) return setRetorno({ ok: false, texto: `${pessoa.nome ?? pessoa.email} não está inscrita em ${item.nome}.`, adicionar: pessoa })
    await marcar(id, "presente")
    setRetorno({ ok: true, texto: `${pessoa.nome ?? pessoa.email} chegou: presença marcada em ${curto(atual)}.` })
  }

  async function adicionar(c: Usuario, comPresenca = false) {
    await matricularCliente(tipo, itemId, item?.nome ?? null, c.id)
    setBuscaNova("")
    await carregar()
    if (comPresenca) {
      await marcar(c.id, "presente")
      setRetorno({ ok: true, texto: `${c.nome ?? c.email} foi inscrita e marcada como presente.` })
    } else notify.success(`${c.nome ?? c.email} entrou na lista`)
  }

  async function confirmarRemocao() {
    if (!remover) return
    await removerPresenca(remover.id)
    if (tipo === "oficina" && (await promoverDaEspera(tipo, itemId))) notify.success("Vaga liberada: a primeira pessoa da lista de espera entrou")
    await carregar()
  }

  if (!item || inscritos === null) return <div className="space-y-4" aria-busy="true" aria-label="Carregando"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={item.nome}
        descricao={`Chamada · ${ITEM_TIPO_LABELS[tipo]}`}
        migalhas={[{ label: voltarLabel, href: voltarHref }, { label: "Chamada" }]}
      />

      <AvisoOffline aoEnviar={carregar} />

      {/* 1. O dia */}
      <section aria-labelledby="titulo-dias" className="rounded-2xl border bg-card p-4 shadow-sm">
        <h2 id="titulo-dias" className="mb-2 font-semibold">Escolha o dia</h2>
        <div ref={seletor} className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Dias deste compromisso">
          {dias.map((d) => {
            const ativo = d.data === atual
            const marcados = registros.some((r) => r.data === d.data)
            return (
              <button key={d.data} type="button" aria-pressed={ativo} onClick={() => { setDia(d.data); setRetorno(null) }}
                className={`min-w-24 shrink-0 rounded-xl border px-3 py-2 text-center text-sm transition-colors ${ativo ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
                <span className="block font-semibold first-letter:uppercase">{d.data === hoje ? "Hoje" : curto(d.data).split(",")[0]}</span>
                <span className="block">{paraData(d.data).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "")}</span>
                <span className="block text-xs opacity-90">{d.data > hoje ? "Em breve" : marcados ? "Feita" : "Pendente"}</span>
              </button>
            )
          })}
        </div>
        {atual && (
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 border-t pt-3">
            <p className="font-semibold first-letter:uppercase">{dataExtenso(atual)}</p>
            {infoDia?.inicio && <p className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" aria-hidden />{faixaHorario(infoDia.inicio, infoDia.fim)}</p>}
            {item.local && <p className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" aria-hidden />{item.local}</p>}
          </div>
        )}
      </section>

      {futuro ? (
        <p className="rounded-xl bg-muted p-4">Este dia ainda não chegou. Você poderá fazer a chamada na data. Abaixo estão as pessoas inscritas.</p>
      ) : (
        <>
          {/* 2. Check-in */}
          <section aria-labelledby="titulo-checkin" className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <h2 id="titulo-checkin" className="flex items-center gap-2 text-lg font-semibold"><QrCode className="h-5 w-5 text-primary" aria-hidden /> Check-in de quem chegou</h2>
            <p className="mb-4 text-muted-foreground">Cada assistido tem um QR Code no celular. Leia o código na chegada e a presença é marcada em <strong className="text-foreground">{item.nome}</strong>, neste dia.</p>
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <LeitorQr onLer={checkin} />
              <form className="flex flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); if (codigo.trim()) checkin(codigo); setCodigo("") }}>
                <Input aria-label="Código do assistido" placeholder="Ou digite o código da pessoa" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                <Button type="submit" variant="outline">Registrar</Button>
              </form>
            </div>
            {retorno && (
              <div role="status" className={`mt-4 flex flex-wrap items-center gap-3 rounded-xl p-3 font-medium ${retorno.ok ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50" : "bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50"}`}>
                {retorno.ok ? <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden /> : <CircleAlert className="h-5 w-5 shrink-0" aria-hidden />}
                <span className="flex-1">{retorno.texto}</span>
                {retorno.adicionar && <Button size="sm" onClick={() => adicionar(retorno.adicionar!, true)}>Inscrever e marcar presença</Button>}
              </div>
            )}
          </section>
        </>
      )}

      {/* 3. Lista */}
      <section aria-labelledby="titulo-lista" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="titulo-lista" className="text-lg font-semibold">Inscritos ({lista.length})</h2>
            {!futuro && <p className="text-muted-foreground" aria-live="polite">{presentes} {presentes === 1 ? "presente" : "presentes"} · {ausentes} {ausentes === 1 ? "falta" : "faltas"} · {semMarcar} sem marcar</p>}
          </div>
          {!futuro && semMarcar > 0 && <Button variant="outline" size="sm" onClick={marcarRestantes}>Marcar os restantes como presentes</Button>}
        </div>

        {lista.length === 0 ? <EstadoVazio icon={Users} titulo="Ninguém inscrito ainda" texto="Quando alguém se inscrever, ou for adicionado abaixo, aparecerá aqui." /> : (
          <>
            {lista.length > 6 && (
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input className="pl-10" placeholder="Buscar na lista" aria-label="Buscar na lista de inscritos" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            )}
            <ul className="space-y-2">
              {filtradas.map((p) => {
                const st = doDia.get(p.cliente_id)
                return (
                  <li key={p.id}>
                    <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden>{iniciais(p.profiles?.nome)}</span>
                        <div className="min-w-0"><p className="truncate font-medium">{p.profiles?.nome ?? "Sem nome"}</p><p className="truncate text-sm text-muted-foreground">{p.profiles?.email}</p></div>
                      </div>
                      {!futuro && (
                        <div className="flex items-center gap-2">
                          <div className="inline-flex flex-1 overflow-hidden rounded-xl border sm:flex-none" role="group" aria-label={`Situação de ${p.profiles?.nome ?? "inscrito"}`}>
                            <button type="button" aria-pressed={st === "presente"} onClick={() => marcar(p.cliente_id, st === "presente" ? null : "presente")} className={`flex-1 border-r px-4 py-2 text-sm font-medium ${st === "presente" ? "bg-emerald-700 text-white" : "bg-background hover:bg-muted"}`}>Presente</button>
                            <button type="button" aria-pressed={st === "ausente"} onClick={() => marcar(p.cliente_id, st === "ausente" ? null : "ausente")} className={`flex-1 px-4 py-2 text-sm font-medium ${st === "ausente" ? "bg-rose-700 text-white" : "bg-background hover:bg-muted"}`}>Ausente</button>
                          </div>
                        </div>
                      )}
                      {futuro && <Button size="sm" variant="ghost" onClick={() => setRemover(p)}>Tirar da lista</Button>}
                    </Card>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      {/* 4. Adicionar */}
      <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold"><UserPlus className="h-4 w-4" aria-hidden /> Adicionar assistido à lista</h2>
        <Input placeholder="Digite o nome ou e-mail" aria-label="Buscar assistido para adicionar" value={buscaNova} onChange={(e) => setBuscaNova(e.target.value)} />
        {buscaNova.trim() && (sugestoes.length === 0 ? <p className="text-muted-foreground">Ninguém encontrado, ou a pessoa já está na lista.</p> : (
          <ul className="divide-y rounded-xl border">
            {sugestoes.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0"><p className="truncate font-medium">{c.nome ?? "Sem nome"}</p><p className="truncate text-sm text-muted-foreground">{c.email}</p></div>
                <Button size="sm" onClick={() => adicionar(c)}>Adicionar</Button>
              </li>
            ))}
          </ul>
        ))}
      </section>

      <Confirmar aberto={!!remover} onFechar={() => setRemover(null)} titulo="Tirar da lista?" perigoso confirmarLabel="Tirar da lista"
        descricao={<>{remover?.profiles?.nome ?? "Esta pessoa"} deixará de constar como inscrita. Você pode adicioná-la de novo depois.</>}
        onConfirmar={confirmarRemocao} />
    </div>
  )
}
