import { text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

export function primaryId(name = "id") {
  return text(name)
    .primaryKey()
    .$defaultFn(() => ulid());
}