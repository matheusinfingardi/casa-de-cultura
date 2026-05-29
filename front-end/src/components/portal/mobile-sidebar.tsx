"use client"

import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import AppSidebarContent from "./app-sidebar-content"

const pageLabels: Record<string, string> = {
  "/portal":             "Dashboard",
  "/portal/eventos":     "Eventos",
  "/portal/atividades":  "Atividades",
  "/portal/oficinas":    "Oficinas",
  "/portal/assistencia": "Assistência",
  "/portal/centros":     "Centros",
  "/portal/settings":    "Configurações",
}

export function MobileHeader() {
  const pathname = usePathname()
  const { openMobile, setOpenMobile } = useSidebar()
  const label = pageLabels[pathname] ?? "Portal"

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <span className="text-sm font-semibold">{label}</span>
        <button
          onClick={() => setOpenMobile(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
      </header>

      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="right" className="w-72 p-0 bg-background">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
          </SheetHeader>
          <AppSidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}