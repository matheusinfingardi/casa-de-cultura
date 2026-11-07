"use client"

import { useEffect } from "react"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center" role="alert">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700"><TriangleAlert className="h-7 w-7" aria-hidden /></span>
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <p className="max-w-sm text-sm text-muted-foreground">Ocorreu um problema inesperado. Tente novamente; se continuar, avise o Suporte Técnico (menu Ajuda).</p>
      {error.digest && <p className="text-xs text-muted-foreground">Código do erro: {error.digest}</p>}
      <Button onClick={reset}>Tentar novamente</Button>
    </main>
  )
}
