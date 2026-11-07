"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { usePessoasInfo } from "@/hooks/use-pessoas-info"
import { iniciais } from "@/lib/formatar"
import type { PresencaDoItem } from "@/lib/services/presencas"

/** Tabela de quem está inscrito e do que é preciso saber de cada pessoa. A presença fica no diário de cada dia. */
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
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input className="pl-10" placeholder="Buscar inscrito" aria-label="Buscar inscrito" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full">
          <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Pessoa</th>
              <th scope="col" className="px-3 py-3 font-semibold">Idade</th>
              <th scope="col" className="px-3 py-3 font-semibold">Bairro</th>
              <th scope="col" className="px-3 py-3 font-semibold">Dependentes</th>
              <th scope="col" className="min-w-72 px-4 py-3 font-semibold">Cuidados</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lista.map((p) => {
              const i = info(p.cliente_id)
              return (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <Link href={hrefPessoa(p.profiles?.dependente_de ?? p.cliente_id)} className="group flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden>{iniciais(p.profiles?.nome)}</span>
                      <span className="whitespace-nowrap font-medium group-hover:underline">{p.profiles?.nome ?? "Sem nome"}</span>
                    </Link>
                    {p.profiles?.dependente_de && <span className="ml-12 block text-sm text-muted-foreground">É dependente</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">{i.anos !== null ? `${i.anos} anos` : "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{i.bairro || "—"}</td>
                  <td className="px-3 py-2.5">
                    {i.familia ? <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-sky-100 px-2.5 py-1 text-sm font-medium text-sky-950 dark:bg-sky-900 dark:text-sky-50"><Users className="h-3.5 w-3.5" aria-hidden />{i.familia}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    {!i.cuidados.length && !i.cuidadosFamilia.length && <span className="text-muted-foreground">—</span>}
                    {i.cuidados.length > 0 && <span className="block font-medium">{i.cuidados.join(" · ")}</span>}
                    {i.cuidadosFamilia.map((c) => <span key={c.nome} className="block"><span className="font-medium">{c.nome}</span> <span className="text-muted-foreground">({c.parentesco}): {c.texto}</span></span>)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
