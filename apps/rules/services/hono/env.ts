import type { ClerkClient } from "@clerk/react-router/api.server";
import type { Database } from "@exectx/db";
import type { Cache } from "@services/cache";

export type ServiceContext = {
  db: Database;
  cache: Cache;
  clerk: ClerkClient;
};

export type HonoEnv = {
  Bindings: Env;
  Variables: {
    services: ServiceContext;
  };
};
