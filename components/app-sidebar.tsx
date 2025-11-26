"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { User } from "@supabase/supabase-js"
import {
  LayoutDashboard,
  User as UserIcon,
  FolderOpen,
  Briefcase,
  GraduationCap,
  Zap,
  Heart,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Profile", 
      url: "/admin/profile",
      icon: UserIcon,
    },
    {
      title: "Projects",
      url: "/admin/projects", 
      icon: FolderOpen,
    },
    {
      title: "Experience",
      url: "/admin/experience",
      icon: Briefcase,
    },
    {
      title: "Education",
      url: "/admin/education",
      icon: GraduationCap,
    },
    {
      title: "Skills",
      url: "/admin/skills",
      icon: Zap,
    },
    {
      title: "Interests",
      url: "/admin/interests",
      icon: Heart,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const isActive = (url: string) => {
    if (url === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(url)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 border-b p-2">
        <div className="flex h-full w-full items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
            {(user?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden text-sm group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">Admin Dashboard</span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email || "admin"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <button
                        onClick={() => router.push(item.url)}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sign out">
              <button
                onClick={handleSignOut}
                className="w-full text-red-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
