export * from "./types";
export * from "drizzle-orm";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
export { drizzle };
import * as schema from "./schema";
import { createClient } from "@libsql/client";
export type Database = LibSQLDatabase<typeof schema>;
export { schema };

export function createConnection(databaseUrl: string): Database {
  const client = createClient({
    url: databaseUrl,
  });
  return drizzle(client, { schema });
}
