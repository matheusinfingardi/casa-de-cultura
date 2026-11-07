"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Award, CheckCircle2, ChevronDown, Clock, MapPin, Plus, UserRound, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import CapaItem from "@/components/comum/capa-item"
import { Campo } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import Confirmar from "@/components/comum/confirmar"
import { calcularAssiduidade, situacao } from "@/lib/assiduidade"
import { dataBR, dataExtenso } from "@/lib/formatar"
import { proximasDatas, rotaAdmin, type ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { certificadosDaPessoa, type CertificadoEmitido } from "@/lib/services/certificados"
import type { Dependente, Registro } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, contarInscritos, listarInscricoesDe, matricularCliente, removerPresenca, type ContagemItem, type MinhaPresenca } from "@/lib/services/presencas"

function Fato({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return <div><dt className="text-sm text-muted-foreground">{rotulo}</dt><dd className="font-medium">{valor}</dd></div>
}

function Cartao({ i, item, registros, certificados, aoTirar }: { i: MinhaPresenca; item?: ItemView; registros: Registro[]; certificados: CertificadoEmitido[]; aoTirar: () => void }) {
  const [aberto, setAberto] = useState(false)
  const regs = registros.filter((r) => r.item_id === i.item_id).sort((a, b) => a.data.localeCompare(b.data))
  const ass = calcularAssiduidade(regs)
  const st = situacao(ass)
  const prox = item ? proximasDatas(item, 60)[0] : undefined
  const qtd = certificados.filter((c) => c.itens.some((x) => x.id === i.item_id)).length
  const certificado = !item?.tem_certificado ? "Esta atividade não emite" : qtd ? (qtd === 1 ? "1 certificado gerado" : `${qtd} certificados gerados`) : "Ainda não gerado"
  return (
    <li className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <button type="button" aria-expanded={aberto} onClick={() => setAberto(!aberto)} className="flex w-full flex-wrap items-center gap-4 p-4 text-left hover:bg-muted/40">
        <span className="w-24 shrink-0 overflow-hidden rounded-xl"><CapaItem tipo={i.item_tipo} imagem={item?.imagem_url} className="h-16" /></span>
        <span className="min-w-40 flex-1">
          <span className="block font-semibold">{i.item_nome}</span>
          <span className="block text-sm text-muted-foreground">{ITEM_TIPO_LABELS[i.item_tipo]}{item?.quando ? ` · ${item.quando}` : ""}</span>
        </span>
        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-medium ${st.classe}`}>{ass.total ? `${ass.presentes} de ${ass.total} · ${ass.taxa}%` : st.rotulo}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${aberto ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {aberto && (
        <div className="space-y-4 border-t p-4">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Fato rotulo="Situação" valor={st.rotulo} />
            <Fato rotulo="Última presença" valor={ass.ultimaPresenca ? dataBR(ass.ultimaPresenca) : "Ainda não veio"} />
            <Fato rotulo="Faltas seguidas" valor={ass.faltasSeguidas} />
            <Fato rotulo="Próxima data" valor={prox ? <span className="flex items-center gap-1.5 first-letter:uppercase"><Clock className="h-4 w-4 shrink-0" aria-hidden />{dataExtenso(prox.data)}</span> : "Sem data marcada"} />
            {item?.local && <Fato rotulo="Local" valor={<span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0" aria-hidden />{item.local}</span>} />}
            <Fato rotulo="Responsável" valor={<span className="flex items-center gap-1.5"><UserRound className="h-4 w-4 shrink-0" aria-hidden />{item?.responsavel || "Sem responsável"}</span>} />
            <Fato rotulo="Certificado" valor={<span className="flex items-center gap-1.5"><Award className="h-4 w-4 shrink-0" aria-hidden />{certificado}</span>} />
          </dl>
          {regs.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Encontro por encontro</p>
              <ul className="flex flex-wrap gap-1.5">
                {regs.slice(-30).map((r) => {
                  const ok = r.status === "presente"
                  const dia = dataBR(r.data).slice(0, 5)
                  return (
                    <li key={r.id} title={`${dataBR(r.data)}: ${ok ? "presente" : "faltou"}`} className={`flex w-14 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-xs font-medium ${ok ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100" : "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100"}`}>
                      {ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
                      {dia}<span className="sr-only">{ok ? "presente" : "faltou"}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline"><Link href={rotaAdmin(i.item_tipo, i.item_id)}>Abrir atividade</Link></Button>
            <Button asChild size="sm" variant="outline"><Link href={`/portal/presenca/${i.item_tipo}/${i.item_id}`}>Abrir chamada</Link></Button>
            <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-300" onClick={aoTirar}>Tirar da atividade</Button>
          </div>
        </div>
      )}
    </li>
  )
}

/** Tudo o que a pessoa e os dependentes dela fazem na Casa. */
export default function ParticipacaoDetalhe({ pessoaId, inscricoes, registros, itens, familia, aoMudar }: { pessoaId: string; inscricoes: MinhaPresenca[]; registros: Registro[]; itens: ItemView[]; familia: Dependente[]; aoMudar: () => Promise<void> }) {
  const [escolha, setEscolha] = useState("")
  const [contagem, setContagem] = useState<Record<string, ContagemItem>>({})
  const [tirar, setTirar] = useState<MinhaPresenca | null>(null)
  const [dosDependentes, setDosDependentes] = useState<{ dep: Dependente; lista: MinhaPresenca[] }[]>([])

  const [certificados, setCertificados] = useState<CertificadoEmitido[]>([])
  useEffect(() => { contarInscritos().then(setContagem) }, [inscricoes])
  useEffect(() => { certificadosDaPessoa(pessoaId).then(setCertificados) }, [pessoaId])
  useEffect(() => {
    Promise.all(familia.filter((d) => !d.parente_id).map(async (dep) => ({ dep, lista: await listarInscricoesDe(dep.id) }))).then(setDosDependentes)
  }, [familia])

  const achar = (i: MinhaPresenca) => itens.find((x) => x.id === i.item_id)
  const lotado = (o: ItemView) => !!o.vagas && (contagem[`${o.tipo}-${o.id}`]?.total ?? 0) >= o.vagas
  const disponiveis = itens.filter((o) => o.tipo !== "centro" && !inscricoes.some((i) => i.item_id === o.id))
  const areas = new Set(inscricoes.map((i) => i.item_tipo)).size

  async function inscrever() {
    const o = itens.find((x) => `${x.tipo}|${x.id}` === escolha)
    if (!o) return
    if (lotado(o)) return notify.error("Esta turma está sem vagas")
    await matricularCliente(o.tipo, o.id, o.nome, pessoaId)
    setEscolha("")
    await aoMudar()
    notify.success(`Inscrição feita em ${o.nome}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <p className="text-muted-foreground"><strong className="text-foreground">{inscricoes.length}</strong> {inscricoes.length === 1 ? "inscrição" : "inscrições"} em <strong className="text-foreground">{areas}</strong> {areas === 1 ? "área" : "áreas"}. Abra cada uma para ver os detalhes.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sm:w-72"><Campo label="Inscrever em">{(p) => <CampoSelect {...p} valor={escolha} onChange={setEscolha} opcoes={disponiveis.map((o) => ({ valor: `${o.tipo}|${o.id}`, label: `${o.nome}${lotado(o) ? " (sem vagas)" : ""}` }))} />}</Campo></div>
          <Button type="button" variant="outline" disabled={!escolha} onClick={inscrever}><Plus className="h-4 w-4" aria-hidden /> Inscrever</Button>
        </div>
      </div>

      {inscricoes.length === 0 ? <p className="text-muted-foreground">Nenhuma inscrição ainda.</p> : (
        <ul className="space-y-3">{inscricoes.map((i) => <Cartao key={i.id} i={i} item={achar(i)} registros={registros} certificados={certificados} aoTirar={() => setTirar(i)} />)}</ul>
      )}

      {dosDependentes.some((d) => d.lista.length) && (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Dependentes nas atividades</h2>
          <ul className="divide-y">
            {dosDependentes.filter((d) => d.lista.length).map(({ dep, lista }) => (
              <li key={dep.id} className="flex flex-wrap justify-between gap-2 py-2.5"><span className="font-medium">{dep.nome} <span className="font-normal text-muted-foreground">({dep.parentesco.toLowerCase()})</span></span><span className="text-muted-foreground">{lista.map((l) => l.item_nome).join(", ")}</span></li>
            ))}
          </ul>
        </section>
      )}

      <Confirmar aberto={!!tirar} onFechar={() => setTirar(null)} titulo="Tirar da atividade?" perigoso confirmarLabel="Tirar"
        descricao={<>A inscrição em {tirar?.item_nome} será removida. O histórico de presença continua guardado.</>}
        onConfirmar={async () => { if (tirar) await removerPresenca(tirar.id); await aoMudar() }} />
    </div>
  )
}
