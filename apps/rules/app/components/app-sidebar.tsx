import * as React from "react";
import { Command } from "lucide-react";
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
import { getAuth } from "@clerk/react-router/ssr.server";
import { redirect } from "react-router";
import { useSession, useUser } from "@clerk/react-router";
import { getUserShapeFromClient } from "@/lib/clerk-utils";

export async function loader(args: Route.LoaderArgs) {}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        <NavMain items={sidebarMenus.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={getUserShapeFromClient(user)} />
      </SidebarFooter>
    </Sidebar>
  );
}
