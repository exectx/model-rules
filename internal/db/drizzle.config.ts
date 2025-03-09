import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/migrations",
  schema: "./src/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  tablesFilter: ["rules_*"],
});
