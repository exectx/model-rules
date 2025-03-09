import { index } from "drizzle-orm/sqlite-core";
import { createTable } from "../table";
import { relations } from "drizzle-orm";
import { primaryId } from "./util/primary_id";
import { disabledAt, lifecycleDates, softDelete } from "./util/lifecycle_dates";

export const keys = createTable(
  "keys",
  (d) => ({
    id: primaryId(),
    userId: d.text("user_id", { length: 256 }).notNull(),
    // .references(() => user.id),
    name: d.text("name", { length: 256 }),
    hash: d.text("hash", { length: 256 }).unique().notNull(),
    preview: d.text("preview", { length: 256 }).notNull(),
    lastUsed: d.integer("last_used", { mode: "timestamp" }),
    ...lifecycleDates,
    ...softDelete,
    ...disabledAt,
  }),
  (t) => [index("key_user_idx").on(t.userId), index("key_hash_idx").on(t.hash)]
);

// export const keysRelations = relations(keys, ({ one }) => ({
//   user: one(user, { fields: [keys.userId], references: [user.id] }),
// }));
