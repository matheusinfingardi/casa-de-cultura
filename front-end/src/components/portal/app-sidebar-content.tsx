"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, UserRound } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth/auth-provider"
import { sair } from "@/lib/services/auth"
import { NAV_ADMIN, rotaAtiva } from "@/lib/nav"

export default function AppSidebarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()
  const { user } = useAuth()
  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? "Administração"

  async function handleSair() {
    await sair()
    setOpenMobile(false)
    router.push("/")
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Link href="/portal" onClick={() => setOpenMobile(false)} className="flex shrink-0 items-center gap-3 px-5 py-3">
        <Image src="/logo-evailton.png" alt="" width={44} height={44} className="h-11 w-11 rounded-full border bg-white object-contain" />
        <span className="leading-tight">
          <span className="block font-semibold">Casa de Cultura</span>
          <span className="block text-sm text-muted-foreground">Administração</span>
        </span>
      </Link>

      <nav aria-label="Menu principal" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-3">
        {NAV_ADMIN.map((g) => (
          <div key={g.titulo}>
            <p className="mb-0.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.titulo}</p>
            <ul className="space-y-0.5">
              {g.itens.map((item) => {
                const ativo = rotaAtiva(pathname, item.url)
                return (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      aria-current={ativo ? "page" : undefined}
                      onClick={() => setOpenMobile(false)}
                      className={`flex h-9 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${ativo ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <item.icon className={`size-[1.15rem] shrink-0 ${ativo ? "" : "text-muted-foreground"}`} aria-hidden />
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1 border-t p-2">
        <Link href="/portal/conta" onClick={() => setOpenMobile(false)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-1.5 hover:bg-muted">
          <UserRound className="size-[1.15rem] shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{nome}</span>
            <span className="block text-xs text-muted-foreground">Minha conta</span>
          </span>
        </Link>
        <button type="button" onClick={handleSair} aria-label="Sair" title="Sair" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-muted">
          <LogOut className="size-[1.15rem] text-muted-foreground" aria-hidden />
        </button>
      </div>
    </div>
  )
}
