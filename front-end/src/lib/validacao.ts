export type Erros<T> = Partial<Record<keyof T, string>>

export const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === ""

export function obrigatorio(v: unknown, msg: string) {
  return vazio(v) ? msg : undefined
}

export function validarHorarios(inicio: string, fim: string): { inicio?: string; fim?: string } {
  const out: { inicio?: string; fim?: string } = {}
  if (!inicio) out.inicio = "Informe o horário de início"
  if (!fim) out.fim = "Informe o horário de término"
  if (inicio && fim && fim <= inicio) out.fim = "O término deve ser depois do início"
  return out
}

export function validarTelefone(v: string): string | undefined {
  if (vazio(v)) return undefined
  const d = v.replace(/\D/g, "")
  return d.length === 10 || d.length === 11 ? undefined : "Telefone incompleto. Use DDD + número"
}
