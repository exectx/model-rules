import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarMenus } from "@/data/sidebar-menus";
import { Link, useLocation } from "react-router";
import { useUser } from "@clerk/react-router";
import { getUserShapeFromClient } from "@/lib/clerk-utils";
import { Logo } from "./logo";
import { Skeleton } from "./ui/skeleton";
import { NavSecondary } from "./nav-secondary";
import { NavDocs } from "./nav-docs";
import { useShellData } from "@/routes/_shell";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { auth: authSSR } = useShellData();
  const { user } = useUser();
  const { pathname } = useLocation();
  const docsRoute = pathname.endsWith("/docs") || pathname.startsWith("/docs/");
  const consoleRoute =
    pathname.endsWith("/console") || pathname.startsWith("/console/");

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                to="/console"
                className="hover:bg-transparent"
                aria-label="Go to dashboard home"
              >
                <div
                  className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
                  aria-hidden="true"
                >
                  <Logo className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Modelrules</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Alpha
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {docsRoute && <NavDocs items={sidebarMenus.navDocs} />}
        {consoleRoute && <NavMain items={sidebarMenus.navMain} />}
        <NavSecondary items={sidebarMenus.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {authSSR ? (
          user ? (
            <NavUser user={getUserShapeFromClient(user)} />
          ) : (
            <div className="h-12 p-2 flex gap-2 items-center border rounded-md">
              <Skeleton className="h-8 w-8 shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          )
        ) : (
          <button
            className="h-10 w-full rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
            onClick={() => {
              window.location.href = "/_auth.auth_.sign-in";
            }}
            type="button"
          >
            Sign in
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
