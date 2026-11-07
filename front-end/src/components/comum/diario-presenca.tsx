"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { chaveData, dataExtenso, faixaHorario } from "@/lib/formatar"
import { datasDoItem, type ItemView } from "@/lib/itens"
import type { Registro } from "@/lib/services/extras"

const INICIAL = 6

/** A presença é sempre de um dia: cada linha abre a chamada daquela data. */
export default function DiarioPresenca({ item, registros, hrefChamada }: { item: ItemView; registros: Registro[]; hrefChamada: (data: string) => string }) {
  const [tudo, setTudo] = useState(false)
  const hoje = chaveData(new Date())
  const reais = datasDoItem(item, 60, 0).map((o) => ({ data: o.data, inicio: o.inicio, fim: o.fim }))
  // Assistência e centros não têm dia fixo: valem os dias já atendidos.
  const dias = (reais.length ? reais : [...new Set(registros.map((r) => r.data))].map((data) => ({ data, inicio: "", fim: "" })))
    .filter((d) => d.data <= hoje)
    .sort((a, b) => b.data.localeCompare(a.data))
  const visiveis = tudo ? dias : dias.slice(0, INICIAL)
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Diário de presença</h2>
      <p className="mb-3 text-muted-foreground">Abra um dia para ver ou fazer a chamada.</p>
      {dias.length === 0 ? <p className="text-muted-foreground">Ainda não houve encontros.</p> : (
        <ul className="divide-y">
          {visiveis.map((d) => {
            const doDia = registros.filter((r) => r.data === d.data)
            const presentes = doDia.filter((r) => r.status === "presente").length
            return (
              <li key={d.data} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="font-medium first-letter:uppercase">{d.data === hoje ? "Hoje" : dataExtenso(d.data)}</p>
                  {d.inicio && <p className="text-sm text-muted-foreground">{faixaHorario(d.inicio, d.fim)}</p>}
                </div>
                {doDia.length ? (
                  <Link href={hrefChamada(d.data)} className="hover:underline"><span className="font-semibold tabular-nums">{presentes} de {doDia.length}</span> <span className="text-muted-foreground">vieram</span></Link>
                ) : (
                  <Button asChild size="sm" variant="outline"><Link href={hrefChamada(d.data)}>Fazer chamada</Link></Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {dias.length > INICIAL && <Button size="sm" variant="ghost" className="mt-2" onClick={() => setTudo(!tudo)}>{tudo ? "Mostrar menos" : `Ver os ${dias.length} dias`}</Button>}
    </section>
  )
}
