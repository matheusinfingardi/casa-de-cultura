"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/auth-provider"
import PageHeader from "@/components/comum/page-header"
import EstadoVazio from "@/components/comum/estado-vazio"
import Confirmar from "@/components/comum/confirmar"
import { CampoSelect } from "@/components/comum/campos"
import { notify } from "@/lib/notify"
import { dataBR, iniciais } from "@/lib/formatar"
import { ROLES, ROLE_LABELS, atualizarRole, listarUsuarios, type Role, type Usuario } from "@/lib/services/usuarios"

const DESCRICAO_PAPEL: Record<Role, string> = {
  admin: "Acesso total ao portal da administração.",
  responsavel: "Vê o que lhe foi atribuído e registra presenças.",
  cliente: "Participa das atividades e acompanha suas inscrições.",
}
const ROTULO_PLURAL: Record<Role, string> = { admin: "Administração", responsavel: "Voluntários", cliente: "Assistidos" }
const ORDEM: Role[] = ["admin", "responsavel", "cliente"]

export default function GestaoUsuarios() {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [busca, setBusca] = useState("")
  const [aba, setAba] = useState<Role | "todos">("todos")
  const [pendente, setPendente] = useState<{ u: Usuario; role: Role } | null>(null)

  useEffect(() => { listarUsuarios().then(setUsuarios) }, [])

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: usuarios?.length ?? 0, admin: 0, responsavel: 0, cliente: 0 }
    usuarios?.forEach((u) => c[u.role]++)
    return c
  }, [usuarios])

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return (usuarios ?? []).filter((u) => (aba === "todos" || u.role === aba) && (!t || `${u.nome ?? ""} ${u.email ?? ""}`.toLowerCase().includes(t)))
  }, [usuarios, busca, aba])

  async function aplicar(id: string, role: Role) {
    const anterior = usuarios
    setUsuarios((prev) => prev?.map((u) => (u.id === id ? { ...u, role } : u)) ?? prev)
    try {
      await atualizarRole(id, role)
      notify.success(`Papel atualizado para ${ROLE_LABELS[role]}`)
    } catch {
      setUsuarios(anterior)
    }
  }

  function pedirTroca(u: Usuario, role: Role) {
    if (role === u.role) return
    // mudanças de/para administrador pedem confirmação
    if (role === "admin" || u.role === "admin") setPendente({ u, role })
    else aplicar(u.id, role)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Usuários"
        descricao="Defina o papel de cada pessoa. O papel decide qual portal ela vê ao entrar."
        migalhas={[{ label: "Pessoas" }, { label: "Usuários" }]}
      />

      <ul className="grid gap-3 sm:grid-cols-3">
        {ORDEM.map((r) => (
          <li key={r} className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium">{ROTULO_PLURAL[r]} <span className="text-muted-foreground">· {contagem[r]}</span></p>
            <p className="mt-1 text-xs text-muted-foreground">{DESCRICAO_PAPEL[r]}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-9" placeholder="Buscar por nome ou e-mail" aria-label="Buscar usuário" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por papel">
          {(["todos", ...ORDEM] as const).map((a) => (
            <button key={a} type="button" aria-pressed={aba === a} onClick={() => setAba(a)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${aba === a ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              {a === "todos" ? "Todos" : ROTULO_PLURAL[a]} ({contagem[a]})
            </button>
          ))}
        </div>
      </div>

      {usuarios === null ? (
        <div className="space-y-3" aria-busy="true">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : visiveis.length === 0 ? (
        <EstadoVazio icon={Users} titulo="Nenhuma pessoa encontrada" texto="Ajuste a busca ou o filtro de papel." />
      ) : (
        <ul className="space-y-2">
          {visiveis.map((u) => {
            const euMesmo = u.id === user?.id
            return (
              <li key={u.id}>
                <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden>{iniciais(u.nome)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{u.nome ?? "Sem nome"}{euMesmo && <Badge variant="outline" className="ml-2">você</Badge>}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email} · desde {dataBR(u.created_at.slice(0, 10))}</p>
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <CampoSelect
                      aria-label={`Papel de ${u.nome ?? u.email}`}
                      valor={u.role}
                      desativado={euMesmo}
                      opcoes={ROLES.map((r) => ({ valor: r, label: ROLE_LABELS[r] }))}
                      onChange={(r) => pedirTroca(u, r as Role)}
                    />
                    {euMesmo && <p className="mt-1 text-xs text-muted-foreground">Você não pode alterar o próprio papel.</p>}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <Confirmar
        aberto={!!pendente}
        onFechar={() => setPendente(null)}
        titulo="Alterar papel?"
        perigoso={pendente?.role === "admin"}
        confirmarLabel="Confirmar alteração"
        descricao={pendente && (
          pendente.role === "admin"
            ? <>{pendente.u.nome ?? pendente.u.email} passará a ter <strong>acesso total</strong> ao portal da administração.</>
            : <>{pendente.u.nome ?? pendente.u.email} deixará de ser administrador(a) e perderá o acesso ao portal.</>
        )}
        onConfirmar={() => pendente ? aplicar(pendente.u.id, pendente.role) : undefined}
      />
    </div>
  )
}
