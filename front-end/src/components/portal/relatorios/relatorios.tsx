"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { FileSpreadsheet, Pencil, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import PageHeader from "@/components/comum/page-header"
import { useDemo } from "@/hooks/use-demo"
import { baixarArquivo, gerarCsv } from "@/lib/ics"
import { carregarDashboard, type DadosDashboard } from "@/lib/services/dashboard"
import { listarMetas, salvarMeta, type Meta } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, ITEM_TIPOS, type ItemTipo } from "@/lib/services/presencas"
import { rotaAdmin } from "@/lib/itens"
import { useUnidade } from "@/components/portal/unidade"

const PERIODOS = [
  { v: "30", r: "Últimos 30 dias" }, { v: "90", r: "Últimos 3 meses" }, { v: "180", r: "Últimos 6 meses" }, { v: "0", r: "Todo o período" },
]

/** Início do período, em milissegundos. */
const inicioDoPeriodo = (dias: string) => (dias === "0" ? 0 : Date.now() - Number(dias) * 86400000)

function Filtro({ rotulo, valor, onChange, children }: { rotulo: string; valor: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium">
      <span className="mb-1 block">{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border bg-card px-3 font-normal">{children}</select>
    </label>
  )
}

/** Barras verticais de uma única série, com o valor escrito sobre cada barra. */
function BarrasMensais({ dados }: { dados: { rotulo: string; total: number }[] }) {
  const max = Math.max(1, ...dados.map((d) => d.total))
  return (
    <div className="flex h-56 items-end gap-3" role="img" aria-label={dados.map((d) => `${d.rotulo}: ${d.total}`).join(", ")}>
      {dados.map((d) => (
        <div key={d.rotulo} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${d.rotulo}: ${d.total} inscrições`}>
          <span className="text-sm font-semibold tabular-nums">{d.total}</span>
          <div className="w-full max-w-14 rounded-t bg-primary transition-opacity group-hover:opacity-80" style={{ height: `${(d.total / max) * 75}%`, minHeight: d.total ? 4 : 0 }} />
          <span className="truncate text-sm text-muted-foreground">{d.rotulo}</span>
        </div>
      ))}
    </div>
  )
}

export default function Relatorios() {
  const demo = useDemo()
  const { filtrar, centros, unidade, definir } = useUnidade()
  const [dados, setDados] = useState<DadosDashboard | null>(null)
  const [metas, setMetas] = useState<Meta[]>([])
  const [periodo, setPeriodo] = useState("180")
  const [tipo, setTipo] = useState<ItemTipo | "">("")
  const [editando, setEditando] = useState<string | null>(null)

  useEffect(() => { carregarDashboard().then(setDados) }, [])
  useEffect(() => { if (demo) listarMetas().then(setMetas) }, [demo])

  const r = useMemo(() => {
    if (!dados) return null
    const nomes = new Map<string, { nome: string; tipo: ItemTipo; vagas?: number }>()
    const juntar = (t: ItemTipo, l: { id: string; nome: string; vagas?: number }[]) => filtrar(l).forEach((i) => nomes.set(i.id, { nome: i.nome, tipo: t, vagas: i.vagas }))
    juntar("evento", dados.eventos); juntar("atividade", dados.atividades); juntar("oficina", dados.oficinas); juntar("centro", dados.centros); juntar("assistencia", dados.assistencias)

    const desde = inicioDoPeriodo(periodo)
    const lista = dados.presencas.filter((p) => nomes.has(p.item_id) && (!tipo || p.item_tipo === tipo) && new Date(p.created_at).getTime() >= desde)
    const presentes = lista.filter((p) => p.status === "presente").length
    const ausentes = lista.filter((p) => p.status === "ausente").length
    const avaliadas = presentes + ausentes

    const meses = new Map<string, number>()
    const d = new Date()
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
      meses.set(m.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), 0)
    }
    for (const p of lista) {
      const k = new Date(p.created_at).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
      if (meses.has(k)) meses.set(k, meses.get(k)! + 1)
    }

    const porItem = [...nomes.entries()]
      .filter(([, i]) => !tipo || i.tipo === tipo)
      .map(([id, i]) => {
        const doItem = lista.filter((p) => p.item_id === id)
        const pres = doItem.filter((p) => p.status === "presente").length
        const aus = doItem.filter((p) => p.status === "ausente").length
        return { id, ...i, total: doItem.length, pres, aus, taxa: pres + aus ? Math.round((pres / (pres + aus)) * 100) : null }
      })
      .filter((i) => i.total > 0)
      .sort((a, b) => b.total - a.total)

    return {
      total: lista.length, pessoas: new Set(lista.map((p) => p.cliente_id)).size, taxa: avaliadas ? Math.round((presentes / avaliadas) * 100) : null, ausentes,
      meses: [...meses.entries()].map(([rotulo, total]) => ({ rotulo, total })), porItem,
    }
  }, [dados, filtrar, periodo, tipo])

  function exportar() {
    if (!r) return
    const linhas: (string | number)[][] = [["Item", "Tipo", "Inscritos", "Presentes", "Ausentes", "Presença (%)"]]
    r.porItem.forEach((i) => linhas.push([i.nome, ITEM_TIPO_LABELS[i.tipo], i.total, i.pres, i.aus, i.taxa ?? ""]))
    baixarArquivo("relatorio-casa-de-cultura.csv", gerarCsv(linhas), "text/csv;charset=utf-8")
  }

  const valorMeta = (m: Meta) => (m.indicador === "assistidos" ? r?.pessoas ?? 0 : m.indicador === "inscricoes" ? r?.total ?? 0 : r?.taxa ?? 0)
  const nomePeriodo = PERIODOS.find((p) => p.v === periodo)?.r

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Relatórios"
        descricao="Números para acompanhar o projeto e prestar contas a parceiros."
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
          <p className="hidden text-sm print:block">Período: {nomePeriodo}. Gerado em {new Date().toLocaleDateString("pt-BR")}.</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[["Inscrições", r.total], ["Pessoas diferentes", r.pessoas], ["Presença", r.taxa === null ? "—" : `${r.taxa}%`], ["Faltas registradas", r.ausentes]].map(([ro, va]) => (
              <div key={ro} className="rounded-2xl border bg-card p-5 shadow-sm">
                <p className="text-4xl font-bold tracking-tight">{va}</p>
                <p className="mt-1 text-muted-foreground">{ro}</p>
              </div>
            ))}
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-4 text-xl font-semibold">Novas inscrições por mês</h2>
              <BarrasMensais dados={r.meses} />
            </section>

            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Metas do trimestre</h2>
              {!demo ? <p className="text-muted-foreground">Metas dependem do back-end. Veja na demonstração.</p> : (
                <ul className="space-y-5">
                  {metas.map((m) => {
                    const atual = valorMeta(m)
                    const pct = Math.min(100, Math.round((atual / (m.alvo || 1)) * 100))
                    const un = m.indicador === "presenca" ? "%" : ""
                    return (
                      <li key={m.id}>
                        <p className="font-medium">{m.titulo}</p>
                        <div className="mt-1 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                          <span>{atual}{un} de {editando === m.id ? "" : `${m.alvo}${un}`}</span>
                          {editando === m.id ? (
                            <Input
                              autoFocus type="number" aria-label={`Nova meta para ${m.titulo}`} defaultValue={m.alvo} className="h-9 w-24"
                              onBlur={async (e) => {
                                const alvo = Number(e.target.value)
                                if (alvo > 0) { await salvarMeta(m.id, alvo); setMetas((l) => l.map((x) => (x.id === m.id ? { ...x, alvo } : x))) }
                                setEditando(null)
                              }}
                            />
                          ) : (
                            <button type="button" className="nao-imprimir flex items-center gap-1 text-primary hover:underline" onClick={() => setEditando(m.id)} aria-label={`Editar meta: ${m.titulo}`}><Pencil className="h-3.5 w-3.5" aria-hidden /> Editar</button>
                          )}
                        </div>
                        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${pct}% da meta`}>
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <h2 className="p-5 pb-3 text-xl font-semibold">Participação por item</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Item</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Área</th>
                    <th scope="col" className="px-3 py-3 text-right font-semibold">Inscritos</th>
                    <th scope="col" className="px-3 py-3 text-right font-semibold">Presentes</th>
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
                      <td className="px-3 py-3 text-right tabular-nums">{i.total}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{i.pres}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{i.aus}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">{i.taxa === null ? "—" : `${i.taxa}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
