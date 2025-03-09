import { sql } from "drizzle-orm";
import { integer } from "drizzle-orm/sqlite-core";

export const lifecycleDates = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date()
  ),
};

export const softDelete = {
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
};

export const disabledAt = {
  disabledAt: integer("disabled_at", { mode: "timestamp" }),
};

/**
 * Over time I want to move all of our timestamps to bigints,
 *
 * These are named with a suffix, so we can have both the old ones and the new ones at the same time
 * for migrations
 */
// export const lifecycleDatesMigration = {
//   createdAtM: bigint("created_at_m", { mode: "number" })
//     .notNull()
//     .default(0)
//     .$defaultFn(() => Date.now()),
//   updatedAtM: bigint("updated_at_m", { mode: "number" }).$onUpdateFn(() => Date.now()),
//   deletedAtM: bigint("deleted_at_m", { mode: "number" }),
// };
