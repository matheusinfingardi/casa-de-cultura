"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarPlus, ClipboardCheck, Copy, Pencil, SearchX, Trash2, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import CapaItem from "@/components/comum/capa-item"
import Confirmar from "@/components/comum/confirmar"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import { useDemo } from "@/hooks/use-demo"
import { dataExtenso, faixaHorario, iniciais } from "@/lib/formatar"
import { baixarIcs } from "@/lib/ics"
import { API_DO_TIPO, carregarItem, paraView, proximasDatas, rotaAdmin, type ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { listarEspera, type Espera } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, ITEM_TIPO_TABLE, PRESENCA_LABELS, listarPresencasDoItem, type ItemTipo, type PresencaDoItem, type PresencaStatus } from "@/lib/services/presencas"
import { listarUsuarios, type Usuario } from "@/lib/services/usuarios"

const PLURAL: Record<ItemTipo, string> = { evento: "Eventos", atividade: "Atividades", oficina: "Oficinas", centro: "Centros", assistencia: "Assistência" }
const GRUPO: Record<ItemTipo, string> = { evento: "Programação", atividade: "Programação", oficina: "Programação", centro: "Atendimento", assistencia: "Atendimento" }
const COR: Record<PresencaStatus, string> = { presente: "bg-emerald-500", marcada: "bg-sky-500", ausente: "bg-rose-500" }

function Bloco({ titulo, acao, children }: { titulo: string; acao?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  )
}

export default function DetalheItem({ tipo, id }: { tipo: ItemTipo; id: string }) {
  const router = useRouter()
  const demo = useDemo()
  const [item, setItem] = useState<ItemView | null | undefined>(undefined)
  const [inscritos, setInscritos] = useState<PresencaDoItem[]>([])
  const [espera, setEspera] = useState<Espera[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [naUnidade, setNaUnidade] = useState<ItemView[]>([])
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    let ativo = true
    Promise.all([carregarItem(tipo, id), listarPresencasDoItem(tipo, id), listarUsuarios()]).then(([i, p, u]) => {
      if (!ativo) return
      setItem(i); setInscritos(p); setUsuarios(u)
    })
    return () => { ativo = false }
  }, [tipo, id])

  useEffect(() => {
    if (demo && item) listarEspera(tipo, id).then(setEspera)
    if (demo && item && tipo === "centro") {
      Promise.all((["evento", "atividade", "oficina", "assistencia"] as ItemTipo[]).map(async (t) => {
        const l = await API_DO_TIPO[t].listar()
        return l.filter((x) => (x as { centro_id?: string }).centro_id === id).map((x) => paraView(t, x))
      })).then((r) => setNaUnidade(r.flat()))
    }
  }, [demo, item, tipo, id])

  if (item === undefined) return <div className="space-y-4" aria-busy="true" aria-label="Carregando"><Skeleton className="h-52 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
  if (item === null) {
    return <EstadoVazio icon={SearchX} titulo={`${ITEM_TIPO_LABELS[tipo]} não encontrado`} texto="Pode ter sido excluído." acao={<Button asChild variant="outline"><Link href={rotaAdmin(tipo)}>Voltar para a lista</Link></Button>} />
  }

  const datas = proximasDatas(item)
  const voluntario = usuarios.find((u) => u.id === item.responsavel_id)
  const n = (s: PresencaStatus) => inscritos.filter((p) => p.status === s).length
  const ocupacao = item.vagas ? Math.min(100, Math.round((inscritos.length / item.vagas) * 100)) : 0
  const lotado = item.vagas !== null && item.vagas > 0 && inscritos.length >= item.vagas
  const nomeDe = (uid: string) => usuarios.find((u) => u.id === uid)?.nome ?? "Pessoa"

  async function duplicar() {
    if (!item) return
    const resto = { ...(item.bruto as unknown as Record<string, unknown>) }
    delete resto.id
    const copia = await API_DO_TIPO[tipo].criar({ ...resto, nome: `${item.nome} (cópia)` } as never)
    notify.success("Cópia criada. Ajuste o que precisar.")
    router.push(`${rotaAdmin(tipo, (copia as { id: string }).id)}/editar`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={item.nome}
        migalhas={[{ label: GRUPO[tipo] }, { label: PLURAL[tipo], href: rotaAdmin(tipo) }, { label: item.nome }]}
        acoes={
          <>
            <Button asChild><Link href={`/portal/presenca/${tipo}/${id}`}><ClipboardCheck className="h-4 w-4" aria-hidden /> Presença</Link></Button>
            <Button asChild variant="outline"><Link href={`${rotaAdmin(tipo, id)}/editar`}><Pencil className="h-4 w-4" aria-hidden /> Editar</Link></Button>
            {tipo !== "centro" && <Button variant="outline" onClick={duplicar}><Copy className="h-4 w-4" aria-hidden /> Duplicar</Button>}
            <Button variant="outline" className="text-red-700 dark:text-red-300" onClick={() => setExcluindo(true)}><Trash2 className="h-4 w-4" aria-hidden /> Excluir</Button>
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <CapaItem tipo={tipo} imagem={item.imagem_url} />
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{ITEM_TIPO_LABELS[tipo]}</Badge>
                {lotado && <Badge variant="destructive">Turma lotada</Badge>}
              </div>
              {item.descricao && <p className="text-base leading-relaxed">{item.descricao}</p>}
              <dl className="grid gap-4 sm:grid-cols-2">
                {item.fatos.filter((f) => f.valor && f.rotulo !== "Vagas").map((f) => (
                  <div key={f.rotulo}>
                    <dt className="text-sm text-muted-foreground">{f.rotulo}</dt>
                    <dd className="font-medium">{f.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {tipo === "centro" ? (
            demo && (
              <Bloco titulo="O que acontece nesta unidade">
                {naUnidade.length === 0 ? <p className="text-muted-foreground">Nada cadastrado nesta unidade ainda.</p> : (
                  <ul className="divide-y">
                    {naUnidade.map((v) => (
                      <li key={`${v.tipo}-${v.id}`}>
                        <Link href={rotaAdmin(v.tipo, v.id)} className="flex items-center justify-between gap-3 py-3 hover:underline">
                          <span className="min-w-0"><span className="block truncate font-medium">{v.nome}</span><span className="block truncate text-sm text-muted-foreground">{v.quando || v.local}</span></span>
                          <Badge variant="outline">{ITEM_TIPO_LABELS[v.tipo]}</Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Bloco>
            )
          ) : datas.length > 0 && (
            <Bloco titulo="Próximas datas" acao={<Button size="sm" variant="outline" onClick={() => baixarIcs(`${item.nome}.ics`, datas)}><CalendarPlus className="h-4 w-4" aria-hidden /> Adicionar ao calendário</Button>}>
              <ul className="divide-y">
                {datas.slice(0, 5).map((o) => (
                  <li key={o.chave} className="flex flex-wrap justify-between gap-2 py-2.5">
                    <span className="font-medium first-letter:uppercase">{dataExtenso(o.data)}</span>
                    <span className="text-muted-foreground">{faixaHorario(o.inicio, o.fim)}</span>
                  </li>
                ))}
              </ul>
              {datas.length > 5 && <p className="mt-2 text-sm text-muted-foreground">e mais {datas.length - 5} nos próximos dois meses.</p>}
            </Bloco>
          )}

          <Bloco titulo={`Inscritos (${inscritos.length})`} acao={<Button asChild size="sm" variant="outline"><Link href={`/portal/presenca/${tipo}/${id}`}>Gerenciar</Link></Button>}>
            {inscritos.length === 0 ? <p className="text-muted-foreground">Ninguém inscrito ainda.</p> : (
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {inscritos.slice(0, 8).map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden>{iniciais(p.profiles?.nome)}</span>
                    <span className="min-w-0 flex-1 truncate">{p.profiles?.nome ?? "Sem nome"}</span>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><span className={`h-2 w-2 rounded-full ${COR[p.status]}`} aria-hidden />{PRESENCA_LABELS[p.status]}</span>
                  </li>
                ))}
              </ul>
            )}
            {inscritos.length > 8 && <p className="mt-3 text-sm text-muted-foreground">e mais {inscritos.length - 8} pessoas.</p>}
          </Bloco>
        </div>

        <aside className="space-y-6">
          {item.vagas !== null && (
            <Bloco titulo="Vagas">
              <p className="text-3xl font-bold">{inscritos.length}<span className="text-lg font-normal text-muted-foreground"> de {item.vagas}</span></p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${ocupacao}% das vagas preenchidas`}>
                <div className={`h-full rounded-full ${ocupacao >= 100 ? "bg-rose-500" : ocupacao >= 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${ocupacao}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{lotado ? "Sem vagas livres" : `${(item.vagas ?? 0) - inscritos.length} vagas livres`}</p>
            </Bloco>
          )}

          {demo && espera.length > 0 && (
            <Bloco titulo={`Lista de espera (${espera.length})`}>
              <ol className="space-y-2">
                {espera.map((e, i) => <li key={e.id} className="flex gap-3"><span className="w-5 font-semibold text-muted-foreground">{i + 1}º</span>{nomeDe(e.cliente_id)}</li>)}
              </ol>
              <p className="mt-3 text-sm text-muted-foreground">Quando abre uma vaga, a primeira pessoa entra sozinha e recebe um aviso.</p>
            </Bloco>
          )}

          {inscritos.length > 0 && (
            <Bloco titulo="Presença">
              <ul className="space-y-2">
                {(["presente", "marcada", "ausente"] as PresencaStatus[]).map((s) => (
                  <li key={s} className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${COR[s]}`} aria-hidden />{PRESENCA_LABELS[s]}</span>
                    <span className="font-semibold">{n(s)}</span>
                  </li>
                ))}
              </ul>
            </Bloco>
          )}

          <Bloco titulo="Responsável">
            {item.responsavel ? (
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary" aria-hidden>{iniciais(item.responsavel)}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.responsavel}</p>
                  {voluntario?.email && <p className="truncate text-sm text-muted-foreground">{voluntario.email}</p>}
                </div>
              </div>
            ) : (
              <div>
                <p className="flex items-center gap-2 text-amber-800 dark:text-amber-300"><UserRound className="h-4 w-4" aria-hidden /> Ninguém definido</p>
                <Button asChild size="sm" variant="outline" className="mt-3"><Link href={`${rotaAdmin(tipo, id)}/editar`}>Escolher voluntário</Link></Button>
              </div>
            )}
          </Bloco>

        </aside>
      </div>

      <Confirmar
        aberto={excluindo}
        onFechar={() => setExcluindo(false)}
        titulo="Excluir este cadastro?"
        descricao={<>“{item.nome}” será removido. Esta ação não pode ser desfeita.</>}
        confirmarLabel="Excluir"
        perigoso
        onConfirmar={async () => {
          await API_DO_TIPO[tipo].excluir(id)
          notify.success("Cadastro excluído")
          router.push(`/portal/${ITEM_TIPO_TABLE[tipo]}`)
        }}
      />
    </div>
  )
}
