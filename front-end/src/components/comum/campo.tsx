"use client"

import { useId } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type PropsFilho = { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }

/** Rótulo + controle + dica + erro, com os ids/ARIA ligados corretamente. */
export function Campo({
  label,
  obrigatorio,
  dica,
  erro,
  className,
  children,
}: {
  label: string
  obrigatorio?: boolean
  dica?: string
  erro?: string
  className?: string
  children: (props: PropsFilho) => React.ReactNode
}) {
  const id = useId()
  const descId = `${id}-desc`
  const temTexto = !!(erro || dica)
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {obrigatorio && <span className="text-red-600" aria-hidden> *</span>}
        {obrigatorio && <span className="sr-only"> (obrigatório)</span>}
      </Label>
      {children({ id, "aria-invalid": erro ? true : undefined, "aria-describedby": temTexto ? descId : undefined })}
      {temTexto && (
        <p id={descId} className={cn("text-xs", erro ? "text-red-600" : "text-muted-foreground")} role={erro ? "alert" : undefined}>
          {erro ?? dica}
        </p>
      )}
    </div>
  )
}

export function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold">{titulo}</h2>
        {descricao && <p className="text-sm text-muted-foreground mt-0.5">{descricao}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}
