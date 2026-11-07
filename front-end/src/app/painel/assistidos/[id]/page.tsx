"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertTriangle, CheckCircle2, Phone, SearchX, ShieldCheck, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { Campo, Secao } from "@/components/comum/campo"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { listarAssistidosDoVoluntario, type AssistidoRelacionado } from "@/lib/assistidos-do-voluntario"
import { calcularAssiduidade, idade, situacao } from "@/lib/assiduidade"
import { dataBR, iniciais } from "@/lib/formatar"
import { notify } from "@/lib/notify"
import { resumoFamilia } from "@/lib/familia"
import { buscarFicha, listarAcompanhamento, listarDependentes, salvarNota, type Dependente, type Ficha, type NotaAcompanhamento } from "@/lib/services/extras"

function Dado({ rotulo, valor }: { rotulo: string; valor?: string }) {
  if (!valor) return null
  return <div><dt className="text-sm text-muted-foreground">{rotulo}</dt><dd className="font-medium">{valor}</dd></div>
}

function Pagina({ id }: { id: string }) {
  const { user } = useAuth()
  const [a, setA] = useState<AssistidoRelacionado | null | undefined>(undefined)
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [notas, setNotas] = useState<NotaAcompanhamento[]>([])
  const [familia, setFamilia] = useState<Dependente[]>([])
  const [texto, setTexto] = useState("")
  const autor = (user?.user_metadata?.nome as string | undefined) ?? "Voluntário"

  useEffect(() => {
    if (!user) return
    // Só carrega a ficha se a pessoa tiver relação com este voluntário.
    listarAssistidosDoVoluntario(user.id).then((l) => {
      const r = l.find((x) => x.pessoa.id === id) ?? null
      setA(r)
      if (!r) return
      buscarFicha(id).then(setFicha)
      listarDependentes(id).then(setFamilia)
      listarAcompanhamento(id).then((n) => setNotas(n.filter((x) => x.autor === autor)))
    })
  }, [id, user, autor])

  if (a === undefined) return <Skeleton className="h-96 rounded-2xl" />
  if (a === null) return <EstadoVazio icon={SearchX} titulo="Assistido não encontrado" texto="Você vê aqui apenas pessoas inscritas nas suas atividades." acao={<Button asChild variant="outline"><Link href="/painel/assistidos">Voltar</Link></Button>} />

  const ass = calcularAssiduidade(a.registros)
  const st = situacao(ass)
  const anos = idade(ficha?.nascimento)
  const recentes = [...a.registros].sort((x, y) => y.data.localeCompare(x.data)).slice(0, 8)
  const temCuidados = ficha && (ficha.deficiencia || ficha.necessidades || ficha.acessibilidade || ficha.alergias)

  return (
    <div className="space-y-6">
      <PageHeader titulo={a.pessoa.nome ?? "Assistido"} descricao={anos !== null ? `${anos} anos` : undefined} migalhas={[{ label: "Meus assistidos", href: "/painel/assistidos" }, { label: a.pessoa.nome ?? "Pessoa" }]} />

      <section className="flex flex-wrap items-center gap-5 rounded-2xl border bg-card p-5 shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary" aria-hidden>{iniciais(a.pessoa.nome)}</span>
        <div className="min-w-0 flex-1">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${st.classe}`}>{st.rotulo}</span>
          <p className="mt-2 text-muted-foreground">Nas suas atividades: veio a <strong className="text-foreground">{ass.presentes} de {ass.total}</strong> encontros{ass.ultimaPresenca ? `. Última presença em ${dataBR(ass.ultimaPresenca)}.` : "."}</p>
        </div>
        <p className="text-4xl font-bold">{ass.taxa === null ? "—" : `${ass.taxa}%`}</p>
      </section>

      {ass.faltasSeguidas >= 3 && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-amber-100 p-4 text-amber-950 dark:bg-amber-900 dark:text-amber-50">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden /> Faltou {ass.faltasSeguidas} vezes seguidas. Vale conversar com a pessoa ou avisar a coordenação.
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">O que ajuda a acolher</h2>
            {temCuidados ? (
              <dl className="space-y-3">
                <Dado rotulo="Deficiência ou condição" valor={ficha?.deficiencia} />
                <Dado rotulo="O que ajuda" valor={ficha?.necessidades} />
                <Dado rotulo="Acessibilidade" valor={ficha?.acessibilidade} />
                <Dado rotulo="Alergias" valor={ficha?.alergias} />
              </dl>
            ) : <p className="text-muted-foreground">Nenhum cuidado especial anotado.</p>}
            <p className="flex gap-2 rounded-xl bg-muted p-3 text-sm"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Você vê só o necessário para acolher bem. Trate com discrição e não compartilhe.</p>
          </section>

          {familia.length > 0 && (
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Dependentes</h2>
              <p className="mb-2 text-muted-foreground">{resumoFamilia(familia)}</p>
              <ul className="divide-y">
                {familia.filter((d) => d.deficiencia || d.cuidados).map((d) => <li key={d.id} className="py-2.5"><p className="font-medium">{d.nome} <span className="font-normal text-muted-foreground">· {d.parentesco}</span></p><p>{[d.deficiencia, d.cuidados].filter(Boolean).join(". ")}</p></li>)}
              </ul>
            </section>
          )}

          {ficha?.contato_emergencia && (
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">Em caso de emergência</h2>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />{ficha.contato_emergencia}</p>
            </section>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault()
            if (!texto.trim()) return notify.error("Escreva sua observação")
            await salvarNota({ pessoa_id: id, autor, tipo: "Observação", texto, proximo_passo: "" })
            setTexto("")
            setNotas((await listarAcompanhamento(id)).filter((x) => x.autor === autor))
            notify.success("Observação enviada à coordenação")
          }}>
            <Secao titulo="Observações" descricao="A coordenação vê o que você escrever aqui.">
              <Campo label="O que você observou">{(p) => <Textarea {...p} rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} />}</Campo>
              <Button type="submit">Salvar observação</Button>
              {notas.length > 0 && (
                <ul className="divide-y border-t">
                  {notas.map((n) => <li key={n.id} className="py-2.5"><p>{n.texto}</p><p className="text-sm text-muted-foreground">{dataBR(n.created_at.slice(0, 10))}</p></li>)}
                </ul>
              )}
            </Secao>
          </form>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Nas suas atividades</h2>
            <ul className="divide-y">
              {a.itens.map((i) => {
                const x = calcularAssiduidade(a.registros.filter((r) => r.item_id === i.id))
                return (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <Link href={`/painel/atividades/${i.tipo}/${i.id}`} className="font-medium hover:underline">{i.nome}</Link>
                    <span className="text-muted-foreground">{x.total ? `${x.presentes} de ${x.total}` : "Sem registros"}</span>
                  </li>
                )
              })}
            </ul>
          </section>
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Últimos encontros</h2>
            {recentes.length === 0 ? <p className="text-muted-foreground">Ainda sem registros.</p> : (
              <ul className="divide-y">
                {recentes.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span>{a.itens.find((i) => i.id === r.item_id)?.nome}</span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {r.status === "presente" ? <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" aria-hidden /> : <XCircle className="h-4 w-4 text-rose-700 dark:text-rose-300" aria-hidden />}
                      {dataBR(r.data)} · {r.status === "presente" ? "Presente" : "Faltou"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default function AssistidoDoVoluntarioPage() {
  const { id } = useParams<{ id: string }>()
  return <SoDemo><Pagina id={id} /></SoDemo>
}
