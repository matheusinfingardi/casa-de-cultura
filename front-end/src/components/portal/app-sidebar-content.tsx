"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Scissors,
  HeartHandshake,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

const mainItems: NavItem[] = [
  { title: "Dashboard", url: "/portal", icon: LayoutDashboard },
]

const managementItems: NavItem[] = [
  { title: "Eventos",     url: "/portal/eventos",     icon: Calendar       },
  { title: "Atividades",  url: "/portal/atividades",  icon: Sparkles       },
  { title: "Oficinas",    url: "/portal/oficinas",    icon: Scissors       },
  { title: "Assistência", url: "/portal/assistencia", icon: HeartHandshake },
  { title: "Centros",     url: "/portal/centros",     icon: Building2      },
]

const systemItems: NavItem[] = [
  { title: "Configurações", url: "/portal/settings", icon: Settings },
]

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <div className="px-2">
      <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.url
          return (
            <Link
              key={item.title}
              href={item.url}
              onClick={() => setOpenMobile(false)}
              className={`
                flex items-center gap-3 px-3 h-12 rounded-xl text-sm font-medium transition-all
                ${active
                  ? "bg-blue-600 text-white"
                  : "text-foreground hover:bg-muted"
                }
              `}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-muted-foreground"}`} />
              {item.title}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function AppSidebarContent() {
  return (
    <div className="flex flex-col py-3 gap-4 h-full overflow-y-auto">
      <div className="px-5 py-2">
        <Link href="/portal">
          <div className="rounded-2xl overflow-hidden border bg-white shadow-sm w-fit">
            <img
              src="/logo-evailton.png"
              alt="Casa de Cultura Evailton Vilela"
              className="w-24 object-cover"
            />
          </div>
          <div className="mt-4">
            <h2 className="text-sm font-semibold">Casa de Cultura</h2>
            <p className="text-xs text-muted-foreground mt-1">Portal Administrativo</p>
          </div>
        </Link>
      </div>

      <Separator />
      <NavSection title="Visão Geral" items={mainItems} />
      <Separator />
      <NavSection title="Gestão" items={managementItems} />
      <Separator />
      <NavSection title="Sistema" items={systemItems} />
    </div>
  )
}