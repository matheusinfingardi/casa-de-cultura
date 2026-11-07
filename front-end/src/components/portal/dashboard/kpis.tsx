import type { LucideIcon } from "lucide-react"

export type Kpi = { rotulo: string; valor: string; detalhe?: string; icon: LucideIcon; tom: string }

export default function Kpis({ itens }: { itens: Kpi[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {itens.map((k) => (
        <li key={k.rotulo} className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-muted-foreground">{k.rotulo}</p>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${k.tom}`}><k.icon className="h-4.5 w-4.5" aria-hidden /></span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">{k.valor}</p>
          {k.detalhe && <p className="mt-0.5 text-xs text-muted-foreground">{k.detalhe}</p>}
        </li>
      ))}
    </ul>
  )
}
