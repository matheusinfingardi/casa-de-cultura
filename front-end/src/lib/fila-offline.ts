// Marcações feitas sem internet ficam guardadas no aparelho e são enviadas depois.
import { marcarDia, type StatusDia } from "@/lib/services/extras"
import { atualizarStatusPresenca, type ItemTipo, type PresencaStatus } from "@/lib/services/presencas"

const CHAVE = "cc-fila-presenca"
const EVENTO = "cc-fila-mudou"
type Pendente =
  | { kind: "status"; chave: string; id: string; status: PresencaStatus }
  | { kind: "dia"; chave: string; tipo: ItemTipo; itemId: string; data: string; clienteId: string; status: StatusDia | null }

export function lerFila(): Pendente[] {
  try { return JSON.parse(localStorage.getItem(CHAVE) ?? "[]") } catch { return [] }
}
function gravar(f: Pendente[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(f))
    window.dispatchEvent(new Event(EVENTO))
  } catch { /* sem armazenamento */ }
}
export function assinarFila(cb: () => void) {
  window.addEventListener(EVENTO, cb)
  window.addEventListener("online", cb)
  window.addEventListener("offline", cb)
  return () => {
    window.removeEventListener(EVENTO, cb)
    window.removeEventListener("online", cb)
    window.removeEventListener("offline", cb)
  }
}
function guardar(p: Pendente) {
  gravar([...lerFila().filter((x) => x.chave !== p.chave), p])
}

/** Marca a situação geral agora, ou guarda para enviar quando a internet voltar. */
export async function marcarPresenca(id: string, status: PresencaStatus): Promise<"enviado" | "guardado"> {
  if (!navigator.onLine) { guardar({ kind: "status", chave: `s-${id}`, id, status }); return "guardado" }
  await atualizarStatusPresenca(id, status)
  return "enviado"
}

/** Marca presença ou falta em um dia específico, com a mesma proteção. */
export async function marcarPresencaDia(tipo: ItemTipo, itemId: string, data: string, clienteId: string, status: StatusDia | null): Promise<"enviado" | "guardado"> {
  if (!navigator.onLine) { guardar({ kind: "dia", chave: `d-${itemId}-${data}-${clienteId}`, tipo, itemId, data, clienteId, status }); return "guardado" }
  await marcarDia(tipo, itemId, data, clienteId, status)
  return "enviado"
}

export async function enviarFila(): Promise<number> {
  let enviados = 0
  const restantes: Pendente[] = []
  for (const p of lerFila()) {
    try {
      if (p.kind === "dia") await marcarDia(p.tipo, p.itemId, p.data, p.clienteId, p.status)
      else await atualizarStatusPresenca(p.id, p.status)
      enviados++
    } catch { restantes.push(p) }
  }
  gravar(restantes)
  return enviados
}
