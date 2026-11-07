"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Eye, EyeOff, SearchX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Campo, Secao } from "@/components/comum/campo"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import { useDemo } from "@/hooks/use-demo"
import { dataBR, iniciais, mascararTelefone } from "@/lib/formatar"
import { rotaAdmin } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { buscarDisponibilidade, buscarFicha, listarDependentes, salvarFicha, type Dependente, type Disponibilidade, type Ficha } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, PRESENCA_LABELS, listarInscricoesDe, type MinhaPresenca } from "@/lib/services/presencas"
import { ROLE_LABELS, listarUsuarios, type Usuario } from "@/lib/services/usuarios"

/** Esconde o miolo de um dado sensível até a pessoa pedir para ver. */
const mascarar = (t: string) => (t.length > 6 ? `${t.slice(0, 4)}${"•".repeat(Math.min(8, t.length - 6))}${t.slice(-2)}` : "•••")

export default function FichaUsuarioPage() {
  const { id } = useParams<{ id: string }>()
  const demo = useDemo()
  const [u, setU] = useState<Usuario | null | undefined>(undefined)
  const [inscricoes, setInscricoes] = useState<MinhaPresenca[]>([])
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [familia, setFamilia] = useState<Dependente[]>([])
  const [disp, setDisp] = useState<Disponibilidade | null>(null)
  const [revelar, setRevelar] = useState(false)

  useEffect(() => {
    listarUsuarios().then((l) => setU(l.find((x) => x.id === id) ?? null))
    listarInscricoesDe(id).then(setInscricoes)
  }, [id])
  useEffect(() => {
    if (!demo) return
    buscarFicha(id).then(setFicha)
    listarDependentes(id).then(setFamilia)
    buscarDisponibilidade(id).then(setDisp)
  }, [demo, id])

  if (u === undefined) return <Skeleton className="h-96 rounded-2xl" />
  if (u === null) return <EstadoVazio icon={SearchX} titulo="Pessoa não encontrada" acao={<Button asChild variant="outline"><Link href="/portal/usuarios">Voltar</Link></Button>} />

  const presentes = inscricoes.filter((i) => i.status === "presente").length

  return (
    <div className="space-y-6">
      <PageHeader titulo={u.nome ?? "Sem nome"} migalhas={[{ label: "Gestão" }, { label: "Usuários", href: `/portal/usuarios?aba=${u.role}` }, { label: u.nome ?? "Pessoa" }]} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <aside className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary" aria-hidden>{iniciais(u.nome)}</span>
          <div><p className="break-all">{u.email}</p><Badge variant="secondary" className="mt-2">{ROLE_LABELS[u.role]}</Badge></div>
          <dl className="grid grid-cols-2 gap-3 border-t pt-4">
            <div><dt className="text-sm text-muted-foreground">Inscrições</dt><dd className="text-2xl font-bold">{inscricoes.length}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Presenças</dt><dd className="text-2xl font-bold">{presentes}</dd></div>
          </dl>
          <p className="text-sm text-muted-foreground">Cadastro em {dataBR(u.created_at?.slice(0, 10))}</p>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          {demo && ficha && (
            <form onSubmit={async (e) => { e.preventDefault(); await salvarFicha(ficha); notify.success("Ficha salva") }}>
              <Secao titulo="Ficha" descricao="Informações sensíveis. Só a administração tem acesso.">
                <div className="flex justify-end">
                  <Button type="button" size="sm" variant="outline" onClick={() => setRevelar(!revelar)}>
                    {revelar ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />} {revelar ? "Esconder dados" : "Mostrar dados"}
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo label="Telefone">{(p) => revelar ? <Input {...p} type="tel" value={ficha.telefone} onChange={(e) => setFicha({ ...ficha, telefone: mascararTelefone(e.target.value) })} /> : <Input {...p} readOnly value={ficha.telefone ? mascarar(ficha.telefone) : "Não informado"} />}</Campo>
                  <Campo label="Nascimento">{(p) => revelar ? <Input {...p} type="date" value={ficha.nascimento} onChange={(e) => setFicha({ ...ficha, nascimento: e.target.value })} /> : <Input {...p} readOnly value={ficha.nascimento ? "••/••/••••" : "Não informado"} />}</Campo>
                </div>
                <Campo label="Endereço">{(p) => revelar ? <Input {...p} value={ficha.endereco} onChange={(e) => setFicha({ ...ficha, endereco: e.target.value })} /> : <Input {...p} readOnly value={ficha.endereco ? mascarar(ficha.endereco) : "Não informado"} />}</Campo>
                {revelar && (
                  <>
                    <Campo label="Responsável legal" dica="Para menores de idade.">{(p) => <Input {...p} value={ficha.responsavel_legal} onChange={(e) => setFicha({ ...ficha, responsavel_legal: e.target.value })} />}</Campo>
                    <Campo label="Necessidades">{(p) => <Textarea {...p} rows={2} value={ficha.necessidades} onChange={(e) => setFicha({ ...ficha, necessidades: e.target.value })} />}</Campo>
                    <Campo label="Observações da equipe">{(p) => <Textarea {...p} rows={2} value={ficha.observacoes} onChange={(e) => setFicha({ ...ficha, observacoes: e.target.value })} />}</Campo>
                    <Button type="submit">Salvar ficha</Button>
                  </>
                )}
              </Secao>
            </form>
          )}

          {demo && familia.length > 0 && (
            <Secao titulo="Família">
              <ul className="divide-y">
                {familia.map((d) => <li key={d.id} className="flex flex-wrap justify-between gap-2 py-2.5"><span className="font-medium">{d.nome}</span><span className="text-muted-foreground">{d.parentesco} · {d.atividade}</span></li>)}
              </ul>
            </Secao>
          )}

          {demo && disp && disp.dias.length > 0 && (
            <Secao titulo="Disponibilidade"><p>{disp.dias.join(", ")} · {disp.periodo}</p>{disp.observacoes && <p className="text-muted-foreground">{disp.observacoes}</p>}</Secao>
          )}

          <Secao titulo="Histórico de participação">
            {inscricoes.length === 0 ? <p className="text-muted-foreground">Nenhuma inscrição ainda.</p> : (
              <ul className="divide-y">
                {inscricoes.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <Link href={rotaAdmin(i.item_tipo, i.item_id)} className="min-w-0 font-medium hover:underline">{i.item_nome}</Link>
                    <span className="text-muted-foreground">{ITEM_TIPO_LABELS[i.item_tipo]} · {PRESENCA_LABELS[i.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </Secao>
        </div>
      </div>
    </div>
  )
}
