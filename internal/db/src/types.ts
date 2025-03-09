import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as schema from "./schema";

// export type User = InferSelectModel<typeof schema.user>;
// export type InsertUser = InferInsertModel<typeof schema.user>;

export type Key = InferSelectModel<typeof schema.keys>;
export type InsertKey = InferInsertModel<typeof schema.keys>;

export type Rule = InferSelectModel<typeof schema.rules>;
export type InsertRule = InferInsertModel<typeof schema.rules>;