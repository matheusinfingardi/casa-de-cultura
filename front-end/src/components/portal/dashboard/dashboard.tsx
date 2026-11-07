"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarCheck, CalendarPlus, ClipboardCheck, HandHeart, Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/auth-provider"
import PageHeader from "@/components/comum/page-header"
import { carregarDashboard, type DadosDashboard } from "@/lib/services/dashboard"
import { ocorrenciasDoMes, type TipoAgenda } from "@/lib/agenda"
import { chaveData } from "@/lib/formatar"
import { ITEM_TIPOS, type PresencaStatus } from "@/lib/services/presencas"
import AgendaDia from "./agenda-dia"
import CalendarioMes from "./calendario-mes"
import Kpis from "./kpis"
import { InscricoesPorTipo, OcupacaoOficinas, PrecisaAtencao, SituacaoPresencas, type Alerta } from "./paineis"

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"
}

export default function Dashboard() {
  const { user } = useAuth()
  const [dados, setDados] = useState<DadosDashboard | null>(null)
  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [selecionado, setSelecionado] = useState(chaveData(hoje))
  const [tipos, setTipos] = useState<Set<TipoAgenda>>(new Set(["evento", "atividade", "oficina"]))

  useEffect(() => { carregarDashboard().then(setDados) }, [])

  const nome = ((user?.user_metadata?.nome as string | undefined) ?? "").split(" ")[0]

  const ocorrencias = useMemo(
    () => (dados ? ocorrenciasDoMes({ eventos: dados.eventos, atividades: dados.atividades, oficinas: dados.oficinas }, ano, mes) : []),
    [dados, ano, mes]
  )
  const doDia = ocorrencias.filter((o) => o.data === selecionado && tipos.has(o.tipo))

  function mudarMes(delta: number) {
    const d = new Date(ano, mes + delta, 1)
    setAno(d.getFullYear()); setMes(d.getMonth())
    const agora = new Date()
    setSelecionado(d.getFullYear() === agora.getFullYear() && d.getMonth() === agora.getMonth() ? chaveData(agora) : chaveData(d))
  }
  function irParaHoje() {
    const a = new Date()
    setAno(a.getFullYear()); setMes(a.getMonth()); setSelecionado(chaveData(a))
  }
  function alternarTipo(t: TipoAgenda) {
    setTipos((prev) => { const n = new Set(prev); if (n.has(t)) n.delete(t); else n.add(t); return n })
  }

  const resumo = useMemo(() => {
    if (!dados) return null
    const contagem: Record<PresencaStatus, number> = { presente: 0, marcada: 0, ausente: 0 }
    const porTipo = Object.fromEntries(ITEM_TIPOS.map((t) => [t, 0])) as Record<string, number>
    const porItem: Record<string, number> = {}
    for (const p of dados.presencas) {
      contagem[p.status]++
      porTipo[p.item_tipo]++
      porItem[`${p.item_tipo}-${p.item_id}`] = (porItem[`${p.item_tipo}-${p.item_id}`] ?? 0) + 1
    }
    const assistidos = dados.usuarios.filter((u) => u.role === "cliente").length
    const voluntarios = dados.usuarios.filter((u) => u.role === "responsavel").length
    const validas = contagem.presente + contagem.ausente
    const hojeK = chaveData(new Date())
    const em30 = new Date(); em30.setDate(em30.getDate() + 30)
    const eventos30 = dados.eventos.filter((e) => e.data && e.data >= hojeK && e.data <= chaveData(em30)).length

    const semResp = (n: number, singular: string, plural: string, href: string): Alerta | null =>
      n ? { texto: `${n} ${n === 1 ? singular : plural} sem voluntário responsável`, href, acao: "Resolver" } : null
    const oficinasOcup = dados.oficinas.map((o) => ({ id: o.id, nome: o.nome, vagas: o.vagas, inscritos: porItem[`oficina-${o.id}`] ?? 0 }))
    const lotadas = oficinasOcup.filter((o) => o.vagas > 0 && o.inscritos >= o.vagas).length
    const alertas = [
      semResp(dados.eventos.filter((x) => !x.responsavel_id).length, "evento", "eventos", "/portal/eventos"),
      semResp(dados.atividades.filter((x) => !x.responsavel_id).length, "atividade", "atividades", "/portal/atividades"),
      semResp(dados.oficinas.filter((x) => !x.responsavel_id).length, "oficina", "oficinas", "/portal/oficinas"),
      semResp(dados.assistencias.filter((x) => !x.responsavel_id).length, "assistência", "assistências", "/portal/assistencia"),
      lotadas ? { texto: `${lotadas} ${lotadas === 1 ? "oficina lotada" : "oficinas lotadas"}`, href: "/portal/oficinas", acao: "Ver" } : null,
      voluntarios === 0 ? { texto: "Nenhum voluntário cadastrado ainda", href: "/portal/usuarios", acao: "Definir" } : null,
    ].filter(Boolean) as Alerta[]

    return {
      contagem, assistidos, voluntarios, eventos30, alertas, oficinasOcup,
      total: dados.presencas.length,
      taxa: validas ? `${Math.round((contagem.presente / validas) * 100)}%` : "—",
      porTipo: ITEM_TIPOS.map((t) => ({ tipo: t, total: porTipo[t] })).sort((a, b) => b.total - a.total),
    }
  }, [dados])

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={`${saudacao()}${nome ? `, ${nome}` : ""}!`}
        descricao={`${hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · Veja como está a Casa de Cultura hoje.`}
        acoes={
          <>
            <Button asChild><Link href="/portal/eventos/novo"><CalendarPlus className="h-4 w-4" aria-hidden /> Novo evento</Link></Button>
            <Button variant="outline" asChild><Link href="/portal/atividades/novo"><Plus className="h-4 w-4" aria-hidden /> Nova atividade</Link></Button>
          </>
        }
      />

      {!dados || !resumo ? (
        <div className="space-y-6" aria-busy="true" aria-label="Carregando visão geral">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
          <div className="grid gap-6 xl:grid-cols-3"><Skeleton className="h-[34rem] rounded-2xl xl:col-span-2" /><Skeleton className="h-[34rem] rounded-2xl" /></div>
        </div>
      ) : (
        <>
          <Kpis
            itens={[
              { rotulo: "Assistidos", valor: String(resumo.assistidos), detalhe: "contas cadastradas", icon: Users, tom: "bg-sky-100 text-sky-700" },
              { rotulo: "Voluntários", valor: String(resumo.voluntarios), detalhe: "com acesso ao painel", icon: HandHeart, tom: "bg-violet-100 text-violet-700" },
              { rotulo: "Inscrições", valor: String(resumo.total), detalhe: `${resumo.taxa} de presença entre os avaliados`, icon: ClipboardCheck, tom: "bg-amber-100 text-amber-700" },
              { rotulo: "Eventos em 30 dias", valor: String(resumo.eventos30), detalhe: "agendados a partir de hoje", icon: CalendarCheck, tom: "bg-emerald-100 text-emerald-700" },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <CalendarioMes
                ano={ano} mes={mes} ocorrencias={ocorrencias} selecionado={selecionado}
                onSelecionar={setSelecionado} onMudarMes={mudarMes} onHoje={irParaHoje}
                tiposAtivos={tipos} onAlternarTipo={alternarTipo}
              />
            </div>
            <div className="space-y-6">
              <AgendaDia data={selecionado} itens={doDia} />
              <PrecisaAtencao alertas={resumo.alertas} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <SituacaoPresencas contagem={resumo.contagem} />
            <InscricoesPorTipo dados={resumo.porTipo} />
            <OcupacaoOficinas itens={resumo.oficinasOcup} />
          </div>
        </>
      )}
    </div>
  )
}
