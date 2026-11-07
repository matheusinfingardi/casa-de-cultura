import { Building2, CalendarDays, HeartHandshake, Palette, Sparkles, type LucideIcon } from "lucide-react"
import type { ItemTipo } from "@/lib/services/presencas"

export const VISUAL: Record<ItemTipo, { icon: LucideIcon; fundo: string }> = {
  evento: { icon: CalendarDays, fundo: "from-violet-700 to-fuchsia-600" },
  atividade: { icon: Sparkles, fundo: "from-sky-700 to-cyan-600" },
  oficina: { icon: Palette, fundo: "from-amber-700 to-orange-600" },
  centro: { icon: Building2, fundo: "from-emerald-700 to-teal-600" },
  assistencia: { icon: HeartHandshake, fundo: "from-rose-700 to-pink-600" },
}

/** Faixa de capa do item: foto, se houver; senão a cor e o ícone do tipo. */
export default function CapaItem({ tipo, imagem, className = "h-36" }: { tipo: ItemTipo; imagem?: string; className?: string }) {
  const { icon: Icon, fundo } = VISUAL[tipo]
  if (imagem) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imagem} alt="" className={`w-full object-cover ${className}`} />
  }
  return (
    <div className={`flex w-full items-center justify-center bg-gradient-to-br ${fundo} ${className}`} aria-hidden>
      <Icon className="size-14 text-white/85" />
    </div>
  )
}
