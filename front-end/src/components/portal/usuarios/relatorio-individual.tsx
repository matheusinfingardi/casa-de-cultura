"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, CircleAlert, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calcularAssiduidade, idade, maiorSequencia, situacao, voltouAVir } from "@/lib/assiduidade"
import { chaveData, dataBR } from "@/lib/formatar"
import { cuidadosDaFamilia, cuidadosDaPessoa, resumoFamilia } from "@/lib/familia"
import type { ItemView } from "@/lib/itens"
import type { Dependente, Ficha, NotaAcompanhamento, Registro } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, type MinhaPresenca } from "@/lib/services/presencas"
import type { Usuario } from "@/lib/services/usuarios"

const PERIODOS = [{ v: "90", r: "Últimos 3 meses" }, { v: "180", r: "Últimos 6 meses" }, { v: "0", r: "Desde o início" }]

/** Resumo de uma pessoa para a equipe acompanhar e levar ao atendimento. Renda e benefícios ficam de fora de propósito. */
export default function RelatorioIndividual({ u, ficha, familia, registros, inscricoes, notas, itens }: {
  u: Usuario; ficha: Ficha; familia: Dependente[]; registros: Registro[]; inscricoes: MinhaPresenca[]; notas: NotaAcompanhamento[]; itens: ItemView[]
}) {
  const [periodo, setPeriodo] = useState("90")
  const dias = Number(periodo)
  const limite = useMemo(() => { if (!dias) return ""; const d = new Date(); d.setDate(d.getDate() - dias); return chaveData(d) }, [dias])
  const regs = registros.filter((r) => r.data >= limite)
  const notasP = notas.filter((n) => n.created_at.slice(0, 10) >= limite)
  const ass = calcularAssiduidade(regs)
  const st = situacao(ass)
  const anos = idade(ficha.nascimento)

  const meses: { rotulo: string; presentes: number; total: number }[] = []
  for (let i = dias === 90 ? 3 : 6; i >= 0; i--) {
    const m = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)
    const pre = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`
    const l = regs.filter((r) => r.data.startsWith(pre))
    meses.push({ rotulo: m.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), presentes: l.filter((r) => r.status === "presente").length, total: l.length })
  }

  const porItem = inscricoes.map((i) => ({ ...i, ass: calcularAssiduidade(regs.filter((r) => r.item_id === i.item_id)) }))
  const sequencia = maiorSequencia(regs)
  const certificados = inscricoes.filter((i) => {
    const it = itens.find((x) => x.id === i.item_id)
    return it?.tem_certificado && it.certificado_liberado && registros.some((r) => r.item_id === i.item_id && r.status === "presente")
  })

  const positivos = [
    ass.taxa !== null && ass.taxa >= 75 && `Veio a ${ass.taxa}% dos encontros do período.`,
    sequencia >= 3 && `Chegou a ${sequencia} presenças seguidas.`,
    voltouAVir(regs) && "Voltou a frequentar depois de um período de faltas.",
    porItem.filter((i) => i.ass.presentes > 0).length >= 2 && `Participa de ${porItem.filter((i) => i.ass.presentes > 0).length} atividades diferentes.`,
    certificados.length > 0 && `Já pode baixar ${certificados.length === 1 ? "1 certificado" : `${certificados.length} certificados`}.`,
  ].filter(Boolean) as string[]

  const atencao = [
    ass.faltasSeguidas >= 3 && `Faltou ${ass.faltasSeguidas} vezes seguidas.`,
    ass.taxa !== null && ass.taxa < 50 && "Veio a menos da metade dos encontros.",
    ass.total === 0 && "Sem presença registrada no período.",
    notasP.length === 0 && "Nenhum contato da equipe registrado no período.",
    notas[0]?.proximo_passo && `Próximo passo combinado: ${notas[0].proximo_passo}`,
  ].filter(Boolean) as string[]

  const cuidados = cuidadosDaPessoa(ficha)
  const naFamilia = cuidadosDaFamilia(familia)
  const topo = Math.max(1, ...meses.map((m) => m.total))

  return (
    <div className="space-y-6">
      <div className="nao-imprimir flex flex-wrap items-end justify-between gap-3">
        <label className="text-sm font-medium">
          <span className="mb-1 block">Período</span>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="h-11 rounded-xl border bg-card px-3 font-normal">{PERIODOS.map((p) => <option key={p.v} value={p.v}>{p.r}</option>)}</select>
        </label>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden /> Imprimir ou salvar PDF</Button>
      </div>

      <section className="hidden print:block">
        <h2 className="text-2xl font-bold">Relatório individual: {u.nome}</h2>
        <p>{anos !== null ? `${anos} anos · ` : ""}{ficha.bairro}. {PERIODOS.find((p) => p.v === periodo)?.r}. Gerado em {new Date().toLocaleDateString("pt-BR")}.</p>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[[ass.taxa === null ? "—" : `${ass.taxa}%`, "de presença"], [`${ass.presentes} de ${ass.total}`, "encontros"], [String(porItem.length), porItem.length === 1 ? "inscrição" : "inscrições"], [String(notasP.length), notasP.length === 1 ? "contato da equipe" : "contatos da equipe"]].map(([v, r]) => (
          <div key={r} className="rounded-2xl border bg-card p-5 shadow-sm"><p className="text-3xl font-bold tracking-tight">{v}</p><p className="mt-1 text-muted-foreground">{r}</p></div>
        ))}
      </div>
      <p><span className="text-muted-foreground">Situação: </span><span className={`rounded-full px-3 py-1 text-sm font-medium ${st.classe}`}>{st.rotulo}</span></p>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">O que está indo bem</h2>
          {positivos.length === 0 ? <p className="text-muted-foreground">Ainda não há destaques neste período.</p> : (
            <ul className="space-y-2">{positivos.map((t) => <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden />{t}</li>)}</ul>
          )}
        </section>
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Onde dá para ajudar</h2>
          {atencao.length === 0 ? <p className="text-muted-foreground">Nada pendente neste período.</p> : (
            <ul className="space-y-2">{atencao.map((t) => <li key={t} className="flex gap-2"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />{t}</li>)}</ul>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Presenças mês a mês</h2>
          <p className="mb-4 text-muted-foreground">Quantos encontros a pessoa veio, do total daquele mês.</p>
          <div className="flex h-40 items-end gap-3" role="img" aria-label={meses.map((m) => `${m.rotulo}: ${m.presentes} de ${m.total}`).join("; ")}>
            {meses.map((m) => (
              <div key={m.rotulo} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${m.rotulo}: ${m.presentes} de ${m.total}`}>
                <span className="text-sm font-semibold tabular-nums">{m.total ? `${m.presentes} de ${m.total}` : "—"}</span>
                <div className="w-full max-w-14 rounded-t bg-primary" style={{ height: `${(m.presentes / topo) * 70}%`, minHeight: m.presentes ? 4 : 0 }} />
                <span className="text-sm text-muted-foreground">{m.rotulo}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Em cada atividade</h2>
          {porItem.length === 0 ? <p className="text-muted-foreground">Nenhuma inscrição.</p> : (
            <ul className="divide-y">
              {porItem.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0"><p className="font-medium">{i.item_nome}</p><p className="text-sm text-muted-foreground">{ITEM_TIPO_LABELS[i.item_tipo]}</p></div>
                  <span className="tabular-nums text-muted-foreground">{i.ass.total ? `${i.ass.presentes} de ${i.ass.total}` : "Sem registros"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Cuidados e dependentes</h2>
          {cuidados.length === 0 && !ficha.necessidades ? <p className="text-muted-foreground">Sem cuidados especiais anotados para a pessoa.</p> : (
            <ul className="mb-3 space-y-1">{cuidados.map((c) => <li key={c} className="font-medium">{c}</li>)}{ficha.necessidades && <li>{ficha.necessidades}</li>}</ul>
          )}
          {familia.length > 0 && (
            <div className="border-t pt-3">
              <p className="font-medium">Dependentes: {resumoFamilia(familia)}</p>
              {naFamilia.map((c) => <p key={c.nome}><span className="font-medium">{c.nome}</span> ({c.parentesco}): {c.texto}</p>)}
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Acompanhamento no período</h2>
          {notasP.length === 0 ? <p className="text-muted-foreground">Nenhum registro.</p> : (
            <ul className="divide-y">
              {notasP.map((n) => <li key={n.id} className="py-2.5"><p className="text-sm text-muted-foreground">{n.tipo} · {n.autor} · {dataBR(n.created_at.slice(0, 10))}</p><p>{n.texto}</p></li>)}
            </ul>
          )}
        </section>
      </div>
      <p className="text-sm text-muted-foreground">Este relatório não traz renda nem benefícios. Compartilhe só com quem cuida diretamente da pessoa.</p>
    </div>
  )
}
