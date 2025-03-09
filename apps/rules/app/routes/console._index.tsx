import { Button } from "@/components/ui/button";
import { Link, useLoaderData, redirect, data } from "react-router";
import type { Route } from "./+types/console._index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayName } from "@/lib/clerk-utils";

export async function loader(args: Route.LoaderArgs) {
  const userId = args.context.auth?.userId;
  const { cache } = args.context.services;
  if (!userId) return redirect("/auth/sign-in");
  const { val: user, err } = await cache.clerkUserById.swr(userId, async () => {
    console.log("Cache miss for clerk user ID:", userId);
    const { clerk } = args.context.services;
    const user = await clerk.users.getUser(userId);
    return user;
  });
  if (err || !user) {
    throw data(
      {
        error: "Internal Server Error",
        message: err?.message ?? "User not found",
      },
      { status: 500 }
    );
  }
  return { displayName: getDisplayName(user) };
}

export default function Dashboard() {
  return (
    <div className="flex items-center justify-center flex-1">
      <div className="mx-auto max-w-md w-full mb-8 px-4">
        <DashHello />
      </div>
    </div>
  );
}

export function DashHello() {
  const { displayName } = useLoaderData<typeof loader>();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-light">
          Welcome, {displayName}!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-col">
          <Button asChild variant="outline" className="text-base" size={"lg"}>
            <Link to="/console/rules">Manage rules and credentials</Link>
          </Button>
          <Button asChild variant="outline" className="text-base" size={"lg"}>
            <Link to="/console/keys">Manage API keys</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
