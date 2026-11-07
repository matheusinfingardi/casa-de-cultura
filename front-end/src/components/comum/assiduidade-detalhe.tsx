"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calcularAssiduidade, maiorSequencia, situacao } from "@/lib/assiduidade"
import { chaveData, dataBR, dataExtenso, paraData } from "@/lib/formatar"
import type { Registro } from "@/lib/services/extras"

const PERIODOS = [{ v: 56, r: "8 semanas" }, { v: 90, r: "3 meses" }, { v: 180, r: "6 meses" }, { v: 0, r: "Tudo" }]
type Grupo = { chave: string; rotulo: string; titulo: string; regs: Registro[] }
const k = chaveData

function agrupar(registros: Registro[], dias: number): Grupo[] {
  const hoje = new Date()
  if (dias && dias <= 90) {
    // Uma barra por semana, de domingo a sábado.
    const out: Grupo[] = []
    const domingo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - hoje.getDay())
    for (let i = Math.ceil(dias / 7) - 1; i >= 0; i--) {
      const ini = new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() - i * 7)
      const fim = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + 6)
      const dm = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      out.push({ chave: k(ini), rotulo: dm(ini), titulo: `Semana de ${dm(ini)} a ${dm(fim)}`, regs: registros.filter((r) => r.data >= k(ini) && r.data <= k(fim)) })
    }
    return out
  }
  // Períodos longos: uma barra por mês.
  const primeiro = registros.map((r) => r.data).sort()[0]
  const meses = dias ? Math.ceil(dias / 30) + 1 : primeiro ? (hoje.getFullYear() - Number(primeiro.slice(0, 4))) * 12 + hoje.getMonth() - Number(primeiro.slice(5, 7)) + 2 : 1
  const out: Grupo[] = []
  for (let i = meses - 1; i >= 0; i--) {
    const m = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const pre = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`
    out.push({ chave: pre, rotulo: m.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), titulo: m.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }), regs: registros.filter((r) => r.data.startsWith(pre)) })
  }
  return out
}

function Linha({ r, nomeItem }: { r: Registro; nomeItem: (id: string) => string }) {
  const veio = r.status === "presente"
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
      <span className="min-w-0"><span className="block font-medium first-letter:uppercase">{dataExtenso(r.data)}</span><span className="block text-sm text-muted-foreground">{nomeItem(r.item_id)}</span></span>
      <span className={`flex items-center gap-1.5 font-medium ${veio ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
        {veio ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}{veio ? "Presente" : "Faltou"}
      </span>
    </li>
  )
}

/** Barras clicáveis: cada uma abre o que foi cumprido naquele período. Mostra também a conta por trás do número. */
export default function AssiduidadeDetalhe({ registros, nomeItem, compacto = false, aoVerTudo }: { registros: Registro[]; nomeItem: (id: string) => string; compacto?: boolean; aoVerTudo?: () => void }) {
  const [dias, setDias] = useState(56)
  const [aberto, setAberto] = useState<string | null>(null)
  const [soFaltas, setSoFaltas] = useState(false)
  const [qtd, setQtd] = useState(15)

  const grupos = useMemo(() => agrupar(registros, dias), [registros, dias])
  // A conta usa exatamente o que está nas barras, para os números sempre baterem.
  const noPeriodo = useMemo(() => (dias ? grupos.flatMap((g) => g.regs) : registros), [grupos, registros, dias])
  const ass = calcularAssiduidade(noPeriodo)
  const st = situacao(ass)
  const topo = Math.max(1, ...grupos.map((g) => g.regs.length))
  const ultimoComDados = [...grupos].reverse().find((g) => g.regs.length)?.chave ?? null
  const atual = grupos.find((g) => g.chave === (aberto ?? ultimoComDados))
  const historico = [...registros].filter((r) => !soFaltas || r.status === "ausente").sort((a, b) => b.data.localeCompare(a.data))
  const situacoes = [["Frequente", "veio a 75% ou mais"], ["Irregular", "de 50% a 74%"], ["Precisa de contato", "menos de 50%, ou 3 faltas seguidas"]]

  if (!registros.length) return <p className="text-muted-foreground">Ainda sem presença registrada.</p>

  return (
    <div className="space-y-5">
      {!compacto && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Período da assiduidade">
          {PERIODOS.map((p) => <Button key={p.v} size="sm" variant={dias === p.v ? "default" : "outline"} aria-pressed={dias === p.v} onClick={() => { setDias(p.v); setAberto(null) }}>{p.r}</Button>)}
        </div>
      )}

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-primary" aria-hidden />Veio</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-rose-300 dark:bg-rose-700" aria-hidden />Faltou</span>
          <span>Clique em uma barra para ver os dias.</span>
        </div>
        <div className="flex h-44 items-end gap-1.5 overflow-x-auto">
          {grupos.map((g) => {
            const pres = g.regs.filter((r) => r.status === "presente").length
            const falt = g.regs.length - pres
            const sel = atual?.chave === g.chave
            return (
              <button key={g.chave} type="button" aria-pressed={sel} disabled={!g.regs.length} onClick={() => setAberto(g.chave)}
                aria-label={`${g.titulo}: veio a ${pres} de ${g.regs.length}`} title={`${g.titulo}: veio a ${pres} de ${g.regs.length}`}
                className={`flex h-full min-w-10 flex-1 flex-col items-center justify-end gap-1 rounded-lg p-1 transition-colors disabled:cursor-default ${sel ? "bg-primary/10 ring-1 ring-primary" : "enabled:hover:bg-muted"}`}>
                <span className="text-sm font-semibold tabular-nums">{g.regs.length ? `${pres}/${g.regs.length}` : "—"}</span>
                <span className="flex w-full max-w-9 flex-col gap-0.5" style={{ height: `${(g.regs.length / topo) * 65}%` }} aria-hidden>
                  {falt > 0 && <span className="w-full rounded-t bg-rose-300 dark:bg-rose-700" style={{ flexGrow: falt }} />}
                  {pres > 0 && <span className={`w-full bg-primary ${falt ? "" : "rounded-t"}`} style={{ flexGrow: pres }} />}
                </span>
                <span className="whitespace-nowrap text-xs text-muted-foreground">{g.rotulo}</span>
              </button>
            )
          })}
        </div>
      </div>

      {atual && (
        <div className="rounded-xl border p-4" aria-live="polite">
          <p className="font-semibold first-letter:uppercase">{atual.titulo}</p>
          <p className="text-muted-foreground">Veio a {atual.regs.filter((r) => r.status === "presente").length} de {atual.regs.length} encontros.</p>
          <ul className="mt-1 divide-y">
            {[...atual.regs].sort((a, b) => b.data.localeCompare(a.data)).map((r) => <Linha key={r.id} r={r} nomeItem={nomeItem} />)}
          </ul>
        </div>
      )}

      <div className="rounded-xl bg-muted p-4">
        <p className="font-semibold">Como o número é calculado</p>
        <p className="mt-1">{ass.presentes} {ass.presentes === 1 ? "presença" : "presenças"} ÷ {ass.total} {ass.total === 1 ? "encontro" : "encontros"} = <strong>{ass.taxa === null ? "—" : `${ass.taxa}%`}</strong> de presença.</p>
        <p className="mt-1 text-muted-foreground">Contam só os encontros em que houve chamada e a pessoa estava inscrita.</p>
        {!compacto && (
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <div><dt className="text-sm text-muted-foreground">Faltas seguidas agora</dt><dd className="font-semibold">{ass.faltasSeguidas}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Maior sequência de presenças</dt><dd className="font-semibold">{maiorSequencia(noPeriodo)}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Última presença</dt><dd className="font-semibold">{ass.ultimaPresenca ? dataBR(ass.ultimaPresenca) : "—"}</dd></div>
          </dl>
        )}
        {!compacto && (
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t pt-3 text-sm">
            {situacoes.map(([s, d]) => <li key={s} className={st.rotulo === s ? "font-semibold" : "text-muted-foreground"}>{st.rotulo === s && "Agora: "}{s}: {d}</li>)}
          </ul>
        )}
      </div>

      {compacto && aoVerTudo && <Button size="sm" variant="outline" onClick={aoVerTudo}>Ver histórico completo</Button>}

      {!compacto && (
        <section>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Histórico completo</h3>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={soFaltas} onChange={(e) => setSoFaltas(e.target.checked)} /> Mostrar só as faltas</label>
          </div>
          <ul className="divide-y">{historico.slice(0, qtd).map((r) => <Linha key={r.id} r={r} nomeItem={nomeItem} />)}</ul>
          {historico.length > qtd && <Button size="sm" variant="outline" className="mt-2" onClick={() => setQtd(qtd + 30)}>Ver mais ({historico.length - qtd})</Button>}
          {historico.length > 0 && <p className="mt-2 text-sm text-muted-foreground">Desde {paraData(historico[historico.length - 1].data).toLocaleDateString("pt-BR")}: {historico.length} {historico.length === 1 ? "registro" : "registros"}.</p>}
        </section>
      )}
    </div>
  )
}
