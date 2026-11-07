"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Plus, Search, Trash2, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { notify } from "@/lib/notify"
import { useUnidade } from "@/components/portal/unidade"
import PageHeader, { type Migalha } from "./page-header"
import EstadoVazio from "./estado-vazio"
import Confirmar from "./confirmar"

export type Coluna<T> = {
  chave: string
  titulo: string
  /** conteúdo exibido (texto ou elemento) */
  render: (item: T) => React.ReactNode
  /** valor usado para ordenar; se ausente a coluna não ordena */
  ordem?: (item: T) => string | number
  /** esconde a coluna na tabela em telas menores que "lg" */
  secundaria?: boolean
}

export type Filtro<T> = {
  chave: string
  label: string
  opcoes: { valor: string; label: string }[]
  pegar: (item: T) => string
}

type Props<T extends { id: string }> = {
  titulo: string
  descricao: string
  migalhas?: Migalha[]
  icon: LucideIcon
  singular: string // "evento"
  genero?: "m" | "f"
  novoHref: string
  detalheHref: (item: T) => string
  carregar: () => Promise<T[]>
  excluir: (item: T) => Promise<void>
  nome: (item: T) => string
  colunas: Coluna<T>[]
  busca: (item: T) => string
  filtros?: Filtro<T>[]
  ordemInicial?: string
}

export default function ListaEntidade<T extends { id: string }>({
  titulo, descricao, migalhas, icon, singular, genero = "m", novoHref, detalheHref, carregar, excluir, nome,
  colunas, busca, filtros = [], ordemInicial,
}: Props<T>) {
  const [itens, setItens] = useState<T[] | null>(null)
  const [termo, setTermo] = useState("")
  const [valoresFiltro, setValoresFiltro] = useState<Record<string, string>>({})
  const [ordem, setOrdem] = useState<{ chave: string; asc: boolean } | null>(
    ordemInicial ? { chave: ordemInicial, asc: true } : null
  )
  const [aExcluir, setAExcluir] = useState<T | null>(null)
  const { filtrar } = useUnidade()

  useEffect(() => {
    let ativo = true
    carregar().then((d) => ativo && setItens(d))
    return () => { ativo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visiveis = useMemo(() => {
    if (!itens) return []
    const t = termo.trim().toLowerCase()
    let out = filtrar(itens).filter(
      (i) =>
        (!t || busca(i).toLowerCase().includes(t)) &&
        filtros.every((f) => !valoresFiltro[f.chave] || f.pegar(i) === valoresFiltro[f.chave])
    )
    const col = colunas.find((c) => c.chave === ordem?.chave)
    if (col?.ordem) {
      out = [...out].sort((a, b) => {
        const x = col.ordem!(a), y = col.ordem!(b)
        const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "pt-BR")
        return ordem!.asc ? r : -r
      })
    }
    return out
  }, [itens, termo, valoresFiltro, ordem, colunas, filtros, busca, filtrar])

  function alternarOrdem(chave: string) {
    setOrdem((o) => (o?.chave === chave ? (o.asc ? { chave, asc: false } : null) : { chave, asc: true }))
  }

  async function confirmarExclusao() {
    if (!aExcluir) return
    await excluir(aExcluir)
    setItens((prev) => prev?.filter((i) => i.id !== aExcluir.id) ?? prev)
    notify.success(`Removido: ${nome(aExcluir)}`)
  }

  const f = genero === "f"
  const novo = f ? "Nova" : "Novo"
  const filtrando = !!termo || Object.values(valoresFiltro).some(Boolean)
  const primeira = colunas[0]
  const demais = colunas.slice(1)

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={titulo}
        descricao={descricao}
        migalhas={migalhas}
        acoes={
          <Button asChild>
            <Link href={novoHref}><Plus className="h-4 w-4" aria-hidden /> {novo} {singular}</Link>
          </Button>
        }
      />

      {itens && itens.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              className="pl-9"
              placeholder={`Buscar ${singular}…`}
              aria-label={`Buscar ${singular}`}
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
            />
          </div>
          {filtros.map((f) => (
            <select
              key={f.chave}
              aria-label={f.label}
              value={valoresFiltro[f.chave] ?? ""}
              onChange={(e) => setValoresFiltro((v) => ({ ...v, [f.chave]: e.target.value }))}
              className="h-11 rounded-xl border bg-card px-3 text-sm"
            >
              <option value="">{f.label}: todos</option>
              {f.opcoes.map((o) => <option key={o.valor} value={o.valor}>{o.label}</option>)}
            </select>
          ))}
        </div>
      )}

      {itens === null ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : itens.length === 0 ? (
        <EstadoVazio
          icon={icon}
          titulo={`${f ? "Nenhuma" : "Nenhum"} ${singular} cadastrad${f ? "a" : "o"} ainda`}
          texto={`Comece cadastrando ${f ? "a primeira" : "o primeiro"} ${singular}. ${f ? "Ela" : "Ele"} aparecerá aqui${["evento", "atividade", "oficina"].includes(singular) ? " e no calendário" : ""}.`}
          acao={<Button asChild><Link href={novoHref}><Plus className="h-4 w-4" aria-hidden /> Cadastrar {singular}</Link></Button>}
        />
      ) : visiveis.length === 0 ? (
        <EstadoVazio
          icon={Search}
          titulo="Nada encontrado"
          texto="Tente outro termo ou limpe os filtros."
          acao={<Button variant="outline" onClick={() => { setTermo(""); setValoresFiltro({}) }}>Limpar filtros</Button>}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtrando ? `${visiveis.length} de ${itens.length}` : itens.length} {itens.length === 1 ? singular : `${singular}s`}
          </p>

          {/* Celular: um cartão por item */}
          <div className="flex flex-col gap-3 md:hidden">
            {visiveis.map((i) => (
              <Card key={i.id} className="space-y-3 p-4">
                <Link href={detalheHref(i)} className="flex items-center justify-between gap-2 text-base font-semibold">
                  <span className="min-w-0">{primeira.render(i)}</span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
                <dl className="space-y-2 text-sm">
                  {demais.map((c) => (
                    <div key={c.chave} className="flex justify-between gap-4">
                      <dt className="shrink-0 text-muted-foreground">{c.titulo}</dt>
                      <dd className="min-w-0 text-right">{c.render(i)}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ))}
          </div>

          {/* Computador: tabela */}
          <Card className="hidden gap-0 overflow-hidden p-0 md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
                  <tr>
                    {colunas.map((c) => (
                      <th key={c.chave} scope="col" className={`px-4 py-3 font-semibold whitespace-nowrap ${c.secundaria ? "hidden xl:table-cell" : ""}`}
                        aria-sort={ordem?.chave === c.chave ? (ordem.asc ? "ascending" : "descending") : undefined}>
                        {c.ordem ? (
                          <button type="button" onClick={() => alternarOrdem(c.chave)} className="inline-flex items-center gap-1 hover:text-foreground">
                            {c.titulo}
                            {ordem?.chave === c.chave ? (ordem.asc ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />) : <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden />}
                          </button>
                        ) : c.titulo}
                      </th>
                    ))}
                    <th scope="col" className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visiveis.map((i) => (
                    <tr key={i.id} className="hover:bg-muted/30">
                      {colunas.map((c, idx) => (
                        <td key={c.chave} className={`px-4 py-3.5 ${idx === 0 ? "font-medium" : "text-muted-foreground"} ${c.secundaria ? "hidden xl:table-cell" : ""}`}>
                          {idx === 0 ? <Link href={detalheHref(i)} className="hover:text-primary hover:underline">{c.render(i)}</Link> : c.render(i)}
                        </td>
                      ))}
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={detalheHref(i)} aria-label={`Abrir ${nome(i)}`}>Abrir</Link>
                          </Button>
                          <Button size="icon-sm" variant="ghost" className="text-red-700 hover:text-red-800 dark:text-red-300" onClick={() => setAExcluir(i)} aria-label={`Excluir ${nome(i)}`}>
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Confirmar
        aberto={!!aExcluir}
        onFechar={() => setAExcluir(null)}
        titulo={`Excluir ${f ? "esta" : "este"} ${singular}?`}
        descricao={<>“{aExcluir ? nome(aExcluir) : ""}” será {f ? "removida" : "removido"} e as inscrições ligadas a ele deixam de fazer sentido. Esta ação não pode ser desfeita.</>}
        confirmarLabel="Excluir"
        perigoso
        onConfirmar={confirmarExclusao}
      />
    </div>
  )
}
