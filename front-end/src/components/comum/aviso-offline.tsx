"use client"

import { useEffect, useSyncExternalStore } from "react"
import { CloudOff, RefreshCw } from "lucide-react"
import { assinarFila, enviarFila, lerFila } from "@/lib/fila-offline"
import { notify } from "@/lib/notify"

const contar = () => `${typeof navigator !== "undefined" && navigator.onLine ? 1 : 0}-${lerFila().length}`

/** Mostra quando não há internet e envia as marcações guardadas assim que a conexão volta. */
export default function AvisoOffline({ aoEnviar }: { aoEnviar?: () => void }) {
  const estado = useSyncExternalStore(assinarFila, contar, () => "1-0")
  const [online, pendentes] = estado.split("-").map(Number)

  useEffect(() => {
    if (online && pendentes > 0) {
      enviarFila().then((n) => {
        if (n) { notify.success(`${n} ${n === 1 ? "marcação enviada" : "marcações enviadas"}`); aoEnviar?.() }
      })
    }
  }, [online, pendentes, aoEnviar])

  if (online && !pendentes) return null
  return (
    <p role="status" className="flex items-center gap-2 rounded-xl bg-amber-100 p-3 text-amber-950 dark:bg-amber-900 dark:text-amber-50">
      {online ? <RefreshCw className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : <CloudOff className="h-4 w-4 shrink-0" aria-hidden />}
      {online
        ? "Enviando marcações guardadas…"
        : `Sem internet. Pode continuar marcando${pendentes ? `: ${pendentes} ${pendentes === 1 ? "marcação guardada" : "marcações guardadas"}` : ""}. Enviamos quando a conexão voltar.`}
    </p>
  )
}
