'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

import { AppSidebar } from '@components/Layout/AppSidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';
import { Separator } from '@components/ui/separator';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/profile': 'Profile',
  '/admin/projects': 'Projects',
  '/admin/companies': 'Companies',
  '/admin/experience': 'Experience',
  '/admin/education': 'Education',
  '/admin/skills': 'Skills',
  '/admin/interests': 'Interests',
};

function DynamicBreadcrumb() {
  const pathname = usePathname();
  const title = pageTitles[pathname];

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs sm:gap-1.5">
        {pathname === '/admin' ? (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-foreground">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/admin"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">
                {title ?? 'Page'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-background font-inter text-foreground antialiased">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-background">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
            <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground" />
            <Separator orientation="vertical" className="h-4 bg-border" />
            <DynamicBreadcrumb />

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                View site
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </header>

          <main className="relative flex-1 overflow-x-clip">
            <div
              aria-hidden
              className="admin-grid admin-grid-mask pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70"
            />
            <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
