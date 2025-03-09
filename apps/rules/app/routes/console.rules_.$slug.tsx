import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  data,
  Link,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/console.rules_.$slug";
import { ROUTE_PATH as RULES_ROUTE_PATH } from "./console.rules";
import { ROUTE_PATH as RULE_SETTINGS_ROUTE_PATH } from "./console.rules_.$slug.settings";

export const ROUTE_PATH = (slug: string) => `/console/rules/${slug}`;

export async function loader(args: Route.LoaderArgs) {
  const userId = args.context.auth?.userId;
  if (!userId) return redirect("/auth/sign-in");
  const { db } = args.context.services;
  const { slug } = args.params;
  if (!slug) return redirect(RULES_ROUTE_PATH);
  const rule = await db.query.rules.findFirst({
    where: (t, { eq, and, isNull }) =>
      and(eq(t.prefix, slug), eq(t.userId, userId), isNull(t.deletedAt)),
    columns: {
      apiKeyEncrypted: false,
      apiKeyIv: false,
      deletedAt: false,
    },
  });
  if (!rule)
    throw data(
      {
        error: "Not Found",
        message: "Ruleset not found",
      },
      { status: 404 }
    );
  return rule;
}

export function useRuleData() {
  const data = useRouteLoaderData<typeof loader>("routes/console.rules_.$slug");
  if (!data) {
    throw new Error("No rule data found");
  }
  return data;
}

export default function RulesPageLayout({ params }: Route.ComponentProps) {
  const { prefix: slug } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  let tab = "overview";
  if (pathname.includes("/metrics")) {
    tab = "metrics";
  } else if (pathname.includes("/settings")) {
    tab = "settings";
  }

  return (
    <>
      <Tabs value={tab} className="w-full border-t border-b">
        <TabsList className="text-foreground h-auto gap-2 rounded-none bg-transparent px-1 sm:px-2 py-1">
          <TabsTrigger
            value="overview"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary text-muted-foreground data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-normal"
            asChild
          >
            <Link to={ROUTE_PATH(slug)}>Overview</Link>
          </TabsTrigger>
          <TabsTrigger
            value="metrics"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary text-muted-foreground data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-normal"
            disabled
          >
            Metrics
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary text-muted-foreground data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-normal"
            asChild
          >
            <Link to={RULE_SETTINGS_ROUTE_PATH(slug)}>Settings</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Outlet />
    </>
  );
}
