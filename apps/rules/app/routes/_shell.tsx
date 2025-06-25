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
import {
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useRouteLoaderData,
} from "react-router";
import { useLocation } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/_shell";
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

// type SOO = SignedOut
export async function loader(args: Route.LoaderArgs) {
  const cookieHeader = args.request.headers.get("cookie");
  const cookies = cookieTool.parse(cookieHeader ?? "");
  const auth = Boolean(args.context.auth?.userId);
  let sideBarOpen = cookies["sidebar_state"];
  if (sideBarOpen !== "true" && sideBarOpen !== "false") {
    sideBarOpen = "true";
  }
  return { sideBarOpen: sideBarOpen === "true", auth };
}

export function useShellData() {
  const data = useRouteLoaderData<typeof loader>("routes/_shell");
  if (!data) {
    throw new Error("No shell data found");
  }
  return data;
}

export default function Page() {
  const { sideBarOpen } = useLoaderData<typeof loader>();
  return (
    <SidebarProvider defaultOpen={sideBarOpen}>
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

// export function ErrorBoundary({ error, loaderData }: Route.ErrorBoundaryProps) {
//   let message = "Oops!";
//   let details = "An unexpected error occurred.";
//   let stack: string | undefined;
//   console.log("ErrorBoundary at _shell.tsx");

//   if (isRouteErrorResponse(error)) {
//     message = error.status === 404 ? "404" : "Error";
//     details =
//       error.status === 404
//         ? "The requested page could not be found."
//         : error.statusText || details;
//   } else if (import.meta.env.DEV && error && error instanceof Error) {
//     details = error.message;
//     stack = error.stack;
//   }

//   return (
//     <SidebarProvider defaultOpen={loaderData?.sideBarOpen ?? true}>
//       <AppSidebar />
//       <SidebarInset>
//         <header className="flex h-16 shrink-0 items-center gap-2">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//             <Breadcrumbs />
//           </div>
//         </header>
//         {/* <Outlet /> */}

//         <main className="pt-16 p-4 container mx-auto">
//           <h1>{message}</h1>
//           <p>{details}</p>
//           {stack && (
//             <pre className="w-full p-4 overflow-x-auto">
//               <code>{stack}</code>
//             </pre>
//           )}
//         </main>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }
