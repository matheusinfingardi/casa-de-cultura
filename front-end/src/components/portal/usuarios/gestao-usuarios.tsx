"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, MailPlus, Search, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth/auth-provider"
import PageHeader from "@/components/comum/page-header"
import EstadoVazio from "@/components/comum/estado-vazio"
import Confirmar from "@/components/comum/confirmar"
import { Campo } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import { useDemo } from "@/hooks/use-demo"
import { notify } from "@/lib/notify"
import { dataBR, iniciais } from "@/lib/formatar"
import { calcularAssiduidade, idade, situacao, type Assiduidade } from "@/lib/assiduidade"
import { cancelarConvite, criarConvite, listarConvites, listarFichas, listarPedidos, listarRegistros, responderPedido, type Convite, type Ficha, type PedidoVoluntario } from "@/lib/services/extras"
import { contarInscricoesPorPessoa } from "@/lib/services/presencas"
import { ROLES, ROLE_LABELS, atualizarRole, listarUsuarios, type Role, type Usuario } from "@/lib/services/usuarios"

type Aba = "cliente" | "responsavel" | "admin" | "convites" | "pedidos"
const POR_PAGINA = 10
const ABAS: { v: Aba; r: string; dica: string; soDemo?: boolean }[] = [
  { v: "cliente", r: "Assistidos", dica: "Pessoas que participam das atividades." },
  { v: "responsavel", r: "Voluntários", dica: "Conduzem atividades e registram presença." },
  { v: "admin", r: "Administração", dica: "Acesso completo a este portal." },
  { v: "pedidos", r: "Pedidos", dica: "Pessoas que querem ser voluntárias.", soDemo: true },
  { v: "convites", r: "Convites", dica: "Convites enviados por e-mail.", soDemo: true },
]

type Extra = { ass?: Assiduidade; ficha?: Ficha }

function TabelaPessoas({ pessoas, inscricoes, euId, onPapel, extra, comCuidado }: { pessoas: Usuario[]; inscricoes: Record<string, number>; euId?: string; onPapel: (u: Usuario, r: Role) => void; extra: (id: string) => Extra; comCuidado: boolean }) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Pessoa</th>
              {comCuidado && <th scope="col" className="hidden px-3 py-3 font-semibold lg:table-cell">Cuidados</th>}
              {comCuidado && <th scope="col" className="hidden px-3 py-3 font-semibold md:table-cell">Assiduidade</th>}
              {!comCuidado && <th scope="col" className="hidden px-3 py-3 font-semibold lg:table-cell">Desde</th>}
              <th scope="col" className="hidden px-3 py-3 text-right font-semibold sm:table-cell">Inscrições</th>
              <th scope="col" className="w-48 px-5 py-3 font-semibold">Papel</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pessoas.map((u) => {
              const { ass, ficha } = extra(u.id)
              const st = ass ? situacao(ass) : null
              const anos = idade(ficha?.nascimento)
              return (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-5 py-3">
                  <Link href={`/portal/usuarios/${u.id}`} className="group flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden>{iniciais(u.nome)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium group-hover:underline">{u.nome ?? "Sem nome"}{u.id === euId && <Badge variant="outline" className="ml-2">você</Badge>}</span>
                      <span className="block truncate text-sm text-muted-foreground">{anos !== null ? `${anos} anos · ` : ""}{ficha?.bairro ? `${ficha.bairro} · ` : ""}{u.email}</span>
                    </span>
                  </Link>
                </td>
                {comCuidado && <td className="hidden px-3 py-3 text-sm lg:table-cell">{ficha?.deficiencia ? <span className="font-medium">{ficha.deficiencia}</span> : ficha?.necessidades ? <span className="text-muted-foreground">Tem necessidades anotadas</span> : <span className="text-muted-foreground">—</span>}</td>}
                {comCuidado && <td className="hidden px-3 py-3 md:table-cell">{st && <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-medium ${st.classe}`}>{ass?.taxa !== null ? `${ass?.taxa}% · ` : ""}{st.rotulo}</span>}</td>}
                {!comCuidado && <td className="hidden whitespace-nowrap px-3 py-3 text-muted-foreground lg:table-cell">{dataBR(u.created_at?.slice(0, 10))}</td>}
                <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{inscricoes[u.id] ?? 0}</td>
                <td className="px-5 py-2">
                  <CampoSelect aria-label={`Papel de ${u.nome ?? u.email}`} valor={u.role} desativado={u.id === euId} opcoes={ROLES.map((r) => ({ valor: r, label: ROLE_LABELS[r] }))} onChange={(r) => onPapel(u, r as Role)} />
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default function GestaoUsuarios() {
  const { user } = useAuth()
  const demo = useDemo()
  const router = useRouter()
  const params = useSearchParams()
  const aba = (params.get("aba") as Aba | null) ?? "cliente"
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [inscricoes, setInscricoes] = useState<Record<string, number>>({})
  const [convites, setConvites] = useState<Convite[]>([])
  const [pedidos, setPedidos] = useState<PedidoVoluntario[]>([])
  const [busca, setBusca] = useState("")
  const [pagina, setPagina] = useState(1)
  const [pendente, setPendente] = useState<{ u: Usuario; role: Role } | null>(null)
  const [convidando, setConvidando] = useState(false)
  const [conviteEmail, setConviteEmail] = useState("")
  const [convitePapel, setConvitePapel] = useState("responsavel")
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [assiduidades, setAssiduidades] = useState<Record<string, Assiduidade>>({})
  const [cuidado, setCuidado] = useState(params.get("filtro") ?? "todos")

  useEffect(() => {
    listarUsuarios().then(setUsuarios)
    contarInscricoesPorPessoa().then(setInscricoes)
  }, [])
  useEffect(() => {
    if (!demo) return
    listarConvites().then(setConvites)
    listarPedidos().then(setPedidos)
    listarFichas().then(setFichas)
    listarRegistros().then((regs) => {
      const porPessoa: Record<string, typeof regs> = {}
      for (const r of regs) (porPessoa[r.cliente_id] ??= []).push(r)
      setAssiduidades(Object.fromEntries(Object.entries(porPessoa).map(([id, l]) => [id, calcularAssiduidade(l)])))
    })
  }, [demo])

  const contagem = useMemo(() => {
    const c: Record<string, number> = { cliente: 0, responsavel: 0, admin: 0 }
    usuarios?.forEach((u) => c[u.role]++)
    c.pedidos = pedidos.filter((p) => p.status === "pendente").length
    c.convites = convites.filter((x) => x.status === "pendente").length
    return c
  }, [usuarios, pedidos, convites])

  const ehPessoas = aba === "cliente" || aba === "responsavel" || aba === "admin"
  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return (usuarios ?? []).filter((u) => {
      if (u.role !== aba || (t && !`${u.nome ?? ""} ${u.email ?? ""}`.toLowerCase().includes(t))) return false
      if (aba !== "cliente" || cuidado === "todos") return true
      const f = fichas.find((x) => x.id === u.id)
      const a = assiduidades[u.id]
      if (cuidado === "deficiencia") return !!f?.deficiencia
      if (cuidado === "contato") return !!a && (a.faltasSeguidas >= 3 || (a.taxa ?? 100) < 50)
      if (cuidado === "beneficio") return !!f?.beneficios?.length
      return true
    })
  }, [usuarios, aba, busca, cuidado, fichas, assiduidades])
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const naPagina = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA)

  function trocarAba(v: Aba) {
    setBusca(""); setPagina(1)
    router.replace(`/portal/usuarios?aba=${v}`, { scroll: false })
  }

  async function aplicar(id: string, role: Role) {
    const anterior = usuarios
    setUsuarios((prev) => prev?.map((u) => (u.id === id ? { ...u, role } : u)) ?? prev)
    try {
      await atualizarRole(id, role)
      notify.success(`Papel alterado para ${ROLE_LABELS[role]}`)
    } catch {
      setUsuarios(anterior)
    }
  }

  function pedirTroca(u: Usuario, role: Role) {
    if (role === u.role) return
    if (role === "admin" || u.role === "admin") setPendente({ u, role })
    else aplicar(u.id, role)
  }

  async function responder(p: PedidoVoluntario, aprovado: boolean) {
    await responderPedido(p, aprovado)
    setPedidos(await listarPedidos())
    setConvites(await listarConvites())
    notify.success(aprovado ? `Convite enviado para ${p.email}` : "Pedido recusado")
  }

  async function convidar(e: React.FormEvent) {
    e.preventDefault()
    if (!/\S+@\S+\.\S+/.test(conviteEmail)) return notify.error("Digite um e-mail válido")
    await criarConvite(conviteEmail, convitePapel)
    setConvites(await listarConvites())
    setConvidando(false); setConviteEmail("")
    notify.success("Convite registrado. O envio do e-mail depende do back-end.")
  }

  const abas = ABAS.filter((a) => !a.soDemo || demo)
  const dica = abas.find((a) => a.v === aba)?.dica

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Usuários"
        descricao="Conheça e acompanhe cada pessoa: abra o nome para ver a ficha, a família e a participação."
        acoes={demo ? <Button onClick={() => setConvidando(true)}><MailPlus className="h-4 w-4" aria-hidden /> Convidar pessoa</Button> : undefined}
      />

      <div className="flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="Grupos de usuários">
        {abas.map((a) => (
          <button key={a.v} type="button" role="tab" aria-selected={aba === a.v} onClick={() => trocarAba(a.v)} className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-medium ${aba === a.v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {a.r}
            <span className={`rounded-full px-2 text-sm ${aba === a.v ? "bg-primary/10" : "bg-muted"}`}>{contagem[a.v] ?? 0}</span>
          </button>
        ))}
      </div>

      <p className="text-muted-foreground">{dica}</p>

      {usuarios === null ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : ehPessoas ? (
        <>
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input className="pl-10" placeholder="Buscar por nome ou e-mail" aria-label="Buscar usuário" value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1) }} />
          </div>
          {aba === "cliente" && demo && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar assistidos">
              {[["todos", "Todos"], ["contato", "Precisam de contato"], ["deficiencia", "Com deficiência"], ["beneficio", "Recebem benefício"]].map(([v, r]) => (
                <Button key={v} size="sm" variant={cuidado === v ? "default" : "outline"} aria-pressed={cuidado === v} onClick={() => { setCuidado(v); setPagina(1) }}>{r}</Button>
              ))}
            </div>
          )}
          {naPagina.length === 0 ? <EstadoVazio icon={Users} titulo="Ninguém encontrado" texto="Tente outra busca ou outro filtro." /> : (
            <>
              <TabelaPessoas pessoas={naPagina} inscricoes={inscricoes} euId={user?.id} onPapel={pedirTroca} comCuidado={aba === "cliente" && demo} extra={(id) => ({ ass: assiduidades[id], ficha: fichas.find((f) => f.id === id) })} />
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground" aria-live="polite">{filtradas.length} {filtradas.length === 1 ? "pessoa" : "pessoas"}</p>
                {totalPaginas > 1 && (
                  <div className="flex items-center gap-2">
                    <Button size="icon-sm" variant="outline" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)} aria-label="Página anterior"><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-sm tabular-nums">Página {paginaAtual} de {totalPaginas}</span>
                    <Button size="icon-sm" variant="outline" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)} aria-label="Próxima página"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : aba === "pedidos" ? (
        pedidos.length === 0 ? <EstadoVazio icon={Users} titulo="Nenhum pedido" /> : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {pedidos.map((p) => (
              <li key={p.id} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="font-semibold">{p.nome}</p><p className="truncate text-sm text-muted-foreground">{p.email} · {p.telefone}</p></div>
                  <Badge variant={p.status === "pendente" ? "secondary" : "outline"}>{p.status === "pendente" ? "Aguardando" : p.status === "aprovado" ? "Aprovado" : "Recusado"}</Badge>
                </div>
                <dl className="grid gap-2 sm:grid-cols-2">
                  <div><dt className="text-sm text-muted-foreground">Quer ajudar com</dt><dd>{p.area}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Disponibilidade</dt><dd>{p.disponibilidade}</dd></div>
                </dl>
                {p.status === "pendente" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => responder(p, true)}>Aprovar e convidar</Button>
                    <Button size="sm" variant="outline" onClick={() => responder(p, false)}>Recusar</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      ) : (
        convites.length === 0 ? <EstadoVazio icon={MailPlus} titulo="Nenhum convite enviado" /> : (
          <Card className="gap-0 divide-y p-0">
            {convites.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0"><p className="truncate font-medium">{c.email}</p><p className="text-sm text-muted-foreground">{ROLE_LABELS[c.role as Role]} · enviado em {dataBR(c.created_at.slice(0, 10))}</p></div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === "pendente" ? "secondary" : "outline"}>{c.status === "pendente" ? "Aguardando" : c.status === "aceito" ? "Aceito" : "Cancelado"}</Badge>
                  {c.status === "pendente" && <Button size="sm" variant="outline" onClick={async () => { await cancelarConvite(c.id); setConvites(await listarConvites()) }}>Cancelar</Button>}
                </div>
              </div>
            ))}
          </Card>
        )
      )}

      <Confirmar
        aberto={!!pendente}
        onFechar={() => setPendente(null)}
        titulo="Alterar papel?"
        perigoso={pendente?.role === "admin"}
        confirmarLabel="Confirmar"
        descricao={pendente && (pendente.role === "admin"
          ? <>{pendente.u.nome ?? pendente.u.email} passará a ter <strong>acesso total</strong> ao portal da administração.</>
          : <>{pendente.u.nome ?? pendente.u.email} deixará de ser da administração e perderá o acesso a este portal.</>)}
        onConfirmar={() => (pendente ? aplicar(pendente.u.id, pendente.role) : undefined)}
      />

      <Dialog open={convidando} onOpenChange={setConvidando}>
        <DialogContent>
          <form onSubmit={convidar} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Convidar pessoa</DialogTitle>
              <DialogDescription>A pessoa recebe um link para criar a senha já com o papel escolhido.</DialogDescription>
            </DialogHeader>
            <Campo label="E-mail" obrigatorio>{(p) => <Input {...p} type="email" value={conviteEmail} onChange={(e) => setConviteEmail(e.target.value)} />}</Campo>
            <Campo label="Papel">{(p) => <CampoSelect {...p} valor={convitePapel} onChange={setConvitePapel} opcoes={[{ valor: "responsavel", label: "Voluntário" }, { valor: "admin", label: "Administração" }]} />}</Campo>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConvidando(false)}>Voltar</Button>
              <Button type="submit">Enviar convite</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
