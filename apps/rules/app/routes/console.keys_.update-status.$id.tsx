import { data } from "react-router";
import type { Route } from "./+types/console.keys_.update-status.$id";
import { and, eq, schema, sql } from "@exectx/db";
import { invalidateRuleCacheByKeyHash } from "@/lib/cache-utils";

export const ROUTE_PATH = (id: string) => `/console/keys/update-status/${id}`;

export async function action(args: Route.ActionArgs) {
  const userId = args.context.auth?.userId;
  if (!userId) throw data(null, { status: 401 });
  const { db } = args.context.services;
  const { id } = args.params;
  if (!id) throw data(null, { status: 400 });
  const [updatedKey] = await db
    .update(schema.keys)
    .set({
      disabledAt: sql`CASE WHEN disabled_at IS NULL THEN (unixepoch()) ELSE NULL END`,
    })
    .where(and(eq(schema.keys.id, id), eq(schema.keys.userId, userId)))
    .returning();

  if (!updatedKey) {
    throw data(
      { error: "Not Found", message: "Key not found" },
      { status: 404 }
    );
  }

  console.log("successfully updated key status:", updatedKey.id);

  // Invalidate cache
  args.context.cloudflare.ctx.waitUntil(
    invalidateRuleCacheByKeyHash({
      hash: updatedKey.hash,
      id: updatedKey.id,
    })
  );
}
