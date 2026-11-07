import {
  CalendarDays, Sparkles, Palette, HeartHandshake, Building2, LayoutDashboard, Users, LifeBuoy, Megaphone,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { title: string; url: string; icon: LucideIcon }
export type NavGrupo = { titulo: string; itens: NavItem[] }

/** Menu do portal da administração. Única fonte: sidebar, menu mobile e títulos usam isto. */
export const NAV_ADMIN: NavGrupo[] = [
  { titulo: "Visão geral", itens: [{ title: "Visão geral", url: "/portal", icon: LayoutDashboard }] },
  {
    titulo: "Programação",
    itens: [
      { title: "Eventos", url: "/portal/eventos", icon: CalendarDays },
      { title: "Atividades", url: "/portal/atividades", icon: Sparkles },
      { title: "Oficinas", url: "/portal/oficinas", icon: Palette },
    ],
  },
  {
    titulo: "Atendimento",
    itens: [
      { title: "Assistência", url: "/portal/assistencia", icon: HeartHandshake },
      { title: "Centros", url: "/portal/centros", icon: Building2 },
    ],
  },
  { titulo: "Pessoas", itens: [{ title: "Usuários", url: "/portal/usuarios", icon: Users }] },
  {
    titulo: "Suporte",
    itens: [
      { title: "Ajuda", url: "/portal/ajuda", icon: LifeBuoy },
      { title: "Atualizações", url: "/portal/atualizacoes", icon: Megaphone },
    ],
  },
]

export function tituloDaRota(pathname: string): string {
  const todos = NAV_ADMIN.flatMap((g) => g.itens).sort((a, b) => b.url.length - a.url.length)
  return todos.find((i) => (i.url === "/portal" ? pathname === "/portal" : pathname.startsWith(i.url)))?.title ?? "Portal"
}

export function rotaAtiva(pathname: string, url: string) {
  return url === "/portal" ? pathname === "/portal" : pathname === url || pathname.startsWith(url + "/")
}
