import Link from "next/link"
import { CalendarX2, Clock, MapPin } from "lucide-react"
import { dataExtenso, faixaHorario } from "@/lib/formatar"
import { TIPO_AGENDA_INFO, type Ocorrencia } from "@/lib/agenda"

export default function AgendaDia({ data, itens, detalhe }: { data: string; itens: Ocorrencia[]; detalhe?: (o: Ocorrencia) => React.ReactNode }) {
  return (
    <section aria-label="Agenda do dia" className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold first-letter:uppercase">{dataExtenso(data)}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{itens.length ? `${itens.length} compromisso${itens.length > 1 ? "s" : ""}` : "Nada marcado para este dia"}</p>
      {itens.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
          <CalendarX2 className="h-8 w-8" aria-hidden />
          Dia livre. Escolha outro dia no calendário.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {itens.map((o) => (
            <li key={o.chave} className="flex flex-col rounded-xl border transition-colors hover:border-primary">
              <Link href={o.href} className="block flex-1 rounded-xl p-3 transition-colors hover:bg-muted">
                <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_AGENDA_INFO[o.tipo].chip}`}>{TIPO_AGENDA_INFO[o.tipo].label}</span>
                <span className="block font-medium">{o.titulo}</span>
                <span className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" aria-hidden />{faixaHorario(o.inicio, o.fim)}</span>
                {o.local && <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" aria-hidden />{o.local}</span>}
              </Link>
              {detalhe && <div className="border-t p-3">{detalhe(o)}</div>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
