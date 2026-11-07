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
import { cancelarConvite, criarConvite, listarConvites, type Convite } from "@/lib/services/extras"
import { contarInscricoesPorPessoa } from "@/lib/services/presencas"
import { ROLES, ROLE_LABELS, atualizarRole, listarUsuarios, type Role, type Usuario } from "@/lib/services/usuarios"

type Aba = "cliente" | "responsavel" | "admin" | "convites"
const POR_PAGINA = 10
const ABAS: { v: Aba; r: string; dica: string; soDemo?: boolean }[] = [
  { v: "cliente", r: "Assistidos", dica: "Contas de quem participa das atividades. Para acompanhar cada pessoa, use Gestão > Assistidos." },
  { v: "responsavel", r: "Voluntários", dica: "Contas de quem conduz atividades. Para ver o trabalho de cada um, use Gestão > Voluntários." },
  { v: "admin", r: "Administração", dica: "Acesso completo a este portal." },
  { v: "convites", r: "Convites", dica: "Convites enviados por e-mail.", soDemo: true },
]
const hrefPessoa = (u: Usuario) => (u.role === "cliente" ? `/portal/assistidos/${u.id}` : u.role === "responsavel" ? `/portal/voluntarios/${u.id}` : `/portal/usuarios/${u.id}`)

function TabelaPessoas({ pessoas, inscricoes, euId, onPapel }: { pessoas: Usuario[]; inscricoes: Record<string, number>; euId?: string; onPapel: (u: Usuario, r: Role) => void }) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Pessoa</th>
              <th scope="col" className="hidden px-3 py-3 font-semibold lg:table-cell">Desde</th>
              <th scope="col" className="hidden px-3 py-3 text-right font-semibold sm:table-cell">Inscrições</th>
              <th scope="col" className="w-48 px-5 py-3 font-semibold">Papel</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pessoas.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-5 py-3">
                  <Link href={hrefPessoa(u)} className="group flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden>{iniciais(u.nome)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium group-hover:underline">{u.nome ?? "Sem nome"}{u.id === euId && <Badge variant="outline" className="ml-2">você</Badge>}</span>
                      <span className="block truncate text-sm text-muted-foreground">{u.email}</span>
                    </span>
                  </Link>
                </td>
                <td className="hidden whitespace-nowrap px-3 py-3 text-muted-foreground lg:table-cell">{dataBR(u.created_at?.slice(0, 10))}</td>
                <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{inscricoes[u.id] ?? 0}</td>
                <td className="px-5 py-2">
                  <CampoSelect aria-label={`Papel de ${u.nome ?? u.email}`} valor={u.role} desativado={u.id === euId} opcoes={ROLES.map((r) => ({ valor: r, label: ROLE_LABELS[r] }))} onChange={(r) => onPapel(u, r as Role)} />
                </td>
              </tr>
            ))}
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
  const [busca, setBusca] = useState("")
  const [pagina, setPagina] = useState(1)
  const [pendente, setPendente] = useState<{ u: Usuario; role: Role } | null>(null)
  const [convidando, setConvidando] = useState(false)
  const [conviteEmail, setConviteEmail] = useState("")
  const [convitePapel, setConvitePapel] = useState("responsavel")

  useEffect(() => {
    listarUsuarios().then(setUsuarios)
    contarInscricoesPorPessoa().then(setInscricoes)
  }, [])
  useEffect(() => {
    if (!demo) return
    listarConvites().then(setConvites)
  }, [demo])

  const contagem = useMemo(() => {
    const c: Record<string, number> = { cliente: 0, responsavel: 0, admin: 0 }
    usuarios?.forEach((u) => c[u.role]++)
    c.convites = convites.filter((x) => x.status === "pendente").length
    return c
  }, [usuarios, convites])

  const ehPessoas = aba === "cliente" || aba === "responsavel" || aba === "admin"
  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return (usuarios ?? []).filter((u) => u.role === aba && (!t || `${u.nome ?? ""} ${u.email ?? ""}`.toLowerCase().includes(t)))
  }, [usuarios, aba, busca])
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
        descricao="Contas de acesso ao sistema: papéis e convites."
        migalhas={[{ label: "Suporte" }, { label: "Usuários" }]}
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
          {naPagina.length === 0 ? <EstadoVazio icon={Users} titulo="Ninguém encontrado" texto="Tente outra busca ou outro filtro." /> : (
            <>
              <TabelaPessoas pessoas={naPagina} inscricoes={inscricoes} euId={user?.id} onPapel={pedirTroca} />
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
