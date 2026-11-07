import Link from "next/link"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { PRESENCA_LABELS, ITEM_TIPO_LABELS, type ItemTipo, type PresencaStatus } from "@/lib/services/presencas"

const COR_STATUS: Record<PresencaStatus, string> = { presente: "bg-emerald-500", marcada: "bg-sky-400", ausente: "bg-rose-400" }

/** Barra empilhada: situação das inscrições (presente / marcada / ausente). */
export function SituacaoPresencas({ contagem }: { contagem: Record<PresencaStatus, number> }) {
  const total = contagem.presente + contagem.marcada + contagem.ausente
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">Situação das inscrições</h2>
      <p className="mb-4 text-xs text-muted-foreground">{total} no total</p>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">Ainda não há inscrições.</p>
      ) : (
        <>
          <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={(["presente", "marcada", "ausente"] as PresencaStatus[]).map((s) => `${contagem[s]} ${PRESENCA_LABELS[s].toLowerCase()}`).join(", ")}>
            {(["presente", "marcada", "ausente"] as PresencaStatus[]).map((s) => contagem[s] > 0 && <div key={s} className={COR_STATUS[s]} style={{ width: `${(contagem[s] / total) * 100}%` }} />)}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {(["presente", "marcada", "ausente"] as PresencaStatus[]).map((s) => (
              <li key={s} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${COR_STATUS[s]}`} aria-hidden />{PRESENCA_LABELS[s]}</span>
                <span className="font-medium">{contagem[s]} <span className="font-normal text-muted-foreground">({Math.round((contagem[s] / total) * 100)}%)</span></span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

/** Barras horizontais: inscrições por tipo de item. */
export function InscricoesPorTipo({ dados }: { dados: { tipo: ItemTipo; total: number }[] }) {
  const max = Math.max(1, ...dados.map((d) => d.total))
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">Inscrições por área</h2>
      <p className="mb-4 text-xs text-muted-foreground">Onde as pessoas mais participam</p>
      <ul className="space-y-3">
        {dados.map((d) => (
          <li key={d.tipo}>
            <div className="mb-1 flex justify-between text-sm"><span>{ITEM_TIPO_LABELS[d.tipo]}</span><span className="font-medium">{d.total}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${ITEM_TIPO_LABELS[d.tipo]}: ${d.total} inscrições`}>
              <div className="h-full rounded-full bg-primary" style={{ width: `${(d.total / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Ocupação das vagas das oficinas. */
export function OcupacaoOficinas({ itens }: { itens: { id: string; nome: string; vagas: number; inscritos: number }[] }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">Vagas das oficinas</h2>
      <p className="mb-4 text-xs text-muted-foreground">Quanto de cada turma já está preenchido</p>
      {itens.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma oficina cadastrada.</p> : (
        <ul className="space-y-3">
          {itens.map((o) => {
            const pct = o.vagas ? Math.min(100, Math.round((o.inscritos / o.vagas) * 100)) : 0
            return (
              <li key={o.id}>
                <div className="mb-1 flex justify-between text-sm"><span className="truncate pr-2">{o.nome}</span><span className={`shrink-0 font-medium ${pct >= 100 ? "text-rose-600" : ""}`}>{o.inscritos}/{o.vagas}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${o.nome}: ${pct}% das vagas preenchidas`}>
                  <div className={`h-full rounded-full ${pct >= 100 ? "bg-rose-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export type Alerta = { texto: string; href: string; acao: string }

/** Pendências que a administração pode resolver agora. */
export function PrecisaAtencao({ alertas }: { alertas: Alerta[] }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold">Precisa de atenção</h2>
      {alertas.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden /> Tudo em ordem por aqui.</p>
      ) : (
        <ul className="space-y-2">
          {alertas.map((a) => (
            <li key={a.texto} className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1">{a.texto}</span>
              <Link href={a.href} className="shrink-0 font-medium underline">{a.acao}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
