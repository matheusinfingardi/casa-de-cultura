"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Accessibility, AlertTriangle, CalendarCheck, Eye, EyeOff, HeartPulse, Home, Link2, Phone, Plus, SearchX, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { useDemo } from "@/hooks/use-demo"
import { calcularAssiduidade, idade, situacao } from "@/lib/assiduidade"
import { DIAS_SEMANA, dataBR, iniciais, mascararTelefone, paraData } from "@/lib/formatar"
import { rotaAdmin } from "@/lib/itens"
import { notify } from "@/lib/notify"
import {
  PERIODOS_DIA, buscarDisponibilidade, buscarFicha, listarAcompanhamento, listarDependentes, registrosDaPessoa, removerDependente, salvarDependente, salvarFicha, salvarNota,
  type Dependente, type Disponibilidade, type Ficha, type NotaAcompanhamento, type Registro,
} from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, listarInscricoesDe, type ItemResponsavel, type MinhaPresenca } from "@/lib/services/presencas"
import { ROLE_LABELS, listarUsuarios, type Usuario } from "@/lib/services/usuarios"

type Aba = "resumo" | "cuidados" | "familia" | "participacao" | "acompanhamento"
const ABAS: [Aba, string][] = [["resumo", "Resumo"], ["cuidados", "Necessidades e condições"], ["familia", "Família"], ["participacao", "Participação"], ["acompanhamento", "Acompanhamento"]]
const PARENTESCO = ["Mãe", "Pai", "Filho", "Filha", "Irmã", "Irmão", "Avó", "Avô", "Neto", "Neta", "Cônjuge", "Responsável", "Outro"].map((x) => ({ valor: x, label: x }))
const TIPOS_NOTA = ["Atendimento", "Ligação", "Visita", "Encaminhamento", "Observação"].map((x) => ({ valor: x, label: x }))
const BENEFICIOS = ["Bolsa Família", "BPC", "CadÚnico", "Tarifa social", "Outro"]

function Dado({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return <div><dt className="text-sm text-muted-foreground">{rotulo}</dt><dd className="font-medium">{valor || "Não informado"}</dd></div>
}

/** Frequência nas últimas semanas: uma barra por semana, sempre com número e legenda. */
function BarrasSemanais({ registros }: { registros: Registro[] }) {
  const semanas = useMemo(() => {
    const out: { rotulo: string; presentes: number; total: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const fim = new Date(); fim.setDate(fim.getDate() - i * 7)
      const ini = new Date(fim); ini.setDate(ini.getDate() - 6)
      const k = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      const naSemana = registros.filter((r) => r.data >= k(ini) && r.data <= k(fim))
      out.push({ rotulo: ini.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), presentes: naSemana.filter((r) => r.status === "presente").length, total: naSemana.length })
    }
    return out
  }, [registros])
  return (
    <div className="flex h-32 items-end gap-2" role="img" aria-label={semanas.map((s) => `Semana de ${s.rotulo}: ${s.presentes} de ${s.total}`).join("; ")}>
      {semanas.map((s) => (
        <div key={s.rotulo} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`Semana de ${s.rotulo}: ${s.presentes} presenças em ${s.total} encontros`}>
          <span className="text-xs font-semibold tabular-nums">{s.total ? `${s.presentes}/${s.total}` : "—"}</span>
          <div className="w-full max-w-10 rounded-t bg-muted" style={{ height: `${s.total ? 60 : 4}%` }}>
            <div className="h-full w-full rounded-t bg-primary" style={{ clipPath: `inset(${s.total ? 100 - (s.presentes / s.total) * 100 : 100}% 0 0 0)` }} />
          </div>
          <span className="truncate text-xs text-muted-foreground">{s.rotulo}</span>
        </div>
      ))}
    </div>
  )
}

function PaginaAssistido({ u }: { u: Usuario }) {
  const { user } = useAuth()
  const [aba, setAba] = useState<Aba>("resumo")
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [familia, setFamilia] = useState<Dependente[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [inscricoes, setInscricoes] = useState<MinhaPresenca[]>([])
  const [notas, setNotas] = useState<NotaAcompanhamento[]>([])
  const [revelar, setRevelar] = useState(false)
  const [novoFam, setNovoFam] = useState({ nome: "", parentesco: "", nascimento: "", telefone: "" })
  const [novaNota, setNovaNota] = useState({ tipo: "Atendimento", texto: "", proximo_passo: "" })

  useEffect(() => {
    buscarFicha(u.id).then(setFicha)
    listarDependentes(u.id).then(setFamilia)
    registrosDaPessoa(u.id).then(setRegistros)
    listarInscricoesDe(u.id).then(setInscricoes)
    listarAcompanhamento(u.id).then(setNotas)
  }, [u.id])

  if (!ficha) return <Skeleton className="h-96 rounded-2xl" />

  const ass = calcularAssiduidade(registros)
  const st = situacao(ass)
  const anos = idade(ficha.nascimento)
  const set = <K extends keyof Ficha>(k: K, v: Ficha[K]) => setFicha({ ...ficha, [k]: v })
  const oculto = (t: string) => (revelar ? t : t ? "••••••••" : "")
  const porItem = inscricoes.map((i) => ({ ...i, ass: calcularAssiduidade(registros.filter((r) => r.item_id === i.item_id)) }))
  const recentes = [...registros].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 10)
  const nomeItem = (id: string) => inscricoes.find((i) => i.item_id === id)?.item_nome ?? "Item"
  const salvar = async () => { await salvarFicha(ficha); notify.success("Ficha salva") }

  return (
    <div className="space-y-6">
      {/* Quem é a pessoa */}
      <section className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary" aria-hidden>{iniciais(u.nome)}</span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-lg">{anos !== null ? `${anos} anos` : "Idade não informada"}{ficha.bairro ? ` · ${ficha.bairro}` : ""}{ficha.trabalho ? ` · ${ficha.trabalho}` : ""}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${st.classe}`}>{st.rotulo}</span>
            {ficha.deficiencia && <Badge variant="secondary"><Accessibility className="h-3.5 w-3.5" aria-hidden /> {ficha.deficiencia}</Badge>}
            {ficha.saude && <Badge variant="outline"><HeartPulse className="h-3.5 w-3.5" aria-hidden /> Atenção à saúde</Badge>}
            {ficha.beneficios?.map((b) => <Badge key={b} variant="outline">{b}</Badge>)}
          </div>
          {ficha.necessidades && <p className="text-muted-foreground">{ficha.necessidades}</p>}
        </div>
        <dl className="grid shrink-0 grid-cols-3 gap-5 border-t pt-4 text-center md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div><dd className="text-3xl font-bold">{ass.taxa === null ? "—" : `${ass.taxa}%`}</dd><dt className="text-sm text-muted-foreground">presença</dt></div>
          <div><dd className="text-3xl font-bold">{inscricoes.length}</dd><dt className="text-sm text-muted-foreground">inscrições</dt></div>
          <div><dd className="text-3xl font-bold">{familia.length}</dd><dt className="text-sm text-muted-foreground">familiares</dt></div>
        </dl>
      </section>

      {ass.faltasSeguidas >= 3 && (
        <p role="status" className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-100 p-4 text-amber-950 dark:bg-amber-900 dark:text-amber-50">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <span className="flex-1">Faltou {ass.faltasSeguidas} vezes seguidas{ass.ultimaPresenca ? `. Última presença em ${dataBR(ass.ultimaPresenca)}` : ""}. Que tal entrar em contato?</span>
          <Button size="sm" variant="outline" className="bg-white text-amber-950" onClick={() => setAba("acompanhamento")}>Registrar contato</Button>
        </p>
      )}

      <div className="flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="Informações da pessoa">
        {ABAS.map(([v, r]) => (
          <button key={v} type="button" role="tab" aria-selected={aba === v} onClick={() => setAba(v)} className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 font-medium ${aba === v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{r}</button>
        ))}
      </div>

      {aba === "resumo" && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Secao titulo="Contato" descricao="Dados pessoais ficam escondidos até você pedir.">
            <Button type="button" size="sm" variant="outline" onClick={() => setRevelar(!revelar)}>
              {revelar ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />} {revelar ? "Esconder dados" : "Mostrar dados"}
            </Button>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Dado rotulo="Telefone" valor={oculto(ficha.telefone)} />
              <Dado rotulo="E-mail" valor={u.email} />
              <Dado rotulo="Endereço" valor={oculto(ficha.endereco)} />
              <Dado rotulo="Contato de emergência" valor={oculto(ficha.contato_emergencia)} />
              <Dado rotulo="Nascimento" valor={revelar && ficha.nascimento ? dataBR(ficha.nascimento) : oculto(ficha.nascimento)} />
              <Dado rotulo="Autoriza uso de imagem" valor={ficha.autoriza_imagem ? "Sim" : "Não"} />
            </dl>
          </Secao>
          <Secao titulo="Assiduidade" descricao="Presença nas últimas 8 semanas.">
            {ass.total === 0 ? <p className="text-muted-foreground">Ainda sem registros de presença.</p> : (
              <>
                <BarrasSemanais registros={registros} />
                <p className="text-muted-foreground">Veio a <strong className="text-foreground">{ass.presentes} de {ass.total}</strong> encontros{ass.ultimaPresenca ? `. Última presença em ${dataBR(ass.ultimaPresenca)}.` : "."}</p>
              </>
            )}
          </Secao>
          <Secao titulo="Último acompanhamento">
            {notas[0] ? (
              <div>
                <p className="text-sm text-muted-foreground">{notas[0].tipo} · {notas[0].autor} · {dataBR(notas[0].created_at.slice(0, 10))}</p>
                <p className="mt-1">{notas[0].texto}</p>
                {notas[0].proximo_passo && <p className="mt-2 font-medium">Próximo passo: {notas[0].proximo_passo}</p>}
              </div>
            ) : <p className="text-muted-foreground">Nenhum registro ainda.</p>}
            <Button size="sm" variant="outline" onClick={() => setAba("acompanhamento")}>Ver e registrar</Button>
          </Secao>
          <Secao titulo="Família">
            {familia.length === 0 ? <p className="text-muted-foreground">Nenhum familiar cadastrado.</p> : (
              <ul className="divide-y">{familia.map((f) => <li key={f.id} className="flex justify-between gap-2 py-2"><span className="font-medium">{f.nome}</span><span className="text-muted-foreground">{f.parentesco}</span></li>)}</ul>
            )}
            <Button size="sm" variant="outline" onClick={() => setAba("familia")}>Ver família</Button>
          </Secao>
        </div>
      )}

      {aba === "cuidados" && (
        <form className="space-y-6" onSubmit={async (e) => { e.preventDefault(); await salvar() }}>
          <p className="rounded-xl bg-muted p-4">Estas informações são sensíveis e existem para cuidar melhor da pessoa. Registre só o necessário, com o consentimento dela ou do responsável.</p>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Secao titulo="Necessidades e acessibilidade">
              <Campo label="Deficiência ou condição" dica="Ex.: baixa visão, mobilidade reduzida, autismo.">{(p) => <Input {...p} value={ficha.deficiencia} onChange={(e) => set("deficiencia", e.target.value)} />}</Campo>
              <Campo label="O que ajuda essa pessoa" dica="O que a equipe precisa saber para acolher bem.">{(p) => <Textarea {...p} rows={3} value={ficha.necessidades} onChange={(e) => set("necessidades", e.target.value)} />}</Campo>
              <Campo label="Acessibilidade necessária">{(p) => <Input {...p} value={ficha.acessibilidade} onChange={(e) => set("acessibilidade", e.target.value)} />}</Campo>
              <Campo label="Responsável legal" dica="Para menores de idade ou pessoas sob curatela.">{(p) => <Input {...p} value={ficha.responsavel_legal} onChange={(e) => set("responsavel_legal", e.target.value)} />}</Campo>
            </Secao>
            <Secao titulo="Saúde">
              <Campo label="Condições de saúde">{(p) => <Input {...p} value={ficha.saude} onChange={(e) => set("saude", e.target.value)} />}</Campo>
              <Campo label="Medicamentos de uso contínuo">{(p) => <Input {...p} value={ficha.medicamentos} onChange={(e) => set("medicamentos", e.target.value)} />}</Campo>
              <Campo label="Alergias">{(p) => <Input {...p} value={ficha.alergias} onChange={(e) => set("alergias", e.target.value)} />}</Campo>
              <Campo label="Contato de emergência">{(p) => <Input {...p} value={ficha.contato_emergencia} onChange={(e) => set("contato_emergencia", e.target.value)} />}</Campo>
            </Secao>
            <Secao titulo="Condição social">
              <div>
                <p className="mb-2 text-sm font-medium">Benefícios</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Benefícios">
                  {BENEFICIOS.map((b) => {
                    const on = ficha.beneficios?.includes(b)
                    return <Button key={b} type="button" size="sm" variant={on ? "default" : "outline"} aria-pressed={!!on} onClick={() => set("beneficios", on ? ficha.beneficios.filter((x) => x !== b) : [...(ficha.beneficios ?? []), b])}>{b}</Button>
                  })}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Renda da família">{(p) => <Input {...p} value={ficha.renda} onChange={(e) => set("renda", e.target.value)} />}</Campo>
                <Campo label="Moradia">{(p) => <Input {...p} value={ficha.moradia} onChange={(e) => set("moradia", e.target.value)} />}</Campo>
                <Campo label="Trabalho">{(p) => <Input {...p} value={ficha.trabalho} onChange={(e) => set("trabalho", e.target.value)} />}</Campo>
                <Campo label="Escolaridade">{(p) => <Input {...p} value={ficha.escolaridade} onChange={(e) => set("escolaridade", e.target.value)} />}</Campo>
                <Campo label="Como chega à Casa">{(p) => <Input {...p} value={ficha.transporte} onChange={(e) => set("transporte", e.target.value)} />}</Campo>
              </div>
            </Secao>
            <Secao titulo="Dados pessoais">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Telefone">{(p) => <Input {...p} type="tel" value={ficha.telefone} onChange={(e) => set("telefone", mascararTelefone(e.target.value))} />}</Campo>
                <Campo label="Nascimento">{(p) => <Input {...p} type="date" value={ficha.nascimento} onChange={(e) => set("nascimento", e.target.value)} />}</Campo>
                <Campo label="Endereço">{(p) => <Input {...p} value={ficha.endereco} onChange={(e) => set("endereco", e.target.value)} />}</Campo>
                <Campo label="Bairro">{(p) => <Input {...p} value={ficha.bairro} onChange={(e) => set("bairro", e.target.value)} />}</Campo>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={ficha.autoriza_imagem} onChange={(e) => set("autoriza_imagem", e.target.checked)} /> Autoriza o uso de imagem</label>
            </Secao>
          </div>
          <Button type="submit" size="lg">Salvar ficha</Button>
        </form>
      )}

      {aba === "familia" && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Família de {u.nome?.split(" ")[0]}</h2>
            {familia.length === 0 ? <p className="text-muted-foreground">Nenhum familiar cadastrado.</p> : (
              <ul className="space-y-3">
                {familia.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="min-w-0">
                      <p className="font-semibold">{f.nome} <span className="font-normal text-muted-foreground">· {f.parentesco}{idade(f.nascimento) !== null ? `, ${idade(f.nascimento)} anos` : ""}</span></p>
                      {f.mora_junto && <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Home className="h-3.5 w-3.5" aria-hidden /> Mora junto</p>}
                      {f.telefone && <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" aria-hidden /> {f.telefone}</p>}
                      {f.atividade && <p className="text-sm text-muted-foreground">Participa de {f.atividade}</p>}
                      {f.parente_id && <Link href={`/portal/usuarios/${f.parente_id}`} className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><Link2 className="h-3.5 w-3.5" aria-hidden /> Também é assistido: abrir ficha</Link>}
                    </div>
                    <Button size="icon-sm" variant="ghost" className="text-red-700 dark:text-red-300" aria-label={`Remover ${f.nome}`} onClick={async () => { await removerDependente(f.id); setFamilia(await listarDependentes(u.id)) }}><Trash2 className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (!novoFam.nome.trim() || !novoFam.parentesco) return notify.error("Informe o nome e o parentesco")
            await salvarDependente({ ...novoFam, responsavel_id: u.id, atividade: "", mora_junto: false, parente_id: null })
            setFamilia(await listarDependentes(u.id))
            setNovoFam({ nome: "", parentesco: "", nascimento: "", telefone: "" })
          }}>
            <Secao titulo="Adicionar familiar">
              <Campo label="Nome" obrigatorio>{(p) => <Input {...p} value={novoFam.nome} onChange={(e) => setNovoFam({ ...novoFam, nome: e.target.value })} />}</Campo>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Parentesco" obrigatorio>{(p) => <CampoSelect {...p} valor={novoFam.parentesco} opcoes={PARENTESCO} onChange={(x) => setNovoFam({ ...novoFam, parentesco: x })} />}</Campo>
                <Campo label="Nascimento">{(p) => <Input {...p} type="date" value={novoFam.nascimento} onChange={(e) => setNovoFam({ ...novoFam, nascimento: e.target.value })} />}</Campo>
              </div>
              <Campo label="Telefone">{(p) => <Input {...p} type="tel" value={novoFam.telefone} onChange={(e) => setNovoFam({ ...novoFam, telefone: mascararTelefone(e.target.value) })} />}</Campo>
              <Button type="submit"><Plus className="h-4 w-4" aria-hidden /> Adicionar</Button>
            </Secao>
          </form>
        </div>
      )}

      {aba === "participacao" && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Secao titulo="Em que participa">
            {porItem.length === 0 ? <p className="text-muted-foreground">Nenhuma inscrição ainda.</p> : (
              <ul className="divide-y">
                {porItem.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0"><Link href={rotaAdmin(i.item_tipo, i.item_id)} className="font-medium hover:underline">{i.item_nome}</Link><p className="text-sm text-muted-foreground">{ITEM_TIPO_LABELS[i.item_tipo]}</p></div>
                    <span className={`rounded-full px-2.5 py-1 text-sm font-medium ${situacao(i.ass).classe}`}>{i.ass.taxa === null ? "Sem registros" : `${i.ass.presentes} de ${i.ass.total} (${i.ass.taxa}%)`}</span>
                  </li>
                ))}
              </ul>
            )}
          </Secao>
          <Secao titulo="Últimos encontros">
            {recentes.length === 0 ? <p className="text-muted-foreground">Ainda sem registros.</p> : (
              <ul className="divide-y">
                {recentes.map((r) => (
                  <li key={r.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                    <span>{nomeItem(r.item_id)}</span>
                    <span className="flex items-center gap-2 text-muted-foreground"><CalendarCheck className="h-4 w-4" aria-hidden />{dataBR(r.data)} · <span className={r.status === "presente" ? "font-medium text-emerald-700 dark:text-emerald-300" : "font-medium text-rose-700 dark:text-rose-300"}>{r.status === "presente" ? "Presente" : "Faltou"}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Secao>
        </div>
      )}

      {aba === "acompanhamento" && (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_24rem]">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Histórico de cuidado</h2>
            {notas.length === 0 ? <p className="text-muted-foreground">Nenhum registro ainda.</p> : (
              <ol className="space-y-3">
                {notas.map((n) => (
                  <li key={n.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{n.tipo}</span> · {n.autor} · {dataBR(n.created_at.slice(0, 10))}</p>
                    <p className="mt-1">{n.texto}</p>
                    {n.proximo_passo && <p className="mt-2 font-medium">Próximo passo: {n.proximo_passo}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (!novaNota.texto.trim()) return notify.error("Escreva o que aconteceu")
            await salvarNota({ ...novaNota, pessoa_id: u.id, autor: (user?.user_metadata?.nome as string) ?? "Equipe" })
            setNotas(await listarAcompanhamento(u.id))
            setNovaNota({ tipo: "Atendimento", texto: "", proximo_passo: "" })
            notify.success("Registro salvo")
          }}>
            <Secao titulo="Novo registro">
              <Campo label="Tipo">{(p) => <CampoSelect {...p} valor={novaNota.tipo} opcoes={TIPOS_NOTA} onChange={(x) => setNovaNota({ ...novaNota, tipo: x })} />}</Campo>
              <Campo label="O que aconteceu" obrigatorio>{(p) => <Textarea {...p} rows={4} value={novaNota.texto} onChange={(e) => setNovaNota({ ...novaNota, texto: e.target.value })} />}</Campo>
              <Campo label="Próximo passo">{(p) => <Input {...p} value={novaNota.proximo_passo} onChange={(e) => setNovaNota({ ...novaNota, proximo_passo: e.target.value })} />}</Campo>
              <Button type="submit">Salvar registro</Button>
            </Secao>
          </form>
        </div>
      )}
    </div>
  )
}

function PaginaVoluntario({ u }: { u: Usuario }) {
  const [d, setD] = useState<Disponibilidade | null>(null)
  const [itens, setItens] = useState<ItemResponsavel[]>([])
  const [notas, setNotas] = useState<NotaAcompanhamento[]>([])

  useEffect(() => {
    buscarDisponibilidade(u.id).then(setD)
    listarAcompanhamento(u.id).then(setNotas)
    // Itens do voluntário: filtra o que vem de todas as tabelas por responsável.
    import("@/lib/itens").then(({ listarItensView }) => listarItensView()).then((l) => setItens(l.filter((i) => i.responsavel_id === u.id).map((i) => ({ tipo: i.tipo, id: i.id, nome: i.nome, local: i.local }))))
  }, [u.id])

  if (!d) return <Skeleton className="h-96 rounded-2xl" />
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Secao titulo="Quando pode ajudar">
        <div className="overflow-x-auto">
          <table className="w-full min-w-80">
            <thead><tr className="text-left text-sm text-muted-foreground"><th scope="col" className="py-1.5 font-semibold">Dia</th>{PERIODOS_DIA.map((p) => <th key={p} scope="col" className="py-1.5 text-center font-semibold">{p}</th>)}</tr></thead>
            <tbody className="divide-y">
              {DIAS_SEMANA.map((dia) => (
                <tr key={dia}>
                  <th scope="row" className="py-1.5 text-left font-medium">{dia}</th>
                  {PERIODOS_DIA.map((p) => <td key={p} className="py-1.5 text-center">{d.grade[dia]?.includes(p) ? <span className="font-semibold text-emerald-700 dark:text-emerald-300">Sim</span> : <span className="text-muted-foreground">—</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {d.observacoes && <p className="text-muted-foreground">{d.observacoes}</p>}
      </Secao>
      <div className="space-y-6">
        <Secao titulo="Como pode ajudar">
          <div className="flex flex-wrap gap-2">{d.areas.length ? d.areas.map((a) => <Badge key={a} variant="secondary">{a}</Badge>) : <p className="text-muted-foreground">Não informado.</p>}</div>
          <dl className="grid gap-4 sm:grid-cols-2"><Dado rotulo="Formação" valor={d.formacao} /><Dado rotulo="Telefone" valor={d.telefone} /></dl>
          {d.experiencia && <p>{d.experiencia}</p>}
        </Secao>
        <Secao titulo={`Compromissos (${itens.length})`}>
          {itens.length === 0 ? <p className="text-muted-foreground">Nenhum compromisso atribuído.</p> : (
            <ul className="divide-y">{itens.map((i) => <li key={`${i.tipo}-${i.id}`} className="flex justify-between gap-2 py-2.5"><Link href={rotaAdmin(i.tipo, i.id)} className="font-medium hover:underline">{i.nome}</Link><span className="text-muted-foreground">{ITEM_TIPO_LABELS[i.tipo]}</span></li>)}</ul>
          )}
        </Secao>
        {notas.length > 0 && <Secao titulo="Anotações da equipe"><ul className="space-y-2">{notas.map((n) => <li key={n.id}>{n.texto}</li>)}</ul></Secao>}
      </div>
    </div>
  )
}

export default function PessoaPage() {
  const { id } = useParams<{ id: string }>()
  const demo = useDemo()
  const [u, setU] = useState<Usuario | null | undefined>(undefined)
  const [inscricoes, setInscricoes] = useState<MinhaPresenca[]>([])
  useEffect(() => {
    listarUsuarios().then((l) => setU(l.find((x) => x.id === id) ?? null))
    listarInscricoesDe(id).then(setInscricoes)
  }, [id])

  if (u === undefined) return <Skeleton className="h-96 rounded-2xl" />
  if (u === null) return <EstadoVazio icon={SearchX} titulo="Pessoa não encontrada" acao={<Button asChild variant="outline"><Link href="/portal/usuarios">Voltar</Link></Button>} />

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={u.nome ?? "Sem nome"}
        descricao={`${ROLE_LABELS[u.role]} · na Casa desde ${paraData((u.created_at ?? "").slice(0, 10)).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`}
        migalhas={[{ label: "Gestão" }, { label: "Usuários", href: `/portal/usuarios?aba=${u.role}` }, { label: u.nome ?? "Pessoa" }]}
      />
      {u.role === "admin" ? <p className="text-muted-foreground">{u.email}</p>
        : !demo ? (
          <div className="space-y-6">
            <Secao titulo="Participação">
              {inscricoes.length === 0 ? <p className="text-muted-foreground">Nenhuma inscrição ainda.</p> : <ul className="divide-y">{inscricoes.map((i) => <li key={i.id} className="py-2.5">{i.item_nome}</li>)}</ul>}
            </Secao>
            <SoDemo perfil="admin" rota={`/portal/usuarios/${u.id}`}><span /></SoDemo>
          </div>
        ) : u.role === "cliente" ? <PaginaAssistido u={u} /> : <PaginaVoluntario u={u} />}
    </div>
  )
}
