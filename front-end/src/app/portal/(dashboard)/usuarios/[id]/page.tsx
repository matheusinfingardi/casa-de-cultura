"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Accessibility, AlertTriangle, ClipboardList, Eye, EyeOff, HeartPulse, SearchX, UsersRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { Campo, Secao } from "@/components/comum/campo"
import AssiduidadeDetalhe from "@/components/comum/assiduidade-detalhe"
import Dependentes from "@/components/comum/dependentes"
import EscolhaMultipla, { OPCOES_ACESSIBILIDADE, OPCOES_CONDICAO } from "@/components/comum/escolha-multipla"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import AcompanhamentoPessoa from "@/components/portal/usuarios/acompanhamento-pessoa"
import ParticipacaoDetalhe from "@/components/portal/usuarios/participacao-detalhe"
import RelatorioIndividual from "@/components/portal/usuarios/relatorio-individual"
import { cuidadosDaFamilia, resumoFamilia, soDependentes } from "@/lib/familia"
import { useDemo } from "@/hooks/use-demo"
import { calcularAssiduidade, idade, situacao } from "@/lib/assiduidade"
import { DIAS_SEMANA, dataBR, iniciais, mascararTelefone, paraData } from "@/lib/formatar"
import { combinaComHorarios, listarItensView, rotaAdmin, type ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import {
  buscarDisponibilidade, buscarFicha, listarAcompanhamento, listarDependentes, listarRegistros, registrosDaPessoa, salvarFicha,
  type Dependente, type Disponibilidade, type Ficha, type NotaAcompanhamento, type Registro,
} from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, contarInscritos, listarInscricoesDe, type ContagemItem, type MinhaPresenca } from "@/lib/services/presencas"
import { ROLE_LABELS, listarUsuarios, type Usuario } from "@/lib/services/usuarios"

type Aba = "resumo" | "cuidados" | "familia" | "participacao" | "assiduidade" | "acompanhamento" | "relatorio"
const ABAS: [Aba, string][] = [["resumo", "Resumo"], ["cuidados", "Necessidades e condições"], ["familia", "Dependentes"], ["participacao", "Participação"], ["assiduidade", "Assiduidade"], ["acompanhamento", "Acompanhamento"], ["relatorio", "Relatório"]]
const BENEFICIOS = ["Bolsa Família", "BPC", "CadÚnico", "Tarifa social", "Outro"]

function Dado({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return <div><dt className="text-sm text-muted-foreground">{rotulo}</dt><dd className="font-medium">{valor || "Não informado"}</dd></div>
}

function PaginaAssistido({ u }: { u: Usuario }) {
  const { user } = useAuth()
  const params = useSearchParams()
  const [aba, setAba] = useState<Aba>(ABAS.find(([v]) => v === params.get("aba"))?.[0] ?? "resumo")
  const [itens, setItens] = useState<ItemView[]>([])
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [familia, setFamilia] = useState<Dependente[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [inscricoes, setInscricoes] = useState<MinhaPresenca[]>([])
  const [notas, setNotas] = useState<NotaAcompanhamento[]>([])
  const [revelar, setRevelar] = useState(false)

  const recarregarInscricoes = async () => setInscricoes(await listarInscricoesDe(u.id))
  // A aba de dependentes pode mudar a família; ao voltar, os totais do topo ficam certos.
  const trocarAba = (v: Aba) => { setAba(v); listarDependentes(u.id).then(setFamilia) }

  useEffect(() => {
    buscarFicha(u.id).then(setFicha)
    listarDependentes(u.id).then(setFamilia)
    registrosDaPessoa(u.id).then(setRegistros)
    listarInscricoesDe(u.id).then(setInscricoes)
    listarAcompanhamento(u.id).then(setNotas)
    listarItensView().then(setItens)
  }, [u.id])

  if (!ficha) return <Skeleton className="h-96 rounded-2xl" />

  const ass = calcularAssiduidade(registros)
  const st = situacao(ass)
  const anos = idade(ficha.nascimento)
  const set = <K extends keyof Ficha>(k: K, v: Ficha[K]) => setFicha({ ...ficha, [k]: v })
  const oculto = (t: string) => (revelar ? t : t ? "••••••••" : "")
  const nomeItem = (id: string) => inscricoes.find((i) => i.item_id === id)?.item_nome ?? itens.find((i) => i.id === id)?.nome ?? "Atividade"
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
            {resumoFamilia(familia) && <Badge variant="secondary"><UsersRound className="h-3.5 w-3.5" aria-hidden /> Dependentes: {resumoFamilia(familia)}</Badge>}
            {ficha.saude && <Badge variant="outline"><HeartPulse className="h-3.5 w-3.5" aria-hidden /> Atenção à saúde</Badge>}
            {ficha.beneficios?.map((b) => <Badge key={b} variant="outline">{b}</Badge>)}
          </div>
          {ficha.necessidades && <p className="text-muted-foreground">{ficha.necessidades}</p>}
        </div>
        <ul className="grid shrink-0 grid-cols-3 gap-5 border-t pt-4 text-center md:border-l md:border-t-0 md:pl-6 md:pt-0">
          {([[ass.taxa === null ? "—" : `${ass.taxa}%`, "presença", "assiduidade"], [inscricoes.length, inscricoes.length === 1 ? "inscrição" : "inscrições", "participacao"], [soDependentes(familia).length, soDependentes(familia).length === 1 ? "dependente" : "dependentes", "familia"]] as const).map(([v, r, destino]) => (
            <li key={destino}>
              <button type="button" onClick={() => trocarAba(destino)} className="group rounded-lg px-1 hover:bg-muted" aria-label={`Ver ${r}: ${v}`}>
                <span className="block text-3xl font-bold">{v}</span><span className="block text-sm text-muted-foreground group-hover:underline">{r}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {ass.faltasSeguidas >= 3 && (
        <p role="status" className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-100 p-4 text-amber-950 dark:bg-amber-900 dark:text-amber-50">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <span className="flex-1">Faltou {ass.faltasSeguidas} vezes seguidas{ass.ultimaPresenca ? `. Última presença em ${dataBR(ass.ultimaPresenca)}` : ""}. Que tal entrar em contato?</span>
          <Button size="sm" variant="outline" className="bg-white text-amber-950" onClick={() => setAba("acompanhamento")}>Registrar contato</Button>
        </p>
      )}

      <div className="nao-imprimir flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="Informações da pessoa">
        {ABAS.map(([v, r]) => (
          <button key={v} type="button" role="tab" aria-selected={aba === v} onClick={() => trocarAba(v)} className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 font-medium ${aba === v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{r}</button>
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
          <Secao titulo="Assiduidade" descricao="Últimas 8 semanas. Clique em uma barra para ver cada dia.">
            <AssiduidadeDetalhe compacto registros={registros} nomeItem={nomeItem} aoVerTudo={() => setAba("assiduidade")} />
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
          <Secao titulo="Dependentes">
            {familia.length === 0 ? <p className="text-muted-foreground">Nenhum dependente cadastrado.</p> : (
              <ul className="divide-y">{familia.map((f) => <li key={f.id} className="py-2"><p className="flex justify-between gap-2"><span className="font-medium">{f.nome}</span><span className="text-muted-foreground">{f.parentesco}</span></p>{(f.deficiencia || f.cuidados) && <p className="text-sm">{[f.deficiencia, f.cuidados].filter(Boolean).join(". ")}</p>}</li>)}</ul>
            )}
            <Button size="sm" variant="outline" onClick={() => setAba("familia")}>Gerenciar dependentes</Button>
          </Secao>
        </div>
      )}

      {aba === "cuidados" && (
        <form className="space-y-6" onSubmit={async (e) => { e.preventDefault(); await salvar() }}>
          <p className="rounded-xl bg-muted p-4">Estas informações são sensíveis e existem para cuidar melhor da pessoa. Registre só o necessário, com o consentimento dela ou do responsável.</p>
          {cuidadosDaFamilia(familia).length > 0 && (
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">Cuidados dos dependentes</h2>
              <ul className="space-y-1">{cuidadosDaFamilia(familia).map((c) => <li key={c.nome}><span className="font-medium">{c.nome}</span> ({c.parentesco}): {c.texto}</li>)}</ul>
              <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => setAba("familia")}>Ver dependentes</Button>
            </section>
          )}
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2"><Secao titulo="Necessidades e acessibilidade" descricao="Marque o que se aplica. Isso ajuda a equipe a preparar o lugar e o acolhimento.">
              <div className="grid gap-6 lg:grid-cols-2">
                <EscolhaMultipla titulo="Deficiência ou condição" opcoes={OPCOES_CONDICAO} valor={ficha.deficiencia} onChange={(x) => set("deficiencia", x)} rotuloOutro="Outra condição" />
                <EscolhaMultipla titulo="O que precisa no local" opcoes={OPCOES_ACESSIBILIDADE} valor={ficha.acessibilidade} onChange={(x) => set("acessibilidade", x)} rotuloOutro="Outra necessidade" />
                <Campo label="O que ajuda essa pessoa" dica="Como acolher bem, o que funciona.">{(p) => <Textarea {...p} rows={3} value={ficha.necessidades} onChange={(e) => set("necessidades", e.target.value)} />}</Campo>
                <Campo label="O que é bom evitar" dica="Situações que atrapalham ou incomodam.">{(p) => <Textarea {...p} rows={3} value={ficha.evitar ?? ""} onChange={(e) => set("evitar", e.target.value)} />}</Campo>
                <Campo label="Responsável legal" dica="Para menores de idade ou pessoas sob curatela.">{(p) => <Input {...p} value={ficha.responsavel_legal} onChange={(e) => set("responsavel_legal", e.target.value)} />}</Campo>
              </div>
            </Secao></div>
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

      {aba === "familia" && <Dependentes responsavelId={u.id} admin />}

      {aba === "participacao" && <ParticipacaoDetalhe pessoaId={u.id} inscricoes={inscricoes} registros={registros} itens={itens} familia={familia} aoMudar={recarregarInscricoes} />}

      {aba === "assiduidade" && (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><ClipboardList className="h-5 w-5 text-primary" aria-hidden /> Assiduidade de {u.nome?.split(" ")[0]}</h2>
          <AssiduidadeDetalhe registros={registros} nomeItem={nomeItem} />
        </section>
      )}

      {aba === "relatorio" && <RelatorioIndividual u={u} ficha={ficha} familia={familia} registros={registros} inscricoes={inscricoes} notas={notas} />}

      {aba === "acompanhamento" && <AcompanhamentoPessoa pessoaId={u.id} autor={(user?.user_metadata?.nome as string) ?? "Equipe"} notas={notas} setNotas={setNotas} />}
    </div>
  )
}

function PaginaVoluntario({ u }: { u: Usuario }) {
  const [d, setD] = useState<Disponibilidade | null>(null)
  const [itens, setItens] = useState<ItemView[]>([])
  const [notas, setNotas] = useState<NotaAcompanhamento[]>([])
  const [contagem, setContagem] = useState<Record<string, ContagemItem>>({})
  const [registros, setRegistros] = useState<Registro[]>([])

  useEffect(() => {
    contarInscritos().then(setContagem)
    listarRegistros().then(setRegistros)
    buscarDisponibilidade(u.id).then(setD)
    listarAcompanhamento(u.id).then(setNotas)
    listarItensView().then(setItens)
  }, [u.id])

  if (!d) return <Skeleton className="h-96 rounded-2xl" />
  const meus = itens.filter((i) => i.responsavel_id === u.id)
  const interesses = itens.filter((i) => d.interesses.includes(i.id))
  const dias = DIAS_SEMANA.filter((x) => d.horarios[x]?.length)

  const inscritos = meus.reduce((t, i) => t + (contagem[`${i.tipo}-${i.id}`]?.total ?? 0), 0)
  const encontros = new Set(registros.filter((r) => meus.some((i) => i.id === r.item_id)).map((r) => `${r.item_id}|${r.data}`)).size

  return (
    <div className="space-y-6">
    <section className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center">
      <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary" aria-hidden>{iniciais(u.nome)}</span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-lg">{d.profissao || "Voluntário"}{d.cidade ? ` · ${d.cidade}` : ""}{d.frequencia ? ` · ${d.frequencia}` : ""}</p>
        <div className="flex flex-wrap gap-2">{d.areas.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}</div>
        {d.experiencia && <p className="text-muted-foreground">{d.experiencia}</p>}
      </div>
      <dl className="grid shrink-0 grid-cols-3 gap-5 border-t pt-4 text-center md:border-l md:border-t-0 md:pl-6 md:pt-0">
        {[[meus.length, meus.length === 1 ? "atividade" : "atividades"], [inscritos, inscritos === 1 ? "inscrito" : "inscritos"], [encontros, encontros === 1 ? "encontro feito" : "encontros feitos"]].map(([v, r]) => (
          <div key={r}><dd className="text-3xl font-bold">{v}</dd><dt className="text-sm text-muted-foreground">{r}</dt></div>
        ))}
      </dl>
    </section>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Secao titulo="Quando pode ajudar">
          {dias.length === 0 ? <p className="text-muted-foreground">Não informado.</p> : (
            <ul className="divide-y">
              {dias.map((x) => <li key={x} className="flex justify-between gap-3 py-2"><span className="font-medium">{x}</span><span>{d.horarios[x].map((f) => `${f.inicio} às ${f.fim}`).join(" · ")}</span></li>)}
            </ul>
          )}
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dado rotulo="Frequência" valor={d.frequencia} />
            <Dado rotulo="Tem como se deslocar" valor={d.tem_transporte ? "Sim" : "Não informado"} />
          </dl>
          {d.observacoes && <p className="text-muted-foreground">{d.observacoes}</p>}
        </Secao>
        <Secao titulo="Quer contribuir com">
          {interesses.length === 0 ? <p className="text-muted-foreground">Nada escolhido ainda.</p> : (
            <ul className="divide-y">
              {interesses.map((i) => {
                const c = combinaComHorarios(i, d.horarios)
                return (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0"><Link href={rotaAdmin(i.tipo, i.id)} className="font-medium hover:underline">{i.nome}</Link><p className="text-sm text-muted-foreground">{i.quando || ITEM_TIPO_LABELS[i.tipo]}</p></div>
                    {c === true && <Badge variant="secondary">Combina com os horários</Badge>}
                    {c === false && <Badge variant="outline">Fora dos horários</Badge>}
                  </li>
                )
              })}
            </ul>
          )}
        </Secao>
        <Secao titulo={`Responsável por (${meus.length})`}>
          {meus.length === 0 ? <p className="text-muted-foreground">Nenhum compromisso atribuído.</p> : (
            <ul className="divide-y">{meus.map((i) => <li key={`${i.tipo}-${i.id}`} className="flex flex-wrap justify-between gap-2 py-2.5"><Link href={rotaAdmin(i.tipo, i.id)} className="font-medium hover:underline">{i.nome}</Link><span className="text-muted-foreground">{ITEM_TIPO_LABELS[i.tipo]} · {contagem[`${i.tipo}-${i.id}`]?.total ?? 0} inscritos</span></li>)}</ul>
          )}
        </Secao>
      </div>
      <div className="space-y-6">
        <Secao titulo="Como pode ajudar">
          <div className="flex flex-wrap gap-2">{d.areas.length ? d.areas.map((a) => <Badge key={a} variant="secondary">{a}</Badge>) : <p className="text-muted-foreground">Áreas não informadas.</p>}</div>
          {d.tarefas.length > 0 && <ul className="list-disc space-y-1 pl-5">{d.tarefas.map((t) => <li key={t}>{t}</li>)}</ul>}
          {d.outras_ideias && <p><span className="font-medium">Outras ideias: </span>{d.outras_ideias}</p>}
          {d.experiencia && <p className="text-muted-foreground">{d.experiencia}</p>}
        </Secao>
        <Secao titulo="Dados profissionais">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dado rotulo="Profissão" valor={d.profissao} /><Dado rotulo="Onde trabalha" valor={d.local_trabalho} />
            <Dado rotulo="Formação" valor={d.formacao} /><Dado rotulo="Escolaridade" valor={d.escolaridade} />
            <Dado rotulo="Registro profissional" valor={d.registro_profissional} /><Dado rotulo="Idiomas" valor={d.idiomas} />
          </dl>
          {d.habilidades && <p><span className="font-medium">Habilidades: </span>{d.habilidades}</p>}
        </Secao>
        <Secao titulo="Dados pessoais">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dado rotulo="E-mail" valor={u.email} /><Dado rotulo="Telefone" valor={d.telefone} />
            <Dado rotulo="Bairro" valor={d.bairro} /><Dado rotulo="Cidade" valor={d.cidade} />
            <Dado rotulo="Contato de emergência" valor={d.contato_emergencia} /><Dado rotulo="Autoriza uso de imagem" valor={d.autoriza_imagem ? "Sim" : "Não"} />
          </dl>
        </Secao>
        {notas.length > 0 && <Secao titulo="Anotações da equipe"><ul className="space-y-2">{notas.map((n) => <li key={n.id}>{n.texto}</li>)}</ul></Secao>}
      </div>
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
        migalhas={u.role === "cliente" ? [{ label: "Gestão" }, { label: "Assistidos", href: "/portal/assistidos" }, { label: u.nome ?? "Pessoa" }]
          : u.role === "responsavel" ? [{ label: "Gestão" }, { label: "Voluntários", href: "/portal/voluntarios" }, { label: u.nome ?? "Pessoa" }]
          : [{ label: "Suporte" }, { label: "Usuários", href: "/portal/usuarios" }, { label: u.nome ?? "Pessoa" }]}
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
