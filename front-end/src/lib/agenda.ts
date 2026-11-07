import { DIAS_SEMANA, DIA_POR_INDICE, chaveData, normalizarDia, paraData } from "@/lib/formatar"
import type { Atividade, DiaSemana, Evento, Horario, Oficina, Recorrencia } from "@/lib/tipos"

export type TipoAgenda = "evento" | "atividade" | "oficina"

export const TIPO_AGENDA_INFO: Record<TipoAgenda, { label: string; plural: string; cor: string; ponto: string; chip: string }> = {
  evento: { label: "Evento", plural: "Eventos", cor: "text-violet-700", ponto: "bg-violet-500", chip: "bg-violet-100 text-violet-900 dark:bg-violet-900 dark:text-violet-100" },
  atividade: { label: "Atividade", plural: "Atividades", cor: "text-sky-700", ponto: "bg-sky-500", chip: "bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100" },
  oficina: { label: "Oficina", plural: "Oficinas", cor: "text-amber-700", ponto: "bg-amber-500", chip: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100" },
}

export type Ocorrencia = {
  chave: string // única por (item, data)
  itemId: string
  tipo: TipoAgenda
  titulo: string
  data: string // AAAA-MM-DD
  inicio: string
  fim: string
  local: string
  responsavel: string
  href: string
}

const ROTA: Record<TipoAgenda, string> = { evento: "/portal/eventos", atividade: "/portal/atividades", oficina: "/portal/oficinas" }

/**
 * Converte o JSON salvo em `atividades.recorrencia` para o formato canônico.
 * Tolera o que já existe no banco: "unica"/"Unica", "semanal"/"Semanal",
 * dias como "Segunda" ou "Segunda-feira", e `dias[]` sem horários.
 */
export function normalizarRecorrencia(raw: unknown): Recorrencia {
  const r = (raw ?? {}) as Record<string, unknown>
  const tipo = String(r.tipo ?? "").toLowerCase()

  if (tipo === "semanal") {
    const horarios: Partial<Record<DiaSemana, Horario>> = {}
    const origem = (r.horarios ?? {}) as Record<string, Partial<Horario>>
    for (const [chave, h] of Object.entries(origem)) {
      const dia = normalizarDia(chave)
      if (dia) horarios[dia] = { horarioInicio: h?.horarioInicio ?? "", horarioFim: h?.horarioFim ?? "" }
    }
    for (const d of (Array.isArray(r.dias) ? r.dias : []) as string[]) {
      const dia = normalizarDia(d)
      if (dia && !horarios[dia]) horarios[dia] = { horarioInicio: "", horarioFim: "" }
    }
    return { tipo: "Semanal", horarios }
  }

  return {
    tipo: "Unica",
    data: String(r.data ?? ""),
    horarioInicio: String(r.horarioInicio ?? ""),
    horarioFim: String(r.horarioFim ?? ""),
  }
}

/** Texto curto: "Toda segunda e quarta, 18:00 às 19:30" / "12/11/2026, 14:00 às 16:00". */
export function resumoRecorrencia(rec: Recorrencia): string {
  if (rec.tipo === "Unica") {
    if (!rec.data) return "Sem data definida"
    const d = paraData(rec.data).toLocaleDateString("pt-BR")
    return rec.horarioInicio ? `${d}, ${rec.horarioInicio} às ${rec.horarioFim}` : d
  }
  const dias = DIAS_SEMANA.filter((d) => rec.horarios[d])
  if (!dias.length) return "Nenhum dia escolhido"
  const horas = new Set(dias.map((d) => `${rec.horarios[d]!.horarioInicio}-${rec.horarios[d]!.horarioFim}`))
  const nomes = dias.map((d) => d.toLowerCase())
  const lista = nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}` : nomes[0]
  if (horas.size === 1) {
    const h = rec.horarios[dias[0]]!
    return `Toda ${lista}${h.horarioInicio ? `, ${h.horarioInicio} às ${h.horarioFim}` : ""}`
  }
  return `Toda ${lista} (horários diferentes)`
}

function diasDoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate()
}

type Fontes = { eventos: Evento[]; atividades: Atividade[]; oficinas: Oficina[] }

/** Todas as ocorrências que caem entre `de` e `ate` (inclusive), ordenadas por data e hora. */
export function ocorrenciasNoPeriodo(f: Fontes, de: Date, ate: Date): Ocorrencia[] {
  const out: Ocorrencia[] = []
  const deK = chaveData(de)
  const ateK = chaveData(ate)
  const dentro = (k: string) => k >= deK && k <= ateK

  for (const e of f.eventos) {
    if (e.data && dentro(e.data.slice(0, 10))) {
      out.push({ chave: `evento-${e.id}`, itemId: e.id, tipo: "evento", titulo: e.nome, data: e.data.slice(0, 10), inicio: e.horarioInicio ?? "", fim: e.horarioFim ?? "", local: e.local ?? "", responsavel: e.responsavel ?? "", href: `${ROTA.evento}/${e.id}` })
    }
  }

  const dias: Date[] = []
  for (let d = new Date(de.getFullYear(), de.getMonth(), de.getDate()); d <= ate; d.setDate(d.getDate() + 1)) dias.push(new Date(d))

  for (const a of f.atividades) {
    const rec = normalizarRecorrencia(a.recorrencia)
    const base = { itemId: a.id, tipo: "atividade" as const, titulo: a.nome, local: a.local ?? "", responsavel: a.responsavel ?? "", href: `${ROTA.atividade}/${a.id}` }
    if (rec.tipo === "Unica") {
      if (rec.data && dentro(rec.data)) out.push({ ...base, chave: `atividade-${a.id}-${rec.data}`, data: rec.data, inicio: rec.horarioInicio, fim: rec.horarioFim })
    } else {
      for (const d of dias) {
        const h = rec.horarios[DIA_POR_INDICE[d.getDay()]]
        if (h) out.push({ ...base, chave: `atividade-${a.id}-${chaveData(d)}`, data: chaveData(d), inicio: h.horarioInicio, fim: h.horarioFim })
      }
    }
  }

  for (const o of f.oficinas) {
    const dia = normalizarDia(o.dia)
    if (!dia) continue
    for (const d of dias) {
      if (DIA_POR_INDICE[d.getDay()] === dia) {
        out.push({ chave: `oficina-${o.id}-${chaveData(d)}`, itemId: o.id, tipo: "oficina", titulo: o.nome, data: chaveData(d), inicio: o.horarioInicio ?? "", fim: o.horarioFim ?? "", local: o.local ?? "", responsavel: o.responsavel ?? "", href: `${ROTA.oficina}/${o.id}` })
      }
    }
  }

  return out.sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio))
}

export function ocorrenciasDoMes(f: Fontes, ano: number, mes: number) {
  return ocorrenciasNoPeriodo(f, new Date(ano, mes, 1), new Date(ano, mes, diasDoMes(ano, mes)))
}

/** Grade de 6 semanas (42 células) começando no domingo, incluindo dias dos meses vizinhos. */
export function gradeDoMes(ano: number, mes: number): { data: Date; doMes: boolean }[] {
  const primeiro = new Date(ano, mes, 1)
  const inicio = new Date(ano, mes, 1 - primeiro.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
    return { data: d, doMes: d.getMonth() === mes }
  })
}
