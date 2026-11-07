"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Award, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Confirmar from "@/components/comum/confirmar"
import EstadoVazio from "@/components/comum/estado-vazio"
import { horasEmTexto, horasNasDatas } from "@/lib/certificados"
import { dataBR } from "@/lib/formatar"
import type { ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { cancelarCertificado, emitirCertificados, listarCertificados, type CertificadoEmitido } from "@/lib/services/certificados"
import { listarRegistros, listarTodosDependentes, notificar, type Dependente, type Registro } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS } from "@/lib/services/presencas"
import { listarUsuarios, type Usuario } from "@/lib/services/usuarios"

type Cobertura = "todas" | "periodo" | "escolhidas"
type Modo = "conjunto" | "cada"
const curta = (d: string) => dataBR(d).slice(0, 5)

function Passo({ n, titulo, dica, children }: { n: number; titulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="flex items-center gap-3 text-lg font-semibold"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground" aria-hidden>{n}</span>{titulo}</h3>
      {dica && <p className="ml-11 text-muted-foreground">{dica}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Opcao({ nome, valor, atual, onChange, titulo, texto }: { nome: string; valor: string; atual: string; onChange: (v: string) => void; titulo: string; texto: string }) {
  return (
    <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${atual === valor ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
      <input type="radio" name={nome} className="mt-1 h-4 w-4" checked={atual === valor} onChange={() => onChange(valor)} />
      <span><span className="block font-medium">{titulo}</span><span className="block text-sm text-muted-foreground">{texto}</span></span>
    </label>
  )
}

/** Gera certificados de uma atividade ou de um conjunto delas, por presença ou por conjunto de presenças. */
export default function CertificadosGestao({ itens, itemFixo, autor, hrefVer }: { itens: ItemView[]; itemFixo?: ItemView; autor: string; hrefVer: (id: string) => string }) {
  const [emitidos, setEmitidos] = useState<CertificadoEmitido[] | null>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [deps, setDeps] = useState<Dependente[]>([])
  const [gerando, setGerando] = useState(false)
  const [selItens, setSelItens] = useState<string[]>(itemFixo ? [itemFixo.id] : [])
  const [titulo, setTitulo] = useState("")
  const [cobertura, setCobertura] = useState<Cobertura>("todas")
  const [de, setDe] = useState("")
  const [ate, setAte] = useState("")
  const [datasSel, setDatasSel] = useState<string[]>([])
  const [modo, setModo] = useState<Modo>("conjunto")
  const [minimo, setMinimo] = useState(1)
  const [fora, setFora] = useState<string[]>([])
  const [comVoluntario, setComVoluntario] = useState(true)
  const [busca, setBusca] = useState("")
  const [cancelar, setCancelar] = useState<CertificadoEmitido | null>(null)

  useEffect(() => {
    listarCertificados().then(setEmitidos)
    listarRegistros().then(setRegistros)
    listarUsuarios().then(setUsuarios)
    listarTodosDependentes().then(setDeps)
  }, [])

  const possiveis = useMemo(() => itens.filter((i) => i.tem_certificado), [itens])
  const escolhidos = possiveis.filter((i) => selItens.includes(i.id))
  const idsItens = new Set(selItens)
  const dessesItens = useMemo(() => registros.filter((r) => selItens.includes(r.item_id)), [registros, selItens])
  const todasDatas = useMemo(() => [...new Set(dessesItens.filter((r) => r.status === "presente").map((r) => r.data))].sort().reverse(), [dessesItens])

  const dentro = (d: string) => (cobertura === "todas" ? true : cobertura === "periodo" ? (!de || d >= de) && (!ate || d <= ate) : datasSel.includes(d))
  const nomeDe = (id: string) => usuarios.find((u) => u.id === id)?.nome ?? deps.find((d) => d.id === id)?.nome ?? "Pessoa"

  // Quem tem presença dentro do que foi escolhido.
  const pessoas = useMemo(() => {
    const m = new Map<string, Registro[]>()
    for (const r of dessesItens) if (r.status === "presente" && dentro(r.data)) m.set(r.cliente_id, [...(m.get(r.cliente_id) ?? []), r])
    return [...m.entries()].map(([id, regs]) => {
      const horas = escolhidos.reduce((t, i) => t + horasNasDatas(i, regs.filter((r) => r.item_id === i.id).map((r) => r.data)), 0)
      return { id, nome: nomeDe(id), regs, horas }
    }).filter((p) => p.regs.length >= minimo).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dessesItens, cobertura, de, ate, datasSel, minimo, usuarios, deps, selItens])
  const marcadas = pessoas.filter((p) => !fora.includes(p.id))
  const qtdCertificados = modo === "conjunto" ? marcadas.length : marcadas.reduce((t, p) => t + p.regs.length, 0)
  const voluntarios = [...new Set(escolhidos.map((i) => i.responsavel_id).filter(Boolean))] as string[]
  const nomeCert = titulo.trim() || (escolhidos.length === 1 ? escolhidos[0].nome : "")

  function alternarItem(id: string) { setSelItens((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id])); setDatasSel([]) }

  async function gerar() {
    if (!escolhidos.length) return notify.error("Escolha ao menos uma atividade")
    if (escolhidos.length > 1 && !titulo.trim()) return notify.error("Dê um nome para o conjunto de atividades")
    if (!marcadas.length) return notify.error("Ninguém selecionado")
    const itensCert = escolhidos.map((i) => ({ tipo: i.tipo, id: i.id, nome: i.nome }))
    const dep = (id: string) => deps.find((d) => d.id === id)?.responsavel_id ?? null
    const lista: Omit<CertificadoEmitido, "id" | "created_at">[] = []
    const base = { titulo: nomeCert, emitido_por: autor }
    const horasDe = (item: ItemView | undefined, ds: string[]) => (item ? horasNasDatas(item, ds) : 0)
    for (const p of marcadas) {
      if (modo === "conjunto") {
        lista.push({ ...base, pessoa_id: p.id, pessoa_nome: p.nome, responsavel_id: dep(p.id), papel: "participante", itens: itensCert, datas: [...new Set(p.regs.map((r) => r.data))], horas: p.horas })
      } else {
        for (const r of p.regs) {
          const it = escolhidos.find((i) => i.id === r.item_id)
          lista.push({ ...base, titulo: it?.nome ?? nomeCert, pessoa_id: p.id, pessoa_nome: p.nome, responsavel_id: dep(p.id), papel: "participante", itens: it ? [{ tipo: it.tipo, id: it.id, nome: it.nome }] : itensCert, datas: [r.data], horas: horasDe(it, [r.data]) })
        }
      }
    }
    if (comVoluntario) {
      for (const v of voluntarios) {
        const meus = escolhidos.filter((i) => i.responsavel_id === v)
        const datas = [...new Set(dessesItens.filter((r) => meus.some((i) => i.id === r.item_id) && dentro(r.data)).map((r) => r.data))]
        if (!datas.length) continue
        const horas = meus.reduce((t, i) => t + horasNasDatas(i, [...new Set(dessesItens.filter((r) => r.item_id === i.id && dentro(r.data)).map((r) => r.data))]), 0)
        lista.push({ ...base, titulo: meus.length === 1 ? meus[0].nome : nomeCert, pessoa_id: v, pessoa_nome: nomeDe(v), responsavel_id: null, papel: "voluntario", itens: meus.map((i) => ({ tipo: i.tipo, id: i.id, nome: i.nome })), datas, horas })
      }
    }
    await emitirCertificados(lista)
    const avisados = new Set(lista.map((c) => c.responsavel_id ?? c.pessoa_id))
    await Promise.all([...avisados].map((id) => notificar(id, "Seu certificado está pronto", `Já dá para baixar o certificado de ${nomeCert}.`, "/painel/certificados")))
    setEmitidos(await listarCertificados())
    setGerando(false); setFora([])
    notify.success(`${lista.length} ${lista.length === 1 ? "certificado gerado" : "certificados gerados"}`)
  }

  const t = busca.trim().toLowerCase()
  const visiveis = (emitidos ?? [])
    .filter((c) => !itemFixo || c.itens.some((i) => i.id === itemFixo.id))
    .filter((c) => !t || `${c.pessoa_nome} ${c.titulo}`.toLowerCase().includes(t))

  if (itemFixo && !itemFixo.tem_certificado) return <EstadoVazio icon={Award} titulo="Esta atividade não emite certificado" texto="Para mudar, edite o cadastro e responda “Sim” em “Esta atividade emite certificado?”." />

  return (
    <div className="space-y-6">
      {!gerando && <Button onClick={() => setGerando(true)}><Plus className="h-4 w-4" aria-hidden /> Gerar certificados</Button>}

      {gerando && (
        <div className="space-y-4">
          <Passo n={1} titulo="De quais atividades?" dica="Escolha uma ou várias. Com várias, o certificado vale para o conjunto.">
            <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {possiveis.map((i) => (
                <li key={`${i.tipo}-${i.id}`}>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${idsItens.has(i.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                    <input type="checkbox" className="h-4 w-4" checked={idsItens.has(i.id)} onChange={() => alternarItem(i.id)} />
                    <span className="min-w-0"><span className="block truncate font-medium">{i.nome}</span><span className="block text-sm text-muted-foreground">{ITEM_TIPO_LABELS[i.tipo]}</span></span>
                  </label>
                </li>
              ))}
            </ul>
            {escolhidos.length > 1 && (
              <label className="mt-4 block max-w-lg font-medium">Nome do conjunto <span className="text-red-600" aria-hidden>*</span>
                <Input className="mt-1.5 font-normal" placeholder="Ex.: Trilha de Artes" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </label>
            )}
          </Passo>

          <Passo n={2} titulo="Quais presenças?" dica="O certificado cita só as presenças escolhidas aqui.">
            <div className="grid gap-2 md:grid-cols-3">
              <Opcao nome="cobertura" valor="todas" atual={cobertura} onChange={(v) => setCobertura(v as Cobertura)} titulo="Todas" texto="Tudo o que já foi registrado." />
              <Opcao nome="cobertura" valor="periodo" atual={cobertura} onChange={(v) => setCobertura(v as Cobertura)} titulo="Um período" texto="Por exemplo, um semestre." />
              <Opcao nome="cobertura" valor="escolhidas" atual={cobertura} onChange={(v) => setCobertura(v as Cobertura)} titulo="Dias escolhidos" texto="Marque cada dia." />
            </div>
            {cobertura === "periodo" && (
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="font-medium">De<Input type="date" className="mt-1 font-normal" value={de} onChange={(e) => setDe(e.target.value)} /></label>
                <label className="font-medium">Até<Input type="date" className="mt-1 font-normal" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
              </div>
            )}
            {cobertura === "escolhidas" && (
              todasDatas.length === 0 ? <p className="mt-3 text-muted-foreground">Escolha uma atividade com presença registrada.</p> : (
                <div className="mt-3 flex max-h-48 flex-wrap gap-1.5 overflow-y-auto" role="group" aria-label="Dias">
                  {todasDatas.map((d) => {
                    const on = datasSel.includes(d)
                    return <button key={d} type="button" aria-pressed={on} onClick={() => setDatasSel((l) => (on ? l.filter((x) => x !== d) : [...l, d]))} className={`rounded-lg border px-2.5 py-1 text-sm font-medium ${on ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{dataBR(d)}</button>
                  })}
                </div>
              )
            )}
            <h4 className="mb-2 mt-5 font-medium">Como gerar</h4>
            <div className="grid gap-2 md:grid-cols-2">
              <Opcao nome="modo" valor="conjunto" atual={modo} onChange={(v) => setModo(v as Modo)} titulo="Um certificado para o conjunto" texto="Reúne as presenças em um só documento, com o total de horas." />
              <Opcao nome="modo" valor="cada" atual={modo} onChange={(v) => setModo(v as Modo)} titulo="Um certificado por presença" texto="Cada encontro gera o seu. Bom para eventos." />
            </div>
          </Passo>

          <Passo n={3} titulo="Para quem?" dica="Aparece quem tem presença no que você escolheu.">
            <label className="mb-3 flex items-center gap-2">Com pelo menos
              <Input type="number" min={1} aria-label="Número mínimo de presenças" className="h-9 w-20" value={minimo} onChange={(e) => setMinimo(Math.max(1, Number(e.target.value) || 1))} /> presenças
            </label>
            {pessoas.length === 0 ? <p className="text-muted-foreground">Ninguém com essas presenças.</p> : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full">
                  <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
                    <tr>
                      <th scope="col" className="w-10 px-3 py-2"><span className="sr-only">Incluir</span></th>
                      <th scope="col" className="px-3 py-2 font-semibold">Pessoa</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Presenças</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Horas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pessoas.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2"><input type="checkbox" aria-label={`Incluir ${p.nome}`} className="h-4 w-4" checked={!fora.includes(p.id)} onChange={() => setFora((l) => (l.includes(p.id) ? l.filter((x) => x !== p.id) : [...l, p.id]))} /></td>
                        <td className="px-3 py-2 font-medium">{p.nome}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{p.regs.length}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{p.horas ? horasEmTexto(p.horas) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {voluntarios.length > 0 && <label className="mt-3 flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={comVoluntario} onChange={(e) => setComVoluntario(e.target.checked)} /> Gerar também para quem conduziu: {voluntarios.map(nomeDe).join(", ")}</label>}
          </Passo>

          <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-lg">
            <p aria-live="polite"><strong>{qtdCertificados}</strong> {qtdCertificados === 1 ? "certificado" : "certificados"} para <strong>{marcadas.length}</strong> {marcadas.length === 1 ? "pessoa" : "pessoas"}{nomeCert ? `: ${nomeCert}` : ""}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setGerando(false)}>Voltar</Button>
              <Button onClick={gerar} disabled={!qtdCertificados}><Award className="h-4 w-4" aria-hidden /> Gerar agora</Button>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Certificados gerados ({visiveis.length})</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input className="pl-10" placeholder="Buscar pessoa ou certificado" aria-label="Buscar certificado" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
        </div>
        {emitidos === null ? null : visiveis.length === 0 ? <EstadoVazio icon={Award} titulo="Nenhum certificado gerado" texto="Clique em “Gerar certificados” quando quiser." /> : (
          <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
            <table className="w-full">
              <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Pessoa</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Certificado</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Cobre</th>
                  <th scope="col" className="hidden px-3 py-3 font-semibold lg:table-cell">Gerado em</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visiveis.map((c) => {
                  const ds = [...c.datas].sort()
                  return (
                    <tr key={c.id}>
                      <td className="px-5 py-3"><span className="font-medium">{c.pessoa_nome}</span>{c.papel === "voluntario" && <span className="block text-sm text-muted-foreground">Voluntário</span>}</td>
                      <td className="px-3 py-3"><span className="font-medium">{c.titulo}</span>{c.itens.length > 1 && <span className="block text-sm text-muted-foreground">{c.itens.map((i) => i.nome).join(", ")}</span>}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm">{ds.length} {ds.length === 1 ? "presença" : "presenças"}{c.horas ? ` · ${horasEmTexto(c.horas)}` : ""}<span className="block text-muted-foreground">{ds.length === 1 ? dataBR(ds[0]) : `${curta(ds[0])} a ${dataBR(ds[ds.length - 1])}`}</span></td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-muted-foreground lg:table-cell">{dataBR(c.created_at.slice(0, 10))}<span className="block text-sm">por {c.emitido_por}</span></td>
                      <td className="px-5 py-2">
                        <div className="flex justify-end gap-1.5">
                          <Button asChild size="sm" variant="outline"><Link href={hrefVer(c.id)} aria-label={`Ver certificado de ${c.pessoa_nome}: ${c.titulo}`}>Ver</Link></Button>
                          <Button size="icon-sm" variant="ghost" className="text-red-700 dark:text-red-300" aria-label={`Cancelar certificado de ${c.pessoa_nome}`} onClick={() => setCancelar(c)}><Trash2 className="h-4 w-4" aria-hidden /></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Confirmar aberto={!!cancelar} onFechar={() => setCancelar(null)} titulo="Cancelar este certificado?" perigoso confirmarLabel="Cancelar certificado"
        descricao={<>O certificado de {cancelar?.pessoa_nome} deixa de valer, e o QR Code dele passa a avisar que não foi possível confirmar.</>}
        onConfirmar={async () => { if (cancelar) await cancelarCertificado(cancelar.id); setEmitidos(await listarCertificados()) }} />
    </div>
  )
}
