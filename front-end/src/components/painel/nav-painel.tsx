"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ClipboardList, Search, type LucideIcon } from "lucide-react"
import type { Role } from "@/lib/services/usuarios"

type Item = { titulo: string; url: string; icon: LucideIcon }

const ASSISTIDO: Item[] = [
  { titulo: "Início", url: "/painel", icon: Home },
  { titulo: "Minhas inscrições", url: "/painel/inscricoes", icon: ClipboardList },
  { titulo: "Explorar", url: "/painel/explorar", icon: Search },
]

// Voluntário tem uma única tela de trabalho; sem barra de abas.
export default function NavPainel({ role }: { role: Role | null }) {
  const pathname = usePathname()
  if (role !== "cliente") return null

  return (
    <nav
      aria-label="Navegação do painel"
      className="border-b bg-background px-2 md:px-8"
    >
      <ul className="flex gap-1 overflow-x-auto max-w-4xl mx-auto">
        {ASSISTIDO.map((item) => {
          const ativo = pathname === item.url
          return (
            <li key={item.url}>
              <Link
                href={item.url}
                aria-current={ativo ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap px-3 h-12 text-sm font-medium border-b-2 transition-colors ${
                  ativo
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
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
