"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth/auth-provider"
import { sair } from "@/lib/services/auth"

import { LogOut } from "lucide-react"
import { NAV_ADMIN, rotaAtiva, type NavItem } from "@/lib/nav"

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
          const active = rotaAtiva(pathname, item.url)
          return (
            <Link
              key={item.title}
              href={item.url}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpenMobile(false)}
              className={`
                flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-all
                ${active
                  ? "bg-primary text-primary-foreground"
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

function UserFooter() {
  const { user } = useAuth()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()

  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? "Administrador"

  async function handleSair() {
    await sair()
    setOpenMobile(false)
    router.push("/")
  }

  return (
    <div className="mt-auto px-2 pt-2">
      <Separator className="mb-3" />
      <div className="px-3 mb-2">
        <p className="text-sm font-medium truncate">{nome}</p>
        {user?.email && (
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        )}
      </div>
      <button
        onClick={handleSair}
        className="flex items-center gap-3 px-3 h-12 w-full rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
      >
        <LogOut className="w-5 h-5 shrink-0 text-muted-foreground" />
        Sair
      </button>
    </div>
  )
}

export default function AppSidebarContent() {
  return (
    <div className="flex flex-col py-3 gap-3 h-full overflow-y-auto">
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
            <p className="text-xs text-muted-foreground mt-1">Administração</p>
          </div>
        </Link>
      </div>

      <Separator />
      {NAV_ADMIN.map((g) => (
        <NavSection key={g.titulo} title={g.titulo} items={g.itens} />
      ))}

      <UserFooter />
    </div>
  )
}