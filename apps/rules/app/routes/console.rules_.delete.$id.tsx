import { data, redirect } from "react-router";
import type { Route } from "./+types/console.rules_.delete.$id";
import { parseWithValibot } from "@conform-to/valibot";
import { and, eq, schema } from "@exectx/db";
import { safeTry } from "@exectx/utils";
import { invalidateAllRulesCache } from "@/lib/cache-utils";
import { ROUTE_PATH as RULES_ROUTE_PATH } from "./console.rules";

export const ROUTE_PATH = (id: string) => `/console/rules/delete/${id}`;

export async function action(args: Route.ActionArgs) {
  if (args.request.method !== "DELETE") throw data(null, { status: 405 });
  const userId = args.context.auth?.userId;
  if (!userId) throw data({ error: "Not authorized" }, { status: 401 });
  const { db } = args.context.services;
  const { id } = args.params;
  const params = new URL(args.request.url).searchParams;
  const shouldRedirect = params.get("redirect");

  if (!id) throw data(null, { status: 400 });
  // TODO: soft delete
  await db
    .delete(schema.rules)
    .where(and(eq(schema.rules.id, id), eq(schema.rules.userId, userId)));
  console.log(args.request.referrer);
  args.context.cloudflare.ctx.waitUntil(invalidateAllRulesCache(userId));

  if (shouldRedirect === "true") {
    const redirectUrl = new URL(RULES_ROUTE_PATH, args.request.url);
    return redirect(RULES_ROUTE_PATH);
  }
  return { deleted: true };
}
