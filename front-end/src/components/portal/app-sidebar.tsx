"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import AppSidebarContent from "./app-sidebar-content"

export default function AppSidebar() {
  const isMobile = useIsMobile()

  if (isMobile) return null

  return (
    <Sidebar collapsible="offcanvas" className="border-r bg-background">
      <SidebarContent className="bg-background">
        <AppSidebarContent />
      </SidebarContent>
    </Sidebar>
  )
}