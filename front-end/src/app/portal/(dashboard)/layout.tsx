import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/portal/app-sidebar"
import Topbar from "@/components/portal/topbar"
import AuthGuard from "@/components/auth/auth-guard"
import { UnidadeProvider } from "@/components/portal/unidade"
import Tour from "@/components/comum/tour"
import Exigir2fa from "@/components/portal/exigir-2fa"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allow={["admin"]} redirectTo="/painel">
      <UnidadeProvider>
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Topbar />
            <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
          </div>
          <Tour perfil="admin" />
          <Exigir2fa />
        </SidebarProvider>
      </UnidadeProvider>
    </AuthGuard>
  )
}
