"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Accessibility, ChevronDown, GraduationCap, Home, Link2, Pencil, Phone, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import AssiduidadeDetalhe from "@/components/comum/assiduidade-detalhe"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import Confirmar from "@/components/comum/confirmar"
import EscolhaMultipla, { OPCOES_CONDICAO } from "@/components/comum/escolha-multipla"
import { calcularAssiduidade, idade } from "@/lib/assiduidade"
import { mascararTelefone } from "@/lib/formatar"
import { listarItensView, rotaAdmin, type ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { atualizarDependente, listarDependentes, registrosDaPessoa, removerDependente, salvarDependente, type Dependente, type Registro } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, contarInscritos, listarInscricoesDe, matricularCliente, removerPresenca, type ContagemItem, type MinhaPresenca } from "@/lib/services/presencas"

const PARENTESCO = ["Filho", "Filha", "Neto", "Neta", "Sobrinho", "Sobrinha", "Irmã", "Irmão", "Mãe", "Pai", "Avó", "Avô", "Cônjuge", "Outro"].map((x) => ({ valor: x, label: x }))
const VAZIO = { nome: "", parentesco: "", nascimento: "", telefone: "", escola: "", deficiencia: "", cuidados: "" }
type Dados = typeof VAZIO

function FormDependente({ inicial, titulo, rotulo, aoSalvar, aoCancelar }: { inicial: Dados; titulo: string; rotulo: string; aoSalvar: (d: Dados) => Promise<void>; aoCancelar?: () => void }) {
  const [v, setV] = useState(inicial)
  const [erro, setErro] = useState("")
  return (
    <form noValidate onSubmit={async (e) => {
      e.preventDefault()
      if (!v.nome.trim() || !v.parentesco) return setErro("Informe o nome e o parentesco")
      setErro("")
      await aoSalvar(v)
      setV(VAZIO)
    }}>
      <Secao titulo={titulo}>
        <Campo label="Nome" obrigatorio erro={erro}>{(p) => <Input {...p} value={v.nome} onChange={(e) => setV({ ...v, nome: e.target.value })} />}</Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Parentesco" obrigatorio>{(p) => <CampoSelect {...p} valor={v.parentesco} opcoes={PARENTESCO} onChange={(x) => setV({ ...v, parentesco: x })} />}</Campo>
          <Campo label="Nascimento">{(p) => <Input {...p} type="date" value={v.nascimento} onChange={(e) => setV({ ...v, nascimento: e.target.value })} />}</Campo>
          <Campo label="Telefone">{(p) => <Input {...p} type="tel" value={v.telefone} onChange={(e) => setV({ ...v, telefone: mascararTelefone(e.target.value) })} />}</Campo>
          <Campo label="Escola">{(p) => <Input {...p} value={v.escola} onChange={(e) => setV({ ...v, escola: e.target.value })} />}</Campo>
        </div>
        <EscolhaMultipla titulo="Deficiência ou condição" dica="Marque se houver." opcoes={OPCOES_CONDICAO} valor={v.deficiencia} onChange={(x) => setV({ ...v, deficiencia: x })} />
        <Campo label="Cuidados" dica="O que a equipe precisa saber: alergias, o que ajuda, o que evitar.">{(p) => <Textarea {...p} rows={2} value={v.cuidados} onChange={(e) => setV({ ...v, cuidados: e.target.value })} />}</Campo>
        <div className="flex gap-2">
          <Button type="submit">{!aoCancelar && <Plus className="h-4 w-4" aria-hidden />} {rotulo}</Button>
          {aoCancelar && <Button type="button" variant="outline" onClick={aoCancelar}>Voltar</Button>}
        </div>
      </Secao>
    </form>
  )
}

function CartaoDependente({ d, opcoes, contagem, admin, aoMudar }: { d: Dependente; opcoes: ItemView[]; contagem: Record<string, ContagemItem>; admin: boolean; aoMudar: () => Promise<void> }) {
  const [inscricoes, setInscricoes] = useState<MinhaPresenca[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [escolha, setEscolha] = useState("")
  const [editando, setEditando] = useState(false)
  const [historico, setHistorico] = useState(false)
  const [remover, setRemover] = useState(false)
  const [tirar, setTirar] = useState<MinhaPresenca | null>(null)

  const carregar = useCallback(async () => {
    const [i, r] = await Promise.all([listarInscricoesDe(d.id), registrosDaPessoa(d.id)])
    setInscricoes(i); setRegistros(r)
  }, [d.id])
  useEffect(() => { Promise.all([listarInscricoesDe(d.id), registrosDaPessoa(d.id)]).then(([i, r]) => { setInscricoes(i); setRegistros(r) }) }, [d.id])

  const anos = idade(d.nascimento)
  const disponiveis = opcoes.filter((o) => !inscricoes.some((i) => i.item_id === o.id))
  const lotado = (o: ItemView) => !!o.vagas && (contagem[`${o.tipo}-${o.id}`]?.total ?? 0) >= o.vagas
  const nomeItem = (id: string) => inscricoes.find((i) => i.item_id === id)?.item_nome ?? "Atividade"
  const ass = calcularAssiduidade(registros)

  async function inscrever() {
    const o = opcoes.find((x) => `${x.tipo}|${x.id}` === escolha)
    if (!o) return
    if (lotado(o)) return notify.error("Esta turma está sem vagas")
    await matricularCliente(o.tipo, o.id, o.nome, d.id)
    setEscolha("")
    await carregar(); await aoMudar()
    notify.success(`${d.nome.split(" ")[0]} foi inscrito em ${o.nome}`.replace("inscrito", d.parentesco.endsWith("a") ? "inscrita" : "inscrito"))
  }

  if (editando) {
    return (
      <FormDependente titulo={`Editar ${d.nome}`} rotulo="Salvar" aoCancelar={() => setEditando(false)}
        inicial={{ nome: d.nome, parentesco: d.parentesco, nascimento: d.nascimento ?? "", telefone: d.telefone ?? "", escola: d.escola ?? "", deficiencia: d.deficiencia ?? "", cuidados: d.cuidados ?? "" }}
        aoSalvar={async (v) => { await atualizarDependente(d.id, v); setEditando(false); await aoMudar(); notify.success("Dados atualizados") }} />
    )
  }

  return (
    <li className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold">{d.nome}</p>
          <p className="text-muted-foreground">{d.parentesco}{anos !== null ? `, ${anos} anos` : ""}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {d.mora_junto && <span className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5" aria-hidden /> Mora junto</span>}
            {d.telefone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" aria-hidden /> {d.telefone}</span>}
            {d.escola && <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" aria-hidden /> {d.escola}</span>}
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" aria-label={`Editar ${d.nome}`} onClick={() => setEditando(true)}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon-sm" variant="ghost" className="text-red-700 dark:text-red-300" aria-label={`Remover ${d.nome}`} onClick={() => setRemover(true)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      {(d.deficiencia || d.cuidados) && (
        <div className="rounded-xl bg-muted p-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold"><Accessibility className="h-4 w-4" aria-hidden /> Cuidados</p>
          {d.deficiencia && <p className="font-medium">{d.deficiencia}</p>}
          {d.cuidados && <p>{d.cuidados}</p>}
        </div>
      )}

      {d.parente_id ? (
        admin
          ? <Link href={`/portal/assistidos/${d.parente_id}`} className="flex items-center gap-1.5 font-medium text-primary hover:underline"><Link2 className="h-4 w-4" aria-hidden /> Também é assistido: abrir ficha</Link>
          : <p className="text-sm text-muted-foreground">Tem conta própria e cuida das próprias inscrições.</p>
      ) : (
        <section className="space-y-3 border-t pt-4">
          <h3 className="font-semibold">Atividades de {d.nome.split(" ")[0]}</h3>
          {inscricoes.length === 0 ? <p className="text-muted-foreground">Ainda não participa de nenhuma atividade.</p> : (
            <ul className="divide-y">
              {inscricoes.map((i) => {
                const x = calcularAssiduidade(registros.filter((r) => r.item_id === i.item_id))
                return (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <Link href={admin ? rotaAdmin(i.item_tipo, i.item_id) : `/painel/item/${i.item_tipo}/${i.item_id}`} className="font-medium hover:underline">{i.item_nome}</Link>
                      <p className="text-sm text-muted-foreground">{ITEM_TIPO_LABELS[i.item_tipo]}{x.total ? ` · veio a ${x.presentes} de ${x.total} encontros` : ""}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setTirar(i)} aria-label={`Tirar ${d.nome} de ${i.item_nome}`}>Tirar</Button>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Campo label={`Inscrever ${d.nome.split(" ")[0]} em`}>{(p) => (
                <CampoSelect {...p} valor={escolha} onChange={setEscolha} opcoes={disponiveis.map((o) => ({ valor: `${o.tipo}|${o.id}`, label: `${o.nome}${lotado(o) ? " (sem vagas)" : ""}` }))} />
              )}</Campo>
            </div>
            <Button type="button" variant="outline" disabled={!escolha} onClick={inscrever}><Plus className="h-4 w-4" aria-hidden /> Inscrever</Button>
          </div>
          {ass.total > 0 && (
            <div>
              <Button type="button" size="sm" variant="ghost" aria-expanded={historico} onClick={() => setHistorico(!historico)}><ChevronDown className={`h-4 w-4 transition-transform ${historico ? "rotate-180" : ""}`} aria-hidden /> Assiduidade de {d.nome.split(" ")[0]} ({ass.taxa}%)</Button>
              {historico && <div className="mt-3"><AssiduidadeDetalhe registros={registros} nomeItem={nomeItem} /></div>}
            </div>
          )}
        </section>
      )}

      <Confirmar aberto={remover} onFechar={() => setRemover(false)} titulo="Remover dependente?" perigoso confirmarLabel="Remover"
        descricao={<>{d.nome} sairá da lista e das atividades em que está inscrito.</>}
        onConfirmar={async () => { await Promise.all(inscricoes.map((i) => removerPresenca(i.id))); await removerDependente(d.id); await aoMudar() }} />
      <Confirmar aberto={!!tirar} onFechar={() => setTirar(null)} titulo="Tirar da atividade?" perigoso confirmarLabel="Tirar"
        descricao={<>{d.nome} deixará de constar em {tirar?.item_nome}. A vaga fica livre.</>}
        onConfirmar={async () => { if (tirar) await removerPresenca(tirar.id); await carregar(); await aoMudar() }} />
    </li>
  )
}

/** Quem depende da pessoa: dados, cuidados, inscrições nas atividades e frequência de cada um. */
export default function Dependentes({ responsavelId, admin }: { responsavelId: string; admin: boolean }) {
  const [lista, setLista] = useState<Dependente[] | null>(null)
  const [opcoes, setOpcoes] = useState<ItemView[]>([])
  const [contagem, setContagem] = useState<Record<string, ContagemItem>>({})

  const carregar = useCallback(async () => {
    const [d, c] = await Promise.all([listarDependentes(responsavelId), contarInscritos()])
    setLista(d); setContagem(c)
  }, [responsavelId])
  useEffect(() => {
    Promise.all([listarDependentes(responsavelId), contarInscritos()]).then(([d, c]) => { setLista(d); setContagem(c) })
    listarItensView().then((l) => setOpcoes(l.filter((i) => i.tipo !== "centro")))
  }, [responsavelId])

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_24rem]">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{admin ? "Dependentes e família" : "Meus dependentes"}</h2>
        {lista === null ? null : lista.length === 0 ? <p className="text-muted-foreground">Ninguém cadastrado ainda.</p> : (
          <ul className="space-y-4">{lista.map((d) => <CartaoDependente key={d.id} d={d} opcoes={opcoes} contagem={contagem} admin={admin} aoMudar={carregar} />)}</ul>
        )}
      </section>
      <FormDependente titulo="Adicionar dependente" rotulo="Adicionar" inicial={VAZIO}
        aoSalvar={async (v) => { await salvarDependente({ ...v, responsavel_id: responsavelId, atividade: "", mora_junto: true, parente_id: null }); await carregar(); notify.success("Dependente adicionado") }} />
    </div>
  )
}
