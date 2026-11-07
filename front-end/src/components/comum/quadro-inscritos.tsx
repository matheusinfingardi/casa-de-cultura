"use client"

import { useState } from "react"
import Link from "next/link"
import { Accessibility, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { usePessoasInfo } from "@/hooks/use-pessoas-info"
import { iniciais } from "@/lib/formatar"
import type { PresencaDoItem } from "@/lib/services/presencas"

/** Quem está inscrito e o que é preciso saber de cada pessoa. A presença fica no diário de cada dia. */
export default function QuadroInscritos({ inscritos, hrefPessoa, comSaude = true }: { inscritos: PresencaDoItem[]; hrefPessoa: (id: string) => string; comSaude?: boolean }) {
  const info = usePessoasInfo({ comSaude })
  const [busca, setBusca] = useState("")
  if (!inscritos.length) return <p className="text-muted-foreground">Ninguém inscrito ainda.</p>
  const t = busca.trim().toLowerCase()
  const lista = inscritos
    .filter((p) => !t || (p.profiles?.nome ?? "").toLowerCase().includes(t))
    .sort((a, b) => (a.profiles?.nome ?? "").localeCompare(b.profiles?.nome ?? "", "pt-BR"))
  return (
    <div className="space-y-3">
      {inscritos.length > 6 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-10" placeholder="Buscar inscrito" aria-label="Buscar inscrito" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      )}
      <ul className="divide-y">
        {lista.map((p) => {
          const i = info(p.cliente_id)
          return (
            <li key={p.id}>
              <Link href={hrefPessoa(p.profiles?.dependente_de ?? p.cliente_id)} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 hover:bg-muted/40">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden>{iniciais(p.profiles?.nome)}</span>
                <span className="min-w-40 flex-1">
                  <span className="block font-medium">{p.profiles?.nome ?? "Sem nome"}</span>
                  <span className="block text-sm text-muted-foreground">{i.subtitulo || p.profiles?.email}</span>
                </span>
                <span className="flex flex-wrap justify-end gap-1.5">
                  {i.familia && <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-sm font-medium text-sky-950 dark:bg-sky-900 dark:text-sky-50"><Users className="h-3.5 w-3.5" aria-hidden />Dependentes: {i.familia}</span>}
                  {i.cuidados.slice(0, 1).map((c) => <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-sm font-medium"><Accessibility className="h-3.5 w-3.5" aria-hidden />{c}</span>)}
                  {i.cuidadosFamilia.slice(0, 1).map((c) => <span key={c.nome} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-sm font-medium"><Accessibility className="h-3.5 w-3.5" aria-hidden />{c.nome} ({c.parentesco}): {c.texto}</span>)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
