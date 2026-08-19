"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserSupabase } from "@lib/supabase/browser";
import { User } from "@supabase/supabase-js";
import {
  Building2,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  Sparkles,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@components/ui/sidebar";
import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@lib/utils";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

/**
 * Nav is grouped by what the records describe rather than listed flat, so the
 * eight destinations read as three short lists instead of one long one.
 */
const navigation: NavGroup[] = [
  {
    items: [{ title: "Dashboard", url: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { title: "Profile", url: "/admin/profile", icon: UserIcon },
      { title: "Projects", url: "/admin/projects", icon: FolderKanban },
      { title: "Skills", url: "/admin/skills", icon: Sparkles },
      { title: "Interests", url: "/admin/interests", icon: Heart },
    ],
  },
  {
    label: "Career",
    items: [
      { title: "Experience", url: "/admin/experience", icon: Briefcase },
      { title: "Education", url: "/admin/education", icon: GraduationCap },
      { title: "Companies", url: "/admin/companies", icon: Building2 },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }
      setUser(user);
      setLoadingUser(false);
    };
    getUser();
  }, [supabase.auth, router]);

  const isActive = (url: string) =>
    url === "/admin" ? pathname === "/admin" : pathname.startsWith(url);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const email = user?.email ?? "";
  const initial = (email || "A").charAt(0).toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar" {...props}>
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-3">
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <div className="admin-raised flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold tracking-tight text-primary-foreground">
            HH
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="admin-display truncate text-sm font-semibold text-sidebar-accent-foreground">
              Portfolio
            </span>
            <span className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Console
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="admin-scroll gap-0 py-2">
        {navigation.map((group, index) => (
          <SidebarGroup key={group.label ?? `group-${index}`} className="py-1">
            {group.label && (
              <SidebarGroupLabel className="admin-eyebrow px-2 group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={cn(
                          "h-8 text-sidebar-foreground transition-colors",
                          "hover:bg-sidebar-accent/70",
                          active &&
                            "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        )}
                      >
                        <Link href={item.url}>
                          <item.icon
                            className={cn(
                              "h-4 w-4 transition-colors",
                              active ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 rounded-md px-1 py-1 group-data-[collapsible=icon]:px-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
            {initial}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            {loadingUser ? (
              <Skeleton className="h-3 w-28" />
            ) : (
              <p className="truncate text-xs text-sidebar-foreground" title={email}>
                {email || "Signed in"}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
