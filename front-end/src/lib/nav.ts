import {
  Activity, BarChart3, Building2, CalendarDays, CalendarRange, HeartHandshake, History, LayoutDashboard,
  LifeBuoy, Megaphone, Palette, Send, Sparkles, Users, type LucideIcon, HandHeart, UserCog, Award } from "lucide-react"

export type NavItem = { title: string; url: string; icon: LucideIcon; soDemo?: boolean }
export type NavGrupo = { titulo: string; itens: NavItem[] }

/** Menu do portal da administração. Única fonte: sidebar, menu mobile e títulos usam isto. */
export const NAV_ADMIN: NavGrupo[] = [
  {
    titulo: "Início",
    itens: [
      { title: "Visão geral", url: "/portal", icon: LayoutDashboard },
      { title: "Agenda", url: "/portal/agenda", icon: CalendarRange },
    ],
  },
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
  {
    titulo: "Gestão",
    itens: [
      { title: "Assistidos", url: "/portal/assistidos", icon: Users },
      { title: "Voluntários", url: "/portal/voluntarios", icon: HandHeart },
      { title: "Certificados", url: "/portal/certificados", icon: Award },
      { title: "Relatórios", url: "/portal/relatorios", icon: BarChart3 },
      { title: "Comunicados", url: "/portal/comunicados", icon: Send },
      { title: "Histórico de ações", url: "/portal/auditoria", icon: History },
    ],
  },
  {
    titulo: "Suporte",
    itens: [
      { title: "Usuários", url: "/portal/usuarios", icon: UserCog },
      { title: "Ajuda", url: "/portal/ajuda", icon: LifeBuoy },
      { title: "Atualizações", url: "/portal/atualizacoes", icon: Megaphone },
      { title: "Status do sistema", url: "/portal/status", icon: Activity },
    ],
  },
]

export function tituloDaRota(pathname: string): string {
  if (pathname.startsWith("/portal/conta")) return "Minha conta"
  if (pathname.startsWith("/portal/presenca")) return "Presença"
  const todos = NAV_ADMIN.flatMap((g) => g.itens).sort((a, b) => b.url.length - a.url.length)
  return todos.find((i) => (i.url === "/portal" ? pathname === "/portal" : pathname.startsWith(i.url)))?.title ?? "Portal"
}

export function rotaAtiva(pathname: string, url: string) {
  return url === "/portal" ? pathname === "/portal" : pathname === url || pathname.startsWith(url + "/")
}
