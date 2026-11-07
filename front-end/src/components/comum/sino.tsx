"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDemo } from "@/hooks/use-demo"
import { listarNotificacoes, marcarNotificacoesLidas, type Notificacao } from "@/lib/services/extras"

/** Sino de avisos dentro do app. */
export default function Sino() {
  const demo = useDemo()
  const [itens, setItens] = useState<Notificacao[]>([])

  useEffect(() => {
    if (demo) listarNotificacoes().then(setItens)
  }, [demo])

  if (!demo) return null
  const novas = itens.filter((n) => !n.lida).length

  return (
    <DropdownMenu
      onOpenChange={(aberto) => {
        if (!aberto && novas) {
          marcarNotificacoesLidas()
          setItens((p) => p.map((n) => ({ ...n, lida: true })))
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={novas ? `Avisos: ${novas} novos` : "Avisos"}>
          <Bell className="size-5" aria-hidden />
          {novas > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">{novas}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-2">
        <p className="px-2 py-1.5 font-semibold">Avisos</p>
        {itens.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">Nenhum aviso por enquanto.</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {itens.slice(0, 8).map((n) => (
              <li key={n.id}>
                <Link href={n.href ?? "#"} className="block rounded-lg px-2 py-2 hover:bg-muted">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {!n.lida && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Novo" />}
                    {n.titulo}
                  </span>
                  <span className="block text-sm text-muted-foreground">{n.texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
