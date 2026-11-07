"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import PageHeader, { type Migalha } from "./page-header"
import Confirmar from "./confirmar"

/** Página de formulário: cabeçalho com migalhas, conteúdo em seções e barra de ações fixa. */
export default function FormShell({
  titulo,
  descricao,
  migalhas,
  voltarHref,
  sujo,
  salvando,
  rotuloSalvar,
  onSubmit,
  children,
}: {
  titulo: string
  descricao?: string
  migalhas: Migalha[]
  voltarHref: string
  sujo: boolean
  salvando: boolean
  rotuloSalvar: string
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
}) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)

  function cancelar() {
    if (sujo) setConfirmando(true)
    else router.push(voltarHref)
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-3xl space-y-6 pb-24">
      <PageHeader titulo={titulo} descricao={descricao} migalhas={migalhas} />
      {children}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-0">
          <p className="hidden text-sm text-muted-foreground sm:block" aria-live="polite">
            {sujo ? "Você tem alterações não salvas" : "Nenhuma alteração"}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button type="button" variant="outline" onClick={cancelar} className="flex-1 sm:flex-none">Cancelar</Button>
            <Button type="submit" disabled={salvando} className="flex-1 sm:flex-none sm:min-w-36">
              {salvando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {salvando ? "Salvando..." : rotuloSalvar}
            </Button>
          </div>
        </div>
      </div>

      <Confirmar
        aberto={confirmando}
        onFechar={() => setConfirmando(false)}
        titulo="Descartar alterações?"
        descricao="Você preencheu informações que ainda não foram salvas. Se sair agora, elas serão perdidas."
        confirmarLabel="Descartar e sair"
        perigoso
        onConfirmar={() => router.push(voltarHref)}
      />
    </form>
  )
}
