import { index, unique } from "drizzle-orm/sqlite-core";
// import { user } from "./user";
import { relations } from "drizzle-orm";
import * as v from "valibot";
import { createTable } from "../table";
import { disabledAt, lifecycleDates, softDelete } from "./util/lifecycle_dates";
import { primaryId } from "./util/primary_id";
import { type ModelRules, type ProviderRules } from "@exectx/schema/rules";

export const rules = createTable(
  "rules",
  (d) => ({
    id: primaryId(),
    userId: d.text("user_id", { length: 256 }).notNull(),
    // .references(() => user.id),
    prefix: d.text("prefix", { length: 256 }).notNull(),
    baseUrl: d.text("base_url", { length: 256 }).notNull(),
    // apiKey: d.text("api_key", { length: 256 }).notNull(),
    apiKeyPreview: d.text("api_key_preview", { length: 256 }).notNull(),
    apiKeyEncrypted: d.text("api_key_encrypted", { length: 256 }).notNull(),
    apiKeyIv: d.text("api_key_iv", { length: 32 }).notNull(),
    isDefault: d
      .integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
    providerRules: d
      .text("provider_rules", { mode: "json" })
      .$type<ProviderRules>(),
    modelRules: d.text("model_rules", { mode: "json" }).$type<ModelRules>(),
    ...lifecycleDates,
    ...softDelete,
  }),
  (t) => [
    index("route_user_idx").on(t.userId),
    unique("user_prefix_unique").on(t.userId, t.prefix),
  ]
);

// export const routesRelations = relations(rules, ({ one }) => ({
//   user: one(user, { fields: [rules.userId], references: [user.id] }),
// }));
