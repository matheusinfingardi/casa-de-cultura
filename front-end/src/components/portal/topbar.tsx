"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth/auth-provider"
import Sino from "@/components/comum/sino"
import { iniciais } from "@/lib/formatar"
import { tituloDaRota } from "@/lib/nav"
import AppSidebarContent from "./app-sidebar-content"
import { useUnidade } from "./unidade"

export default function Topbar() {
  const pathname = usePathname()
  const { openMobile, setOpenMobile } = useSidebar()
  const { user } = useAuth()
  const { unidade, definir, centros } = useUnidade()
  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? ""

  return (
    <>
      <header className="nao-imprimir sticky top-[var(--altura-banner,0px)] z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-8">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpenMobile(true)} aria-label="Abrir menu">
          <Menu className="size-5" aria-hidden />
        </Button>
        <p className="truncate font-semibold md:hidden">{tituloDaRota(pathname)}</p>

        <div className="ml-auto flex items-center gap-2">
          {centros.length > 0 && (
            <select
              aria-label="Filtrar por unidade"
              value={unidade}
              onChange={(e) => definir(e.target.value)}
              className="hidden h-10 max-w-56 rounded-xl border bg-card px-3 text-sm sm:block"
            >
              <option value="">Todas as unidades</option>
              {centros.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          )}
          <Sino />
          <Link href="/portal/conta" aria-label="Minha conta" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {iniciais(nome)}
          </Link>
        </div>
      </header>

      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-72 bg-background p-0">
          <SheetHeader className="sr-only"><SheetTitle>Menu de navegação</SheetTitle></SheetHeader>
          <AppSidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
