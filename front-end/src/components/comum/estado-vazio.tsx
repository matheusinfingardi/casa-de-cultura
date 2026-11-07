import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

export default function EstadoVazio({
  icon: Icon,
  titulo,
  texto,
  acao,
}: {
  icon: LucideIcon
  titulo: string
  texto?: string
  acao?: React.ReactNode
}) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <div>
        <p className="font-semibold">{titulo}</p>
        {texto && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{texto}</p>}
      </div>
      {acao}
    </Card>
  )
}
