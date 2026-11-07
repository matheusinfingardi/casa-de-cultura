import Link from "next/link"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ItemTipo } from "@/lib/services/presencas"

/** Botão "Inscritos" que leva à gestão de presença daquele item. */
export function BotaoInscritos({ tipo, id, nome }: { tipo: ItemTipo; id: string; nome: string }) {
  return (
    <Button size="sm" variant="outline" asChild>
      <Link href={`/portal/presenca/${tipo}/${id}`} aria-label={`Ver inscritos de ${nome}`}>
        <Users className="h-3.5 w-3.5" aria-hidden /> Inscritos
      </Link>
    </Button>
  )
}

export function SemResponsavel() {
  return <span className="text-amber-700">Sem responsável</span>
}
