import Link from "next/link"
import { ChevronRight } from "lucide-react"

export type Migalha = { label: string; href?: string }

export default function PageHeader({
  titulo,
  descricao,
  migalhas,
  acoes,
}: {
  titulo: string
  descricao?: string
  migalhas?: Migalha[]
  acoes?: React.ReactNode
}) {
  return (
    <header className="space-y-3">
      {migalhas && migalhas.length > 0 && (
        <nav aria-label="Você está em" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            {migalhas.map((m, i) => (
              <li key={m.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
                {m.href ? (
                  <Link href={m.href} className="hover:text-foreground hover:underline">
                    {m.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-foreground">{m.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{titulo}</h1>
          {descricao && <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{descricao}</p>}
        </div>
        {acoes && <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div>}
      </div>
    </header>
  )
}
