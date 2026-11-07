"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, FileSpreadsheet, Minus, Pencil, Printer, Sparkles, TrendingDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import PageHeader from "@/components/comum/page-header"
import { useDemo } from "@/hooks/use-demo"
import { calcularAssiduidade, idade, situacao } from "@/lib/assiduidade"
import { chaveData, dataBR } from "@/lib/formatar"
import { baixarArquivo, gerarCsv } from "@/lib/ics"
import { rotaAdmin } from "@/lib/itens"
import { carregarDashboard, type DadosDashboard } from "@/lib/services/dashboard"
import { listarFichas, listarMetas, listarRegistros, salvarMeta, type Ficha, type Meta, type StatusDia } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, ITEM_TIPOS, type ItemTipo } from "@/lib/services/presencas"
import { useUnidade } from "@/components/portal/unidade"

const PERIODOS = [{ v: "30", r: "Últimos 30 dias" }, { v: "56", r: "Últimas 8 semanas" }, { v: "90", r: "Últimos 3 meses" }, { v: "0", r: "Todo o período" }]
type Aba = "panorama" | "participacao" | "pessoas"
type Reg = { item_id: string; item_tipo: ItemTipo; cliente_id: string; data: string; status: StatusDia }

const antesDe = (dias: number) => { const d = new Date(); d.setDate(d.getDate() - dias); return chaveData(d) }

function Filtro({ rotulo, valor, onChange, children }: { rotulo: string; valor: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium">
      <span className="mb-1 block">{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border bg-card px-3 font-normal">{children}</select>
    </label>
  )
}

function Numero({ valor, rotulo, delta, unidade = "" }: { valor: string; rotulo: string; delta?: number | null; unidade?: string }) {
  const Icone = !delta ? Minus : delta > 0 ? ArrowUp : ArrowDown
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-4xl font-bold tracking-tight">{valor}</p>
      <p className="mt-1 text-muted-foreground">{rotulo}</p>
      {delta !== undefined && delta !== null && (
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><Icone className="h-3.5 w-3.5" aria-hidden />{delta === 0 ? "Igual ao período anterior" : `${delta > 0 ? "+" : ""}${delta}${unidade} em relação ao período anterior`}</p>
      )}
    </div>
  )
}

/** Barras com o valor escrito em cada uma: dispensa eixo e legenda, pois há uma série só. */
function Barras({ dados, sufixo = "", max }: { dados: { rotulo: string; valor: number; dica?: string }[]; sufixo?: string; max?: number }) {
  const topo = max ?? Math.max(1, ...dados.map((d) => d.valor))
  return (
    <div className="flex h-52 items-end gap-3" role="img" aria-label={dados.map((d) => `${d.rotulo}: ${d.valor}${sufixo}`).join(", ")}>
      {dados.map((d) => (
        <div key={d.rotulo} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={d.dica ?? `${d.rotulo}: ${d.valor}${sufixo}`}>
          <span className="text-sm font-semibold tabular-nums">{d.valor}{sufixo}</span>
          <div className="w-full max-w-14 rounded-t bg-primary transition-opacity group-hover:opacity-80" style={{ height: `${(d.valor / topo) * 72}%`, minHeight: d.valor ? 4 : 0 }} />
          <span className="truncate text-sm text-muted-foreground">{d.rotulo}</span>
        </div>
      ))}
    </div>
  )
}

/** Barras horizontais para categorias com nomes longos. */
function Lista({ dados }: { dados: { rotulo: string; valor: number }[] }) {
  const topo = Math.max(1, ...dados.map((d) => d.valor))
  return (
    <ul className="space-y-2.5">
      {dados.map((d) => (
        <li key={d.rotulo}>
          <div className="mb-1 flex justify-between gap-3"><span className="truncate">{d.rotulo}</span><span className="font-semibold tabular-nums">{d.valor}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden><div className="h-full rounded-full bg-primary" style={{ width: `${(d.valor / topo) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  )
}

export default function Relatorios() {
  const demo = useDemo()
  const { filtrar, centros, unidade, definir } = useUnidade()
  const [dados, setDados] = useState<DadosDashboard | null>(null)
  const [registros, setRegistros] = useState<Reg[]>([])
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [periodo, setPeriodo] = useState("56")
  const [tipo, setTipo] = useState<ItemTipo | "">("")
  const [aba, setAba] = useState<Aba>("panorama")
  const [editando, setEditando] = useState<string | null>(null)

  useEffect(() => { carregarDashboard().then(setDados) }, [])
  useEffect(() => {
    if (!demo) return
    listarRegistros().then(setRegistros)
    listarFichas().then(setFichas)
    listarMetas().then(setMetas)
  }, [demo])

  const r = useMemo(() => {
    if (!dados) return null
    const itens = new Map<string, { nome: string; tipo: ItemTipo; vagas?: number }>()
    const juntar = (t: ItemTipo, l: { id: string; nome: string; vagas?: number }[]) => filtrar(l).forEach((i) => itens.set(i.id, { nome: i.nome, tipo: t, vagas: i.vagas }))
    juntar("evento", dados.eventos); juntar("atividade", dados.atividades); juntar("oficina", dados.oficinas); juntar("centro", dados.centros); juntar("assistencia", dados.assistencias)

    // Sem presença por dia (conta real), usa a situação geral da inscrição.
    const base: Reg[] = demo ? registros : dados.presencas.filter((p) => p.status !== "marcada").map((p) => ({ item_id: p.item_id, item_tipo: p.item_tipo, cliente_id: p.cliente_id, data: p.created_at.slice(0, 10), status: p.status as StatusDia }))
    const validos = base.filter((x) => itens.has(x.item_id) && (!tipo || x.item_tipo === tipo))
    const dias = Number(periodo)
    const limite = dias ? antesDe(dias) : ""
    const limiteAnterior = dias ? antesDe(dias * 2) : ""
    const atual = validos.filter((x) => x.data >= limite)
    const anterior = dias ? validos.filter((x) => x.data >= limiteAnterior && x.data < limite) : []

    const taxa = (l: Reg[]) => (l.length ? Math.round((l.filter((x) => x.status === "presente").length / l.length) * 100) : null)
    const ativas = (l: Reg[]) => new Set(l.filter((x) => x.status === "presente").map((x) => x.cliente_id)).size
    const encontros = (l: Reg[]) => new Set(l.map((x) => `${x.item_id}|${x.data}`)).size
    const delta = (a: number | null, b: number | null) => (dias && a !== null && b !== null && anterior.length ? a - b : null)

    // Presença mês a mês
    const meses: { rotulo: string; valor: number; dica: string }[] = []
    for (let i = 3; i >= 0; i--) {
      const m = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)
      const pre = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`
      const doMes = validos.filter((x) => x.data.startsWith(pre))
      if (doMes.length) meses.push({ rotulo: m.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), valor: taxa(doMes) ?? 0, dica: `${doMes.length} marcações` })
    }

    const inscritosPorItem: Record<string, number> = {}
    for (const p of dados.presencas) inscritosPorItem[p.item_id] = (inscritosPorItem[p.item_id] ?? 0) + 1

    const porItem = [...itens.entries()]
      .filter(([, i]) => !tipo || i.tipo === tipo)
      .map(([id, i]) => {
        const l = atual.filter((x) => x.item_id === id)
        return { id, ...i, inscritos: inscritosPorItem[id] ?? 0, encontros: encontros(l), presentes: l.filter((x) => x.status === "presente").length, faltas: l.filter((x) => x.status === "ausente").length, taxa: taxa(l) }
      })
      .filter((i) => i.inscritos > 0)
      .sort((a, b) => (b.taxa ?? -1) - (a.taxa ?? -1))
    const comTaxa = porItem.filter((i) => i.taxa !== null && i.encontros >= 2)

    // Pessoas
    const porPessoa = new Map<string, Reg[]>()
    for (const x of validos) porPessoa.set(x.cliente_id, [...(porPessoa.get(x.cliente_id) ?? []), x])
    const contato = [...porPessoa.entries()]
      .map(([id, l]) => ({ id, nome: dados.usuarios.find((u) => u.id === id)?.nome ?? "Pessoa", ass: calcularAssiduidade(l) }))
      .filter((p) => p.ass.faltasSeguidas >= 3 || (p.ass.taxa ?? 100) < 50)
      .sort((a, b) => b.ass.faltasSeguidas - a.ass.faltasSeguidas)

    const assistidos = dados.usuarios.filter((u) => u.role === "cliente")
    const fichasA = fichas.filter((f) => assistidos.some((a) => a.id === f.id))
    const faixas: [string, number, number][] = [["Até 17", 0, 17], ["18 a 29", 18, 29], ["30 a 44", 30, 44], ["45 a 59", 45, 59], ["60 ou mais", 60, 200]]
    const porFaixa = faixas.map(([rotulo, de, ate]) => ({ rotulo, valor: fichasA.filter((f) => { const i = idade(f.nascimento); return i !== null && i >= de && i <= ate }).length }))
    const contar = (f: (x: Ficha) => string) => {
      const m: Record<string, number> = {}
      for (const x of fichasA) { const k = f(x); if (k) m[k] = (m[k] ?? 0) + 1 }
      return Object.entries(m).map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor)
    }

    return {
      taxa: taxa(atual), dTaxa: delta(taxa(atual), taxa(anterior)),
      ativas: ativas(atual), dAtivas: delta(ativas(atual), ativas(anterior)),
      encontros: encontros(atual), dEncontros: delta(encontros(atual), encontros(anterior)),
      faltas: atual.filter((x) => x.status === "ausente").length,
      meses, porItem, contato, melhor: comTaxa[0], pior: comTaxa[comTaxa.length - 1],
      assistidos: assistidos.length, porFaixa, porBairro: contar((f) => f.bairro).slice(0, 6),
      comDeficiencia: fichasA.filter((f) => f.deficiencia).length, comBeneficio: fichasA.filter((f) => f.beneficios?.length).length,
      inscricoes: dados.presencas.filter((p) => itens.has(p.item_id)).length,
      temFichas: fichasA.length > 0,
    }
  }, [dados, filtrar, periodo, tipo, registros, fichas, demo])

  function exportar() {
    if (!r) return
    const linhas: (string | number)[][] = aba === "pessoas"
      ? [["Pessoa", "Presença (%)", "Faltas seguidas", "Última presença"], ...r.contato.map((p) => [p.nome, p.ass.taxa ?? "", p.ass.faltasSeguidas, p.ass.ultimaPresenca ? dataBR(p.ass.ultimaPresenca) : ""])]
      : [["Item", "Área", "Inscritos", "Encontros", "Presenças", "Faltas", "Presença (%)"], ...r.porItem.map((i) => [i.nome, ITEM_TIPO_LABELS[i.tipo], i.inscritos, i.encontros, i.presentes, i.faltas, i.taxa ?? ""])]
    baixarArquivo(`relatorio-${aba}.csv`, gerarCsv(linhas), "text/csv;charset=utf-8")
  }

  const valorMeta = (m: Meta) => (m.indicador === "assistidos" ? r?.ativas ?? 0 : m.indicador === "inscricoes" ? r?.inscricoes ?? 0 : r?.taxa ?? 0)
  const nomePeriodo = PERIODOS.find((p) => p.v === periodo)?.r
  const ABAS: [Aba, string][] = [["panorama", "Panorama"], ["participacao", "Participação"], ["pessoas", "Pessoas"]]

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Relatórios"
        descricao="Entenda como o projeto está indo, quem precisa de atenção e preste contas a parceiros."
        acoes={
          <span className="nao-imprimir flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportar}><FileSpreadsheet className="h-4 w-4" aria-hidden /> Baixar planilha</Button>
            <Button onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden /> Imprimir ou salvar PDF</Button>
          </span>
        }
      />

      <div className="nao-imprimir grid gap-4 sm:grid-cols-3">
        <Filtro rotulo="Período" valor={periodo} onChange={setPeriodo}>{PERIODOS.map((p) => <option key={p.v} value={p.v}>{p.r}</option>)}</Filtro>
        <Filtro rotulo="Área" valor={tipo} onChange={(v) => setTipo(v as ItemTipo | "")}>
          <option value="">Todas</option>
          {ITEM_TIPOS.map((t) => <option key={t} value={t}>{ITEM_TIPO_LABELS[t]}</option>)}
        </Filtro>
        {centros.length > 0 && (
          <Filtro rotulo="Unidade" valor={unidade} onChange={definir}>
            <option value="">Todas</option>
            {centros.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Filtro>
        )}
      </div>

      {!r ? <Skeleton className="h-96 rounded-2xl" /> : (
        <>
          <p className="hidden print:block">Período: {nomePeriodo}. Gerado em {new Date().toLocaleDateString("pt-BR")}.</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Numero valor={r.taxa === null ? "—" : `${r.taxa}%`} rotulo="de presença" delta={r.dTaxa} unidade=" pontos" />
            <Numero valor={String(r.ativas)} rotulo="pessoas compareceram" delta={r.dAtivas} />
            <Numero valor={String(r.encontros)} rotulo="encontros realizados" delta={r.dEncontros} />
            <Numero valor={String(r.contato.length)} rotulo="precisam de contato" />
          </div>

          <div className="nao-imprimir flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="Partes do relatório">
            {ABAS.map(([v, ro]) => (
              <button key={v} type="button" role="tab" aria-selected={aba === v} onClick={() => setAba(v)} className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 font-medium ${aba === v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{ro}</button>
            ))}
          </div>

          {aba === "panorama" && (
            <div className="grid items-start gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section className="rounded-2xl border bg-card p-5 shadow-sm">
                  <h2 className="text-xl font-semibold">Presença mês a mês</h2>
                  <p className="mb-4 text-muted-foreground">De cada 100 pessoas esperadas, quantas vieram.</p>
                  {r.meses.length ? <Barras dados={r.meses} sufixo="%" max={100} /> : <p className="text-muted-foreground">Ainda sem registros suficientes.</p>}
                </section>
                {(r.melhor || r.pior) && (
                  <section className="grid gap-4 sm:grid-cols-2">
                    {r.melhor && (
                      <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <p className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" aria-hidden /> Maior presença</p>
                        <Link href={rotaAdmin(r.melhor.tipo, r.melhor.id)} className="mt-1 block text-lg font-semibold hover:underline">{r.melhor.nome}</Link>
                        <p className="text-muted-foreground">{r.melhor.taxa}% em {r.melhor.encontros} encontros</p>
                      </div>
                    )}
                    {r.pior && r.pior.id !== r.melhor?.id && (
                      <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <p className="flex items-center gap-2 font-semibold"><TrendingDown className="h-4 w-4 text-primary" aria-hidden /> Vale olhar de perto</p>
                        <Link href={rotaAdmin(r.pior.tipo, r.pior.id)} className="mt-1 block text-lg font-semibold hover:underline">{r.pior.nome}</Link>
                        <p className="text-muted-foreground">{r.pior.taxa}% em {r.pior.encontros} encontros</p>
                      </div>
                    )}
                  </section>
                )}
              </div>

              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Metas do trimestre</h2>
                {!demo ? <p className="text-muted-foreground">Metas dependem do back-end.</p> : (
                  <ul className="space-y-5">
                    {metas.map((m) => {
                      const atual = valorMeta(m)
                      const pct = Math.min(100, Math.round((atual / (m.alvo || 1)) * 100))
                      const un = m.indicador === "presenca" ? "%" : ""
                      return (
                        <li key={m.id}>
                          <p className="font-medium">{m.titulo}</p>
                          <div className="mt-1 flex items-center justify-between gap-2 text-muted-foreground">
                            <span>{atual}{un} de {editando === m.id ? "" : `${m.alvo}${un}`}</span>
                            {editando === m.id ? (
                              <Input autoFocus type="number" aria-label={`Nova meta para ${m.titulo}`} defaultValue={m.alvo} className="h-9 w-24" onBlur={async (e) => {
                                const alvo = Number(e.target.value)
                                if (alvo > 0) { await salvarMeta(m.id, alvo); setMetas((l) => l.map((x) => (x.id === m.id ? { ...x, alvo } : x))) }
                                setEditando(null)
                              }} />
                            ) : (
                              <button type="button" className="nao-imprimir flex items-center gap-1 text-sm text-primary hover:underline" onClick={() => setEditando(m.id)} aria-label={`Editar meta: ${m.titulo}`}><Pencil className="h-3.5 w-3.5" aria-hidden /> Editar</button>
                            )}
                          </div>
                          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${pct}% da meta`}><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </div>
          )}

          {aba === "participacao" && (
            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <h2 className="p-5 pb-3 text-xl font-semibold">Participação por item</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-semibold">Item</th>
                      <th scope="col" className="px-3 py-3 font-semibold">Área</th>
                      <th scope="col" className="px-3 py-3 text-right font-semibold">Inscritos</th>
                      <th scope="col" className="px-3 py-3 text-right font-semibold">Encontros</th>
                      <th scope="col" className="px-3 py-3 text-right font-semibold">Faltas</th>
                      <th scope="col" className="px-5 py-3 text-right font-semibold">Presença</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {r.porItem.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Nenhum registro com estes filtros.</td></tr>
                    ) : r.porItem.map((i) => (
                      <tr key={i.id}>
                        <td className="px-5 py-3 font-medium"><Link href={rotaAdmin(i.tipo, i.id)} className="hover:underline">{i.nome}</Link></td>
                        <td className="px-3 py-3 text-muted-foreground">{ITEM_TIPO_LABELS[i.tipo]}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{i.inscritos}{i.vagas ? ` de ${i.vagas}` : ""}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{i.encontros}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{i.faltas}</td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums">{i.taxa === null ? "—" : `${i.taxa}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {aba === "pessoas" && (
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <h2 className="text-xl font-semibold">Quem precisa de contato ({r.contato.length})</h2>
                <p className="mb-3 text-muted-foreground">Faltou 3 vezes seguidas ou veio a menos da metade dos encontros.</p>
                {r.contato.length === 0 ? <p className="text-muted-foreground">Ninguém nesta situação.</p> : (
                  <ul className="divide-y">
                    {r.contato.slice(0, 12).map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                        <Link href={`/portal/usuarios/${p.id}`} className="font-medium hover:underline">{p.nome}</Link>
                        <span className={`rounded-full px-2.5 py-1 text-sm font-medium ${situacao(p.ass).classe}`}>{p.ass.taxa}%{p.ass.faltasSeguidas >= 3 ? ` · ${p.ass.faltasSeguidas} faltas seguidas` : ""}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {r.temFichas ? (
                <div className="space-y-6">
                  <section className="rounded-2xl border bg-card p-5 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold">Quem a Casa atende</h2>
                    <dl className="mb-5 grid grid-cols-3 gap-3 text-center">
                      <div><dd className="text-3xl font-bold">{r.assistidos}</dd><dt className="text-sm text-muted-foreground">assistidos</dt></div>
                      <div><dd className="text-3xl font-bold">{r.comDeficiencia}</dd><dt className="text-sm text-muted-foreground">com deficiência</dt></div>
                      <div><dd className="text-3xl font-bold">{r.comBeneficio}</dd><dt className="text-sm text-muted-foreground">com benefício</dt></div>
                    </dl>
                    <h3 className="mb-2 font-semibold">Por idade</h3>
                    <Barras dados={r.porFaixa} />
                  </section>
                  <section className="rounded-2xl border bg-card p-5 shadow-sm">
                    <h2 className="mb-3 text-xl font-semibold">Bairros com mais assistidos</h2>
                    <Lista dados={r.porBairro} />
                  </section>
                </div>
              ) : <p className="text-muted-foreground">O perfil do público depende das fichas, que ainda não existem no banco real.</p>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
