'use client'

import { AppSidebar } from "@components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@components/ui/sidebar"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@components/ui/breadcrumb"
import { Separator } from "@components/ui/separator"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User as UserIcon,
  FolderOpen,
  Briefcase,
  GraduationCap,
  Zap,
  Heart,
} from "lucide-react"

const navigationItems = {
  '/admin': { title: 'Dashboard', icon: LayoutDashboard },
  '/admin/profile': { title: 'Profile', icon: UserIcon },
  '/admin/projects': { title: 'Projects', icon: FolderOpen },
  '/admin/experience': { title: 'Experience', icon: Briefcase },
  '/admin/education': { title: 'Education', icon: GraduationCap },
  '/admin/skills': { title: 'Skills', icon: Zap },
  '/admin/interests': { title: 'Interests', icon: Heart },
}

function DynamicBreadcrumb() {
  const pathname = usePathname()
  const currentPage = navigationItems[pathname as keyof typeof navigationItems]
  
  if (pathname === '/admin') {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/admin" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Admin Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-2">
            {currentPage?.icon && <currentPage.icon className="h-4 w-4" />}
            {currentPage?.title || 'Page'}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800 px-4">
            <SidebarTrigger 
              className="outline outline-1 outline-border bg-background hover:bg-accent text-foreground shadow-sm" 
            />
            <Separator orientation="vertical" className="mr-2 h-4 bg-gray-600" />
            <DynamicBreadcrumb />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-900">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
} 