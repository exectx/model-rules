import { Hono, type ExecutionContext } from "hono";
import { createRequestHandler } from "react-router";
import { addRulesApi } from "./rules-api";
import type { HonoEnv } from "@services/hono/env";
import { createConnection } from "@exectx/db";
import { initCache } from "@services/cache";
import { contextStorage } from "hono/context-storage";
import {
  createClerkClient,
  type ClerkClient,
} from "@clerk/react-router/api.server";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    services: HonoEnv["Variables"]["services"];
    auth: ReturnType<
      Awaited<ReturnType<ClerkClient["authenticateRequest"]>>["toAuth"]
    >;
    _authRequestState: Awaited<ReturnType<ClerkClient["authenticateRequest"]>>;

    // session: HonoEnv["Variables"]["session"];
  }
}

const app = new Hono<HonoEnv>();

export type App = typeof app;

app.use(contextStorage());
app.use("*", async (c, next) => {
  const db = createConnection(c.env.DATABASE_URL);
  const cache = initCache(c);
  const clerk = createClerkClient({
    secretKey: c.env.CLERK_SECRET_KEY,
    publishableKey: c.env.VITE_CLERK_PUBLISHABLE_KEY,
  });
  c.set("services", { db, cache, clerk });
  await next();
});

addRulesApi(app);

const mode = import.meta.env.MODE;
const reactRouterRequestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  mode
);

app.use("*", async (c) => {
  const url = new URL(c.req.url);
  if (url.pathname.startsWith("/.well-known/appspecific/com.chrome.devtools")) {
    return new Response(null, { status: 204 }); // Return empty response with 204 No Content
  }
  const { clerk } = c.get("services");
  const authreq = await clerk.authenticateRequest(c.req.raw);
  authreq.headers.forEach((value, key) => {
    c.res.headers.append(key, value);
  });
  const auth = authreq.toAuth();
  return reactRouterRequestHandler(c.req.raw, {
    cloudflare: {
      env: c.env,
      ctx: c.executionCtx,
    },
    services: c.get("services"),
    auth,
    _authRequestState: authreq,
  });
});
export default app;

// export default {
//   fetch: (req, env, ctx) => {
//     return app.fetch(req, env, ctx);
//   },
// } satisfies ExportedHandler<Env>;
