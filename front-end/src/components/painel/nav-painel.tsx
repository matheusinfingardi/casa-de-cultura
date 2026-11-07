"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardCheck, ClipboardList, Home, LifeBuoy, Search, type LucideIcon } from "lucide-react"
import type { Role } from "@/lib/services/usuarios"

type Item = { titulo: string; url: string; icon: LucideIcon }

const ASSISTIDO: Item[] = [
  { titulo: "Início", url: "/painel", icon: Home },
  { titulo: "Minhas inscrições", url: "/painel/inscricoes", icon: ClipboardList },
  { titulo: "Explorar", url: "/painel/explorar", icon: Search },
  { titulo: "Ajuda", url: "/painel/ajuda", icon: LifeBuoy },
]

const VOLUNTARIO: Item[] = [
  { titulo: "Meus compromissos", url: "/painel", icon: ClipboardCheck },
  { titulo: "Ajuda", url: "/painel/ajuda", icon: LifeBuoy },
]

export default function NavPainel({ role }: { role: Role | null }) {
  const pathname = usePathname()
  const itens = role === "responsavel" ? VOLUNTARIO : ASSISTIDO

  return (
    <nav aria-label="Navegação do painel" className="border-b bg-background">
      <ul className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-1 md:px-7">
        {itens.map((item) => {
          const ativo = pathname === item.url || (item.url === "/painel" && pathname.startsWith("/painel/presenca"))
          return (
            <li key={item.url}>
              <Link
                href={item.url}
                aria-current={ativo ? "page" : undefined}
                className={`flex h-12 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors ${ativo ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.titulo}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
