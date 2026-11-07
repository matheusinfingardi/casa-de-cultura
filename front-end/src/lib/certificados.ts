import { datasDoItem, type ItemView } from "@/lib/itens"

const minutos = (h: string) => { const [a, b] = h.split(":").map(Number); return a * 60 + (b || 0) }

/** Soma as horas de uma lista de datas do item. Só conta datas com horário conhecido. */
export function horasNasDatas(item: ItemView, datas: string[]): number {
  const conhecidas = datasDoItem(item, 400, 0)
  const total = datas.reduce((s, d) => {
    const o = conhecidas.find((x) => x.data === d)
    return s + (o?.inicio && o.fim ? minutos(o.fim) - minutos(o.inicio) : 0)
  }, 0)
  return Math.round(total / 30) / 2
}

export const horasEmTexto = (h: number) => `${String(h).replace(".", ",")} ${h === 1 ? "hora" : "horas"}`
