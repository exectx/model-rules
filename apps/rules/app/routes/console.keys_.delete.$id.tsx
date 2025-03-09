import { data, redirect } from "react-router";
import type { Route } from "./+types/console.keys_.delete.$id";
import { and, eq, schema } from "@exectx/db";
import { invalidateRuleCacheByKeyHash } from "@/lib/cache-utils";

export const ROUTE_PATH = (id: string) => `/console/keys/delete/${id}`;

export async function action(args: Route.ActionArgs) {
  if (args.request.method !== "DELETE") throw data(null, { status: 405 });
  const { db, cache } = args.context.services;
  const userId = args.context.auth?.userId;
  if (!userId) throw data({ error: "Not Authorized" }, { status: 401 });
  const { id } = args.params;
  if (!id) throw data(null, { status: 400 });
  // TODO: soft delete
  const [deletedKey] = await db
    .delete(schema.keys)
    .where(and(eq(schema.keys.id, id), eq(schema.keys.userId, userId)))
    .returning();

  if (!deletedKey) {
    throw data(
      { error: "Not Found", message: "Key not found" },
      { status: 404 }
    );
  }
  // Invalidate cache
  args.context.cf.ctx.waitUntil(
    invalidateRuleCacheByKeyHash({
      hash: deletedKey.hash,
      id: deletedKey.id,
    })
  );
}
