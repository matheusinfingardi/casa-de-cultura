import type { Registro } from "@/lib/services/extras"

export type Assiduidade = { total: number; presentes: number; faltas: number; taxa: number | null; faltasSeguidas: number; ultimaPresenca: string | null }

/** Resumo da frequência de uma pessoa ou item. Faltas seguidas contam a partir do registro mais recente. */
export function calcularAssiduidade(regs: Pick<Registro, "data" | "status">[]): Assiduidade {
  const ordenados = [...regs].sort((a, b) => b.data.localeCompare(a.data))
  const presentes = ordenados.filter((r) => r.status === "presente")
  let faltasSeguidas = 0
  for (const r of ordenados) {
    if (r.status !== "ausente") break
    faltasSeguidas++
  }
  return {
    total: ordenados.length,
    presentes: presentes.length,
    faltas: ordenados.length - presentes.length,
    taxa: ordenados.length ? Math.round((presentes.length / ordenados.length) * 100) : null,
    faltasSeguidas,
    ultimaPresenca: presentes[0]?.data ?? null,
  }
}

export type SituacaoAssiduidade = { rotulo: string; classe: string }
export function situacao(a: Assiduidade): SituacaoAssiduidade {
  if (a.taxa === null) return { rotulo: "Sem registros", classe: "bg-muted text-muted-foreground" }
  if (a.faltasSeguidas >= 3 || a.taxa < 50) return { rotulo: "Precisa de contato", classe: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100" }
  if (a.taxa < 75) return { rotulo: "Irregular", classe: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100" }
  return { rotulo: "Frequente", classe: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100" }
}

export function idade(nascimento: string | null | undefined): number | null {
  if (!nascimento) return null
  const n = new Date(nascimento + "T12:00:00")
  const h = new Date()
  let a = h.getFullYear() - n.getFullYear()
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) a--
  return a
}
