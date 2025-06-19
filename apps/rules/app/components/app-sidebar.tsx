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
import type { Route } from "../routes/+types/console";
import { Link } from "react-router";
import { useUser } from "@clerk/react-router";
import { getUserShapeFromClient } from "@/lib/clerk-utils";
import { Logo } from "./logo";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { NavSecondary } from "./nav-secondary";

export async function loader(args: Route.LoaderArgs) {}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
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
                  {/* <Zap className="size-4" /> */}
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
        <NavMain items={sidebarMenus.navMain} />
        <NavSecondary items={sidebarMenus.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUser user={getUserShapeFromClient(user)} />
        ) : (
          <div className="h-12 p-2 flex gap-2 items-center border rounded-md">
            <Skeleton className="h-8 w-8 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
