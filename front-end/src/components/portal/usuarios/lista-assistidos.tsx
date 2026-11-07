"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Search, Users, UsersRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import { useDemo } from "@/hooks/use-demo"
import { calcularAssiduidade, idade, situacao, type Assiduidade } from "@/lib/assiduidade"
import { cuidadosDaFamilia, cuidadosDaPessoa, ehResponsavelFamiliar, resumoFamilia } from "@/lib/familia"
import { iniciais } from "@/lib/formatar"
import { listarFichas, listarRegistros, listarTodosDependentes, type Dependente, type Ficha } from "@/lib/services/extras"
import { contarInscricoesPorPessoa } from "@/lib/services/presencas"
import { listarClientes, type Usuario } from "@/lib/services/usuarios"

const POR_PAGINA = 12
const FILTROS = [["todos", "Todos"], ["familia", "Com dependentes"], ["cuidados", "Com cuidados especiais"], ["contato", "Precisam de contato"], ["beneficio", "Recebem benefício"]]

/** Gestão das pessoas atendidas: quem são, quem depende delas, que cuidados pedem e como está a frequência. */
export default function ListaAssistidos() {
  const demo = useDemo()
  const params = useSearchParams()
  const [pessoas, setPessoas] = useState<Usuario[] | null>(null)
  const [fichas, setFichas] = useState<Ficha[]>([])
  const [deps, setDeps] = useState<Dependente[]>([])
  const [inscricoes, setInscricoes] = useState<Record<string, number>>({})
  const [assiduidades, setAssiduidades] = useState<Record<string, Assiduidade>>({})
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState(params.get("filtro") ?? "todos")
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    listarClientes().then(setPessoas)
    contarInscricoesPorPessoa().then(setInscricoes)
  }, [])
  useEffect(() => {
    if (!demo) return
    listarFichas().then(setFichas)
    listarTodosDependentes().then(setDeps)
    listarRegistros().then((regs) => {
      const por: Record<string, typeof regs> = {}
      for (const r of regs) (por[r.cliente_id] ??= []).push(r)
      setAssiduidades(Object.fromEntries(Object.entries(por).map(([id, l]) => [id, calcularAssiduidade(l)])))
    })
  }, [demo])

  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return (pessoas ?? []).filter((u) => {
      if (t && !`${u.nome ?? ""} ${u.email ?? ""}`.toLowerCase().includes(t)) return false
      const f = fichas.find((x) => x.id === u.id)
      const a = assiduidades[u.id]
      const dele = deps.filter((d) => d.responsavel_id === u.id)
      if (filtro === "familia") return ehResponsavelFamiliar(dele)
      if (filtro === "cuidados") return cuidadosDaPessoa(f).length > 0 || cuidadosDaFamilia(dele).length > 0
      if (filtro === "contato") return !!a && (a.faltasSeguidas >= 3 || (a.taxa ?? 100) < 50)
      if (filtro === "beneficio") return !!f?.beneficios?.length
      return true
    }).sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR"))
  }, [pessoas, busca, filtro, fichas, deps, assiduidades])
  const total = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const atual = Math.min(pagina, total)
  const naPagina = filtradas.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA)

  return (
    <div className="space-y-6">
      <PageHeader titulo="Assistidos" descricao="Conheça e acompanhe cada pessoa atendida: dependentes, cuidados, frequência e o relatório individual." migalhas={[{ label: "Gestão" }, { label: "Assistidos" }]} />
      <div className="relative max-w-lg">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input className="pl-10" placeholder="Buscar por nome ou e-mail" aria-label="Buscar assistido" value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1) }} />
      </div>
      {demo && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar assistidos">
          {FILTROS.map(([v, r]) => <Button key={v} size="sm" variant={filtro === v ? "default" : "outline"} aria-pressed={filtro === v} onClick={() => { setFiltro(v); setPagina(1) }}>{r}</Button>)}
        </div>
      )}
      {pessoas === null ? <Skeleton className="h-96 rounded-2xl" /> : naPagina.length === 0 ? <EstadoVazio icon={Users} titulo="Ninguém encontrado" texto="Tente outra busca ou outro filtro." /> : (
        <>
          <Card className="gap-0 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Pessoa</th>
                    {demo && <th scope="col" className="hidden px-3 py-3 font-semibold lg:table-cell">Dependentes</th>}
                    {demo && <th scope="col" className="hidden px-3 py-3 font-semibold lg:table-cell">Cuidados</th>}
                    {demo && <th scope="col" className="px-3 py-3 font-semibold">Assiduidade</th>}
                    <th scope="col" className="hidden px-5 py-3 text-right font-semibold sm:table-cell">Inscrições</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {naPagina.map((u) => {
                    const f = fichas.find((x) => x.id === u.id)
                    const dele = deps.filter((d) => d.responsavel_id === u.id)
                    const a = assiduidades[u.id]
                    const st = a ? situacao(a) : null
                    const anos = idade(f?.nascimento)
                    const resumo = resumoFamilia(dele)
                    const cuidados = cuidadosDaPessoa(f)
                    const naFamilia = cuidadosDaFamilia(dele)
                    return (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3">
                          <Link href={`/portal/assistidos/${u.id}`} className="group flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden>{iniciais(u.nome)}</span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium group-hover:underline">{u.nome ?? "Sem nome"}</span>
                              <span className="block truncate text-sm text-muted-foreground">{[anos !== null ? `${anos} anos` : "", f?.bairro].filter(Boolean).join(" · ") || u.email}</span>
                            </span>
                          </Link>
                        </td>
                        {demo && <td className="hidden px-3 py-3 lg:table-cell">{resumo ? <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-sky-100 px-2.5 py-1 text-sm font-medium text-sky-950 dark:bg-sky-900 dark:text-sky-50"><UsersRound className="h-3.5 w-3.5" aria-hidden />{resumo}</span> : <span className="text-muted-foreground">—</span>}</td>}
                        {demo && (
                          <td className="hidden min-w-64 px-3 py-3 text-sm lg:table-cell">
                            {!cuidados.length && !naFamilia.length && <span className="text-muted-foreground">—</span>}
                            {cuidados.slice(0, 1).map((c) => <span key={c} className="block font-medium">{c}</span>)}
                            {naFamilia.slice(0, 1).map((c) => <span key={c.nome} className="line-clamp-2"><span className="font-medium">{c.nome}</span> <span className="text-muted-foreground">({c.parentesco}): {c.texto}</span></span>)}
                          </td>
                        )}
                        {demo && <td className="px-3 py-3">{!st && <span className="text-sm text-muted-foreground">Sem registros</span>}{st && <Link href={`/portal/assistidos/${u.id}?aba=assiduidade`} aria-label={`Assiduidade de ${u.nome}: ${st.rotulo}`} className={`whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-medium hover:underline ${st.classe}`}>{a?.taxa !== null ? `${a?.taxa}% · ` : ""}{st.rotulo}</Link>}</td>}
                        <td className="hidden px-5 py-3 text-right tabular-nums sm:table-cell"><Link href={`/portal/assistidos/${u.id}?aba=participacao`} className="hover:underline">{inscricoes[u.id] ?? 0}</Link></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">{filtradas.length} {filtradas.length === 1 ? "pessoa" : "pessoas"}</p>
            {total > 1 && (
              <div className="flex items-center gap-2">
                <Button size="icon-sm" variant="outline" disabled={atual === 1} onClick={() => setPagina(atual - 1)} aria-label="Página anterior"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm tabular-nums">Página {atual} de {total}</span>
                <Button size="icon-sm" variant="outline" disabled={atual === total} onClick={() => setPagina(atual + 1)} aria-label="Próxima página"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
