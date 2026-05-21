"use client"

import Link from "next/link"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
} from "@/components/ui/sidebar"

import {
    LayoutDashboard,
    Calendar,
    Sparkles,
    Scissors,
    HeartHandshake,
    Building2,
    Settings,
} from "lucide-react"

const mainItems = [
    {
        title: "Dashboard",
        url: "/portal",
        icon: LayoutDashboard,
    },
]

const managementItems = [
    {
        title: "Eventos",
        url: "/portal/eventos",
        icon: Calendar,
    },
    {
        title: "Atividades",
        url: "/portal/atividades",
        icon: Sparkles,
    },
    {
        title: "Oficinas",
        url: "/portal/oficinas",
        icon: Scissors,
    },
    {
        title: "Assistência",
        url: "/portal/assistencia",
        icon: HeartHandshake,
    },
    {
        title: "Centros",
        url: "/portal/centros",
        icon: Building2,
    },
]

const systemItems = [
    {
        title: "Configurações",
        url: "/portal/settings",
        icon: Settings,
    },
]

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <div className="px-4 py-3">
                    <Link href="/portal">
                        <img
                            src="/logo-evailton.png"
                            alt="Casa de Cultura Evailton Vilela"
                            className="w-25 md:w-25 rounded-full"
                        />
                    </Link>
                    <span className="text-xs text-muted-foreground">
                        Portal Administrativo
                    </span>
            </div>
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>Visão Geral</SidebarGroupLabel>
                <SidebarMenu>
                    {mainItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url} className="flex items-center gap-2">
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>Gestão</SidebarGroupLabel>
                <SidebarMenu>
                    {managementItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url} className="flex items-center gap-2">
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>Sistema</SidebarGroupLabel>
                <SidebarMenu>
                    {systemItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url} className="flex items-center gap-2">
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>

        </SidebarContent>
    </Sidebar >
  )
}