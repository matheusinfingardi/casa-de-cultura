// Marcações de presença feitas sem internet ficam guardadas no aparelho e são enviadas depois.
import { atualizarStatusPresenca, type PresencaStatus } from "@/lib/services/presencas"

const CHAVE = "cc-fila-presenca"
const EVENTO = "cc-fila-mudou"
type Pendente = { id: string; status: PresencaStatus }

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

/** Marca a presença agora, ou guarda para enviar quando a internet voltar. */
export async function marcarPresenca(id: string, status: PresencaStatus): Promise<"enviado" | "guardado"> {
  if (!navigator.onLine) {
    gravar([...lerFila().filter((p) => p.id !== id), { id, status }])
    return "guardado"
  }
  await atualizarStatusPresenca(id, status)
  return "enviado"
}

export async function enviarFila(): Promise<number> {
  const fila = lerFila()
  let enviados = 0
  const restantes: Pendente[] = []
  for (const p of fila) {
    try {
      await atualizarStatusPresenca(p.id, p.status)
      enviados++
    } catch {
      restantes.push(p)
    }
  }
  gravar(restantes)
  return enviados
}
