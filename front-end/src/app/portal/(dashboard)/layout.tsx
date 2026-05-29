import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/portal/app-sidebar"
import { MobileHeader } from "@/components/portal/mobile-sidebar"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <MobileHeader />
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}