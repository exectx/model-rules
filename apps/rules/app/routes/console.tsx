import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { Outlet, useLoaderData } from "react-router";
import { useLocation } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/console";
import * as cookieTool from "cookie-es";

function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();
  if (breadcrumbs.length === 0) return null;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb) => (
          <div className="contents" key={crumb.href}>
            {!crumb.isCurrent ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            ) : (
              <BreadcrumbItem key={crumb.href}>
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export async function loader(args: Route.LoaderArgs) {
  const cookieHeader = args.request.headers.get("cookie");
  const cookies = cookieTool.parse(cookieHeader ?? "");
  return { defaultOpen: cookies["sidebar_state"] === "true" };
}

export default function Page() {
  const { defaultOpen } = useLoaderData<typeof loader>();
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
