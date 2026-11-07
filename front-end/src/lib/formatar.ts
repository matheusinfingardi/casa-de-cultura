import type { DiaSemana } from "@/lib/tipos"

export const DIAS_SEMANA: DiaSemana[] = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

// getDay(): 0 = domingo
export const DIA_POR_INDICE: DiaSemana[] = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

/** Aceita "Segunda", "segunda-feira", "TERCA", "Sabado"... e devolve o dia canônico (ou null). */
export function normalizarDia(valor: string | null | undefined): DiaSemana | null {
  if (!valor) return null
  const v = semAcento(valor).replace(/-?feira/, "").trim()
  return DIAS_SEMANA.find((d) => semAcento(d) === v) ?? null
}

export function chaveData(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** "2026-11-07" -> Date local (sem deslocamento de fuso). */
export function paraData(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number)
  return new Date(a, (m || 1) - 1, d || 1)
}

export function dataBR(iso: string | null | undefined) {
  if (!iso) return "—"
  return paraData(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function dataExtenso(iso: string) {
  return paraData(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
}

export function faixaHorario(inicio?: string | null, fim?: string | null) {
  if (!inicio && !fim) return "—"
  return `${(inicio ?? "").slice(0, 5)}${fim ? ` às ${fim.slice(0, 5)}` : ""}`
}

export function mascararTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function capitalizar(s: string | null | undefined) {
  if (!s) return "—"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function iniciais(nome: string | null | undefined) {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return "?"
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase()
}
