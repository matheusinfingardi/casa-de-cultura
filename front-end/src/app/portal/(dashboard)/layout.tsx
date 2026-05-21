import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import AppSidebar from "@/components/portal/app-sidebar"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 md:p-10">
          <SidebarTrigger className="mb-4 md:hidden" />
          {children}
        </main>

      </div>
    </SidebarProvider>
  )
}