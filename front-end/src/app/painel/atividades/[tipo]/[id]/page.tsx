"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { ArrowRight, ClipboardCheck, SearchX } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/auth-provider"
import CapaItem from "@/components/comum/capa-item"
import EstadoVazio from "@/components/comum/estado-vazio"
import DiarioPresenca from "@/components/comum/diario-presenca"
import QuadroInscritos from "@/components/comum/quadro-inscritos"
import AbasItem, { lerAba, type AbaItem } from "@/components/comum/abas-item"
import CertificadosGestao from "@/components/comum/certificados-gestao"
import MapaLocal from "@/components/comum/mapa-local"
import PageHeader from "@/components/comum/page-header"
import { useDemo } from "@/hooks/use-demo"
import { chaveData, faixaHorario, paraData } from "@/lib/formatar"
import { carregarItem, datasDoItem, listarItensView, enderecoDaUnidade, enderecoDoMapa, type ItemView } from "@/lib/itens"
import { listarEspera, registrosDoItem, type Espera, type Registro } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, isItemTipo, listarPresencasDoItem, type ItemTipo, type PresencaDoItem } from "@/lib/services/presencas"

function Bloco({ titulo, children, acao }: { titulo: string; children: React.ReactNode; acao?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{titulo}</h2>{acao}</div>
      {children}
    </section>
  )
}

/** Página de acompanhamento de uma atividade do voluntário. */
export default function AtividadeVoluntarioPage() {
  const { tipo, id } = useParams<{ tipo: string; id: string }>()
  const { user } = useAuth()
  const demo = useDemo()
  const params = useSearchParams()
  const abas: [AbaItem, string][] = [["geral", "Visão geral"], ["inscritos", "Inscritos"], ["diario", "Diário de presença"], ["certificados", "Certificados"]]
  const [aba, setAba] = useState<AbaItem>(lerAba(params.get("aba"), abas))
  const [meus, setMeus] = useState<ItemView[]>([])
  const [item, setItem] = useState<ItemView | null | undefined>(undefined)
  const [inscritos, setInscritos] = useState<PresencaDoItem[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [espera, setEspera] = useState<Espera[]>([])
  const [endUnidade, setEndUnidade] = useState<string | undefined>()

  useEffect(() => {
    ;(isItemTipo(tipo) ? carregarItem(tipo as ItemTipo, id) : Promise.resolve(null)).then((i) => {
      setItem(i)
      if (!i) return
      listarPresencasDoItem(i.tipo, i.id).then(setInscritos)
      enderecoDaUnidade(i).then(setEndUnidade)
    })
  }, [tipo, id])
  useEffect(() => {
    if (user) listarItensView().then((l) => setMeus(l.filter((i) => i.responsavel_id === user.id)))
  }, [user])
  useEffect(() => {
    if (!demo || !isItemTipo(tipo)) return
    registrosDoItem(tipo as ItemTipo, id).then(setRegistros)
    listarEspera(tipo as ItemTipo, id).then(setEspera)
  }, [demo, tipo, id])

  const hoje = chaveData(new Date())
  const datas = useMemo(() => (item ? datasDoItem(item, 28, 21) : []), [item])
  const passadas = datas.filter((o) => o.data <= hoje).reverse()
  const futuras = datas.filter((o) => o.data > hoje)

  if (item === undefined) return <Skeleton className="h-96 rounded-2xl" />
  if (!item || item.responsavel_id !== user?.id) {
    return <EstadoVazio icon={SearchX} titulo="Atividade não encontrada" texto="Ela não existe ou não está sob sua responsabilidade." acao={<Button asChild variant="outline"><Link href="/painel/atividades">Voltar</Link></Button>} />
  }

  const feitas = new Set(registros.map((r) => r.data))
  const pendentes = passadas.filter((o) => !feitas.has(o.data)).length

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={item.nome}
        descricao={item.quando || ITEM_TIPO_LABELS[item.tipo]}
        migalhas={[{ label: "Minhas atividades", href: "/painel/atividades" }, { label: item.nome }]}
        acoes={<Button asChild><Link href={`/painel/presenca/${item.tipo}/${item.id}`}><ClipboardCheck className="h-4 w-4" aria-hidden /> Abrir chamada</Link></Button>}
      />
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[[inscritos.length, item.vagas ? `inscritos de ${item.vagas} vagas` : "inscritos"], [feitas.size, "encontros feitos"], [pendentes, pendentes === 1 ? "chamada pendente" : "chamadas pendentes"], [futuras.length, "próximos encontros"]].map(([v, r]) => (
          <li key={r as string} className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-3xl font-bold">{v}</p><p className="text-muted-foreground">{r}</p></li>
        ))}
      </ul>

      <AbasItem abas={abas} atual={aba} onChange={setAba} />

      {aba === "inscritos" && (
        <Bloco titulo={`Inscritos (${inscritos.length})`} acao={<Link href="/painel/assistidos" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">Meus assistidos <ArrowRight className="h-4 w-4" aria-hidden /></Link>}>
          <QuadroInscritos inscritos={inscritos} hrefPessoa={(p) => `/painel/assistidos/${p}`} comSaude={false} />
        </Bloco>
      )}
      {aba === "diario" && <DiarioPresenca item={item} registros={registros} hrefChamada={(d) => `/painel/presenca/${item.tipo}/${item.id}?data=${d}`} />}
      {aba === "certificados" && <CertificadosGestao itens={meus} itemFixo={item} autor={(user?.user_metadata?.nome as string) ?? "Voluntário"} hrefVer={(c) => `/painel/certificado/${c}`} />}

      {aba === "geral" && <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MapaLocal endereco={enderecoDoMapa(item, endUnidade)} />
        </div>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <CapaItem tipo={item.tipo} imagem={item.imagem_url} className="h-40" />
            <div className="space-y-2 p-4">
              <Badge variant="secondary">{ITEM_TIPO_LABELS[item.tipo]}</Badge>
              {item.descricao && <p>{item.descricao}</p>}
              {item.local && <p className="text-muted-foreground">{item.local}</p>}
            </div>
          </section>
          {futuras.length > 0 && (
            <Bloco titulo="Próximas datas">
              <ul className="space-y-2">
                {futuras.slice(0, 4).map((o) => <li key={o.chave}><p className="font-medium">{paraData(o.data).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}</p><p className="text-sm text-muted-foreground">{faixaHorario(o.inicio, o.fim)}</p></li>)}
              </ul>
            </Bloco>
          )}
          {espera.length > 0 && <Bloco titulo="Lista de espera"><p>{espera.length} {espera.length === 1 ? "pessoa aguardando vaga" : "pessoas aguardando vaga"}.</p></Bloco>}
        </aside>
      </div>}
    </div>
  )
}
