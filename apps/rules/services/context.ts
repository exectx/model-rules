import { getContext as getHonoContext } from "hono/context-storage";
import type { HonoEnv } from "./hono/env";

// export function getContext() {
//   try {
// const { getContext: getHonoContext } = await import("hono/context-storage");
//     const c = getHonoContext<HonoEnv>();
//     return { event: c.event, env: c.env, services: c.var.services };
//   } catch (e) {
//     console.error("Error getting context", e);
//     throw e;
//   }
// }

export function getServices() {
  try {
    // const { getContext: getHonoContext } = await import("hono/context-storage");
    return getHonoContext<HonoEnv>().var.services;
    // return {} as any
  } catch (e) {
    console.error("Error getting services", e);
    throw e;
  }
}
