"use client"

import { useState } from "react"
import { ArrowRight, Check, Eye, Home, MessagesSquare, Phone, Send, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Campo, Secao } from "@/components/comum/campo"
import { dataBR, paraData } from "@/lib/formatar"
import { notify } from "@/lib/notify"
import { atualizarNota, listarAcompanhamento, salvarNota, type NotaAcompanhamento } from "@/lib/services/extras"

const TIPOS: [string, LucideIcon, string][] = [
  ["Atendimento", MessagesSquare, "bg-sky-100 text-sky-950 dark:bg-sky-900 dark:text-sky-50"],
  ["Ligação", Phone, "bg-violet-100 text-violet-950 dark:bg-violet-900 dark:text-violet-50"],
  ["Visita", Home, "bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50"],
  ["Encaminhamento", Send, "bg-emerald-100 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50"],
  ["Observação", Eye, "bg-muted text-foreground"],
]
const info = (t: string) => TIPOS.find(([n]) => n === t) ?? TIPOS[4]
const haDias = (iso: string) => Math.max(0, Math.floor((Date.now() - paraData(iso.slice(0, 10)).getTime()) / 86400000))

/** Linha do tempo do cuidado com a pessoa: quem fez o quê, quando, e o que ficou combinado. */
export default function AcompanhamentoPessoa({ pessoaId, autor, notas, setNotas }: { pessoaId: string; autor: string; notas: NotaAcompanhamento[]; setNotas: (n: NotaAcompanhamento[]) => void }) {
  const [filtro, setFiltro] = useState("")
  const [nova, setNova] = useState({ tipo: "Atendimento", texto: "", proximo_passo: "" })
  const recarregar = async () => setNotas(await listarAcompanhamento(pessoaId))
  const visiveis = notas.filter((n) => !filtro || n.tipo === filtro)
  const pendentes = notas.filter((n) => n.proximo_passo && !n.passo_feito)
  const ultimo = notas[0] ? haDias(notas[0].created_at) : null

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_24rem]">
      <section className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[[String(notas.length), notas.length === 1 ? "registro" : "registros"], [ultimo === null ? "—" : ultimo === 0 ? "Hoje" : `${ultimo} dias`, "desde o último contato"], [String(pendentes.length), pendentes.length === 1 ? "passo a fazer" : "passos a fazer"]].map(([v, r]) => (
            <div key={r} className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-2xl font-bold">{v}</p><p className="text-sm text-muted-foreground">{r}</p></div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar registros">
          <Button size="sm" variant={!filtro ? "default" : "outline"} aria-pressed={!filtro} onClick={() => setFiltro("")}>Todos</Button>
          {TIPOS.filter(([n]) => notas.some((x) => x.tipo === n)).map(([n]) => <Button key={n} size="sm" variant={filtro === n ? "default" : "outline"} aria-pressed={filtro === n} onClick={() => setFiltro(n)}>{n}</Button>)}
        </div>

        {visiveis.length === 0 ? <p className="text-muted-foreground">Nenhum registro ainda.</p> : (
          <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-5 before:top-4 before:w-px before:bg-border">
            {visiveis.map((n) => {
              const [, Icone, cor] = info(n.tipo)
              return (
                <li key={n.id} className="relative flex gap-4">
                  <span className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cor}`} aria-hidden><Icone className="h-5 w-5" /></span>
                  <article className="min-w-0 flex-1 rounded-2xl border bg-card p-4 shadow-sm">
                    <header className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="font-semibold">{n.tipo}</h3>
                      <p className="text-sm text-muted-foreground">{dataBR(n.created_at.slice(0, 10))} · {n.autor}</p>
                    </header>
                    <p className="mt-1">{n.texto}</p>
                    {n.proximo_passo && (
                      <div className={`mt-3 flex flex-wrap items-center gap-2 rounded-xl p-3 ${n.passo_feito ? "bg-muted text-muted-foreground" : "bg-primary/5"}`}>
                        {n.passo_feito ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
                        <p className="min-w-0 flex-1"><span className="font-medium">{n.passo_feito ? "Feito: " : "Próximo passo: "}</span>{n.proximo_passo}</p>
                        <Button size="sm" variant="outline" onClick={async () => { await atualizarNota(n.id, { passo_feito: !n.passo_feito }); await recarregar() }}>{n.passo_feito ? "Reabrir" : "Marcar como feito"}</Button>
                      </div>
                    )}
                  </article>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <form className="lg:sticky lg:top-6" onSubmit={async (e) => {
        e.preventDefault()
        if (!nova.texto.trim()) return notify.error("Escreva o que aconteceu")
        await salvarNota({ ...nova, pessoa_id: pessoaId, autor })
        await recarregar()
        setNova({ tipo: "Atendimento", texto: "", proximo_passo: "" })
        notify.success("Registro salvo")
      }}>
        <Secao titulo="Novo registro">
          <fieldset className="space-y-2">
            <legend className="font-medium">Tipo</legend>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map(([n, I]) => (
                <button key={n} type="button" aria-pressed={nova.tipo === n} onClick={() => setNova({ ...nova, tipo: n })} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${nova.tipo === n ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}><I className="h-3.5 w-3.5" aria-hidden />{n}</button>
              ))}
            </div>
          </fieldset>
          <Campo label="O que aconteceu" obrigatorio>{(p) => <Textarea {...p} rows={4} value={nova.texto} onChange={(e) => setNova({ ...nova, texto: e.target.value })} />}</Campo>
          <Campo label="Próximo passo" dica="O que ficou combinado, se houver.">{(p) => <Input {...p} value={nova.proximo_passo} onChange={(e) => setNova({ ...nova, proximo_passo: e.target.value })} />}</Campo>
          <Button type="submit">Salvar registro</Button>
        </Secao>
      </form>
    </div>
  )
}
